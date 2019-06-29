import { isNullOrUndefined } from 'util';

import { MessageTriggerOperator } from './emun/MessageTriggerOperator';
import { ReceivedMessage } from './ReceivedMessage';

export class MessageTrigger {
    private flag: boolean = false;
    private message: ReceivedMessage;

    public operator: MessageTriggerOperator;
    public type: string = "text";
    public content: string | string[];
    public senderId?: string | string[];
    public excludeSenderId?: string | string[];
    public action?: (...args: any[]) => Promise<any>;

    constructor(option: { senderId?: string | string[], excludeSenderId?: string | string[], operator: MessageTriggerOperator, content: string | string[], action?: (...args: any[]) => Promise<any>}) {
        this.senderId = option.senderId;
        this.excludeSenderId = option.excludeSenderId;
        this.operator = option.operator;
        this.content = option.content;
        this.action = option.action;
    }

    public check(message: ReceivedMessage): boolean {
        this.message = message;
        this.flag = false;
        if (this.checkSenderId(message.senderId)) {
            switch (this.operator) {
                case MessageTriggerOperator.StartsWith: {
                    if (Array.isArray(this.content)) {
                        this.flag = false;
                        this.content.forEach(tmp => {
                            if (message.text.startsWith(tmp)) {
                                this.flag = true;
                            }
                        });
                    } else {
                        this.flag = message.text.startsWith(this.content.toString());
                    }
                    break;
                }
                case MessageTriggerOperator.EndsWith: {
                    if (Array.isArray(this.content)) {
                        this.flag = false;
                        this.content.forEach(tmp => {
                            if (message.text.endsWith(tmp)) {
                                this.flag = true;
                            }
                        });
                    } else {
                        this.flag = message.text.endsWith(this.content.toString());
                    }
                    break;
                }
                case MessageTriggerOperator.Contains: {
                    if(Array.isArray(this.content)) {
                        this.flag = false;
                        this.content.forEach(tmp => {
                            if (message.text.indexOf(tmp) != -1) {
                                this.flag = true;
                            }
                        });
                    } else {
                        this.flag = message.text.indexOf(this.content.toString()) != -1;
                    }
                    break;
                }
                case MessageTriggerOperator.ContainsAll: {
                    if (Array.isArray(this.content)) {
                        this.content.forEach(tmp => {
                            if (message.text.indexOf(tmp) === -1) {
                                this.flag = false;
                            }
                        });
                    } else {
                        this.flag = message.text.indexOf(this.content.toString()) != -1;
                    }
                    break;
                }
                case MessageTriggerOperator.Match: {
                    if (Array.isArray(this.content)) {
                        this.flag = false;
                        this.content.forEach(tmp => {
                            if (message.text === tmp) {
                                this.flag = true;
                            }
                        });
                    }else {
                        this.flag = message.text === this.content.toString();
                    }
                    break;
                }
            }
        }
        return this.flag;
    }

    public async run(...args: any[]) {
        return new Promise((resolve, reject) => {
            if (!isNullOrUndefined(this.message)) {
                if (this.flag) {
                    this.action(this.message, ...args)
                        .then(() => resolve())
                        .catch(error => reject(error));
                }
            }else {
                reject();
            }
        });
    }

    public async checkAndRun(message: ReceivedMessage, ...args: any[]) {
        this.check(message);
        return this.run(...args);
    }

    private checkSenderId(senderId: string): boolean {
        if (!isNullOrUndefined(this.senderId)) {
            if (Array.isArray(this.senderId)) {
                if (senderId in this.senderId) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (senderId == this.senderId) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        if (!isNullOrUndefined(this.excludeSenderId)) {
            if (Array.isArray(this.excludeSenderId)) {
                if (senderId in this.excludeSenderId) {
                    return false;
                }
            } else {
                if (senderId == this.excludeSenderId) {
                    return false;
                }
            }
        }
        return true;
    }

}