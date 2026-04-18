/**
 * Converts a File or Blob image to WebP format with optional resizing.
 * @param file The original image file
 * @param quality Quality from 0 to 1 (default 0.7)
 * @param maxWidth Optional maximum width
 * @param maxHeight Optional maximum height
 * @returns A Promise that resolves to a new Blob in WebP format
 */
export async function convertToWebP(
  file: File | Blob, 
  quality: number = 0.7,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions if max limits are provided
        if (maxWidth && width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw with the new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
