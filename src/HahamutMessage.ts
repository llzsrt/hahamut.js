import { HahamutBot } from './HahamutBot';
import { Message, ReceivedTextMessage, ReceivedStickerMessage } from "./types/Message";
import { isNullOrUndefined } from 'util';

export class HahamutMessage {
    public botId: string;
    public time: number;
    public senderId: string;
    public content: ReceivedTextMessage | ReceivedStickerMessage;
    public text: string;

    private bot: HahamutBot;

    constructor(bot: HahamutBot, botId: string, time: number,senderId: string, content: any) {
        this.bot = bot;
        this.botId = botId;
        this.time = time;
        this.senderId = senderId;
        this.content = content;
        if (isNullOrUndefined(content.text)) {
            this.text = "(sticker)";
        }else {
            this.text = content.text;
        }
    }

    public say(text: string) {
        let temp: Message = {
            type: "text",
            text: text
        }
        this.bot.sendMessage(this.senderId, temp);
    }
}