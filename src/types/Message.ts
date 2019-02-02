export type ReceivedData = {
    botid: string;
    time: number;
    messaging: [
        {
            sender_id: string;
            message: ReceivedTextMessage | ReceivedStickerMessage;
        }
    ];
}

export type ReceivedStickerMessage = {
    sticker_group: string;
    sticker_id: string;
}

export type ReceivedTextMessage = {
    text: string;
}

export type Message = {
    type: string;
    text?: string;
    sticker_group?: string;
    sticker_id?: string;
}
