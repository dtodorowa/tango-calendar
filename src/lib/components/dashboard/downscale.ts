// Browser-only: shrink a picked photo before upload. Phone photos are often
// 5-10 MB, over Vercel's 4.5 MB request cap; the server re-encodes anyway, so a
// 2400px JPEG loses nothing that survives to the stored sizes.

import { MAX_UPLOAD_BYTES, UPLOAD_MAX_EDGE, fitWithin } from '$lib/media';

export async function downscaleImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Formats the browser can't decode (e.g. HEIC outside Safari) go up as-is;
    // the server says so if it can't read them either.
    return file;
  }
  const size = fitWithin(bitmap.width, bitmap.height, UPLOAD_MAX_EDGE);
  if (size.width === bitmap.width && file.size <= MAX_UPLOAD_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.9)
  );
  if (!blob) return file;
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}
