import path from "node:path";
import ts from "typescript";

/**
 * Checks live API responses against the exported TypeScript types in
 * src/index.ts, so drift in note.com's API (renamed fields, new nulls)
 * is caught by `npm run test:live`.
 *
 * - missing required properties and type mismatches are errors
 * - properties the type does not declare are reported as `extra`
 */

const entry = path.resolve(process.cwd(), "src/index.ts");
let cached: { checker: ts.TypeChecker; exports: Map<string, ts.Type> } | undefined;

function load() {
  if (cached) return cached;
  const program = ts.createProgram([entry], {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) throw new Error(`cannot load ${entry}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`no module symbol for ${entry}`);
  const exports = new Map<string, ts.Type>();
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    if (target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      exports.set(symbol.name, checker.getDeclaredTypeOfSymbol(target));
    }
  }
  cached = { checker, exports };
  return cached;
}

type Kind = "string" | "number" | "boolean" | "null" | "undefined" | "array" | "object" | "any";

function kindsOf(checker: ts.TypeChecker, type: ts.Type): Kind[] {
  const parts = type.isUnion() ? type.types : [type];
  return parts.map((t): Kind => {
    const f = t.flags;
    if (f & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return "any";
    if (f & ts.TypeFlags.Null) return "null";
    if (f & ts.TypeFlags.Undefined) return "undefined";
    if (f & ts.TypeFlags.StringLike) return "string";
    if (f & ts.TypeFlags.NumberLike) return "number";
    if (f & ts.TypeFlags.BooleanLike) return "boolean";
    if (t.isIntersection() && t.types.some((p) => p.flags & ts.TypeFlags.StringLike)) return "string";
    if (checker.isArrayType(t) || checker.isTupleType(t)) return "array";
    return "object";
  });
}

function kindOfValue(value: unknown): Kind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as Kind;
}

export interface ContractResult {
  errors: string[];
  extra: string[];
}

export function checkContract(value: unknown, typeName: string, maxItems = 100): ContractResult {
  const { checker, exports } = load();
  const root = exports.get(typeName);
  if (!root) throw new Error(`type ${typeName} is not exported from src/index.ts`);
  const run = (type: ts.Type, v: unknown, at: string, depth: number) => {
    const errors = new Set<string>();
    const extra = new Set<string>();
    walkInto(type, v, at, depth, errors, extra);
    return { errors, extra };
  };

  const walkInto = (
    type: ts.Type,
    v: unknown,
    at: string,
    depth: number,
    errors: Set<string>,
    extra: Set<string>,
  ) => {
    const walk = (t: ts.Type, value: unknown, path: string, d: number) =>
      walkInto(t, value, path, d, errors, extra);
    if (depth > 8) return;
    const kinds = kindsOf(checker, type);
    if (kinds.includes("any")) return;
    const actual = kindOfValue(v);
    if (!kinds.includes(actual)) {
      errors.add(`${at}: expected ${[...new Set(kinds)].join(" | ")}, got ${actual}`);
      return;
    }
    const parts = type.isUnion() ? type.types : [type];
    if (actual === "string") {
      // Closed string literal unions ("root" | "element") must match exactly;
      // open ones (`"a" | (string & {})`, plain string) accept anything.
      const stringParts = parts.filter((p) => kindsOf(checker, p)[0] === "string");
      const literals = stringParts.filter((p): p is ts.StringLiteralType => p.isStringLiteral());
      if (literals.length > 0 && literals.length === stringParts.length) {
        const allowed = literals.map((l) => l.value);
        if (!allowed.includes(v as string)) {
          errors.add(`${at}: expected ${allowed.map((a) => JSON.stringify(a)).join(" | ")}, got ${JSON.stringify(v)}`);
        }
      }
      return;
    }
    if (actual === "array") {
      const arrayType = parts.find((p) => checker.isArrayType(p));
      if (!arrayType) return;
      const [element] = checker.getTypeArguments(arrayType as ts.TypeReference);
      (v as unknown[]).slice(0, maxItems).forEach((item) => walk(element, item, `${at}[]`, depth + 1));
      return;
    }
    if (actual !== "object") return;
    const objectTypes = parts.filter(
      (p) => kindsOf(checker, p)[0] === "object" && !checker.isArrayType(p),
    );
    if (objectTypes.length === 0) return;
    if (objectTypes.length > 1) {
      // Union of object types (e.g. a discriminated union): use the member
      // that matches best.
      const results = objectTypes.map((member) => run(member, v, at, depth));
      const best = results.reduce((a, b) => (b.errors.size < a.errors.size ? b : a));
      best.errors.forEach((e) => errors.add(e));
      best.extra.forEach((e) => extra.add(e));
      return;
    }
    const objectType = objectTypes[0]!;
    const props = checker.getPropertiesOfType(objectType);
    const hasIndex = checker.getIndexInfosOfType(objectType).length > 0;
    if (props.length === 0) return; // Record<string, ...> or {}
    const obj = v as Record<string, unknown>;
    const declared = new Set(props.map((p) => p.name));
    if (!hasIndex) {
      for (const key of Object.keys(obj)) {
        if (!declared.has(key)) extra.add(`${at}.${key}: ${kindOfValue(obj[key])}`);
      }
    }
    for (const prop of props) {
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
      if (!(prop.name in obj)) {
        if (!optional) errors.add(`${at}.${prop.name}: missing`);
        continue;
      }
      walk(checker.getTypeOfSymbol(prop), obj[prop.name], `${at}.${prop.name}`, depth + 1);
    }
  };

  const { errors, extra } = run(root, value, typeName, 0);
  return { errors: [...errors], extra: [...extra] };
}
