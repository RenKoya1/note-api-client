import imageSize from "image-size";
import { NoteAPIClient } from "../client";

function getContentTypeFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer.slice(0, 4));

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg";
  }

  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }

  // WebP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    return "image/webp";
  }

  return "image/png";
}

export async function uploadEyecatch(
  this: NoteAPIClient,
  {
    id,
    imageUrl,
  }: {
    id: string;
    imageUrl: string;
  }
) {
  const url = `${this.BASE_URL}/v1/image_upload/note_eyecatch`;
  const croppedBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const contentType = getContentTypeFromBuffer(croppedBuffer);
  const form = new FormData();
  form.append("note_id", id);
  form.append("file", new Blob([croppedBuffer], { type: contentType }), "blob");
  const { width, height } = imageSize(Buffer.from(croppedBuffer));
  form.append("width", String(width));
  form.append("height", String(height));

  return this.post<{
    url: string;
  }>(url, form);
}
