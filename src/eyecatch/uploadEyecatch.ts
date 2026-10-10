import { imageSize } from "image-size";
import type { NoteAPIClient } from "../client";
import { requireParam } from "../client/params";

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

type ImageInput = Buffer | Uint8Array | ArrayBuffer | Blob;

async function toBytes(image: ImageInput): Promise<Uint8Array<ArrayBuffer>> {
  if (image instanceof ArrayBuffer) return new Uint8Array(image);
  if (image instanceof Uint8Array) return new Uint8Array(image); // copy: may be backed by a SharedArrayBuffer
  return new Uint8Array(await image.arrayBuffer());
}

async function download(imageUrl: string): Promise<Uint8Array<ArrayBuffer>> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(
      `note-api-client: failed to download eyecatch image (${res.status} ${res.statusText}): ${imageUrl}`,
    );
  }
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Uploads the eyecatch (header) image of a note.
 * POST /v1/image_upload/note_eyecatch (multipart/form-data)
 *
 * The image is attached to the note immediately. Pass either `imageUrl`
 * (downloaded first) or `image` (raw bytes). PNG, JPEG, GIF and WebP are
 * accepted; note.com recommends 1280x670 or larger (1.91:1).
 * Requires session cookies.
 *
 * @param id Numeric note id.
 * @returns `url` of the uploaded image.
 */
export async function uploadEyecatch(
  this: NoteAPIClient,
  {
    id,
    imageUrl,
    image,
  }: {
    id: string | number;
    imageUrl?: string;
    image?: ImageInput;
  },
): Promise<{ url: string }> {
  const noteId = requireParam("id", id);
  if (!imageUrl && !image) {
    throw new TypeError('note-api-client: "imageUrl" or "image" is required');
  }
  const bytes = image ? await toBytes(image) : await download(imageUrl!);

  const { width, height, type } = imageSize(bytes);
  const contentType = type ? MIME_TYPES[type] : undefined;
  if (!contentType) {
    throw new TypeError(
      `note-api-client: unsupported eyecatch image type "${type}" (use png, jpg, gif or webp)`,
    );
  }

  const form = new FormData();
  form.append("note_id", noteId);
  form.append("file", new Blob([bytes], { type: contentType }), "blob");
  form.append("width", String(width));
  form.append("height", String(height));

  return this.post<{ url: string }>(`${this.BASE_URL}/v1/image_upload/note_eyecatch`, form);
}
