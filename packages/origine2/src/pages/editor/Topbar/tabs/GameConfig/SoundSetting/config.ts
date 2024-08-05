import { IMenuSoundConfig, EnumSoundTypeKey, EnumType } from './soundInterface'

export const boolMap = new Map<string | boolean, boolean>([
    ['true', true],
    ['false', false],
    [true, true],
    [false, false],
  ]);

/**
 * @description 默认菜单音效配置
 */
export const defaultMenuSoundConfig: IMenuSoundConfig[] = [
    {   
        soundType: EnumSoundTypeKey.Menu,
        type: EnumType.Click,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Menu,
        type: EnumType.Move,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Menu,
        type: EnumType.Error,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Menu,
        type: EnumType.Alert,
        close: false,
        sound: '',
    }
];


/**
 * @description 默认游戏音效配置
 */
export const defaultGameSoundConfig: IMenuSoundConfig[] = [
    {
        soundType: EnumSoundTypeKey.Game,
        type: EnumType.Click,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Game,
        type: EnumType.Move,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Game,
        type: EnumType.Error,
        close: false,
        sound: '',
    },
    {
        soundType: EnumSoundTypeKey.Game,
        type: EnumType.Alert,
        close: false,
        sound: '',
    }
];