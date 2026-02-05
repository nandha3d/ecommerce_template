/**
 * Get full image URL from path
 */
export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '/placeholder-product.jpg';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Converts an image file to WebP format with optimization
 * @param file The original file
 * @param quality Quality from 0 to 1 (default 0.8)
 * @returns Promise resolving to the new WebP File
 */
export const convertToWebP = (file: File, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        // If already WebP, return as is
        if (file.type === 'image/webp') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Draw white background for transparent images (optional, but good for JPEGs converting to WebP)
                // ctx.fillStyle = '#FFFFFF';
                // ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }

                        // Create new filename with .webp extension
                        const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

                        const newFile = new File([blob], fileName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });

                        resolve(newFile);
                    },
                    'image/webp',
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};

/**
 * Process a list of files and convert eligible images to WebP
 */
export const processImagesForUpload = async (files: FileList | File[]): Promise<File[]> => {
    const fileArray = Array.from(files);
    const processedFiles: File[] = [];

    for (const file of fileArray) {
        if (file.type.startsWith('image/') && !file.type.includes('svg')) {
            try {
                const webpFile = await convertToWebP(file);
                processedFiles.push(webpFile);
            } catch (error) {
                console.error(`Failed to convert ${file.name} to WebP:`, error);
                processedFiles.push(file); // Fallback to original
            }
        } else {
            processedFiles.push(file);
        }
    }

    return processedFiles;
};
