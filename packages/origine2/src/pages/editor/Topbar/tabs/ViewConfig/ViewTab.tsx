/* eslint-disable max-params */
import TopbarTab from '@/pages/editor/Topbar/components/TopbarTab';
import { TabItem } from '@/pages/editor/Topbar/components/TabItem';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/origineStore';
import { setShowSidebar } from '@/store/userDataReducer';
import s from './viewTab.module.scss';
import { IconWithTextItem } from '@/pages/editor/Topbar/components/IconWithTextItem';
import { eventBus } from '@/utils/eventBus';
import { useTranslation } from 'react-i18next';
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
} from '@fluentui/react-icons';
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
  Select
} from '@fluentui/react-components';
import { WebgalConfig } from 'idoltime-parser/build/types/configParser/configParser';
import {
  ButtonItem,
  ButtonKey,
  ContainerItem,
  IndicatorContainerItem,
  LoadSceneButtonKey,
  Scene,
  sceneButtonConfig,
  SceneKeyMap,
  sceneNameMap,
  sceneOtherConfig,
  sceneUIConfig,
  SceneUIConfig,
  SliderContainerItem,
  Style,
  UIItemConfig,
  CollectionItemKey,
  collectionItemInfoKey,
  SliderItemKey,
} from '@/pages/editor/types';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { cloneDeep } from 'lodash';
import { useValue } from '@/hooks/useValue';
import axios from 'axios';
import { WebgalParser } from '@/pages/editor/GraphicalEditor/parser';
import { CollectionInfo } from './CollectionImgInfo';
import { 
  IStyleConfig,
  defaultStyle,
  InfoConfig,
  defaultInfo,
  ICollectionImages,
  defaultCollectionImages,
  defaultCollectionVideos,
  IBtnSoundConfig,
  IStyleConfigArr,
  defaultBtnSoundConfig
} from './confg';
import { EscMenu } from '@/pages/editor/Topbar/tabs/GameConfig/EscMenu/EscMenu';
import { SoundSetting } from '@/pages/editor/Topbar/tabs/GameConfig/SoundSetting/SoundSetting';

interface IGameConfigEditor {
  key: string;
  value: string;
  onChange: Function;
}

const sliderKeyArr = [
  SliderItemKey.slider, 
  SliderItemKey.sliderBg, 
  SliderItemKey.sliderThumb
];

