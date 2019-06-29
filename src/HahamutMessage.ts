import { HahamutBot } from './HahamutBot';
import { Message, ReceivedTextMessage, ReceivedStickerMessage } from "./types/Message";
import { isNullOrUndefined } from 'util';

export class HahamutMessage {
    public botId: string;
    public time: number;
    public senderId: string;
    public type: string;
    public message: ReceivedTextMessage | ReceivedStickerMessage;
    public text: string;

    private bot: HahamutBot;

    constructor(bot: HahamutBot, botId: string, time: number, senderId: string, message: any) {
        this.bot = bot;
        this.botId = botId;
        this.time = time;
        this.senderId = senderId;
        this.type = message.type;
        this.message = message;
        if (isNullOrUndefined(message.text)) {
            this.text = "(sticker)";
        } else {
            this.text = message.text;
        }
    }

    public async say(text: string) {
        let temp: Message = {
            type: "text",
            text: text
        }
        return this.bot.sendMessage(this.senderId, temp);
    }
}