import { FC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    Button,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Checkbox,
  } from "@fluentui/react-components";
import { cloneDeep } from "lodash";
import axios from "axios";
import {RootState} from "@/store/origineStore";
import {eventBus} from "@/utils/eventBus";
import ChooseFile from "@/pages/editor/ChooseFile/ChooseFile";
import { WebgalParser } from "@/pages/editor/GraphicalEditor/parser";
import { WebgalConfig } from "idoltime-parser/build/types/configParser/configParser";
import { useValue } from "@/hooks/useValue";
import { IMenuSoundConfig, EMenuSoundTypeToName, EnumSoundTypeKey, EnumType } from './soundInterface'
import { defaultMenuSoundConfig, defaultGameSoundConfig, boolMap } from './config'
import styles from './soundSetting.module.scss'
  

export const SoundSetting: FC = () => {
    const state = useSelector((state: RootState) => state.status.editor);
    const [soundSettingDialogOpen, setSoundSettingDialogOpen] = useState<boolean>(false);
    const [menuOptions, setMenuOptions] = useState<IMenuSoundConfig[]>(defaultMenuSoundConfig);
    const [gameOptions, setGameOptions] = useState<IMenuSoundConfig[]>(defaultGameSoundConfig);
      // 拿到游戏配置
    const gameConfig = useValue<WebgalConfig>([]);
    const getGameConfig = () => {
        axios
          .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
          .then((r) => parseAndSetGameConfigState(r.data));
      };
    
      function parseAndSetGameConfigState(data: string) {
        const config = WebgalParser.parseConfig(data);
        gameConfig.set(config);
      }

    // @ts-ignore
    const updateOptions = ({ options }, type: EnumSoundTypeKey) => {
        const newOptions: IMenuSoundConfig[] = [];
        options?.forEach((item: { key: string, value: string | boolean }) => {
            let close = item.value as boolean;
            let sound = '';

            if (typeof item.value === 'string') {
                const values = item.value?.split(',');
                close = boolMap.get(values[0]) as boolean;
                sound = values[1] || '';
            }

            newOptions.push({
                soundType: type,
                type: item.key as EnumType,
                close,
                sound,
            })
        })

        type === EnumSoundTypeKey.Menu && setMenuOptions(newOptions)
        type === EnumSoundTypeKey.Game && setGameOptions(newOptions)
    }

    useEffect(() => {
        if (gameConfig.value?.length) {
            const menu = gameConfig.value.find(item => item.command === EnumSoundTypeKey.Menu)
            menu && updateOptions(menu, EnumSoundTypeKey.Menu)

            const game = gameConfig.value.find(item => item.command === EnumSoundTypeKey.Game)
            game && updateOptions(game, EnumSoundTypeKey.Game)
        }

    }, [gameConfig.value])

    const handleOpenDialog = () => setSoundSettingDialogOpen(true);

    useEffect(() => {
        eventBus.on('soundSetting', handleOpenDialog);
        getGameConfig()
        return ()=>{
            eventBus.off('soundSetting',handleOpenDialog);
          };
    }, []);

    const updateConfig = (configType: EnumSoundTypeKey, idx: number, data: { close?: boolean, sound?: string  }) => {
        const options = configType === EnumSoundTypeKey.Menu 
                ? menuOptions
                : gameOptions;
        const updatOptions = options.map((item, index) => {
            if (index === idx) {
                return {
                    ...item,
                    ...data
                }
            }
            return item
        })
        configType === EnumSoundTypeKey.Menu ? setMenuOptions(updatOptions) : setGameOptions(updatOptions);

        const newConfig = cloneDeep(gameConfig.value);
        const newOptions: any[] = []
        updatOptions.forEach(({ type, close, sound }: IMenuSoundConfig) => {
            newOptions.push({
                key: type,
                value: sound ? `${close},${sound}` : close
            })
        })
        const index = newConfig.findIndex(e => e.command === configType);
        if (index >= 0) {
          newConfig[index].options = newOptions
        } else {
          newConfig.push({command: configType, args: [], options: newOptions});
        }
        gameConfig.set(newConfig);
    }

    const submit = () => {
        const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
        const form = new URLSearchParams();
        form.append("gameName", state.currentEditingGame);
        form.append("newConfig", newConfig);
        axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
    }

    const renderConfig = ({ soundType, type, close, sound }: IMenuSoundConfig, index: number) => {
        return (
            <div key={`${soundType}-${type}`} className={styles.soundSettingItem}>
                <span className={styles.label}>{EMenuSoundTypeToName[type]}</span>
                <span className={styles.closeSound}>
                    关闭音效
                    <Checkbox 
                        checked={close} 
                        onChange={(_, data) => {
                            const checked = data.checked as boolean
                            updateConfig(soundType, index, { close: checked });
                        }} 
                    />
                </span>
                <span>
                    音效文件{' \u00a0\u00a0 '}
                    {sound + "\u00a0\u00a0"}
                    <ChooseFile 
                        sourceBase={'bgm'}
                        extName={[".mp3", ".ogg", ".wav"]}
                        onChange={(file) => {
                            updateConfig(soundType, index, { sound: file?.name ?? '' });
                        }}
                    />
                </span>
            </div>
        )
    }
    
    return (
        <Dialog open={soundSettingDialogOpen} onOpenChange={(event, data) => setSoundSettingDialogOpen(data.open)}>
            <DialogSurface style={{ maxWidth: "960px" }}>
                <DialogBody>
                    <DialogTitle>音效设置</DialogTitle>
                    <DialogContent className={styles.soundMain}>
                        <div className={styles.soundContent}>
                            <h3>菜单内音效</h3>
                            {menuOptions.map((renderConfig))}
                        </div>
    
                        <div className={styles.soundContent}>
                            <h3>游戏内音效</h3>
                            {gameOptions.map((renderConfig))}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button 
                                appearance="secondary" 
                                onClick={() => {
                                    setSoundSettingDialogOpen(false);
                                }}
                            >取消</Button>
                        </DialogTrigger>
                        <Button 
                            appearance="primary" 
                            onClick={() => {
                                submit();
                                setSoundSettingDialogOpen(false);
                            }}
                        >确认</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}