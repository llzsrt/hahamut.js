import { isNullOrUndefined } from 'util';

import { HahamutBot } from './HahamutBot';
import { EventHp, EventText, EventButton, EventHidden, ButtonSetting } from './types/BotEvent';
import { BotStartMessage, BotEventMessage } from './types/Message';
import { ButtonStyle } from './enums';

export class HahamutEvent {
    private bot: HahamutBot;
    private eventHp: EventHp;
    private eventText: EventText;
    private eventButton: EventButton;
    public eventId: string;
    public startImage: string;
    public image: string;
    public isHpHidden: boolean = false;
    public isTextHidden: boolean = false;
    public isButtonHidden: boolean = false;

    constructor(bot: HahamutBot, startImage?: string, image?: string, hp?: EventHp | EventHidden, text?: EventText | EventHidden, button?: EventButton | EventHidden, eventId?: string)
    constructor(option: { bot: HahamutBot; eventId?: string; startImage?: string; image?: string; hp?: EventHp | EventHidden; text?: EventText | EventHidden; button?: EventButton | EventHidden })
    constructor(botOrOption: HahamutBot | any, 
                startImage: string = null, 
                image: string = null, 
                hp: EventHp | EventHidden = { max: 100, current: 100, color: '#000000' }, 
                text: EventText | EventHidden = { text: '', color: '#000000' }, 
                button: EventButton | EventHidden = { style: ButtonStyle.Horizontal, setting: [] }, 
                eventId?: string) {

        this.bot = botOrOption instanceof HahamutBot ? botOrOption : botOrOption.bot;
        this.startImage = botOrOption instanceof HahamutBot ? startImage : botOrOption.startImage;
        this.image = botOrOption instanceof HahamutBot ? image : botOrOption.image;
        this.eventHp = botOrOption instanceof HahamutBot ? hp : botOrOption.hp;
        this.eventText = botOrOption instanceof HahamutBot ? text : botOrOption.text;
        this.eventButton = botOrOption instanceof HahamutBot ? button : botOrOption.button;
        this.eventId = botOrOption instanceof HahamutBot ? eventId : botOrOption.eventId;
    }

    public async start(recipientId: string): Promise<void> {
        const tempBotStart: BotStartMessage = {
            type: 'botStart',
            start_img: this.startImage,
            init: {
                image: this.image,
                hp: this.isHpHidden ? { hidden: true} : this.eventHp,
                text: this.isTextHidden ? { hidden: true} : this.eventText,
                button: this.isButtonHidden ? { hidden: true } : this.eventButton
            }
        }
        try {
            this.eventId = await this.bot.sendMessage(recipientId, tempBotStart);
        } catch (error) {
            throw error;
        }
    }

    public async sentEvent(recipientId: string): Promise<string> {
        if (isNullOrUndefined(this.eventId)) throw new Error('This event has not yet started.');

        const tempBotStart: BotEventMessage = {
            type: 'botEvent',
            event_id: this.eventId,
            image: this.image,
            hp: this.isHpHidden ? { hidden: true } : this.eventHp,
            text: this.isTextHidden ? { hidden: true } : this.eventText,
            button: this.isButtonHidden ? { hidden: true } : this.eventButton
        }
        return await this.bot.sendMessage(recipientId, tempBotStart);
    }

    public addButton(text: string, command: string, order?: number, disabled?: boolean)
    public addButton(buttonSetting: ButtonSetting)
    public addButton(buttonTextOrObject: ButtonSetting | string, command?: string, order?: number, disabled: boolean = false) {
        if (typeof buttonTextOrObject === 'string') {
            this.eventButton.setting.push({
                text: buttonTextOrObject,
                command: command,
                order: isNullOrUndefined(order)
                        ? (!!this.eventButton.setting.length
                            ? this.eventButton.setting[this.eventButton.setting.length-1].order + 1 
                            : 0) 
                        : order,
                disabled: disabled
            })
        } else {
            this.eventButton.setting.push(buttonTextOrObject);
        }
    }

    public hpHide() {
        this.isHpHidden = true;
    }
    public hpShow() {
        this.isHpHidden = false;
    }
    public textHide() {
        this.isTextHidden = true;
    }
    public textShow() {
        this.isTextHidden = false;
    }
    public buttonHide() {
        this.isButtonHidden = true;
    }
    public buttonShow() {
        this.isButtonHidden = false;
    }

    set maxHp(max: number) {
        this.eventHp.max = max;
    }
    get maxHp() {
        return this.eventHp.max;
    }
    set currentHP(current: number) {
        this.eventHp.current = current;
    }
    get currentHP() {
        return this.eventHp.current;
    }
    set hpColor(color: string) {
        this.eventHp.color = color;
    }
    get hpColor() {
        return this.eventHp.color;
    }
    set text(text: string) {
        this.eventText.text = text;
    }
    get text() {
        return this.eventText.text;
    }
    set textColor(color: string) {
        this.eventText.color = color;
    }
    get textColor() {
        return this.eventText.color;
    }
    set buttonStyle(style: ButtonStyle) {
        this.eventButton.style = style;
    }
    get buttonStyle() {
        return this.eventButton.style;
    }
    set buttons(buttonArray: ButtonSetting[]) {
        this.eventButton.setting = buttonArray;
    }
    get buttons() {
        return this.eventButton.setting;
    }
}