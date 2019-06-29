import { HahamutBot } from './HahamutBot';
import { ReceivedTextMessage } from './types/Received';
import { TextMessage, StickerMessage, ImageMessage } from './types/Message';
import { isNullOrUndefined } from 'util';

export class ReceivedMessage {
    public botId: string;
    public time: number;
    public senderId: string;
    public message: ReceivedTextMessage;
    public text?: string;

    private bot: HahamutBot;

    constructor(bot: HahamutBot, botId: string, time: number, senderId: string, message: any) {
        this.bot = bot;
        this.botId = botId;
        this.time = time;
        this.senderId = senderId;
        this.message = message;
        if (!isNullOrUndefined(message.text)) {
            this.text = message.text;
        }
    }

    public replyText(text: string): Promise<string>
    public replyText(textMessage: TextMessage): Promise<string>
    public replyText(textStringOrObject: string | TextMessage): Promise<string> {
        let temp: TextMessage;
        if (typeof textStringOrObject === 'string') {
            temp = {
                type: 'text',
                text: textStringOrObject
            }
        }else {
            temp = textStringOrObject;
        }
        return this.bot.sendMessage(this.senderId, temp);
    }

    public replySticker(stickerGroup: string, stickerId: string): Promise<string>
    public replySticker(stickerMessage: StickerMessage): Promise<string>
    public replySticker(stickerGroupStringOrObject: string | StickerMessage, stickerId?: string): Promise<string> {
        let temp: StickerMessage;
        if (typeof stickerGroupStringOrObject === 'string') {
            temp = {
                type: 'sticker',
                sticker_group: stickerGroupStringOrObject,
                sticker_id: stickerId
            }
        } else {
            temp = stickerGroupStringOrObject;
        }
        return this.bot.sendMessage(this.senderId, temp);
    }

    public replyImage(id: string, ext: string, width: number, height: number): Promise<string>
    public replyImage(imageMessage: ImageMessage): Promise<string>
    public replyImage(imageIdStringOrObject: string | ImageMessage, ext?: string, width?: number, height?: number): Promise<string> {
        let temp: ImageMessage;
        if (typeof imageIdStringOrObject === 'string') {
            temp = {
                type: 'img',
                id: imageIdStringOrObject,
                ext: ext,
                width: width,
                height: height
            }
        } else {
            temp = imageIdStringOrObject;
        }
        return this.bot.sendMessage(this.senderId, temp);
    }
}