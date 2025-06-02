interface SuiteNumeriqueDocsIntegrationProps {
    pluginName: string;
    pluginUuid: string;
    pluginBaseUrl: URL;
}

interface ExternalVideoMeetingSubscription {
    meeting: {
        externalVideo: {
            playerPlaying: boolean
            externalVideoUrl: string
        }
    }[]
}

interface DataToGenericLink {
    isUrlSameForRole: boolean;
    url: string;
    viewerUrl?: string
}

export { SuiteNumeriqueDocsIntegrationProps, ExternalVideoMeetingSubscription, DataToGenericLink };
