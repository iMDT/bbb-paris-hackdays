#!/usr/bin/env bash

cd "$(dirname "$0")"
INSTALL_DIR=$(pwd)

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      sudo rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
  sudo npm ci --no-progress
fi

# Copy files
sudo mkdir -p /usr/local/docs-api
sudo chown -R bigbluebutton:bigbluebutton /usr/local/docs-api
sudo npm run build
sudo mv -f dist/server.js dist/docs-api.js
sudo cp -rf dist/* /usr/local/docs-api
sudo cp package.json /usr/local/docs-api/
sudo cp package-lock.json /usr/local/docs-api/
cd /usr/local/docs-api/
npm ci --no-progress --omit=dev
sudo chown -R bigbluebutton:bigbluebutton /usr/local/docs-api

cd $INSTALL_DIR

#Service
sudo cp docs-api.service /lib/systemd/system/docs-api.service
sudo systemctl daemon-reload
sudo systemctl enable docs-api
sudo systemctl restart docs-api


echo ''
echo ''
echo '----------------'
echo 'docs-api updated'
