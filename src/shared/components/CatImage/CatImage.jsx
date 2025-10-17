import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Shared cat image renderer used by multiple card components.
 * Handles responsive sources, fallback logging, and automatic
 * focal point detection so cat faces stay centered.
 */
function CatImage({
  src,
  alt = 'Cat picture',
  containerClassName = '',
  imageClassName = '',
  loading = 'lazy',
  decoding = 'async',
  containerStyle,
  onLoad,
  onError
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const computeFocalY = useMemo(
    () =>
      (imgEl) => {
        try {
          const naturalW = imgEl.naturalWidth || imgEl.width;
          const naturalH = imgEl.naturalHeight || imgEl.height;
          if (!naturalW || !naturalH) return null;

          const targetW = 128;
          const scale = targetW / naturalW;
          const w = Math.max(16, Math.min(targetW, naturalW));
          const h = Math.max(16, Math.floor(naturalH * scale));

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(imgEl, 0, 0, w, h);
          const { data } = ctx.getImageData(0, 0, w, h);

          const rowEnergy = new Array(h).fill(0);
          const toGray = (r, g, b) => r * 0.299 + g * 0.587 + b * 0.114;
          const idx = (x, y) => (y * w + x) * 4;

          for (let y = 1; y < h - 1; y += 1) {
            let sum = 0;
            for (let x = 0; x < w; x += 1) {
              const i1 = idx(x, y - 1);
              const i2 = idx(x, y + 1);
              const g1 = toGray(data[i1], data[i1 + 1], data[i1 + 2]);
              const g2 = toGray(data[i2], data[i2 + 1], data[i2 + 2]);
              sum += Math.abs(g2 - g1);
            }
            rowEnergy[y] = sum / w;
          }

          const start = Math.floor(h * 0.08);
          const end = Math.floor(h * 0.7);
          let bestY = start;
          let bestVal = -Infinity;

          for (let y = start; y < end; y += 1) {
            const e =
              (rowEnergy[y - 1] || 0) + rowEnergy[y] + (rowEnergy[y + 1] || 0);
            if (e > bestVal) {
              bestVal = e;
              bestY = y;
            }
          }

          const pct = Math.min(60, Math.max(10, Math.round((bestY / h) * 100)));
          return pct;
        } catch (error) {
          console.error('Failed to compute focal point for cat image', error);
          return null;
        }
      },
    []
  );

  const applyFocalPoint = useCallback(
    (imgEl) => {
      if (!imgEl) return;
      const container = containerRef.current;
      if (!container) return;

      const focal = computeFocalY(imgEl);
      if (focal != null) {
        container.style.setProperty('--image-pos-y', `${focal}%`);
      }
    },
    [computeFocalY]
  );

  const handleLoad = useCallback(
    (event) => {
      const target = event?.target || imageRef.current;
      applyFocalPoint(target);
      onLoad?.(event);
    },
    [applyFocalPoint, onLoad]
  );

  const handleError = useCallback(
    (event) => {
      if (event?.target?.src) {
        console.error('Image failed to load:', event.target.src);
      }
      onError?.(event);
    },
    [onError]
  );

  useEffect(() => {
    const imgEl = imageRef.current;
    if (imgEl && imgEl.complete) {
      applyFocalPoint(imgEl);
    }
  }, [applyFocalPoint, src]);

  if (!src) {
    return null;
  }

  const containerClasses = [containerClassName].filter(Boolean).join(' ');
  const mergedStyle = {
    ...containerStyle,
    ...(src ? { ['--bg-image']: `url(${src})` } : {})
  };

  const renderImage = () => {
    const commonProps = {
      ref: imageRef,
      src,
      alt,
      className: imageClassName,
      loading,
      decoding,
      onLoad: handleLoad,
      onError: handleError
    };

    if (String(src).startsWith('/assets/images/')) {
      const base = src.includes('.') ? src.replace(/\.[^.]+$/, '') : src;
      return (
        <picture>
          <source type="image/avif" srcSet={`${base}.avif`} />
          <source type="image/webp" srcSet={`${base}.webp`} />
          <img {...commonProps} />
        </picture>
      );
    }

    return <img {...commonProps} />;
  };

  return (
    <div ref={containerRef} className={containerClasses} style={mergedStyle}>
      {renderImage()}
    </div>
  );
}

CatImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  containerClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['async', 'auto', 'sync']),
  containerStyle: PropTypes.object,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default CatImage;
