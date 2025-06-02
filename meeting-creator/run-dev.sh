#!/usr/bin/env bash
cd "$(dirname "$0")"

sudo cp bbb-meeting-creator.nginx /usr/share/bigbluebutton/nginx/bbb-meeting-creator.nginx
sudo systemctl restart nginx

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm install
fi

sudo systemctl stop bbb-meeting-creator
npm start