export function ViewTab() {
  const dispatch = useDispatch();
  const isShowSidebar = useSelector((state: RootState) => state.userData.isShowSidebar);
  const currentEditGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  const { t } = useTranslation();

  const PanelLeftIcon = bundleIcon(PanelLeft24Filled, PanelLeft24Regular);
  const PanelLeftContractIcon = bundleIcon(PanelLeftContract24Filled, PanelLeftContract24Regular);
  const ArrowClockwiseIcon = bundleIcon(ArrowClockwise24Filled, ArrowClockwise24Regular);
  const OpenIcon = bundleIcon(Open24Filled, Open24Regular);

  return (
    <TopbarTab>
      <TabItem title={t('侧边栏')}>
        <IconWithTextItem
          onClick={() => {
            dispatch(setShowSidebar(!isShowSidebar));
          }}
          icon={
            isShowSidebar ? (
              <PanelLeftIcon className={s.iconColor} />
            ) : (
              <PanelLeftContractIcon className={s.iconColor} />
            )
          }
          text={isShowSidebar ? t('显示侧边栏') : t('隐藏侧边栏')}
        />
      </TabItem>
      <TabItem title={t('侧边栏游戏预览')}>
        <IconWithTextItem
          onClick={() => {
            eventBus.emit('refGame');
          }}
          icon={<ArrowClockwiseIcon className={s.iconColor} />}
          text={t('刷新游戏')}
        />
        <IconWithTextItem
          onClick={() => {
            window.open(`/games/${currentEditGame}?standalone=true`, '_blank');
          }}
          icon={<OpenIcon className={s.iconColor} />}
          text={t('新标签页预览')}
        />
      </TabItem>
      <TabItem title={t('游戏UI自定义')}>
        {Object.keys(Scene).map((key, index) => (
          <Button
            key={key + index}
            appearance="primary"
            size="small"
            style={{ height: 30, marginRight: 10 }}
            onClick={() => {
              eventBus.emit('customUI', { scene: key });
            }}
          >
            {sceneNameMap[key as keyof typeof Scene]}
          </Button>
        ))}
        <GameConfigEditorGameMenu key="customGameMenu" />
      </TabItem>
      <TabItem title={t("ESC菜单")}>
        <Button
          appearance='primary'
          size="small"
          style={{ height: 30 }}
          onClick={() => {
            eventBus.emit('escMenu');
          }}
        >
          {t('UI设置')}
        </Button>
        <EscMenu key="escMenu" value="ESC_menu_button" />
      </TabItem>
      <TabItem title={t("界面音效")}>
        <Button
          appearance='primary'
          size="small"
          style={{ height: 30 }}
          onClick={() => {
            eventBus.emit('soundSetting');
          }}
        >
          {t('音效设置')}
        </Button>
        <SoundSetting key="soundSetting" />
      </TabItem>
    </TopbarTab>
  );
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
  
    function handleUpdate(
      key: string,
      value: ButtonItem | ContainerItem | SliderContainerItem | IndicatorContainerItem,
    ) {
      const index = newConfig.findIndex((e) => e.command === key);
      let styleContent: Record<string, string[]> = {};
      Object.keys(value.args).forEach((argKey) => {
        // @ts-ignore
        if (argKey.toLowerCase().endsWith('style') && value.args[argKey] || sliderKeyArr.includes(argKey)) {
          styleContent[argKey] = [];
          // @ts-ignore
          Object.keys(value.args[argKey]).forEach((styleKey) => {
            let newKey = styleKey as keyof Style;
            // @ts-ignore
            if (value.args[argKey][newKey] !== undefined && value.args[argKey][newKey] !== null && value.args[argKey][newKey] !== '') {
              // @ts-ignore
              styleContent[argKey].push(`${newKey}=${value.args[argKey][newKey]}`);
            }
          });
        } else if (argKey.toLowerCase().endsWith('info') || argKey.toLowerCase().endsWith('images') || argKey === 'videos') {
          styleContent[argKey] = [];
          // @ts-ignore
          Object.keys(value.args[argKey]).forEach((infoKey) => {
            let newKey = argKey.toLowerCase().endsWith('info') && infoKey as keyof InfoConfig || 
              argKey.toLowerCase().endsWith('images') && infoKey as keyof ICollectionImages || 
              argKey === 'videos' && infoKey as keyof typeof defaultCollectionVideos;

            // @ts-ignore
            if (value.args[argKey][newKey] !== undefined && value.args[argKey][newKey] !== null && value.args[argKey][newKey] !== '') {
              // @ts-ignore
              styleContent[argKey].push(`${newKey}=${value.args[argKey][newKey]}`);
            }
          });
        } else if (argKey === "btnSound") {
          // console.log(argKey);
          // debugger;

          styleContent[argKey] = [];
          // @ts-ignore
          Object.keys(value.args[argKey]).forEach((btnSoundKey) => {
            // @ts-ignore
            let val = value.args[argKey][btnSoundKey];
            if (!val) {
              return;
            }
            // @ts-ignore
            styleContent[argKey].push(`${btnSoundKey}=${val}`);
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
        newConfig.push({ command: key, args: [value.content], options });
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

    form.append('gameName', state.currentEditingGame);
    form.append('newConfig', newConfig);
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
        const styleRegex = /\{([^]*?)\}/; // /\{(.*?)\}/;
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
      const parsedKeys = ['hoverStyle', 'info', 'images', 'btnSound', 'videos'];

      args.forEach((e: any) => {
        if (e.key === 'hide') {
          parsedArgs.hide = e.value === true;
        } else if (e.key.endsWith('style') || parsedKeys.includes(e.key)) {
          parsedArgs[e.key] = parseStyleString(e.value as string);
        }
        
        // else if (e.key === 'hoverStyle') {
        //   parsedArgs[e.key] = parseStyleString(e.value as string);
        // } else if (e.key === 'info') {
        //   parsedArgs[e.key] = parseStyleString(e.value as string);
        // } else if (e.key === 'images') {
        //   parsedArgs[e.key] = parseStyleString(e.value as string);
        // } else if (e.key === 'btnSound') {
        //   parsedArgs[e.key] = parseStyleString(e.value as string);
        // } 
      });

      return parsedArgs;
    };

    gameConfig.value.forEach((item) => {
      if (SceneKeyMap[currentEditScene]) {
        // @ts-ignore
        newOptions[currentEditScene] = { ...newOptions[currentEditScene] };
        // @ts-ignore
        if (SceneKeyMap[currentEditScene].buttons[item.command]) {
          // @ts-ignore
          newOptions[currentEditScene].buttons[item.command] = {
            key: item.command,
            content: item.args[0] ?? '',
            args: parseArgs(item.options ?? []),
          };
          // @ts-ignore
        } else if (SceneKeyMap[currentEditScene].other[item.command]) {
          // @ts-ignore
          newOptions[currentEditScene].other[item.command] = {
            key: item.command,
            content: item.args[0] ?? '',
            args: parseArgs(item.options ?? []),
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
      <DialogSurface style={{ maxWidth: '960px' }}>
        <DialogBody>
          <DialogTitle>{sceneNameMap[currentEditScene || Scene.extra]}UI设置</DialogTitle>
          <DialogContent>
            <div className={s.group} key="other">
              <span className={s.groupLabel}>其他设置</span>
              {Object.values(options[currentEditScene || Scene.extra]?.other || {}).map((item, index) =>
                renderConfig(item, 'other', currentEditScene || Scene.extra, setOptions, index),
              )}
            </div>
            <div className={s.group} key="buttons">
              <span className={s.groupLabel}>界面按钮</span>
              {Object.values(options[currentEditScene || Scene.extra]?.buttons || {}).map((item, index) =>
                renderConfig(item, 'buttons', currentEditScene || Scene.extra, setOptions, index),
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="secondary"
                onClick={() => {
                  setGameMenuDialogOpen(false);
                }}
              >
                取消
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={() => {
                submit();
                setGameMenuDialogOpen(false);
              }}
            >
              确认
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function GameConfigEditorWithFileChoose(
  props: IGameConfigEditor & {
    title: string;
    sourceBase: string;
    extNameList: string[];
  },
) {
  return (
    <div className={s.textEditArea}>
      <span className={s.label}>{props.title}</span>
      <span style={{ marginRight: 12 }}>{props.value}</span>
      <ChooseFile
        sourceBase={props.sourceBase}
        onChange={(file) => {
          if (file) {
            props.onChange(file.name);
          } else {
            props.onChange('');
          }
        }}
        extName={props.extNameList}
      />
    </div>
  );
}

export interface IStyleType {
  style: string;
  hoverStyle: string;
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
      ...config.customStyle,
    };
  }

  if (config.hasHoverStyle !== false && config.type === 'image') {
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
  item: ButtonItem | IndicatorContainerItem | SliderContainerItem | ContainerItem | CollectionItemKey,
  type: 'buttons' | 'other',
  currentEditScene: Scene,
  setOptions: Dispatch<SetStateAction<SceneUIConfig>>,
  itemIndex: number,
) {
  const key = item.key;
  let config: (UIItemConfig & { children: Record<string, UIItemConfig> }) | undefined;

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
  const styleConfigArr: IStyleConfigArr[] = [
    { label: '默认样式', style: styleConfig, key: 'style' },
  ];

  if (hasHoverStyle) {
    styleConfigArr.push({ 
      label: '选中样式', 
      style: { ...styleConfig }, 
      key: 'hoverStyle' 
    });
  }

  if (config.children) {
    for (const [key, value] of Object.entries(config.children)) {
      value.type = value.type || 'image';
      const [_styleConfig, _hasHoverStyle] = handleStyle(defaultStyle, value);

      if (key === collectionItemInfoKey.collectionInfo) {
        styleConfigArr.push({
          label: '图鉴信息',
          key: 'info',
          style: {},
          info: defaultInfo
        });
      } else if (key === collectionItemInfoKey.collectionImages) {
        styleConfigArr.push({
          label: '详情图片列表',
          key: key,
          style: {},
          images: defaultCollectionImages
        });
      } else if (key === 'collection_videos') {
        styleConfigArr.push({
          label: '详情视频列表',
          key: key,
          style: {},
          videos: defaultCollectionVideos,
        });
      } else {
        styleConfigArr.push({ 
          label: value.label + '样式', 
          style: _styleConfig, 
          key: sliderKeyArr.includes(key as any) ? key : value.label + 'Style' 
        });
      }

      if (_hasHoverStyle) {
        styleConfigArr.push({ 
          label: value.label + '选中样式', 
          style: { ..._styleConfig }, 
          key: key + 'HoverStyle' 
        });
      }
    }
  }
  
  // 按钮按钮点击音效配置项
  if (config?.hasButtonSound) { 
    styleConfigArr.push({ 
      label: '按钮音效', 
      key: 'buttonSound',
      style: {},
      btnSound: { ...defaultBtnSoundConfig }
    });
  }

  return parseStyleConfig({
    styleConfigArr,
    config,
    item,
    type,
    currentEditScene,
    setOptions,
    itemIndex,
  });
}

function parseStyleConfig({
  styleConfigArr,
  config,
  item,
  type,
  currentEditScene,
  setOptions,
  itemIndex,
}: {
  styleConfigArr: IStyleConfigArr[];
  config: (UIItemConfig & { children: Record<string, UIItemConfig> }) | undefined;
  item: ButtonItem | IndicatorContainerItem | SliderContainerItem | ContainerItem | CollectionItemKey;
  type: 'buttons' | 'other';
  currentEditScene: Scene;
  setOptions: Dispatch<SetStateAction<SceneUIConfig>>;
  itemIndex: number;
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
            },
          },
        },
      };
      return newOptions;
    });
  }

  function setStyle(
    styleKey: keyof IStyleConfig,
    value: number | string | undefined,
    styleType: 'style' | 'hoverStyle' = 'style',
  ) {
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
                  ...options[currentEditScene][type][key].args[styleType],
                  [styleKey]: value,
                },
              },
            },
          },
        },
      };

      
      if (
        (config?.positionType === 'relative' && (styleKey === 'x' || styleKey === 'y') && !value)
      ) {
        // @ts-ignore
        newOptions[currentEditScene][type][key].args.style.position = 'relative';
      } else {
        config?.positionType === 'absolute'
          // @ts-ignore
          ? newOptions[currentEditScene][type][key].args.style.position = config.positionType
          // @ts-ignore
          : delete newOptions[currentEditScene][type][key].args.style.position;
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
              },
            },
          },
        },
      };
      return newOptions;
    });
  }

  function setFile(fileType: 'videos' | 'images', fileKey: keyof ICollectionImages | keyof typeof defaultCollectionVideos, value: string) {
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
                [fileType]: {
                  // @ts-ignore
                  ...options[currentEditScene][type][key].args[fileType],
                  [fileKey]: value,
                },
              },
            },
          },
        },
      };
      return newOptions;
    });
  }

  function setInfo(infoKey: keyof InfoConfig, value: number | string | undefined) {
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
                'info': {
                  // @ts-ignore
                  ...options[currentEditScene][type][key].args['info'],
                  [infoKey]: value,
                },
              },
            },
          },
        },
      };
      return newOptions;
    });
  }

  /**
   * 
   * @param btnTypeKey 按钮类型：‘clickSound’ | 'hoverSound' => IBtnSoundConfig
   * @param value 声音文件
   */
  function setButtonSound(btnTypeKey: keyof IBtnSoundConfig, value: string) {
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
                'btnSound': {
                  // @ts-ignore
                  ...options[currentEditScene][type][key].args['btnSound'],
                  [btnTypeKey]: value,
                },
              },
            },
          },
        },
      };
      return newOptions;
    });
  }

  // 图鉴界面
  if (key.includes('Collection_img')) {
    return  (
      <CollectionInfo
        key={key}
        styleConfigArr={styleConfigArr}
        config={config}
        item={item as CollectionItemKey}
        type={type}
        currentEditScene={currentEditScene}
        itemIndex={itemIndex}
        setOptions={setOptions}
        setContent={setContent}
        setStyle={setStyle}
        setHide={setHide}
        setInfo={setInfo}
        setFile={setFile}
      />
    );
  }

  if (config.type === 'bgm') {
    return (
      <div style={{ marginTop: 12 }} key={key + itemIndex}>
        <GameConfigEditorWithFileChoose
          title={config.label}
          extNameList={['.mp3', '.ogg', '.wav']}
          sourceBase="bgm"
          key="titleBgm"
          value={item.content}
          onChange={(e: string) => setContent(e)}
        />
      </div>
    );
  }

  const getChooseFileName = (key: string, item: ButtonItem, styleKey: any, type?: string) => {
    let fileName = '';
    if (type === 'bg' && key === 'style') {
      fileName = item.content;
    } else if (key === 'hoverStyle') {
      fileName = (item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string;
    } else if (sliderKeyArr.includes(key as any)) {
      // @ts-ignore
      fileName = item.args[key]?.[styleKey as keyof IStyleConfig] as string ?? '';
    } else {
      fileName = item.args.style?.[styleKey as keyof IStyleConfig] as string ?? '';
    }

    return fileName;
  };

  return (
    <div className={s.row} key={itemIndex + config.label}>
      <span className={s.label}>{config.label}</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={item.args.hide}
          onChange={(_, data) => {
            setHide(data.checked as boolean);
          }}
        />
        <span style={{ display: 'inline-block', width: '30px' }}>隐藏</span>
      </div>
      {styleConfigArr.map(({ label, style, key, btnSound }, index: number) => (
        <Dialog key={key + index}>
          <DialogTrigger disableButtonEnhancement>
            <Button size="small">设置{label}</Button>
          </DialogTrigger>
          <DialogSurface style={{ maxWidth: '960px' }}>
            <DialogBody>
              <DialogTitle>{label}</DialogTitle>
              <DialogContent className={s.dialogContent}>
                {key === 'buttonSound' && btnSound && 
                  Object.keys(btnSound).map((soundKey: string, idx: number) => {
                    return <div className={s.row} key={soundKey + idx}>
                      <GameConfigEditorWithFileChoose
                        title="点击音效"
                        extNameList={['.mp3', '.ogg', '.wav']}
                        sourceBase="bgm"
                        key={soundKey}
                        // @ts-ignore
                        value={item?.args?.btnSound?.[soundKey] ?? ''}
                        onChange={(val: string) => {
                          setButtonSound(soundKey as keyof IBtnSoundConfig, val);
                        }}
                      />
                    </div>;
                  })
                }

                {style.fontSize && key === 'style' && (
                  <div className={s.row}>
                    <span className={s.optionLabel}>文字</span>
                    <Input value={item.content} onChange={(e) => setContent(e.target.value)} />
                  </div>
                )}
                {Object.entries(style).map(([styleKey, styleProp], idx: number) => (
                  <div className={s.row} key={styleKey + index + idx}>
                    <span className={s.optionLabel}>{styleProp.label}</span>

                    {styleKey === 'alignPosition' && (
                      <Select
                        value={
                          key === 'hoverStyle'
                            ? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
                            : (item.args.style?.[styleKey as keyof IStyleConfig] as string) ?? ''
                        }
                        onChange={(e, data) => {
                          setStyle(
                              styleKey as keyof IStyleConfig,
                              data.value as string,
                              key as keyof IStyleType,
                          );
                        }}
                      >
                        {/* {alignPositionOptions.map((item: { name: string, value: string }, index: number) => {
                          return <option defaultValue={'top-center'} key={item.value + index} value={item.value}>{item.name}</option>;
                        })} */}
                      </Select>
                    )}

                    {styleProp.type === 'number' ? (
                      <Input
                        type="number"
                        value={
                          key === 'hoverStyle'
                            ? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
                            : (item.args.style?.[styleKey as keyof IStyleConfig] as string) ?? ''
                        }
                        onChange={(e) => {
                          setStyle(
                            styleKey as keyof IStyleConfig,
                            e.target.value === '' ? '' : Number(e.target.value),
                            key as keyof IStyleType,
                          );
                        }}
                      />
                    ) : styleProp.type === 'color' ? (
                      <input
                        type="color"
                        value={
                          key === 'hoverStyle'
                            ? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
                            : (item.args.style?.[styleKey as keyof IStyleConfig] as string) ?? ''
                        }
                        onChange={(e) => {
                          setStyle(styleKey as keyof IStyleConfig, e.target.value, key as keyof IStyleType);
                        }}
                      />
                    ) : styleProp.type === 'image' ? (
                      <div>
                        <ChooseFile
                          extName={['.png', '.jpg', '.jpeg', '.gif', '.webp']}
                          sourceBase={config.type === 'bg' ? 'background' : 'ui'}
                          onChange={(file) =>
                            config.type === 'bg' && key === 'style'
                              ? setContent(file?.name ?? '')
                              : setStyle(styleKey as keyof IStyleConfig, file?.name ?? '', key as keyof IStyleType)
                          }
                        />
                        <span style={{ marginLeft: 12 }}>
                          {getChooseFileName(key, item as ButtonItem, styleKey, config.type,)}
                          {/* {config.type === 'bg' && key === 'style'
                            ? item.content
                            : key === 'hoverStyle'
                              ? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
                              : item.args.style?.[styleKey as keyof IStyleConfig] ?? ''} */}
                        </span>
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
