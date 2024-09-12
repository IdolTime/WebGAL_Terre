import { IConfigESCMenus, EMenuKey, ECommandKey } from './escMenuInterface'

export const getMenuKeyToName = (key: EMenuKey) => {
    const mapper = {
        continueGame: '继续游戏',
        backToLevel: '返回关卡',
        setting: '设置',
        exitGame: '退出游戏',
    }
    return mapper[key] || ''
}

export const getCommandKey = (key: EMenuKey) => {
    const mapper = {
        continueGame: 'Esc_continueGame_button',
        backToLevel: 'Esc_backToLevel_button',
        setting: 'Esc_setting_button',
        exitGame: 'Esc_exitGame_button',
    }
    return mapper[key] || ''
}

export const defaultEscMenuConfig: IConfigESCMenus[] = [
    {
        key: EMenuKey.ContinueGame,
        type: ECommandKey.ContinueGameButton,
        hide: false,
        name: '',
        btnImage: '',
        btnSound: '',
        btnPosition: '',
        fontFamily: '',
        fontSize: '',
        fontColor: '#000000',
        align: '',
        x: 0,
        y: 0,
        scale: 1
    },
    {
        key: EMenuKey.BackToLevel,
        type: ECommandKey.BackToLevelButton,
        hide: false,
        name: '',
        btnImage: '',
        btnSound: '',
        btnPosition: '',
        fontFamily: '',
        fontSize: '',
        fontColor: '#000000',
        align: '',
        x: 0,
        y: 0,
        scale: 1
    },
    {
        key: EMenuKey.Setting,
        type: ECommandKey.SettingButton,
        hide: false,
        name: '',
        btnImage: '',
        btnSound: '',
        btnPosition: '',
        fontFamily: '',
        fontSize: '',
        fontColor: '#000000',
        align: '',
        x: 0,
        y: 0,
        scale: 1
    },
    {
        key: EMenuKey.ExitGame,
        type: ECommandKey.ExitGameButton,
        hide: false,
        name: '',
        btnImage: '',
        btnSound: '',
        fontFamily: '',
        btnPosition: '',
        fontSize: '',
        fontColor: '#000000',
        align: '',
        x: 0,
        y: 0,
        scale: 1
    }
];