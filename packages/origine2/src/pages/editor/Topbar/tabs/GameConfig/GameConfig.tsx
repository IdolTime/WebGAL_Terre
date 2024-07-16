import styles from "../topbarTabs.module.scss";
import {useValue} from "../../../../../hooks/useValue";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "../../../../../store/origineStore";
import React, {useState, useEffect, useRef, useMemo} from "react";
import {cloneDeep} from "lodash";
import ChooseFile from "../../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import TagTitleWrapper from "@/components/TagTitleWrapper/TagTitleWrapper";
import {WebgalConfig} from "idoltime-parser/build/es/configParser/configParser";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";
import {logger} from "@/utils/logger";
import {textboxThemes} from "./constants";
import {eventBus} from "@/utils/eventBus";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {Add, Plus, Tub, Write} from "@icon-park/react";
import {
  Button,
  Dropdown,
  Input,
  Option,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Checkbox,
} from "@fluentui/react-components";
import { Dismiss24Filled, Dismiss24Regular, bundleIcon } from "@fluentui/react-icons";

export enum GameMenuKey {
  Game_start_button = "Game_start_button",
  Game_achievement_button="Game_achievement_button",
  Game_storyline_button="Game_storyline_button",
  Game_extra_button="Game_extra_button",
}

interface GameMenuItem {
  content: string,
  args: {
    hide: boolean,
      style: {
      x?: number;
      y?: number;
      scale?: number;
      image?: string;
      fontSize?: number;
      fontColor?: string;
      countdown?: number;
    }
  }
}


