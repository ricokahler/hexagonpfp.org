import { useRef } from 'react';
import { MountingTransition } from '@ricokahler/react-mounting-transition';
import styles from './drawer.module.css';
import classNames from 'classnames';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ open, children, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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
              onClick={onClose}
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

            {children}
          </div>
        </>
      )}
    </MountingTransition>
  );
}
