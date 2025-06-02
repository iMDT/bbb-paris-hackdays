# Repository of a plugin for BigBlueButton

## Description

This is the code for the official BigBlueButton plugin integration for [La Suite numérique Docs](https://github.com/suitenumerique/docs). It encapsulates the docs into a BigBlueButton sidebar component, and it is possible to move it to the main area. See demo ahead:

![Demo video for integration with la suite numérique docs](assets/docs_integration_in_bbb30.mp4)

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd bbb-paris-hackdays/bbb-plugin-la-suite-numerique-docs
npm ci
npm run build-bundle
```

The above command will generate the `dist` folder, containing the bundled JavaScript file named `BbbPluginLaSuiteNumeriqueDocs.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the Plugin separated to the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
