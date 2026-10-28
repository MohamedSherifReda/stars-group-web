/**
 * Client-side image upload validation: extension + MIME type + size + magic bytes.
 * This is UX / defence in depth; the API validates uploads again.
 * Mirrors the backend allowlist (png, jpeg, webp, gif, avif). SVG is intentionally excluded.
 */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.avif,image/png,image/jpeg,image/webp,image/gif,image/avif';

const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'];
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif'];

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) =>
  sig.every((b, i) => bytes[offset + i] === b);

function sniffImage(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'gif'; // GIF8
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8))
    return 'webp'; // RIFF....WEBP
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (brand === 'avif' || brand === 'avis') return 'avif';
  }
  return null;
}

/** Returns an error message, or null when the file is an acceptable image. */
export async function validateImageFile(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(file.type.toLowerCase())) {
    return 'Only PNG, JPEG, WebP, GIF or AVIF images are allowed';
  }
  if (file.size === 0) return 'The file is empty';
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `Image is too large (max ${MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024} MB)`;
  }
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!sniffImage(head)) return 'File content is not a valid image';
  return null;
}
