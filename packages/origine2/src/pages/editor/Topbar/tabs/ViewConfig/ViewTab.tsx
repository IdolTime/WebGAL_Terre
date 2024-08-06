import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import useTrans from "@/hooks/useTrans";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {setEnableLivePreview, setShowSidebar} from "@/store/userDataReducer";
import s from './viewTab.module.scss';
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import {eventBus} from "@/utils/eventBus";
import {useTranslation} from "react-i18next";
import {
  ArrowClockwise24Filled,
  ArrowClockwise24Regular,
  bundleIcon,
  Open24Filled,
  Open24Regular,
  PanelLeft24Filled,
  PanelLeft24Regular,
  PanelLeftContract24Filled,
  PanelLeftContract24Regular,
} from "@fluentui/react-icons";
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
import { WebgalConfig } from "idoltime-parser/build/types/configParser/configParser";
import { ButtonItem, ButtonKey, ContainerItem, IndicatorContainerItem, LoadSceneButtonKey, Scene, sceneButtonConfig, SceneKeyMap, sceneNameMap, sceneOtherConfig, sceneUIConfig, SceneUIConfig, SliderContainerItem, Style, UIItemConfig } from "@/pages/editor/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ChooseFile from "@/pages/editor/ChooseFile/ChooseFile";
import { cloneDeep } from "lodash";
import { useValue } from "@/hooks/useValue";
import axios from "axios";
import { WebgalParser } from "@/pages/editor/GraphicalEditor/parser";
import { Write } from "@icon-park/react";
import { ColorPicker } from "@fluentui/react";

interface IGameConfigEditor {
  key: string;
  value: string;
  onChange: Function;
}

export function ViewTab() {
  const dispatch = useDispatch();
  const isShowSidebar = useSelector((state: RootState) => state.userData.isShowSidebar);
  const currentEditGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const {t} = useTranslation();

  const PanelLeftIcon = bundleIcon(PanelLeft24Filled, PanelLeft24Regular);
  const PanelLeftContractIcon = bundleIcon(PanelLeftContract24Filled, PanelLeftContract24Regular);
  const ArrowClockwiseIcon = bundleIcon(ArrowClockwise24Filled, ArrowClockwise24Regular);
  const OpenIcon = bundleIcon(Open24Filled, Open24Regular);

  return <TopbarTab>
    <TabItem title={t("侧边栏")}>
      <IconWithTextItem
        onClick={() => {
          dispatch(setShowSidebar(!isShowSidebar));
        }}
        icon={isShowSidebar ? <PanelLeftIcon className={s.iconColor}/> : <PanelLeftContractIcon className={s.iconColor}/>}
        text={isShowSidebar ? t('显示侧边栏') : t('隐藏侧边栏')}
      />
    </TabItem>
    <TabItem title={t("侧边栏游戏预览")}>
      <IconWithTextItem
        onClick={() => {
          eventBus.emit('refGame');
        }}
        icon={<ArrowClockwiseIcon className={s.iconColor}/>}
        text={t("刷新游戏")}
      />
      <IconWithTextItem
        onClick={() => {
          window.open(`/games/${currentEditGame}`, "_blank");
        }}
        icon={<OpenIcon className={s.iconColor}/>}
        text={t("新标签页预览")}
      />
    </TabItem>
    <TabItem title={t("游戏UI自定义")}>
      {Object.keys(Scene).map((key) => (
        <Button
          key={key}
          appearance='primary'
          size="small"
          style={{ height: 30, marginRight: 10 }}
          onClick={() => {
            eventBus.emit('customUI', { scene: key });
          }}
        >
          {sceneNameMap[key as keyof typeof Scene]}
        </Button>
      ))}
      <GameConfigEditorGameMenu
        key="gameMenu"
      />
    </TabItem>
  </TopbarTab>;
}


/**
 * 游戏菜单控制
 */
