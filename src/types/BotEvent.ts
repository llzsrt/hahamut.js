import { ButtonStyle } from '../enums/ButtonStyle';

export type EventHp = {
    max: number,
    current: number,
    color: string
}

export type EventText = {
    text: string,
    color: string
}

export type EventButton = {
    style: ButtonStyle,
    setting: ButtonSetting[]
}

export type ButtonSetting = {
    disabled: boolean,
    order: number,
    text: string,
    command: string
}

export type EventHidden = {
    hidden: boolean
}