import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
const serverSecuritySalt = require('../serverSecuritySalt');

class CreateController {
    async handleRequest(req: Request, res: Response) {
        logger.info(`---------------New request received: ${req.path}`);

        console.log('Query received:', req.query);

        const meetingName = req.query['name'];

        const params = new URLSearchParams({});



        const docsResponse = await axios.post('http://localhost:3099/create', {
            name: meetingName
        });

        // curl -X POST http://localhost:3000/create -H 'Content-type: application/json' -d '{"name": "Teste 17:24"}'

        if(docsResponse.status === 201 && docsResponse.data.url) {
            logger.info(`Docs created ${docsResponse.data.url}.`);
            params.set('meta_docs-document-url', docsResponse.data.url);
        }


        // const myMeetingUrl = 'https://docs-hackdays.h.elos.dev/docs/99152e4b-36f7-4462-b358-3720beed9434/';
        // params.set('meta_docs-document-url', myMeetingUrl);

        for(let param in req.query) {
            if(param == 'checksum') continue;

            if(typeof req.query[param]  == 'string') {
                params.set(param,req.query[param]);
            }
        }

        const requestUrl = `http://127.0.0.1:8090/bigbluebutton/api/create/`;
        const controller = 'create';
        const checksumSource=`${controller}${params.toString()}${serverSecuritySalt.getSecuritySalt()}`

        params.set('checksum',require('crypto').createHash('sha1').update(checksumSource).digest('hex'));


        logger.info(`---------------Sending request to: ${requestUrl}?${params.toString()}`);

        // const url = `${TARGET_APP_URL}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;



        try {
            let response;
            if (req.method === 'GET') {
                response = await axios.get(requestUrl, { params: params, headers: req.headers });
            } else if (req.method === 'POST') {
                response = await axios.post(requestUrl, req.body, { params: params, headers: req.headers });
            } else {
                logger.error(`Unsupported method: ${req.method}.`);
                return res.status(405).json({ error: 'Unsupported method.' });
            }

            res.status(response.status);
            res.set(response.headers);

            return res.send(response.data);
        } catch (error) {
            logger.error('Error while processing request:', error);
            return res.status(500).json({ error: 'Error while processing request.', details: error });
        }
    }
}

export default new CreateController();
