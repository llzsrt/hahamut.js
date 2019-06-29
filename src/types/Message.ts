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