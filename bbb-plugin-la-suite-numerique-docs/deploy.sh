npm ci
npm run build-bundle
sudo mkdir -p /var/www/bigbluebutton-default/assets/plugins

sudo cp manifest.json /var/www/bigbluebutton-default/assets/plugins/BbbPluginLaSuiteNumeriqueDocsManifest.json
sudo cp dist/BbbPluginLaSuiteNumeriqueDocs.js /var/www/bigbluebutton-default/assets/plugins/BbbPluginLaSuiteNumeriqueDocs.js

echo "Include BbbPluginLaSuiteNumeriqueDocs.json to config pluginManifests at /etc/bigbluebutton/bbb-web.properties"
# pluginManifests=[{"url":"https://<your-domain>/plugins/BbbPluginLaSuiteNumeriqueDocsManifest.json"}]
