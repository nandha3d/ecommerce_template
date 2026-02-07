import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    fallback?: string;
    threshold?: number;
    blur?: boolean;
}

/**
 * LazyImage - Performance-optimized image component
 * 
 * Features:
 * - Intersection Observer for lazy loading
 * - Blur-up placeholder effect
 * - Error fallback handling
 * - Memory efficient (unobserves after load)
 */
export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
    fallback = '/placeholder-product.jpg',
    threshold = 0.1,
    blur = true,
    className = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    const imageSrc = hasError ? fallback : (isInView ? src : placeholder);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`${className} ${blur && !isLoaded ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-300`}
            loading="lazy"
            decoding="async"
            {...props}
        />
    );
};

/**
 * Responsive image with srcset support
 */
interface ResponsiveImageProps extends LazyImageProps {
    sizes?: string;
    srcSet?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
    src,
    srcSet,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    ...props
}) => {
    return (
        <LazyImage
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            {...props}
        />
    );
};

export default LazyImage;
