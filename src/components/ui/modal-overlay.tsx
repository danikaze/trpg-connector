import clsx from 'clsx';
import React, { FunctionComponent, useEffect } from 'react';
import { makeStyles } from '@utils/styles';
import { BodyPortal } from '@components/portal';

export interface Props {
  transparent?: boolean;
  onClose?: () => void;
  className?: string;
}

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  transparent: {
    background: 'rgba(0, 0, 0, 0)',
  },
  shadow: {
    cursor: 'pointer',
    background: 'rgba(0, 0, 0, 0.6)',
  },
}));

export const ModalOverlay: FunctionComponent<Props> = ({
  transparent,
  onClose,
  children,
  className,
}) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose && onClose();
    };

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  });

  const styles = useStyles();
  const classes = clsx(
    className,
    styles.root,
    transparent ? styles.transparent : styles.shadow
  );

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    ev.stopPropagation();
    onClose && onClose();
  };

  const overlay = (
    <div className={classes} onClick={handleClick}>
      {children}
    </div>
  );

  return <BodyPortal>{overlay}</BodyPortal>;
};
