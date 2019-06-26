import https from 'https';
import request from 'request';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { isNullOrUndefined } from 'util';

import { MessageTrigger } from './MessageTrigger';
import { HahamutMessage } from './HahamutMessage';
import { ReceivedData, Message } from './types/Message';
import { MessageTriggerOperator } from './emun/MessageTriggerOperator';

const HAHAMUT_API_HOST: string = "https://us-central1-hahamut-8888.cloudfunctions.net";

export class HahamutBot extends EventEmitter {
    private appSecret: string;
    private server: https.Server;
    private messagePushUrl: string;
    private imagePushUrl: string;
    private prefix?: string;
    private commands: {} = {};
    private commandTrigger: MessageTrigger;
    private isCheckSignature: boolean;

    constructor(token: { accessToken: string, appSecret: string }, sslOptions: any, prefix?: string, isCheckSignature?: boolean) {
        super();

        let self: HahamutBot = this;

        this.appSecret = token.appSecret;
        this.prefix = prefix;
        this.isCheckSignature = isNullOrUndefined(isCheckSignature) ? true : isCheckSignature;
        if(!isNullOrUndefined(prefix)) {
            this.commandTrigger = new MessageTrigger({
                content: prefix,
                operator: MessageTriggerOperator.StartsWith,
                action: async (message: HahamutMessage) => {
                    let args = message.text.split(" ");
                    args.splice(0,1);
                    let command = isNullOrUndefined(args[0]) ? "default" : args[0];
                    args.splice(0, 1);
    
                    if (!isNullOrUndefined(self.commands[command])) {
                        const tempCommand: (...args: any[]) => Promise<any> = self.commands[command];
                        await tempCommand(message, ...args);
                    }else {
                        console.log(`Command "${command}" is not defined.`);
                    }
                }
            });
        }

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
                request.on('end', async () => {
                    try {
                        receivedData = JSON.parse(body);
                    } catch (err) {
                        receivedData = null;
                    }
                    if (self.checkSignature(receivedData, request.headers['x-baha-data-signature']) || !this.isCheckSignature) {
                        let tempMessage = new HahamutMessage(self, receivedData.botid, receivedData.time, receivedData.messaging[0].sender_id, receivedData.messaging[0].message);

                        if (!isNullOrUndefined(self.prefix)) {
                            if (!self.commandTrigger.check(tempMessage)) {
                                self.emit("message", tempMessage);
                            } else {
                                self.commandTrigger.run();
                            }
                        }else{
                            self.emit("message", tempMessage);
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

    public boot(host: string="localhost", port: number=443) {
        this.server.listen(port, host);
        this.emit("ready");
    }

    public async sendMessage(recipientId: string, message: Message) {
        let bodyString = JSON.stringify({
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
            }, (err, response, body) => {
                    if (err) return reject(err);
                    try {
                        resolve(body);
                    } catch (e) {
                        reject(e);
                    }
            });
        });

        
    }

    public addCommand(name: string, run: (...args: any[]) => Promise<any>) {

        this.commands[ name === "" ? "default" : name ] = run;
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