function GameConfigEditorGameMenu() {
  const [gameMenuDialogOpen, setGameMenuDialogOpen] = useState(false);
  const [currentEditScene, setCurrentEditScene] = useState<Scene>();
  const [options, setOptions] = useState<SceneUIConfig>(sceneUIConfig);

  const state = useSelector((state: RootState) => state.status.editor);


  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
  const getGameConfig = () => {
    axios
      .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };

  function parseAndSetGameConfigState(data: string) {
    gameConfig.set(WebgalParser.parseConfig(data));
  }

  function updateGameUIConfig() {
    const newConfig = cloneDeep(gameConfig.value);

    function handleUpdate(key: string, value: ButtonItem | ContainerItem | SliderContainerItem | IndicatorContainerItem) {
      const index = newConfig.findIndex(e => e.command === key);
      let styleContent: Record<string, string[]> = {};

      Object.keys((value.args)).forEach((argKey) => {
        // @ts-ignore
        if (argKey.toLowerCase().endsWith('style') && value.args[argKey]) {
          styleContent[argKey] = [];
          // @ts-ignore
          Object.keys((value.args[argKey])).forEach((styleKey) => {
            let newKey = styleKey as keyof Style;
            // @ts-ignore
            if (value.args[argKey][newKey]) {
              // @ts-ignore
              styleContent[argKey].push(`${newKey}=${value.args[argKey][newKey]}`);
            }
          });
        }
      });

      const options: any[] = [{ key: 'hide', value: value.args.hide }];
      
      Object.keys(styleContent).forEach((key) => {
        if (styleContent[key].length > 0) {
          options.push({ key, value: `{${styleContent[key].join(',')}}` });
        }
      });

      if (index >= 0) {
        newConfig[index].args = [value.content];
        newConfig[index].options = options;
      } else {
        newConfig.push({command: key, args: [value.content], options });
      }
    }

    // @ts-ignore
    for (const [key, value] of Object.entries(options[currentEditScene!]?.buttons)) {
      handleUpdate(key, value);
    }
    // @ts-ignore
    for (const [key, value] of Object.entries(options[currentEditScene!]?.other)) {
      handleUpdate(key, value);
    }

    gameConfig.set(newConfig);
    updateGameConfig();
  }

  function updateGameConfig() {
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }

  useEffect(() => {
    const handler = (data: unknown) => {
      const typedData = data as { scene: Scene };
      setCurrentEditScene(typedData.scene);
      setGameMenuDialogOpen(true);
    };
    getGameConfig();

    eventBus.on('customUI', handler);
  }, []);
  
  useEffect(() => {
    if (!currentEditScene) return;

    const newOptions: SceneUIConfig = {
      ...sceneUIConfig,
    };

    const parseArgs = (args: WebgalConfig[0]['options']) => {
      const parseStyleString = (styleString: string): Style => {
        let styleObj: Style = {};
        const styleRegex = /\{(.*?)\}/;
        const styleMatch = styleString.match(styleRegex);
        if (styleMatch) {
          const styleStr = styleMatch[1];
          const styleProps = styleStr.split(',');
          const style: any = {};
    
          // Parse each style property
          styleProps.forEach((prop) => {
            const [key, value] = prop.split('=');
            if (key && value) {
              style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
            }
          });
    
          styleObj = style;
        }
        return styleObj;
      };
    
      const parsedArgs: any = { hide: false, style: {} };
    
      args.forEach((e: any) => {
        if (e.key === 'hide') {
          parsedArgs.hide = e.value === true;
        } else if (e.key.endsWith('style')) {
          parsedArgs[e.key] = parseStyleString(e.value as string);
        }
      });
    
      return parsedArgs;
    };

    gameConfig.value.forEach((item) => {
      if (SceneKeyMap[currentEditScene]) {
        // @ts-ignore
        newOptions[currentEditScene] = { ...newOptions[currentEditScene]  };
        // @ts-ignore
        if (SceneKeyMap[currentEditScene].buttons[item.command]) {
          // @ts-ignore
          newOptions[currentEditScene].buttons[item.command] = {
            key: item.command,
            content: item.args[0] ?? '',
            args: parseArgs(item.options ?? [])
          };
        // @ts-ignore
        } else if (SceneKeyMap[currentEditScene].other[item.command]) {
          // @ts-ignore
          newOptions[currentEditScene].other[item.command] = {
            key: item.command,
            content: item.args[0] ?? '',
            args: parseArgs(item.options ?? [])
          };
        }
      }
    });

    setOptions(newOptions);
  }, [gameConfig.value, currentEditScene]);


  const submit = () => {
    setGameMenuDialogOpen(false);
    setTimeout(() => {
      updateGameUIConfig();
    }, 10);
  };

  return (
    <Dialog open={gameMenuDialogOpen} onOpenChange={(event, data) => setGameMenuDialogOpen(data.open)}>
      <DialogSurface style={{ maxWidth: "960px" }}>
        <DialogBody>
          <DialogTitle>{sceneNameMap[currentEditScene || Scene.extra]}UI设置</DialogTitle>
          <DialogContent>
            <div className={s.group}>
              <span className={s.groupLabel}>其他设置</span>
              {Object.values((options[currentEditScene || Scene.extra]?.other || {})).map((item) => renderConfig(item, "other", currentEditScene || Scene.extra, setOptions))}
            </div>
            <div className={s.group}>
              <span className={s.groupLabel}>界面按钮</span>
              {Object.values((options[currentEditScene || Scene.extra]?.buttons || {})).map((item) => renderConfig(item, "buttons", currentEditScene || Scene.extra, setOptions))}

              {/* {Object.values(options.buttons).map((menu, index) => (
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
                      className={s.sayInput}
                      placeholder="按钮名称"
                      style={{ width: "10%", margin: "0 6px 0 12px", color: "#666" }}
                    />
                    <Button appearance="primary" size="small" style={{ margin: '0 18px 0 36px' }}>默认样式</Button>
                    <Button appearance="primary" size="small">选中样式</Button>
                  </div>
                </div>
              ))} */}
            </div>
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

function GameConfigEditorWithFileChoose(props: IGameConfigEditor & {
  title: string,
  sourceBase: string,
  extNameList: string[]
}) {
  return <div className={s.textEditArea}>
    <span className={s.label}>{props.title}</span>
    <span style={{ marginRight: 12 }}>{props.value}</span>
    <ChooseFile sourceBase={props.sourceBase}
      onChange={(file) => {
        if (file) {
          props.onChange(file.name);
        } else {
          props.onChange("");
        }
      }}
      extName={props.extNameList}/>
  </div>;
}

interface IStyleConfig {
  x?: {
    type: 'number',
    label: string,
  };
  y?: {
    type: 'number',
    label: string,
  };
  scale?: {
    type: 'number',
    label: string,
  };
  fontSize?: {
    type: 'number',
    label: string,
  };
  fontColor?: {
    type: 'color',
    label: string,
  };
  image?: {
    type: 'image',
    label: string,
  };
  width?: {
    type: 'number',
    label: string,
  };
  height?: {
    type: 'number',
    label: string,
  };
  marginLeft?: {
    type: 'number',
    label: string,
  };
  marginRight?: {
    type: 'number',
    label: string,
  };
  gap?: {
    type: 'number',
    label: string,
  };
  rowGap?: {
    type: 'number',
    label: string,
  };
  columnGap?: {
    type: 'number',
    label: string,
  };
}

function handleStyle(_style: IStyleConfig, config: UIItemConfig): [IStyleConfig, boolean] {
  let hasHoverStyle = false;
  let style = { ..._style };

  if (config.hasXY === false) {
    delete style.x;
    delete style.y;
  }

  if (config.hasWidthHeight === false) {
    delete style.width;
    delete style.height;
  }

  if (config.customStyle) {
    style = {
      ...style,
      ...config.customStyle
    };
  }

  if (config.hasHoverStyle !== false && (config.type === 'image')) {
    hasHoverStyle = true;
  }

  if (config.type === 'text') {
    delete style.image;
    delete style.width;
    delete style.height;
  }

  if (config.type === 'placeholder') {
    delete style.image;
  }

  if (config.type === 'bg') {
    hasHoverStyle = false;
  }

  if (config.type !== 'image' && config.type !== 'text') {
    delete style.fontColor;
    delete style.fontSize;
  }

  if ((config.type === 'text' || config.type === 'image') && config.hasText === false) {
    delete style.fontSize;
    delete style.fontColor;
  }

  return [style, hasHoverStyle];
}

// eslint-disable-next-line
function renderConfig(
  item: ButtonItem | IndicatorContainerItem | SliderContainerItem | ContainerItem,
  type: 'buttons' | 'other',
  currentEditScene: Scene,
  setOptions: Dispatch<SetStateAction<SceneUIConfig>>,
) {
  const key = item.key;
  let config: UIItemConfig & { children: Record<string, UIItemConfig> } | undefined;
  const defaultStyle: IStyleConfig = {
    x: {
      type: 'number',
      label: 'x',
    },
    y: {
      type: 'number',
      label: 'y',
    },
    scale: {
      type: 'number',
      label: '缩放',
    },
    fontSize: {
      type: 'number',
      label: '字体大小',
    },
    fontColor: {
      type: 'color',
      label: '字体颜色',
    },
    image: {
      type: 'image',
      label: '图片',
    },
    width: {
      type: 'number',
      label: '宽度',
    },
    height: {
      type: 'number',
      label: '高度',
    },
  };

  if (type === 'buttons') {
    const sceneConfig = sceneButtonConfig[currentEditScene];

    if (sceneConfig) {
      // @ts-ignore
      config = sceneConfig[key];
    }
  } else {
    const sceneConfig = sceneOtherConfig[currentEditScene];

    if (sceneConfig) {
      // @ts-ignore
      config = sceneConfig[key];
    }
  }

  if (!config) return null;

  config.type = config.type || 'image';

  const [styleConfig, hasHoverStyle] = handleStyle(defaultStyle, config);
  const styleConfigArr: { label: string; style: IStyleConfig, key: string }[] = [{ label: '默认样式', style: styleConfig, key: 'style' }];

  if (hasHoverStyle) {
    styleConfigArr.push({ label: '选中样式', style: { ...styleConfig }, key: 'hoverStyle' });
  }

  if (config.children) {
    for (const [key, value] of Object.entries(config.children)) {
      const [_styleConfig, _hasHoverStyle] = handleStyle(defaultStyle, value);
      styleConfigArr.push({ label: value.label + '样式', style: _styleConfig, key: value.label + 'Style' });
      
      if (_hasHoverStyle) {
        styleConfigArr.push({ label: value.label + '选中样式', style: { ..._styleConfig }, key: key + 'HoverStyle' });
      }
    }
  }

  return parseStyleConfig({
    styleConfigArr,
    config,
    item,
    type,
    currentEditScene,
    setOptions,
  });
}

function parseStyleConfig({
  styleConfigArr,
  config,
  item,
  type,
  currentEditScene,
  setOptions,
}: {
  styleConfigArr: { label: string; style: IStyleConfig, key: string }[],
  config: UIItemConfig & { children: Record<string, UIItemConfig> } | undefined,
  item: ButtonItem | IndicatorContainerItem | SliderContainerItem | ContainerItem,
  type: 'buttons' | 'other',
  currentEditScene: Scene,
  setOptions: Dispatch<SetStateAction<SceneUIConfig>>,
}) {
  if (!config) return;
  const key = item.key;

  function setContent(value: string) {
    setOptions((options) => {
      const newOptions = {
        ...options,
        [currentEditScene]: {
          ...options[currentEditScene],
          [type]: {
            // @ts-ignore
            ...options[currentEditScene][type],
            [key]: {
              // @ts-ignore
              ...options[currentEditScene][type][key],
              content: value.trim(),
            }
          }
        }
      };

      return newOptions;
    });
  }

  function setStyle(styleKey: keyof IStyleConfig, value: number | string | undefined, styleType:  'style' | 'hoverStyle' = 'style') {
    setOptions((options) => {
      const newOptions = {
        ...options,
        [currentEditScene]: {
          ...options[currentEditScene],
          [type]: {
            // @ts-ignore
            ...options[currentEditScene][type],
            [key]: {
              // @ts-ignore
              ...options[currentEditScene][type][key],
              args: {
                // @ts-ignore
                ...options[currentEditScene][type][key].args,
                [styleType]: {
                  // @ts-ignore
                  ...options[currentEditScene][type][key].args.style,
                  [styleKey]: value,
                }
              }
            }
          }
        }
      };

      if (config?.positionType === 'relative' && (styleKey === 'x' || styleKey === 'y') && value !== undefined || value !== '') {
        // @ts-ignore
        newOptions[currentEditScene][type][key].args.style.position = 'relative';
      } else {
        // @ts-ignore
        delete newOptions[currentEditScene][type][key].args.style.position;
      }

      return newOptions;
    });
  }

  function setHide(value: boolean) {
    setOptions((options) => {
      const newOptions = {
        ...options,
        [currentEditScene]: {
          ...options[currentEditScene],
          [type]: {
            // @ts-ignore
            ...options[currentEditScene][type],
            [key]: {
              // @ts-ignore
              ...options[currentEditScene][type][key],
              args: {
                // @ts-ignore
                ...options[currentEditScene][type][key].args,
                hide: value,
              }
            }
          }
        }
      };
      return newOptions;
    });
  }

  if (config.type === 'bgm') {
    return (
      <div style={{ marginTop: 12 }}>
        <GameConfigEditorWithFileChoose
          title={config.label}
          extNameList={[".mp3", ".ogg", ".wav"]}
          sourceBase="bgm" key="titleBgm"
          value={item.content}
          onChange={(e: string) => setContent(e)}
        />
      </div>
    );
  }
  
  return (
    <div className={s.row}>
      <span className={s.label}>{config.label}</span>
      <div>
        <Checkbox
          checked={item.args.hide}
          onChange={(_, data) => {
            setHide(data.checked as boolean);
          }}
        />
        <span>隐藏</span>
      </div>
      {styleConfigArr.map(({ label, style, key }) => (
        <Dialog key={key}>
          <DialogTrigger disableButtonEnhancement>
            <Button size="small">设置{label}</Button>
          </DialogTrigger>
          <DialogSurface style={{ maxWidth: "960px" }}>
            <DialogBody>
              <DialogTitle>{label}</DialogTitle>
              <DialogContent className={s.dialogContent}>
                {style.fontSize && key === 'style' && (
                  <div className={s.row}>
                    <span className={s.optionLabel}>文字</span>
                    <Input
                      value={item.content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                )}
                {Object.entries(style).map(([styleKey, styleProp]) => (
                  <div className={s.row} key={styleKey}>
                    <span className={s.optionLabel}>{styleProp.label}</span>
                    {styleProp.type === 'number' ? (
                      <Input
                        type="number"
                        value={item.args.style?.[styleKey as keyof IStyleConfig] as string || ""}
                        onChange={(e) => setStyle(styleKey as keyof IStyleConfig, Number(e.target.value))}
                      />
                    ) : styleProp.type === 'color' ? (
                      <input
                        type="color"
                        value={item.args.style?.[styleKey as keyof IStyleConfig] as string || ""}
                        onChange={(e) => setStyle(styleKey as keyof IStyleConfig, e.target.value)}
                      />
                    ) : (styleProp.type === 'image') ? (
                      <div>
                        <ChooseFile
                          sourceBase={config.type === 'bg' ? 'background' : 'ui'}
                          onChange={(file) => config.type === 'bg' && key === 'style' ? setContent(file?.name ?? "") : setStyle(styleKey as keyof IStyleConfig, file?.name ?? "")}
                          extName={[".png", ".jpg", ".jpeg", ".gif"]}
                        />
                        <span style={{ marginLeft: 12 }}>{config.type === 'bg' && key === 'style' ? item.content : item.args.style?.[styleKey as keyof IStyleConfig]}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="primary">确认</Button>
                </DialogTrigger>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      ))}
    </div>
  );
}