import * as React from 'react';
import { DOCS_AREA } from '../../suite-numerique-docs-integration/constants';

interface ButtonIconProps {
  size: number;
  currentArea: DOCS_AREA;
}

export function ButtonIcon({ size = 18, currentArea }: ButtonIconProps) {
  return currentArea === DOCS_AREA.MAIN_AREA ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 4 15 9 20 9" />
      <line x1="15" y1="9" x2="21" y2="3" />

      <polyline points="9 20 9 15 4 15" />
      <line x1="9" y1="15" x2="3" y2="21" />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 8 4 4 8 4" />
      <line x1="4" y1="4" x2="10" y2="10" />
      <polyline points="20 16 20 20 16 20" />
      <line x1="20" y1="20" x2="14" y2="14" />
    </svg>
  );
}
