import { Drawer } from './drawer';
import { createPromiseSuspender } from '@ricokahler/promise-suspender';
import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { assignId, svgToPngDataUrl, isMobileDevice } from './helpers';
import { MountingTransition } from '@ricokahler/react-mounting-transition';
import styles from './saved-pfp.module.css';
import classNames from 'classnames';

const usePromise = createPromiseSuspender();

interface Props {
  svgElement: SVGSVGElement | null;
  onCancel: () => void;
  onRetry: () => void;
}

export function SavedPfp({ svgElement, onCancel, onRetry }: Props) {
  return (
    <Drawer open={!!svgElement} onClose={onCancel}>
      <div className={styles.savedPfp}>
        <ErrorBoundary
          fallback={
            <div className={styles.messages}>
              An error occurred while generating your pfp.{' '}
              <button className={styles.retry} onClick={onRetry}>
                {isMobileDevice() ? 'tap' : 'click'} here
              </button>{' '}
              to retry.
            </div>
          }
        >
          <Suspense fallback={<div className={styles.message}>Loading…</div>}>
            <PfpImage svgElement={svgElement} />
            <div>
              {isMobileDevice() ? 'Tap and hold' : 'Right click'} to save.
            </div>
            <div>
              If you don't see a picture{' '}
              <button className={styles.retry} onClick={onRetry}>
                {isMobileDevice() ? 'tap' : 'click'} here
              </button>{' '}
              to retry.
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Drawer>
  );
}

interface PfpImageProps {
  svgElement: SVGSVGElement | null;
}

function PfpImage({ svgElement }: PfpImageProps) {
  const [mounted, setMounted] = useState(false);

  const pngImageUrl = usePromise(
    () => svgToPngDataUrl(svgElement),
    [assignId(svgElement)],
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [svgElement]);

  return (
    <MountingTransition mounted={mounted} timeout={500}>
      {({ active }) => (
        <img
          className={classNames(styles.pfpImage, {
            [styles.pfpImageActive]: active,
          })}
          alt="hexagon PFP"
          src={pngImageUrl}
        />
      )}
    </MountingTransition>
  );
}
