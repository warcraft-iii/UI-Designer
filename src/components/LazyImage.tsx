import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
}

/**
 * 懒加载图片组件
 * 使用 Intersection Observer 检测元素可见性，只加载可见的图片
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  onLoad,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // 一旦可见就断开观察，避免重复加载
            observer.disconnect();
          }
        });
      },
      {
        // 提前50px开始加载
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={className} style={{ position: 'relative' }}>
      {isVisible ? (
        <>
          {!isLoaded && placeholder}
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            style={{
              display: isLoaded ? 'block' : 'none',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </>
      ) : (
        placeholder || <div className="preview-placeholder">🖼️</div>
      )}
    </div>
  );
};
