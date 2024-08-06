
export interface IMenuSoundConfig {
    soundType: EnumSoundTypeKey
    type: EnumType,
    close: boolean,
    sound: string,  
}

export enum EnumType {
    Click = 'click',
    Move = 'move',
    Error = 'error',
    Alert = 'alert',
}

export enum EMenuSoundTypeToName {
    click = '点击',
    move = '移动',
    error = '错误',
    alert = '提示',
}

export enum EnumSoundTypeKey {
    Menu = 'Menu_sound',
    Game = 'Game_sound',
}
