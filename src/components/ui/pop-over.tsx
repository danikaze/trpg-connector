import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { ModalOverlay } from '@components/ui/modal-overlay';
import { makeStyles } from '@utils/styles';

export interface Props {
  relativeTo: HTMLElement;
  arrow?: 'top-right';
  onClose?: () => void;
  className?: string;
}

interface StyleParams {
  top: number;
  right: number;
}

const ARROW_SIZE = 10;
const ARROW_OFFSET = 10;
const OFFSET_FIX = -2;

const useStyles = makeStyles<StyleParams>(() => ({
  root: ({ top, right }) => ({
    top,
    right,
    position: 'absolute',
    padding: 10,
    background: '#fff',
    borderRadius: 4,
    border: '1px solid #ddd',
    minWidth: 30,
    boxShadow: '0px 0px 10px 0px rgb(0 0 0 / 20%)',
  }),
  arrow: {
    backgroundColor: '#fff',
    position: 'absolute',
    height: ARROW_SIZE,
    width: ARROW_SIZE,
  },
  'top-right': {
    right: ARROW_OFFSET,
    top: 0,
    borderLeft: '1px solid #ddd',
    borderTop: '1px solid #ddd',
    transform: 'translate(-50%, -50%) rotate(45deg)',
  },
}));

export const PopOver: FunctionComponent<Props> = ({
  relativeTo,
  arrow,
  onClose,
  children,
  className,
}) => {
  const styles = useStyles(getPosition(relativeTo));
  const rootClasses = clsx(className, styles.root);
  const arrowClasses = clsx(styles.arrow, styles[arrow || 'top-right']);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    ev.stopPropagation();
  };

  return (
    <ModalOverlay transparent onClose={onClose}>
      <div className={rootClasses} onClick={handleClick}>
        <div className={arrowClasses} />
        {children}
      </div>
    </ModalOverlay>
  );
};

function getPosition(relativeTo: HTMLElement) {
  const bounds = relativeTo.getBoundingClientRect();
  return {
    top: bounds.bottom + ARROW_SIZE,
    right:
      window.innerWidth -
      bounds.right -
      ARROW_OFFSET -
      ARROW_SIZE / 2 +
      OFFSET_FIX,
  };
}