export default function GameConfig() {
  const t = useTrans("editor.sideBar.gameConfigs.");
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
  console.log(gameConfig);
  const getGameConfig = () => {
    axios
      .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };

  useEffect(() => {
    getGameConfig();
  }, []);

  function updateGameConfig() {
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }

  function getConfigContentAsString(key: string) {
    return gameConfig.value.find(e => e.command === key)?.args?.join('') ?? '';
  }

  function getConfigContentAsStringArray(key: string) {
    console.log(gameConfig.value);
    return gameConfig.value.find(e => e.command === key)?.args ?? [];
  }

  function updateGameConfigSimpleByKey(key: string, value: string) {
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e => e.command === key);
    if (index >= 0) {
      newConfig[index].args = [value];
    } else {
      newConfig.push({command: key, args: [value], options: []});
    }
    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function updateGameConfigArrayByKey(key: string, value: string[]) {
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e => e.command === key);

    if (index >= 0) {
      newConfig[index].args = value;
    } else {
      newConfig.push({command: key, args: value, options: []});
    }

    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function updateGameMenuConfig(options: Record<GameMenuKey, GameMenuItem>) {
    const newConfig = cloneDeep(gameConfig.value);

    for (const [key, value] of Object.entries(options)) {
      const index = newConfig.findIndex(e => e.command === key);
      let styleContent: string[] = [];

      Object.keys((value.args.style)).forEach((key) => {
        let newKey = key as 'x' | 'y' | 'scale' | 'fontSize' | 'fontColor' | 'image';
        if (value.args.style[newKey] !== undefined) {
          styleContent.push(`${key}=${value.args.style[newKey]}`);
        }
      });

      const style = styleContent ? `{${styleContent.join(',')}}` : '';
      const options = [{ key: 'hide', value: value.args.hide }, { key: 'style', value: style }];

      if (index >= 0) {
        newConfig[index].args = [value.content];
        newConfig[index].options = options;
      } else {
        newConfig.push({command: key, args: [value.content], options });
      }
    }

    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function parseAndSetGameConfigState(data: string) {
    console.log(data);
    gameConfig.set(WebgalParser.parseConfig(data));
    if (getConfigContentAsString('Game_key') === '') {
      // 设置默认识别码
      const randomCode = (Math.random() * 100000).toString(16).replace(".", "d");
      updateGameConfigSimpleByKey("Game_key", randomCode);
    }
  }

  return (
    <>
      <TabItem title={t("options.name")}>
        <GameConfigEditor key="gameName" value={getConfigContentAsString('Game_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Game_name", e)}/>
      </TabItem>
      <TabItem title={t("options.id")}>
        <GameConfigEditor key="gameKey" value={getConfigContentAsString('Game_key')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Game_key', e)}/>
      </TabItem>
      <TabItem title={t("options.description")}>
        <GameConfigEditor key="gameDescription" value={getConfigContentAsString('Description')}
          onChange={(e: string) => updateGameConfigSimpleByKey("Description", e)}/>
      </TabItem>
      <TabItem title={t("options.packageName")}>
        <GameConfigEditor key="packageName" value={getConfigContentAsString('Package_name')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Package_name', e)}/>
      </TabItem>
      {/* <TabItem title={t("options.textboxTheme")}> */}
      {/*  <GameConfigEditorWithSelector key="packageName" value={getConfigContentAsString('Textbox_theme')} */}
      {/*    onChange={(e: string) => updateGameConfigSimpleByKey('Textbox_theme', e)} */}
      {/*    selectItems={textboxThemes}/> */}
      {/* </TabItem> */}
      <TabItem title={t("options.bg")}>
        <GameConfigEditorWithFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp"]}
          key="titleBackground"
          value={getConfigContentAsString('Title_img')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_img', e)}/>
      </TabItem>
      <TabItem title={t("options.bgm")}>
        <div className={styles.sidebar_gameconfig_title}>{}</div>
        <GameConfigEditorWithFileChoose
          extNameList={[".mp3", ".ogg", ".wav"]}
          sourceBase="bgm" key="titleBgm"
          value={getConfigContentAsString('Title_bgm')}
          onChange={(e: string) => updateGameConfigSimpleByKey('Title_bgm', e)}/>
      </TabItem>
      <TabItem title={t("options.logoImage")}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp"]}
          key="logoImage"
          value={getConfigContentAsStringArray('Game_Logo')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_Logo', e)}/>
      </TabItem>
      <TabItem title={t("options.mouseCursor")}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp"]}
          key="mouseCursor"
          value={getConfigContentAsStringArray('Game_cursor')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_cursor', e)}/>
      </TabItem>
      <TabItem title={t("options.gameMenu")}>
        <GameConfigEditorGameMenu
          key="gameMenu"
          value={gameConfig.value}
          onChange={updateGameMenuConfig}
        />
      </TabItem>

      {/* <TabItem title={t("options.openingLogo")}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp", '.mp4', '.flv']}
          key="openingLogo"
          value={getConfigContentAsStringArray('Opening_logo')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Opening_logo', e)}/>
      </TabItem> */}

      <TabItem title={t("options.R18")}>
        <GameConfigEditorR18
          key="R18"
          value={getConfigContentAsStringArray('Game_r18')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_r18', e)}
        />
      </TabItem>
    </>
  );
}

interface IGameConfigEditor {
  key: string;
  value: string;
  onChange: Function;
}

interface IGameConfigEditorMulti {
  key: string;
  value: string[];
  onChange: Function;
}

interface IGameConfigEditorR18 {
  key: string;
  value: boolean;
  onChange: Function;
}

interface IGameConfigEditorMenu {
  key: string;
  value: Array<IMenuConfig>;
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);

  return <div className={styles.textEditArea} style={{maxWidth: 200}}>
    {!showEditBox.value && props.value}
    {!showEditBox.value &&
    <span className={styles.editButton} onClick={() => showEditBox.set(true)}>
      <Write theme="outline" size="16" fill="#005CAF" strokeWidth={3}/>
    </span>}
    {showEditBox.value &&
    <Input
      autoFocus
      defaultValue={props.value}
      onBlur={(event) => {
        props.onChange(event.target.value);
        showEditBox.set(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          const inputElement = event.target as HTMLInputElement;
          props.onChange(inputElement.value);
          showEditBox.set(false);
        }
      }}
    />}
  </div>;
}

function GameConfigEditorWithSelector(props: IGameConfigEditor & {
  selectItems: { key: string, text: string }[],
}) {
  return (
    <Dropdown
      value={props.selectItems.find(item => item.key === props.value)?.text ?? props.value}
      selectedOptions={[props.value]}
      onOptionSelect={(event, data) => {
        const key = data.optionValue ?? '';
        props.onChange(key);
      }}
      style={{minWidth: 0}}
    >
      {props.selectItems.map((item) => <Option key={item.key} value={item.key}>{item.text}</Option>)}
    </Dropdown>
  );
}

function GameConfigEditorWithFileChoose(props: IGameConfigEditor & {
  sourceBase: string,
  extNameList: string[]
}) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<HTMLInputElement>(null);
  return <div className={styles.textEditArea}>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <span className={styles.editButton} onClick={() => {
      showEditBox.set(true);
      setTimeout(() => inputBoxRef.current?.focus(), 100);
    }}><Write theme="outline" size="16" fill="#005CAF" strokeWidth={3}/></span>}
    {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
      onChange={(file) => {
        if (file) {
          props.onChange(file.name);
          showEditBox.set(false);
        } else {
          showEditBox.set(false);
        }
      }}
      extName={props.extNameList}/>}
  </div>;
}

function GameConfigEditorWithImageFileChoose(props: IGameConfigEditorMulti & {
  sourceBase: string,
  extNameList: string[]
}) {
  const t = useTrans("common.");
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<HTMLInputElement>(null);
  const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const images = props.value;

  const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);

  const addImage = (imageName: string) => {
    const newImages = [...images, imageName];
    // setImages(newImages);
    props.onChange(newImages);
  };

  const removeImage = (imageName: string) => {
    const newImages = images.filter((image) => image !== imageName);
    // setImages(newImages);
    props.onChange(newImages);
  };

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {/* {props.value.join(' | ')} */}
      <div style={{display: 'flex'}}>
        {images.map((imageName, index) => (
          <div key={index} className={styles.imageChooseItem}>
            <img className={styles.imageChooseItemImage} src={`games/${gameName}/game/${props.sourceBase}/${imageName}`}
              alt={`logo-${index}`}/>
            {/* <div className={styles.imageChooseItemText}>{imageName}</div> */}
            <Button
              appearance="subtle"
              icon={<DismissIcon />}
              onClick={() => removeImage(imageName)}
            />
          </div>
        ))}</div>
      {!showEditBox.value && <div onClick={() => {
        showEditBox.set(true);
        eventBus.emit('scrollTopbarToEnd');
        setTimeout(() => inputBoxRef.current?.focus(), 100);
      }}
      className={styles.addIcon}
      ><Plus theme="outline" size="20" fill="#005CAF" strokeWidth={3}/></div>}
      {showEditBox.value && <ChooseFile sourceBase={props.sourceBase}
        onChange={(file) => {
          if (file) {
            addImage(file.name);
            showEditBox.set(false);
            eventBus.emit('scrollTopbarToEnd');
          } else {
            showEditBox.set(false);
          }
        }}
        extName={props.extNameList}/>}
    </div>
  );
}

/**
 * 游戏菜单控制
 */
function GameConfigEditorGameMenu(props: {
  value: WebgalConfig,
  onChange: (options: Record<GameMenuKey, GameMenuItem>) => void
}) {
  const [gameMenuDialogOpen, setGameMenuDialogOpen] = useState(false);
  const [options, setOptions] = useState<Record<GameMenuKey, GameMenuItem>>({
    Game_start_button: {
      content: "",
      args: {
        hide: false,
        style: {}
      }
    },
    Game_achievement_button: {
      content: "",
      args: {
        hide: false,
        style: {
        }
      }
    },
    Game_storyline_button: {
      content: "",
      args: {
        hide: false,
        style: {
        }
      }
    },
    Game_extra_button: {
      content: "",
      args: {
        hide: false,
        style: {
        }
      }
    },
  });
  const keys = Object.keys(GameMenuKey) as GameMenuKey[];
  const keysNameMap = {
    Game_start_button: "开始游戏",
    Game_achievement_button: "成就",
    Game_storyline_button: "故事线",
    Game_extra_button: "鉴赏模式",
  };
  
  useEffect(() => {
    let GameStartButton = props.value.find(e => e.command === GameMenuKey.Game_start_button);
    let GameAchievementButton = props.value.find(e => e.command === GameMenuKey.Game_achievement_button);
    let GameStorylineButton = props.value.find(e => e.command === GameMenuKey.Game_storyline_button);
    let GameExtraButton = props.value.find(e => e.command === GameMenuKey.Game_extra_button);

    const parseArgs = (args: WebgalConfig[0]['options']) => {
      const hide = args.find((e: any) => e.key === 'hide')?.value === true;
      const styleString = (args.find((e: any) => e.key === 'style')?.value as string) || '{}';
      let styleObj: GameMenuItem['args']['style'] = {};

      const styleRegex = /\{(.*?)\}/;
      const styleMatch = styleString.match(styleRegex);
      if (styleMatch) {
        const styleStr = styleMatch[1];
        const styleProps = styleStr.split(',');
        const style: any = {}; // Change to specific type if possible

        // Parse each style property
        styleProps.forEach((prop) => {
          const [key, value] = prop.split('=');
          if (key && value) {
            style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
          }
        });

        styleObj = style;
      }

      return {
        hide,
        style: styleObj
      };
    };

    setOptions({
      Game_start_button: {
        content: GameStartButton?.args[0] ?? '',
        args: parseArgs(GameStartButton?.options ?? [])
      },
      Game_achievement_button: {
        content: GameAchievementButton?.args[0] ?? '',
        args: parseArgs(GameAchievementButton?.options ?? [])
      },
      Game_storyline_button: {
        content: GameStorylineButton?.args[0] ?? '',
        args: parseArgs(GameStorylineButton?.options ?? [])
      },
      Game_extra_button: {
        content: GameExtraButton?.args[0] ?? '',
        args: parseArgs(GameExtraButton?.options ?? [])
      },
    });
  }, [props.value]);

  const setStyle = (index: number, styleKey: string, value: number | string | undefined) => {
    const key = keys[index];
    setOptions({
      ...options,
      [key]: {
        ...options[key],
        args: {
          ...options[key].args,
          style: {
            ...options[key].args.style,
            [styleKey]: value
          }
        }
      }
    });
  };

  const setHide = (index: number, value: boolean) => {
    const key = keys[index];
    setOptions({
      ...options,
      [key]: {
        ...options[key],
        args: {
          ...options[key].args,
          hide: value
        }
      }
    });
  };

  const setName = (index: number, value: string) => {
    const key = keys[index];
    setOptions({
      ...options,
      [key]: {
        ...options[key],
        content: value
      }
    });
  };

  const submit = () => {
    setGameMenuDialogOpen(false);
    setTimeout(() => {
      props.onChange(options);
    }, 10);
  };

  return (
    <Dialog open={gameMenuDialogOpen} onOpenChange={(event, data) => setGameMenuDialogOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button size="small" appearance="primary">
          菜单设置
        </Button>
      </DialogTrigger>
      <DialogSurface style={{ maxWidth: "840px" }}>
        <DialogBody>
          <DialogTitle>标题菜单UI设置</DialogTitle>
          <DialogContent>
            {Object.values(options).map((menu, index) => (
              <div key={index} style={{ marginBlock: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: '16px', fontWeight: 500, width: "70px" }}>{(keysNameMap as any)[keys[index]]}</span>
                  <Checkbox checked={menu.args.hide} onChange={(_, data) => {
                    setHide(index, data.checked as boolean);
                  }} />
                  <span>隐藏</span>
                  <span style={{ marginLeft: '38px' }}>按钮名称</span>
                  <input value={menu.content}
                    onChange={(ev) => {
                      setName(index, ev.target.value.trim());
                    }}
                    className={styles.sayInput}
                    placeholder="按钮名称"
                    style={{ width: "10%", margin: "0 6px 0 12px", color: "#666" }}
                  />
                  <span style={{ margin: '0 6px 0 6px' }}>按钮样式 {menu.args.style.image}</span>
                  <ChooseFile sourceBase="ui" onChange={(newFile) => {
                    const newValue = newFile?.name ?? "";

                    if (newFile) {
                      setStyle(index, 'image', newValue);
                    } else {
                      setStyle(index, 'image', undefined);
                    }
                  }} extName={[".jpg", ".png", "webp"]} />
                </div>
                <div style={{  display: "flex", alignItems: "center"}}>
                  <span style={{ marginLeft: '6px' }}>按钮位置X</span>
                  <input type="number" value={menu.args.style.x}
                    onChange={(ev) => {
                      setStyle(index, 'x', ev.target.value);
                    }}
                    className={styles.sayInput}
                    placeholder="X"
                    style={{ width: "10%", margin: "0 6px 0 6px" }}
                  />
                  <span style={{ marginLeft: '6px' }}>按钮位置Y</span>
                  <input type="number" value={menu.args.style.y}
                    onChange={(ev) => {
                      setStyle(index, 'y', ev.target.value);
                    }}
                    className={styles.sayInput}
                    placeholder="Y"
                    style={{ width: "10%", margin: "0 6px 0 6px" }}
                  />
                  <span style={{ marginLeft: '6px' }}>缩放</span>
                  <input type="number" value={menu.args.style.scale}
                    onChange={(ev) => {
                      setStyle(index, 'scale', ev.target.value);
                    }}
                    className={styles.sayInput}
                    placeholder="缩放"
                    style={{ width: "10%", margin: "0 6px 0 6px" }}
                  />
                  <span style={{ marginLeft: '6px' }}>文字大小</span>
                  <input type="number" value={menu.args.style.fontSize}
                    onChange={(ev) => {
                      setStyle(index, 'fontSize', ev.target.value);
                    }}
                    className={styles.sayInput}
                    placeholder="文字大小"
                    style={{ width: "10%", margin: "0 6px 0 6px" }}
                  />
                  <span style={{ marginLeft: '6px' }}>文字颜色</span>
                  <input type="color" value={menu.args.style.fontColor || '#fff'}
                    onChange={(ev) => {
                      setStyle(index, 'fontColor', ev.target.value);
                    }}
                    className={styles.sayInput}
                    placeholder="文字大小"
                    style={{ width: "10%", margin: "0 6px 0 6px" }}
                  />
                </div>
              </div>
            ))}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={() => {
                setGameMenuDialogOpen(false);
              }}>取消</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={() => {
              submit();
              setGameMenuDialogOpen(false);
            }}>确认</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}


/**
 * R18
 */
function GameConfigEditorR18(props: IGameConfigEditorMulti) {

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    props.onChange([`${checked}`]);
  }

  const boolMap = new Map<string | boolean, boolean>([
    ['true', true],
    ['false', false],
    [true, true],
    [false, false]
  ])
  
  return (
      <Checkbox 
        checked={props.value?.length ? boolMap.get(props.value[0]) : false}
        onChange={(e) => handleCheckboxChange(e)}
      />
  )
}
