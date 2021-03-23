import React, { FunctionComponent } from 'react';

interface Props {
  className?: string;
}

export const Button: FunctionComponent<Props> = ({ children, className }) => {
  return <button className={className}>{children}</button>;
};
