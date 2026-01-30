import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: { url: string; alt?: string }[];
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
    isOpen,
    onClose,
    images,
    initialIndex = 0,
    onIndexChange,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            setDragPosition({ x: 0, y: 0 });
        }
    }, [isOpen, initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex]);

    const goToPrevious = useCallback(() => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setCurrentIndex(newIndex);
        onIndexChange?.(newIndex);
        setIsZoomed(false);
        setDragPosition({ x: 0, y: 0 });
    }, [currentIndex, images.length, onIndexChange]);

    const goToNext = useCallback(() => {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        onIndexChange?.(newIndex);
        setIsZoomed(false);
        setDragPosition({ x: 0, y: 0 });
    }, [currentIndex, images.length, onIndexChange]);

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
        onIndexChange?.(index);
        setIsZoomed(false);
        setDragPosition({ x: 0, y: 0 });
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
        if (isZoomed) {
            setDragPosition({ x: 0, y: 0 });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isZoomed) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - dragPosition.x,
            y: e.clientY - dragPosition.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !isZoomed) return;
        setDragPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            onClose();
        }
    };

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return createPortal(
        <div
            ref={containerRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-fade-in"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
                <div className="text-sm font-medium opacity-80">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleZoom}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        title={isZoomed ? 'Zoom out' : 'Zoom in'}
                    >
                        {isZoomed ? (
                            <ZoomOut className="w-5 h-5" />
                        ) : (
                            <ZoomIn className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Image Area */}
            <div
                className="flex-1 flex items-center justify-center relative overflow-hidden px-16"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Previous Button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10 backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Image */}
                <img
                    ref={imageRef}
                    src={currentImage.url}
                    alt={currentImage.alt || 'Product image'}
                    onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                    className={`max-h-[70vh] max-w-full object-contain transition-transform duration-300 select-none ${isZoomed ? 'cursor-grab scale-150' : 'cursor-zoom-in'
                        } ${isDragging ? 'cursor-grabbing' : ''}`}
                    style={isZoomed ? {
                        transform: `scale(1.5) translate(${dragPosition.x / 1.5}px, ${dragPosition.y / 1.5}px)`,
                    } : undefined}
                    draggable={false}
                />

                {/* Next Button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10 backdrop-blur-sm"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="p-4 border-t border-white/10">
                    <div className="flex justify-center gap-2 overflow-x-auto max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                        ? 'border-white ring-2 ring-white/30'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    alt={image.alt || `Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default ImageZoomModal;
