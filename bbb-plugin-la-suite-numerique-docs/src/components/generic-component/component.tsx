import * as React from 'react';
import Iframe from 'react-iframe';
import { DOCS_AREA } from '../suite-numerique-docs-integration/constants';
import { ButtonIcon } from './button-icon/component';

interface GenericComponentLinkShareProps {
  link: string;
  switchGenericContentArea: () => void;
  renderArea: DOCS_AREA;
}

function GenericComponentLinkShare(props: GenericComponentLinkShareProps): React.ReactElement {
  const { link, switchGenericContentArea, renderArea } = props;

  const changeAreaButtonStyle: React.CSSProperties = {
    zIndex: 1000,
    position: 'absolute',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    transition: 'background-color 0.2s',
  };

  let tooltipButton;
  if (renderArea === DOCS_AREA.SIDEKICK_AREA) {
    tooltipButton = 'Pin in main area';
    changeAreaButtonStyle.top = 8;
    changeAreaButtonStyle.right = 8;
  } else {
    tooltipButton = 'Send back to sidebar';
    changeAreaButtonStyle.bottom = 8;
    changeAreaButtonStyle.left = 8;
  }
  return (
    <div
      style={{
        background: 'white',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <button
        onClick={switchGenericContentArea}
        type="button"
        title={tooltipButton}
        style={changeAreaButtonStyle}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        onFocus={() => {}}
        onBlur={() => {}}
      >
        <ButtonIcon
          size={18}
          currentArea={renderArea}
        />
      </button>
      <Iframe
        url={link}
        width="100%"
        height="100%"
        display="block"
        position="relative"
      />
    </div>
  );
}

export default GenericComponentLinkShare;
