

export interface IConfigESCMenus {
    key: EMenuKey;
    type: ECommandKey
    hide: boolean;
    name: string;
    btnImage: string;
    btnSound: string;
    btnPosition: string;
    fontFamily: string;
    fontSize: number | string;
    fontColor: string;
    align: string;
    x: number | string;
    y: number | string;
    scale: number | string;
}

export enum EMenuKey {
    ContinueGame = 'continueGame',
    BackToLevel = 'backToLevel',
    Setting = 'setting',
    ExitGame = 'exitGame',
}

export enum ECommandKey {
    ContinueGameButton ='Esc_continueGame_button',
    BackToLevelButton = 'Esc_backToLevel_button',
    SettingButton = 'Esc_setting_button',
    ExitGameButton = 'Esc_exitGame_button',
}