import { FunctionComponent, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PORTAL_ID = '__trpg-portal';

interface Props {
  id?: string;
  parent?: HTMLElement;
}

export const BodyPortal: FunctionComponent<Props> = ({
  children,
  id,
  parent,
}) => {
  useEffect(
    () => () => {
      (parent || document.body).removeChild(portalElem!);
    },
    [id]
  );

  const random = String(Math.random()).substr(2);
  const elemId = id || `${PORTAL_ID}-${random}`;

  let portalElem = document.getElementById(PORTAL_ID);
  if (!portalElem) {
    portalElem = document.createElement('div');
    portalElem.id = elemId;
    (parent || document.body).appendChild(portalElem);
  }

  return createPortal(children, portalElem!);
};
