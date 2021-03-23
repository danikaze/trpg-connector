import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { ModalOverlay } from '@components/ui/modal-overlay';
import { makeStyles } from '@utils/styles';

export interface Props {
  onSelect?: (confirm: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

const useStyles = makeStyles(() => ({
  overlay: {
    display: 'flex',
  },
  root: {
    position: 'absolute',
    top: 18,
    right: 70,
    width: 8,
    height: 8,
    borderRadius: 5,
    cursor: 'pointer',
  },
  buttons: {
    display: 'flex',
  },
}));

export const Confirm: FunctionComponent<Props> = ({
  onSelect,
  onConfirm,
  onCancel,
  className,
  children,
}) => {
  const styles = useStyles();
  const rootClasses = clsx(className, styles.root);

  const handleCancel = () => {
    onSelect && onSelect(false);
    onCancel && onCancel();
  };

  const handleConfirm = () => {
    onSelect && onSelect(true);
    onConfirm && onConfirm();
  };

  return (
    <ModalOverlay className={styles.overlay} onClose={handleCancel}>
      <div className={rootClasses} onClick={handleCancel}>
        {children}
        <div className={styles.buttons}>
          <button className="btn" onClick={handleConfirm}>
            OK
          </button>
          <button className="btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
