import { EventHp, EventButton, EventText, EventHidden } from './BotEvent';

export type TextMessage = {
    type: string;
    text: string;
}

export type StickerMessage = {
    type: string;
    sticker_group: string;
    sticker_id: string;
}

export type ImageMessage = {
    type: string,
    id: string,
    ext: string,
    width: number,
    height: number
}

export type BotStartMessage = {
    type: string,
    start_img: string,
    init: {
        image: string,
        hp: EventHp | EventHidden,
        text: EventText | EventHidden,
        button: EventButton | EventHidden
    }
}

export type BotEventMessage = {
    type: string,
    event_id: string,
    image: string,
    hp: EventHp | EventHidden,
    text: EventText | EventHidden,
    button: EventButton | EventHidden
}