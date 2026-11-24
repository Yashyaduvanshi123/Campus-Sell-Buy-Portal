import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProductCard from './ProductCard';

const GAP_PX = 20; // Matches Tailwind gap-5 (1.25rem = 20px)

const FeaturedCarousel = ({ products = [] }) => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag & Swipe tracking refs
  const dragStartXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const hasMovedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

  // Ensure sufficient items to fill any ultra-wide screen before the seamless loop point
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    let list = [...products];
    while (list.length < 6) {
      list = [...list, ...products];
    }
    return list;
  }, [products]);

  // Dynamic animation duration: ~4.5 seconds per card guarantees consistent, steady scrolling speed
  const animationDuration = useMemo(() => {
    return Math.max(25, displayProducts.length * 4.5);
  }, [displayProducts.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Mouse & Touch interaction handlers for manual horizontal scrolling
  const handlePointerDown = (e) => {
    // Only primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;

    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartXRef.current = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    startOffsetRef.current = dragOffset;
    setIsHovered(true);

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    const diff = clientX - dragStartXRef.current;

    if (Math.abs(diff) > 6) {
      hasMovedRef.current = true;
    }
    setDragOffset(startOffsetRef.current + diff);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Resume auto-scroll after a brief natural pause
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1500);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      className="marquee-container relative w-full overflow-hidden select-none py-2 -my-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isDragging) {
          setIsHovered(false);
        }
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onClickCapture={(e) => {
        // Prevent accidental card click if user was actively dragging
        if (hasMovedRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Subtle 50% soft edge fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#F3EFE7]/50 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#F3EFE7]/50 to-transparent z-10" />

      {/* Manual Drag Wrapper */}
      <div
        ref={containerRef}
        className="flex"
        style={{
          transform: `translate3d(${dragOffset}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 400ms ease-out',
          gap: `${GAP_PX}px`,
        }}
      >
        {/* Set 1: Primary marquee group */}
        <div
          className="flex flex-shrink-0 animate-marquee-track"
          style={{
            gap: `${GAP_PX}px`,
            '--marquee-duration': `${animationDuration}s`,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          {displayProducts.map((p, idx) => (
            <div
              key={`feat-1-${p.id}-${idx}`}
              className="w-[260px] sm:w-[270px] md:w-[280px] lg:w-[290px] flex-shrink-0"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Set 2: Exact duplicate group for continuous, seamless infinite loop */}
        <div
          aria-hidden="true"
          className="flex flex-shrink-0 animate-marquee-track"
          style={{
            gap: `${GAP_PX}px`,
            '--marquee-duration': `${animationDuration}s`,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          {displayProducts.map((p, idx) => (
            <div
              key={`feat-2-${p.id}-${idx}`}
              className="w-[260px] sm:w-[270px] md:w-[280px] lg:w-[290px] flex-shrink-0"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;
