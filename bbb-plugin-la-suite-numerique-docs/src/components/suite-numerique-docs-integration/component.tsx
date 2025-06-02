import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  BbbPluginSdk,
  GenericContentMainArea,
  PluginApi,
  GenericContentSidekickArea,
} from 'bigbluebutton-html-plugin-sdk';

import GenericComponentLinkShare from '../generic-component/component';

import { SuiteNumeriqueDocsIntegrationProps } from './types';
import { DOCS_AREA, REGEX } from './constants';

function SuiteNumeriqueDocsIntegration(
  { pluginUuid: uuid, pluginBaseUrl }: SuiteNumeriqueDocsIntegrationProps,
): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const [documentUrl, setDocumentUrl] = useState('');
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const renderDocsInArea = (area: DOCS_AREA, open: boolean) => {
    if (area === DOCS_AREA.MAIN_AREA) {
      pluginApi.setGenericContentItems([]);
      pluginApi.setGenericContentItems([
        new GenericContentMainArea({
          contentFunction: (element: HTMLElement) => {
            const root = ReactDOM.createRoot(element);
            root.render(
              <GenericComponentLinkShare
                link={documentUrl}
                renderArea={DOCS_AREA.MAIN_AREA}
                switchGenericContentArea={
                  () => renderDocsInArea(DOCS_AREA.SIDEKICK_AREA, true)
                }
              />,
            );
            return root;
          },
        }),
      ]);
    } else {
      pluginApi.setGenericContentItems([]);
      pluginApi.setGenericContentItems([
        new GenericContentSidekickArea({
          name: 'Docs',
          section: 'Document',
          buttonIcon: 'file',
          open,
          contentFunction: (element: HTMLElement) => {
            const root = ReactDOM.createRoot(element);
            root.render(
              <GenericComponentLinkShare
                link={documentUrl}
                renderArea={DOCS_AREA.SIDEKICK_AREA}
                switchGenericContentArea={
                  () => renderDocsInArea(DOCS_AREA.MAIN_AREA, false)
                }
              />,
            );
            return root;
          },
        }),
      ]);
    }
  };

  useEffect(() => {
    const docsDocumentFromPluginUrl = pluginBaseUrl.search.replace('?docsUrl=', '');
    if (docsDocumentFromPluginUrl) {
      setDocumentUrl(docsDocumentFromPluginUrl);
    }
  }, []);

  useEffect(() => {
    if (documentUrl.match(REGEX)) {
      renderDocsInArea(DOCS_AREA.SIDEKICK_AREA, false);
    } else {
      pluginApi.setGenericContentItems([]);
    }
  }, [documentUrl]);
  return null;
}

export default SuiteNumeriqueDocsIntegration;
