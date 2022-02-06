import { useRef, useState } from 'react';
import ReactEasyCrop from 'react-easy-crop';
import { cropImage } from './helpers';
import styles from './cropper.module.css';
import { Drawer } from './drawer';

interface Props {
  open: boolean;
  imageUrl: string;
  onCrop: (imageUrl: string) => void;
  onClear: () => void;
  onCancel: () => void;
}

export function Cropper({ open, imageUrl, onCancel, onClear, onCrop }: Props) {
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
    <Drawer open={open} onClose={onCancel}>
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
    </Drawer>
  );
}
