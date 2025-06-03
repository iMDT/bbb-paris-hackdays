import * as React from 'react';
import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  BbbPluginSdk,
  GenericContentMainArea,
  PluginApi,
  GenericContentSidekickArea,
  PresentationWhiteboardUiDataNames,
  PresentationToolbarButton,
  pluginLogger,
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
  const { data: presentationInformation } = pluginApi.useCurrentPresentation();

  const appendData = async (base64Content: string, url: string) => {
    const response = await fetch('https://hackdays-docs-bbb.bbb.imdt.dev/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        pngBase64: base64Content,
      }),
    });
    if (!response.ok) {
      pluginLogger.error('Failed to append data:', response.statusText);
      return;
    }

    const data = await response.json();
    pluginLogger.info('Append response:', data);
  };

  useEffect(() => {
    if (presentationInformation
      && presentationInformation?.currentPage?.urlsJson?.png
      && documentUrl) {
      const currentObjectToSendToClient = new PresentationToolbarButton({
        label: 'Get the snapshot of current slide.',
        tooltip: 'The content will be shown in the console.',
        style: {},
        onClick: () => {
          pluginApi.getUiData(
            PresentationWhiteboardUiDataNames.CURRENT_PAGE_SNAPSHOT,
          ).then((pngDataResult) => {
            const dataToSend = pngDataResult.base64Png.replace('data:image/png;base64,', '');
            appendData(dataToSend, documentUrl);
            pluginLogger.info('Here is the base64', pngDataResult);
          }).catch((err) => {
            pluginLogger.error('Ops, something went wrong when getting the snapshot', err);
          });
        },
      });
      pluginApi.setPresentationToolbarItems([currentObjectToSendToClient]);
    }
  }, [presentationInformation, documentUrl]);

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
