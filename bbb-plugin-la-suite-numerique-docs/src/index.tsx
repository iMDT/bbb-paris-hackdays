import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import SuiteNumeriqueDocsIntegration from './components/suite-numerique-docs-integration/component';

const uuid = document.currentScript?.getAttribute('uuid') || 'root';

const pluginName = document.currentScript?.getAttribute('pluginName') || 'plugin';

const script = document.currentScript as HTMLScriptElement;
const pluginBaseUrl = new URL(script.src);

const root = ReactDOM.createRoot(document.getElementById(uuid));
root.render(
  <SuiteNumeriqueDocsIntegration {...{
    pluginUuid: uuid,
    pluginName,
    pluginBaseUrl,
  }}
  />,
);
