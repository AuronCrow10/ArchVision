import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './CanvasEditor.module.css';

export default function CanvasEditor({
  locationSrc,
  prospettoSrc,
  previewProspettoSrc = null,
  isCleanupPreviewUpdating = false,
  onChange,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0, offX: 0, offY: 0 });
  const [overlay, setOverlay] = useState(null);
  const [opacity, setOpacity] = useState(0.92);
  const [cleanBackground, setCleanBackground] = useState(true);
  const [lineThreshold, setLineThreshold] = useState(188);
  const [fillOpacity, setFillOpacity] = useState(0.86);
  const [lineStrength, setLineStrength] = useState(1);

  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const updateImgDisplay = useCallback(() => {
    const container = containerRef.current;
    if (!container || imgNatural.w === 0) return;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const ratio = imgNatural.w / imgNatural.h;
    let dW;
    let dH;
    if (cW / cH > ratio) {
      dH = cH;
      dW = cH * ratio;
    } else {
      dW = cW;
      dH = cW / ratio;
    }
    setImgDisplay({ w: dW, h: dH, offX: (cW - dW) / 2, offY: (cH - dH) / 2 });
  }, [imgNatural]);

  useEffect(() => {
    const ro = new ResizeObserver(updateImgDisplay);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateImgDisplay]);

  useEffect(() => {
    if (!locationSrc) return;
    const img = new Image();
    img.onload = () => setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = locationSrc;
  }, [locationSrc]);

  useEffect(() => {
    updateImgDisplay();
  }, [imgNatural, updateImgDisplay]);

  useEffect(() => {
    if (!prospettoSrc || imgNatural.w === 0) return;
    const img = new Image();
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const initW = Math.round(imgNatural.w * 0.45);
      const initH = Math.round(initW / aspect);
      setOverlay({
        x: Math.round((imgNatural.w - initW) / 2),
        y: Math.round((imgNatural.h - initH) / 2),
        w: initW,
        h: initH,
      });
    };
    img.src = prospettoSrc;
  }, [prospettoSrc, imgNatural]);

  useEffect(() => {
    if (!overlay || !onChange) return;
    onChange({
      x: overlay.x,
      y: overlay.y,
      width: overlay.w,
      height: overlay.h,
      opacity,
      cleanup: {
        enabled: cleanBackground,
        lineThreshold,
        fillOpacity,
        lineStrength,
      },
    });
  }, [overlay, opacity, cleanBackground, lineThreshold, fillOpacity, lineStrength, onChange]);

  const getScale = useCallback(
    () => (imgDisplay.w > 0 ? imgNatural.w / imgDisplay.w : 1),
    [imgNatural.w, imgDisplay.w],
  );

  const overlayRef = useRef(null);
  overlayRef.current = overlay;

  const onMouseDownDrag = useCallback(
    (e) => {
      e.preventDefault();
      const scale = getScale();
      const cur = overlayRef.current;
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: cur.x, origY: cur.y, scale };
      const onMove = (me) => {
        const dx = (me.clientX - dragRef.current.startX) * dragRef.current.scale;
        const dy = (me.clientY - dragRef.current.startY) * dragRef.current.scale;
        setOverlay((o) => ({
          ...o,
          x: Math.round(dragRef.current.origX + dx),
          y: Math.round(dragRef.current.origY + dy),
        }));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [getScale],
  );

  const onMouseDownResize = useCallback(
    (e, handle) => {
      e.preventDefault();
      e.stopPropagation();
      const scale = getScale();
      const cur = overlayRef.current;
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: cur.w,
        origH: cur.h,
        origX: cur.x,
        origY: cur.y,
        scale,
      };
      const MIN = 60;
      const onMove = (me) => {
        const dx = (me.clientX - resizeRef.current.startX) * resizeRef.current.scale;
        const dy = (me.clientY - resizeRef.current.startY) * resizeRef.current.scale;
        const { origW, origH, origX, origY } = resizeRef.current;
        let x = origX;
        let y = origY;
        let w = origW;
        let h = origH;
        switch (handle) {
          case 'se':
            w = Math.max(MIN, origW + dx);
            h = Math.max(MIN, origH + dy);
            break;
          case 'sw':
            w = Math.max(MIN, origW - dx);
            h = Math.max(MIN, origH + dy);
            x = origX + origW - w;
            break;
          case 'ne':
            w = Math.max(MIN, origW + dx);
            h = Math.max(MIN, origH - dy);
            y = origY + origH - h;
            break;
          case 'nw':
            w = Math.max(MIN, origW - dx);
            h = Math.max(MIN, origH - dy);
            x = origX + origW - w;
            y = origY + origH - h;
            break;
          case 'e':
            w = Math.max(MIN, origW + dx);
            break;
          case 'w':
            w = Math.max(MIN, origW - dx);
            x = origX + origW - w;
            break;
          case 's':
            h = Math.max(MIN, origH + dy);
            break;
          case 'n':
            h = Math.max(MIN, origH - dy);
            y = origY + origH - h;
            break;
          default:
            break;
        }
        setOverlay({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [getScale],
  );

  const screenOverlay =
    overlay && imgDisplay.w > 0
      ? {
          x: imgDisplay.offX + (overlay.x / imgNatural.w) * imgDisplay.w,
          y: imgDisplay.offY + (overlay.y / imgNatural.h) * imgDisplay.h,
          w: (overlay.w / imgNatural.w) * imgDisplay.w,
          h: (overlay.h / imgNatural.h) * imgDisplay.h,
        }
      : null;

  const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
  const displayProspettoSrc =
    cleanBackground && previewProspettoSrc ? previewProspettoSrc : prospettoSrc;

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvas} ref={containerRef}>
        {locationSrc ? (
          <img
            ref={imgRef}
            src={locationSrc}
            alt="Foto della location"
            className={styles.locationImg}
            draggable={false}
            onLoad={updateImgDisplay}
          />
        ) : (
          <div className={styles.emptyLocation}>Carica una foto della location</div>
        )}
        {screenOverlay && prospettoSrc && (
          <div
            className={styles.overlay}
            style={{
              left: screenOverlay.x,
              top: screenOverlay.y,
              width: screenOverlay.w,
              height: screenOverlay.h,
              opacity,
            }}
            onMouseDown={onMouseDownDrag}
          >
            <img src={displayProspettoSrc} alt="Prospetto" className={styles.prospettoImg} draggable={false} />
            {handles.map((h) => (
              <div
                key={h}
                className={`${styles.handle} ${styles[`handle-${h}`]}`}
                onMouseDown={(e) => onMouseDownResize(e, h)}
              />
            ))}
          </div>
        )}
      </div>
      {overlay && (
        <div className={styles.toolbar}>
          <label className={styles.sliderLabel}>
            Opacità del prospetto
            <span className={styles.sliderValue}>{Math.round(opacity * 100)}%</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className={styles.slider}
          />

          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={cleanBackground}
              onChange={(e) => setCleanBackground(e.target.checked)}
            />
            Pulisci lo sfondo del foglio per l'AI
          </label>
          {cleanBackground && (
            <p className={styles.cleanupHint}>
              L'anteprima live usa lo stesso asset pulito del backend usato in "Applica posizionamento".
            </p>
          )}
          {cleanBackground && isCleanupPreviewUpdating && (
            <p className={styles.cleanupHint}>Aggiornamento anteprima di pulizia in corso...</p>
          )}

          {cleanBackground && (
            <>
              <label className={styles.sliderLabel}>
                Riempimento struttura
                <span className={styles.sliderValue}>{Math.round(fillOpacity * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.35}
                max={1}
                step={0.01}
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className={styles.slider}
              />

              <label className={styles.sliderLabel}>
                Sensibilità linee
                <span className={styles.sliderValue}>{lineThreshold}</span>
              </label>
              <input
                type="range"
                min={120}
                max={230}
                step={1}
                value={lineThreshold}
                onChange={(e) => setLineThreshold(parseInt(e.target.value, 10))}
                className={styles.slider}
              />

              <label className={styles.sliderLabel}>
                Intensità linee
                <span className={styles.sliderValue}>{lineStrength}</span>
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={lineStrength}
                onChange={(e) => setLineStrength(parseInt(e.target.value, 10))}
                className={styles.slider}
              />
            </>
          )}
          <div className={styles.coords}>
            <span>X {overlay.x}px</span>
            <span>Y {overlay.y}px</span>
            <span>W {overlay.w}px</span>
            <span>H {overlay.h}px</span>
          </div>
        </div>
      )}
    </div>
  );
}
