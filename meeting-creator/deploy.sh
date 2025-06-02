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
sudo mkdir -p /usr/local/bbb-meeting-creator
sudo chown -R bigbluebutton:bigbluebutton /usr/local/bbb-meeting-creator
sudo npm run build
sudo mv -f dist/app.js dist/bbb-meeting-creator.js
sudo cp -rf dist/* /usr/local/bbb-meeting-creator
sudo cp package.json /usr/local/bbb-meeting-creator/
sudo cp package-lock.json /usr/local/bbb-meeting-creator/
sudo cp -R src/config /usr/local/bbb-meeting-creator/config
cd /usr/local/bbb-meeting-creator/
npm ci --no-progress --omit=dev
sudo chown -R bigbluebutton:bigbluebutton /usr/local/bbb-meeting-creator

cd $INSTALL_DIR

#Service
sudo cp bbb-meeting-creator.service /lib/systemd/system/bbb-meeting-creator.service
sudo systemctl daemon-reload
sudo systemctl enable bbb-meeting-creator
sudo systemctl restart bbb-meeting-creator

# Nginx
sudo cp bbb-meeting-creator.nginx /usr/share/bigbluebutton/nginx/bbb-meeting-creator.nginx
sudo systemctl restart nginx


echo ''
echo ''
echo '----------------'
echo 'bbb-meeting-creator updated'
