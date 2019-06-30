import fs from 'fs';
import http from 'http';
import https from 'https';
import request from 'request';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { isNullOrUndefined } from 'util';

import { MessageTrigger } from './MessageTrigger';
import { ReceivedMessage } from './ReceivedMessage';
import { ReceivedData } from './types/Received';
import { TextMessage, StickerMessage, ImageMessage, BotStartMessage, BotEventMessage } from './types/Message';
import { TriggerOperator } from './enums/TriggerOperator';

const HAHAMUT_API_HOST: string = 'https://us-central1-hahamut-8888.cloudfunctions.net';

export class HahamutBot extends EventEmitter {
    public prefix?: string;
    private appSecret: string;
    private server: https.Server | http.Server;
    private messagePushUrl: string;
    private imagePushUrl: string;
    private commands: {} = {};
    private commandTrigger: MessageTrigger;

    constructor(configs: { botId: string, accessToken: string, appSecret: string }, sslOptions?: any, prefix?: string, isCheckSignature?: boolean) {
        super();

        const self: HahamutBot = this;

        this.appSecret = configs.appSecret;
        isCheckSignature = isNullOrUndefined(isCheckSignature) ? true : isCheckSignature;
        if(!isNullOrUndefined(prefix)) {
            this.prefix = prefix;
            this.commandTrigger = new MessageTrigger({
                content: this.prefix,
                operator: TriggerOperator.StartsWith,
                action: async (message: ReceivedMessage) => {
                    const args = message.text.split(' ');
                    args.splice(0,1);
                    const command = isNullOrUndefined(args[0]) ? 'default' : args[0];
                    args.splice(0, 1);
    
                    if (!isNullOrUndefined(self.commands[command])) {
                        const tempCommand: (...args: any[]) => Promise<any> = self.commands[command];
                        return tempCommand(message, ...args);
                    }else {
                        console.log(`Command "${command}" is not defined.`);
                    }
                }
            });
        }

        this.messagePushUrl = `/messagePush?access_token=${configs.accessToken}`;
        this.imagePushUrl = `/imagePush?bot_id=${configs.botId}&access_token=${configs.accessToken}`;
        
        if(isNullOrUndefined(sslOptions)) {
            this.server = http.createServer();
        } else {
            this.server = https.createServer(sslOptions);
        }

        this.server.on('request', (request, response) => {
            if (request.method === 'POST') {

                let body: string = '';
                let receivedData: ReceivedData;

                request.on('data', (chunk: any) => {
                    body += chunk;
                });
                request.on('end', () => {
                    try {
                        receivedData = JSON.parse(body);
                    } catch (error) {
                        receivedData = null;
                        console.log(error);
                    }
                    if (self.checkSignature(receivedData, request.headers['x-baha-data-signature']) || !isCheckSignature) {
                        let tempMessage = new ReceivedMessage(self, receivedData.botid, receivedData.time, receivedData.messaging[0].sender_id, receivedData.messaging[0].message);

                        if (!isNullOrUndefined(self.prefix)) {
                            if (!self.commandTrigger.check(tempMessage)) {
                                self.emit('message', tempMessage);
                            } else {
                                self.commandTrigger.run();
                            }
                        }else{
                            self.emit('message', tempMessage);
                        }

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

    public boot(port?: number, host?: string)
    public boot(path?: string)
    public boot(...args) {
        try {
            this.server.listen(...args);
            this.emit('ready');
        } catch (error) {
            throw error;
        }
    }

    public sendMessage(recipientId: string, message: TextMessage | StickerMessage | ImageMessage | BotStartMessage | BotEventMessage): Promise<string> {
        const bodyString = JSON.stringify({
            recipient: {
                id: recipientId
            },
            message: message
        });

        return new Promise((resolve, reject) => {
            request.post({
                headers: { 'Content-Type': 'application/json' },
                url: HAHAMUT_API_HOST + this.messagePushUrl,
                body: bodyString
            }, (error, response, body: string) => {
                    if (error) return reject(error);
                    if (body === 'get data~~' || body === 'event adding' || body.startsWith('-')) {
                        resolve(body);
                    }else {
                        reject(body);
                    }
            });
        });
    }

    public addCommand(name: string, run: (...args: any[]) => Promise<any>) {

        this.commands[name === '' ? 'default' : name ] = run;
    }

    public uploadImage(imagePath: string): Promise<ImageMessage>
    public uploadImage(imageFile: fs.ReadStream): Promise<ImageMessage>
    public uploadImage(imageData: fs.ReadStream | string): Promise<ImageMessage> {
        return new Promise((resolve, reject) => {

            try {
                if (typeof (imageData) === 'string') imageData = fs.createReadStream(imageData);
            } catch(error) {
                return reject(error);
            }

            const formData = {
                filedata: imageData
            };

            request.post({
                headers: { 'Content-Type': 'multipart/form-data' },
                url: HAHAMUT_API_HOST + this.imagePushUrl,
                formData: formData
            }, (error, response, body) => {
                if (error) return reject(error);
                try {
                    const temp = JSON.parse(body);
                    const result: ImageMessage = {
                        type: 'img',
                        id: temp.id,
                        ext: temp.ext,
                        width: temp.width,
                        height: temp.height
                    };
                    resolve(result);
                } catch {
                    reject(body);
                }
            });
        });
    }

    private checkSignature(body: any, signature: string): boolean {

        let hmac = crypto.createHmac('sha1', this.appSecret);
        hmac.update(JSON.stringify(body), 'utf8');
        let expectedSignature = 'sha1=' + hmac.digest('hex');

        if (signature != expectedSignature) {
            return false;
        } else {
            return true;
        }
    }
    
}