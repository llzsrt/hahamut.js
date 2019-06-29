import { isNullOrUndefined } from 'util';

import { MessageTriggerOperator } from './emun/MessageTriggerOperator';
import { ReceivedMessage } from './ReceivedMessage';

export class MessageTrigger {
    private flag: boolean = false;
    private message: ReceivedMessage;

    public operator: MessageTriggerOperator;
    public content: string | string[];
    public senderId?: string | string[];
    public excludeSenderId?: string | string[];
    public action?: (...args: any[]) => Promise<any>;

    constructor(operator: MessageTriggerOperator, content: string | string[], action?: (...args: any[]) => Promise<any>, senderId?: string | string[], excludeSenderId?: string | string[])
    constructor(option: { senderId?: string | string[], excludeSenderId?: string | string[], operator: MessageTriggerOperator, content: string | string[], action?: (...args: any[]) => Promise<any>})
    constructor(operatorOrOption: MessageTriggerOperator | { operator: MessageTriggerOperator, content: string | string[], action?: (...args: any[]) => Promise<any>, senderId?: string | string[], excludeSenderId?: string | string[]}, content?: string | string[], action?: (...args: any[]) => Promise<any>, senderId?: string | string[], excludeSenderId?: string | string[]) {
        this.operator = typeof operatorOrOption === 'object' ? operatorOrOption.operator : operatorOrOption;
        this.content = typeof operatorOrOption === 'object' ? operatorOrOption.content : content;
        this.action = typeof operatorOrOption === 'object' ? operatorOrOption.action : action;
        this.senderId = typeof operatorOrOption === 'object' ? operatorOrOption.senderId : senderId;
        this.excludeSenderId = typeof operatorOrOption === 'object' ? operatorOrOption.excludeSenderId : excludeSenderId;
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

    public run(...args: any[]): Promise<void> {
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

    public checkAndRun(message: ReceivedMessage, ...args: any[]): Promise<void> {
        this.check(message);
        return this.run(...args);
    }

    private checkSenderId(senderId: string): boolean {
        if (!isNullOrUndefined(this.senderId)) {
            if (Array.isArray(this.senderId)) {
                if (!this.senderId.filter(x => x === senderId).length) {
                    return false;
                }
            } else {
                if (senderId != this.senderId) {
                    return false;
                }
            }
        }
        if (!isNullOrUndefined(this.excludeSenderId)) {
            if (Array.isArray(this.excludeSenderId)) {
                if (!!this.excludeSenderId.filter(x => x === senderId).length) {
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