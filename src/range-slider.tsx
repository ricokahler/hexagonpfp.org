import classNames from 'classnames';
import { useMemo } from 'react';
import { randomId } from './helpers';
import styles from './range-slider.module.css';

type Props = JSX.IntrinsicElements['input'] & {
  label: React.ReactNode;
  datalist?: React.ReactNode;
  displayValue: React.ReactNode;
};

export function RangeSlider({
  className,
  datalist,
  label,
  displayValue,
  ...props
}: Props) {
  const id = useMemo(randomId, []);
  const listId = `list-${id}`;

  return (
    <>
      <div className={classNames(styles.formControl, className)}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>

        <div className={styles.wrapper}>
          <input
            id={id}
            className={styles.range}
            type="range"
            {...(datalist && { list: listId })}
            {...props}
          />
        </div>

        <div className={styles.displayValue}>{displayValue}</div>
      </div>

      {datalist && <datalist id={listId}>{datalist}</datalist>}
    </>
  );
}
