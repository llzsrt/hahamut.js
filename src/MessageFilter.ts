import { FilterMethod } from './emun/FilterMethod';
import { isNullOrUndefined } from 'util';
import { HahamutMessage } from './HahamutMessage';

export class MessageFilter {

    public method: FilterMethod;
    public type: string = "text";
    public content: string | string[];
    public senderId?: string | string[];
    public excludeSenderId?: string | string[];
    public action?: (...args: any[])=>void;

    constructor(option: { senderId?: string | string[], excludeSenderId?: string | string[], method: FilterMethod, content: string | string[], action?: (...args: any[]) => void}) {
        this.senderId = option.senderId;
        this.excludeSenderId = option.excludeSenderId;
        this.method = option.method;
        this.content = option.content;
        this.action = option.action;
    }

    public filter(message: HahamutMessage, ...args: any[]): boolean {
        if (this.checkSenderId(message.senderId)) {
            let flag = true;

            switch (this.method) {
                case FilterMethod.StartsWith: {
                    if (Array.isArray(this.content)) {
                        flag = false;
                        this.content.forEach(tmp => {
                            if (message.text.startsWith(tmp)) {
                                flag = true;
                            }
                        });
                    } else {
                        flag = message.text.startsWith(this.content.toString());
                    }
                    break;
                }
                case FilterMethod.EndsWith: {
                    if (Array.isArray(this.content)) {
                        flag = false;
                        this.content.forEach(tmp => {
                            if (message.text.endsWith(tmp)) {
                                flag = true;
                            }
                        });
                    } else {
                        flag = message.text.endsWith(this.content.toString());
                    }
                    break;
                }
                case FilterMethod.Find: {
                    if(Array.isArray(this.content)) {
                        flag = false;
                        this.content.forEach(tmp => {
                            if(message.text.indexOf(tmp) != -1) {
                                flag = true;
                            }
                        });
                    } else {
                        flag = message.text.indexOf(this.content.toString()) != -1;
                    }
                    break;
                }
                case FilterMethod.FindAnd: {
                    if (Array.isArray(this.content)) {
                        this.content.forEach(tmp => {
                            if (message.text.indexOf(tmp) == -1) {
                                flag = false;
                            }
                        });
                    } else {
                        flag = message.text.indexOf(this.content.toString()) != -1;
                    }
                    break;
                }
                case FilterMethod.Match: {
                    if (Array.isArray(this.content)) {
                        flag = false;
                        this.content.forEach(tmp => {
                            if (message.text == tmp) {
                                flag = true;
                            }
                        });
                    }else {
                        flag = message.text == this.content.toString();
                    }
                    break;
                }
            }

            if(flag) {
                if (!isNullOrUndefined(this.action)) {
                    this.action(message, ...args);
                }
                return true;
            }
        }
        return false;
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