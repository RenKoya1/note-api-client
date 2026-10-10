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
  const errors = new Set<string>();
  const extra = new Set<string>();

  const walk = (type: ts.Type, v: unknown, at: string, depth: number) => {
    if (depth > 8) return;
    const kinds = kindsOf(checker, type);
    if (kinds.includes("any")) return;
    const actual = kindOfValue(v);
    if (!kinds.includes(actual)) {
      errors.add(`${at}: expected ${[...new Set(kinds)].join(" | ")}, got ${actual}`);
      return;
    }
    const parts = type.isUnion() ? type.types : [type];
    if (actual === "array") {
      const arrayType = parts.find((p) => checker.isArrayType(p));
      if (!arrayType) return;
      const [element] = checker.getTypeArguments(arrayType as ts.TypeReference);
      (v as unknown[]).slice(0, maxItems).forEach((item) => walk(element, item, `${at}[]`, depth + 1));
      return;
    }
    if (actual !== "object") return;
    const objectType = parts.find(
      (p) => kindsOf(checker, p)[0] === "object" && !checker.isArrayType(p),
    );
    if (!objectType) return;
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

  walk(root, value, typeName, 0);
  return { errors: [...errors], extra: [...extra] };
}
