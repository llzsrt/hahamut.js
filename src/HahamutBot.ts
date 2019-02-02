import { HahamutMessage } from './HahamutMessage';
import { ReceivedData, Message } from './types/Message';
import { EventEmitter } from 'events';
import request from 'request';
import https from 'https';
import crypto from 'crypto';

const HAHAMUT_API_HOST: string = "https://us-central1-hahamut-8888.cloudfunctions.net";

export class HahamutBot extends EventEmitter {
    private appSecret: string;
    private server: https.Server;
    private messagePushUrl: string;
    private imagePushUrl: string;

    constructor(token: { accessToken: string, appSecret: string }, sslOptions: any) {
        super();

        let self: HahamutBot = this;

        this.appSecret = token.appSecret;

        this.messagePushUrl = "/messagePush?access_token=" + token.accessToken;
        this.imagePushUrl = "/ImgmessagePush?access_token=" + token.accessToken;
        
        this.server = https.createServer(sslOptions);
        this.server.on("request", (request, response) => {
            if (request.method === 'POST') {

                let body: string = '';
                let receivedData: ReceivedData;

                request.on('data', (chunk: any) => {
                    body += chunk;
                });
                request.on('end', () => {
                    try {
                        receivedData = JSON.parse(body);
                    } catch (err) {
                        receivedData = null;
                    }
                    if (self.checkSignature(receivedData, request.headers['x-baha-data-signature'])) {
                        self.emit("message", new HahamutMessage(self, receivedData.botid, receivedData.time, receivedData.messaging[0].sender_id, receivedData.messaging[0].message));

                        response.statusCode = 200;
                        response.end();
                    } else {
                        response.statusCode = 400;
                        response.end();
                    }
                });
            } else {
                response.statusCode = 400;
                response.end();
            }
        });
    }

    public boot(host: string, port: number) {
        this.server.listen(port, host);
        this.emit("ready");
    }

    public async sendMessage(recipientID: string, message: Message) {
        let bodyString = JSON.stringify({
            recipient: {
                id: recipientID
            },
            message: message
        });

        request.post({
            headers: { 'Content-Type': 'application/json' },
            url: HAHAMUT_API_HOST + this.messagePushUrl,
            body: bodyString
        });
    }

    private checkSignature(body: any, signature: string): boolean {

        let hmac = crypto.createHmac('sha1', this.appSecret);
        hmac.update(JSON.stringify(body), "utf8");
        let expectedSignature = 'sha1=' + hmac.digest('hex');

        if (signature != expectedSignature) {
            return false;
        } else {
            return true;
        }
    }
    
}