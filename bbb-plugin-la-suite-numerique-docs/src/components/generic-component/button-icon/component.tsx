import * as React from 'react';
import { DOCS_AREA } from '../../suite-numerique-docs-integration/constants';

interface ButtonIconProps {
  currentArea: DOCS_AREA;
  iconName?: string;
}

export function ButtonIcon({ currentArea, iconName }: ButtonIconProps) {
  if (iconName && iconName !== '') {
    return (<i className={`icon-bbb-${iconName}`} />);
  }
  return currentArea === DOCS_AREA.MAIN_AREA ? (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ) : null;
}

ButtonIcon.defaultProps = {
  iconName: '',
};
