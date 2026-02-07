import React, { useState, useRef, useCallback } from 'react';

interface UploadedImage {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

interface Props {
    productId: number;
    maxImages?: number;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    onUpload: (files: File[]) => Promise<string[]>;
    onComplete?: (urls: string[]) => void;
}

const ImageUploader: React.FC<Props> = ({
    productId,
    maxImages = 3,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    onUpload,
    onComplete,
}) => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const validateFile = (file: File): string | null => {
        if (!acceptedFormats.includes(file.type)) {
            return `Invalid format. Allowed: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File too large. Max size: ${maxSizeMB}MB`;
        }
        return null;
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        setError('');
        const fileArray = Array.from(files);

        // Check max images limit
        if (images.length + fileArray.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Create preview entries
        const newImages: UploadedImage[] = [];
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                continue;
            }

            const preview = URL.createObjectURL(file);
            newImages.push({
                id: generateId(),
                file,
                preview,
                progress: 0,
                status: 'pending',
            });
        }

        if (newImages.length === 0) return;

        setImages(prev => [...prev, ...newImages]);

        // Start upload
        for (const img of newImages) {
            await uploadImage(img);
        }
    }, [images.length, maxImages, acceptedFormats, maxSizeMB]);

    const uploadImage = async (image: UploadedImage) => {
        setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, status: 'uploading' as const, progress: 10 } : img
        ));

        // Simulate progress
        const progressInterval = setInterval(() => {
            setImages(prev => prev.map(img =>
                img.id === image.id && img.status === 'uploading' && img.progress < 90
                    ? { ...img, progress: img.progress + 10 }
                    : img
            ));
        }, 200);

        try {
            const urls = await onUpload([image.file]);

            clearInterval(progressInterval);

            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, status: 'success' as const, progress: 100, url: urls[0] }
                    : img
            ));

            // Notify completion
            const allImages = images.filter(i => i.status === 'success').map(i => i.url!);
            if (urls[0]) allImages.push(urls[0]);
            onComplete?.(allImages);

        } catch (err: any) {
            clearInterval(progressInterval);
            setImages(prev => prev.map(img =>
                img.id === image.id
                    ? { ...img, status: 'error' as const, error: err.message || 'Upload failed' }
                    : img
            ));
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => {
            const img = prev.find(i => i.id === id);
            if (img?.preview) {
                URL.revokeObjectURL(img.preview);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const retryUpload = (id: string) => {
        const image = images.find(i => i.id === id);
        if (image) {
            uploadImage(image);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image-uploader">
            <h3>📸 Customize Your Product</h3>
            <p className="subtitle">Upload your image to personalize this product</p>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${images.length >= maxImages ? 'disabled' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={images.length < maxImages ? openFilePicker : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats.join(',')}
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                />

                <div className="drop-content">
                    <span className="drop-icon">📁</span>
                    <span className="drop-text">
                        {isDragging ? 'Drop your images here' : 'Drag & drop images or click to browse'}
                    </span>
                    <span className="drop-hint">
                        Max {maxImages} images • {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • Up to {maxSizeMB}MB each
                    </span>
                </div>
            </div>

            {error && <div className="upload-error">{error}</div>}

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="preview-grid">
                    {images.map(image => (
                        <div key={image.id} className={`preview-item ${image.status}`}>
                            <img src={image.preview} alt="Preview" />

                            {/* Progress Overlay */}
                            {image.status === 'uploading' && (
                                <div className="progress-overlay">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${image.progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{image.progress}%</span>
                                </div>
                            )}

                            {/* Success Overlay */}
                            {image.status === 'success' && (
                                <div className="success-overlay">
                                    <span className="success-icon">✓</span>
                                </div>
                            )}

                            {/* Error Overlay */}
                            {image.status === 'error' && (
                                <div className="error-overlay">
                                    <span className="error-icon">⚠️</span>
                                    <span className="error-text">{image.error}</span>
                                    <button onClick={() => retryUpload(image.id)}>Retry</button>
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                className="remove-btn"
                                onClick={() => removeImage(image.id)}
                                title="Remove image"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Usage Indicator */}
            <div className="usage-indicator">
                <div className="usage-bar">
                    <div
                        className="usage-fill"
                        style={{ width: `${(images.length / maxImages) * 100}%` }}
                    />
                </div>
                <span className="usage-text">{images.length} / {maxImages} images</span>
            </div>

            <style>{`
                .image-uploader {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border-radius: 20px;
                    padding: 24px;
                    margin: 20px 0;
                }

                .image-uploader h3 {
                    margin: 0 0 4px;
                    font-size: 20px;
                    color: #0c4a6e;
                }

                .subtitle {
                    margin: 0 0 20px;
                    color: #0369a1;
                    font-size: 14px;
                }

                .drop-zone {
                    border: 3px dashed #7dd3fc;
                    border-radius: 16px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #fff;
                }

                .drop-zone:hover:not(.disabled) {
                    border-color: #0ea5e9;
                    background: #f0f9ff;
                }

                .drop-zone.dragging {
                    border-color: #0ea5e9;
                    background: #e0f2fe;
                    transform: scale(1.02);
                }

                .drop-zone.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .drop-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .drop-icon {
                    font-size: 48px;
                }

                .drop-text {
                    font-size: 16px;
                    font-weight: 500;
                    color: #0c4a6e;
                }

                .drop-hint {
                    font-size: 13px;
                    color: #64748b;
                }

                .upload-error {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-top: 12px;
                    font-size: 14px;
                }

                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }

                .preview-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .preview-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-item.uploading img {
                    filter: brightness(0.7);
                }

                .progress-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.5);
                    gap: 8px;
                }

                .progress-bar {
                    width: 80%;
                    height: 6px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #fff;
                    transition: width 0.2s;
                }

                .progress-text {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                }

                .success-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(16, 185, 129, 0.8);
                }

                .success-icon {
                    font-size: 36px;
                    color: #fff;
                }

                .error-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(239, 68, 68, 0.9);
                    gap: 8px;
                    padding: 12px;
                }

                .error-icon {
                    font-size: 24px;
                }

                .error-overlay .error-text {
                    color: #fff;
                    font-size: 12px;
                    text-align: center;
                }

                .error-overlay button {
                    padding: 6px 16px;
                    background: #fff;
                    color: #dc2626;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .remove-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 28px;
                    height: 28px;
                    background: rgba(0,0,0,0.7);
                    color: #fff;
                    border: none;
                    border-radius: 50%;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .preview-item:hover .remove-btn {
                    opacity: 1;
                }

                .usage-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                }

                .usage-bar {
                    flex: 1;
                    height: 6px;
                    background: #e0f2fe;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .usage-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0ea5e9, #0284c7);
                    transition: width 0.3s;
                }

                .usage-text {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                }

                @media (max-width: 480px) {
                    .drop-zone {
                        padding: 24px 16px;
                    }

                    .drop-icon {
                        font-size: 36px;
                    }

                    .preview-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageUploader;
