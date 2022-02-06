import { useRef, useState } from 'react';
import classNames from 'classnames';
import ReactEasyCrop from 'react-easy-crop';
import { MountingTransition } from '@ricokahler/react-mounting-transition';
import { cropImage } from './helpers';
import styles from './cropper.module.css';

interface Props {
  open: boolean;
  imageUrl: string;
  onCrop: (imageUrl: string) => void;
  onClear: () => void;
  onCancel: () => void;
}

export function Cropper({ open, imageUrl, onCancel, onClear, onCrop }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const cropperRef = useRef<ReactEasyCrop | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);

    try {
      const cropData = cropperRef.current?.getCropData();
      if (!cropData) return;

      const { croppedAreaPixels } = cropData;
      const result = await cropImage({
        imageUrl,
        ...croppedAreaPixels,
      });

      onCrop(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MountingTransition
      mounted={open}
      portal={{ containerClass: styles.container }}
      timeout={500}
      onMount={() => {
        setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 0);
      }}
    >
      {({ active }) => (
        <>
          <div
            className={classNames(styles.backdrop, {
              [styles.backdropActive]: active,
            })}
          />

          <div
            className={classNames(styles.drawer, {
              [styles.drawerActive]: active,
            })}
          >
            <button
              ref={(el) => {
                closeButtonRef.current = el;
              }}
              className={styles.close}
              title="Close"
              onClick={onCancel}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-50 -50 100 100"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="20px"
                  strokeLinecap="round"
                  d="M -50 -50 l 100 100"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="20px"
                  strokeLinecap="round"
                  d="M -50 50 l 100 -100"
                />
              </svg>
            </button>

            <div className={styles.cropper}>
              <ReactEasyCrop
                ref={cropperRef}
                image={imageUrl}
                classes={{ cropAreaClassName: styles.cropArea }}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                cropShape="round"
                aspect={1}
              />
            </div>

            <div className={styles.buttons}>
              <button onClick={onClear}>change pfp</button>
              <button onClick={handleDone} disabled={loading}>
                {loading ? 'loading…' : 'done'}
              </button>
            </div>
          </div>
        </>
      )}
    </MountingTransition>
  );
}
