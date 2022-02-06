import { useState, useEffect, useRef, useDeferredValue, useMemo } from 'react';
import {
  createPolygonPath,
  fileToDataUri,
  scaleImage,
  isMobileDevice,
} from './helpers';
import { throttle } from 'lodash';
import { RangeSlider } from './range-slider';
import { Cropper } from './cropper';
import { SavedPfp } from './saved-pfp';
import styles from './app.module.css';

export function App() {
  const [originalImage, setOriginalImage] = useState('');
  const [croppedImage, setCroppedImage] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [sides, setSides] = useState(6);
  const [smoothness, setSmoothness] = useState(0.5);
  const [throttledSmoothness, _setThrottledSmoothness] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [savedSvg, setSavedSvg] = useState<SVGSVGElement | null>(null);

  const setThrottledSmoothness = useMemo(() => {
    return throttle(_setThrottledSmoothness, 50);
  }, []);

  useEffect(() => {
    if (originalImage) {
      setCropperOpen(true);
    }
  }, [originalImage]);

  const { path, x, y, width, height, viewBox, bounds } = createPolygonPath({
    rotation: useDeferredValue(rotation),
    sides: useDeferredValue(sides),
    smoothness: useDeferredValue(throttledSmoothness),
  });

  const handleSave = () => {
    if (svgRef.current) {
      setSavedSvg(svgRef.current.cloneNode(true) as SVGSVGElement);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>hexagon</span>
          <span className={styles.pfp}>pfp</span>
          <span>.org</span>
        </h1>

        <div>where everyone gets a hexagon pfp.</div>
      </header>

      <Cropper
        imageUrl={originalImage}
        onCrop={(imageUrl) => {
          setCropperOpen(false);
          setCroppedImage(imageUrl);
        }}
        open={cropperOpen}
        onClear={() => {
          inputRef.current?.click();
        }}
        onCancel={() => setCropperOpen(false)}
      />

      <div className={styles.hexagonWrapper}>
        {croppedImage ? (
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
          >
            <defs>
              <clipPath id="clipPath">
                <path d={path} />
              </clipPath>
            </defs>
            <image
              href={croppedImage}
              height={height}
              width={width}
              x={x}
              y={y}
              clipPath="url(#clipPath)"
            />
          </svg>
        ) : (
          <button
            className={styles.svgButton}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox={viewBox}
            >
              <defs>
                <linearGradient id="Gradient1">
                  <stop className="stop1" offset="0%" stopColor="#8900c8" />
                  <stop className="stop3" offset="100%" stopColor="#0025cc" />
                </linearGradient>
              </defs>

              <path d={path} fill="url(#Gradient1)" />

              <g style={{ transform: `scale(${bounds * 0.005})` }}>
                <g style={{ transform: `translateX(-130px)` }}>
                  <text dx={64} style={{ fontSize: 128 }}>
                    😏
                  </text>
                  <text
                    style={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      fill: 'white',
                      textAlign: 'center',
                    }}
                    dy={50}
                    dx={7}
                  >
                    this could be you
                  </text>
                  <text
                    dy={80}
                    dx={isMobileDevice() ? 2 : -4}
                    style={{
                      fontSize: 24,
                      fill: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {isMobileDevice() ? 'tap' : 'click'} here to pick a photo
                  </text>
                </g>
              </g>
            </svg>
          </button>
        )}

        {!!originalImage && (
          <button className={styles.edit} onClick={() => setCropperOpen(true)}>
            edit
          </button>
        )}
      </div>

      <input
        hidden
        ref={inputRef}
        type="file"
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;

          const dataUri = await fileToDataUri(file);
          setOriginalImage(await scaleImage(dataUri));
        }}
        accept="image/*"
      />

      <div className={styles.controls}>
        <RangeSlider
          label="Rotation"
          value={rotation}
          onChange={(e) => setRotation(parseFloat(e.currentTarget.value))}
          displayValue={`${(rotation * (360 / sides)).toFixed()}°`}
          min={0}
          max={1}
          step={1 / 100}
          list="smooth"
          datalist={
            <>
              <option value={0} />
              <option value={1 / 4} />
              <option value={2 / 4} />
              <option value={3 / 4} />
            </>
          }
        />

        <RangeSlider
          label="Smoothness"
          value={smoothness}
          onChange={(e) => {
            const smoothness = parseFloat(e.currentTarget.value);
            setSmoothness(smoothness);
            setThrottledSmoothness(smoothness);
          }}
          displayValue={`${(((smoothness + 0.5) * 2 - 1) * 100).toFixed()}%`}
          min={0}
          max={1}
          step={1 / 200}
          list="smooth"
          datalist={
            <>
              <option value={0} />
              <option value={1 / 4} />
              <option value={2 / 4} />
              <option value={3 / 4} />
            </>
          }
        />

        <RangeSlider
          label="Sides"
          value={sides}
          displayValue={sides}
          onChange={(e) => setSides(parseInt(e.currentTarget.value, 10))}
          min={3}
          max={10}
          step={1}
        />

        <button
          className={styles.save}
          disabled={!croppedImage || !!savedSvg}
          onClick={handleSave}
        >
          Save PFP
        </button>
      </div>

      <SavedPfp
        svgElement={savedSvg}
        onCancel={() => setSavedSvg(null)}
        onRetry={handleSave}
      />
    </>
  );
}
