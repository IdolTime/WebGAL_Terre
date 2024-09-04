import styles from "../topbarTabs.module.scss";
import {useValue} from "../../../../../hooks/useValue";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
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
import { Dismiss24Filled, Dismiss24Regular, bundleIcon, Image48Regular } from "@fluentui/react-icons";
import { EscMenu } from './EscMenu/EscMenu';
import { SoundSetting } from './SoundSetting/SoundSetting';
import { setGamePackageName } from "@/store/statusReducer";
import configStyles from "./gameConfig.module.scss";
import { animateCursor } from "@/utils/utils";

interface ICursorConfig {
  normal: {
    imgs: string[];
    interval: number;
  };
  active: {
    imgs: string[];
    interval: number;
  }
}


export default function GameConfig() {
  const t = useTrans("editor.sideBar.gameConfigs.");
  const state = useSelector((state: RootState) => state.status.editor);
  const dispatch = useDispatch();
  const isShowCursorDialog = useValue(false);
  const cursorOptions = useValue<ICursorConfig>({
    normal: {
      imgs: [],
      interval: 100,
    },
    active: {
      imgs: [],
      interval: 100,
    }
  });
  const disposeCallbackRef = useRef<{
    normal: () => void,
    active: () => void
      }>({
        normal: () => {},
        active: () => {},
      });

  // 拿到游戏配置
  const gameConfig = useValue<WebgalConfig>([]);
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

  function updateCursorConfig() {
    const newConfig = cloneDeep(gameConfig.value);
    const index = newConfig.findIndex(e => e.command === 'Game_cursor');
    const normalImgs = cursorOptions.value.normal.imgs;
    const activeImgs = cursorOptions.value.active.imgs;

    if (index >= 0) {
      newConfig[index].options = [];
      newConfig[index].options = [{
        key: 'normal',
        value: JSON.stringify({
          imgs: normalImgs,
          interval: cursorOptions.value.normal.interval
        })
      }];
      newConfig[index].options.push({
        key: 'active',
        value: JSON.stringify({
          imgs: activeImgs,
          interval: cursorOptions.value.active.interval
        })
      });
    } else {
      newConfig.push({command: 'Game_cursor', args: [], options: [
        {
          key: 'normal',
          value: JSON.stringify({
            imgs: normalImgs,
            interval: cursorOptions.value.normal.interval
          })
        },
        {
          key: 'active',
          value: JSON.stringify({
            imgs: activeImgs,
            interval: cursorOptions.value.active.interval
          })
        }
      ]});
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

    // 游戏包名
    const gamePackageName = getConfigContentAsString('Package_name');
    if (gamePackageName) {
      dispatch(setGamePackageName(gamePackageName));
    }
  }

  const setCursorOptions = (key: 'normal' | 'active', secondaryKey: 'imgs' | 'interval', value: string | string[]) => {
    const newOptions = cloneDeep(cursorOptions.value);
    
    if (secondaryKey === 'interval') {
      newOptions[key][secondaryKey] = Number(value);
    } else {
      if (Array.isArray(value)) {
        newOptions[key][secondaryKey] = value;
      } else {
        newOptions[key][secondaryKey] = [];
      }
    }

    cursorOptions.set(newOptions);
  };

  const handleUpload = (type: 'normal' | 'active', files: FileList | null, onUpload: () => void) => {
    let targetDirectory = `public/games/${state.currentEditingGame}/game/ui`;
    
    const fileList = Array.from(files || []);

    if (!fileList.length) {
      return;
    }

    if (type === 'normal') {
      targetDirectory += '/cursor';
    } else {
      targetDirectory += '/cursorActive';
    }

    const formData = new FormData();
    formData.append("targetDirectory", targetDirectory);
    formData.append("clearTargetDirectory", "true");

    fileList.forEach((file) => {
      formData.append("files", file);
    });

    axios.post('/api/manageGame/uploadFiles', formData).then((response) => {
      if (response.data) {
        onUpload();
      }
    });
  };

  useEffect(() => {
    if (cursorOptions.value.normal.imgs.length && isShowCursorDialog.value) {
      const imgs = cursorOptions.value.normal.imgs.map((e) => `/games/${state.currentEditingGame}/game/ui/${e.split('./')[1]}`);
      disposeCallbackRef.current.normal = animateCursor(document.getElementById('normalContainer'), imgs, cursorOptions.value.normal.interval);
    }
  }, [cursorOptions.value.normal, isShowCursorDialog.value]);

  useEffect(() => {
    if (cursorOptions.value.active.imgs.length && isShowCursorDialog.value) {
      const imgs = cursorOptions.value.active.imgs.map((e) => `/games/${state.currentEditingGame}/game/ui/${e.split('./')[1]}`);
      disposeCallbackRef.current.active = animateCursor(document.getElementById('activeContainer'), imgs, cursorOptions.value.active.interval);
    }
  }, [cursorOptions.value.active, isShowCursorDialog.value]);

  useEffect(() => {
    const cursorConfig = gameConfig.value.find(k => k.command === 'Game_cursor');

    if (cursorConfig) {
      let normalCursorStr = cursorConfig.options[0].value as string;
      let activeCursorStr = cursorConfig.options[1].value as string;
      const normalCursor = JSON.parse(normalCursorStr);
      const activeCursor = JSON.parse(activeCursorStr);
      cursorOptions.set({
        normal: normalCursor,
        active: activeCursor
      });
    }
  }, [gameConfig.value]);

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

      <TabItem title={t("options.gameIcon")}>
        <GameConfigEditorWithImageFileChoose
          sourceBase="background"
          extNameList={[".jpg", ".png", ".webp", '.ico']}
          key="gameIcon"
          value={getConfigContentAsStringArray('Game_Icon')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_Icon', e)}
        />
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
          extNameList={[".jpg", ".png", ".webp", '.gif']}
          key="logoImage"
          value={getConfigContentAsStringArray('Game_Logo')}
          onChange={(e: string[]) => updateGameConfigArrayByKey('Game_Logo', e)}/>
      </TabItem>
      <TabItem title={t("options.mouseCursor")}>
        <Button
          appearance='primary'
          size="small"
          onClick={() => {
            isShowCursorDialog.set(true);
          }}
        >
          光标设置
        </Button>
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
      <TabItem title={t("options.escMenu")}>
        <Button
          appearance='primary'
          size="small"
          onClick={() => {
            eventBus.emit('escMenu');
          }}
        >
          {t("escMenu.title")}
        </Button>
        <EscMenu key="escMenu" value="ESC_menu_button" />
      </TabItem>
      <TabItem title={t("options.sound")}>
        <Button
          appearance='primary'
          size="small"
          onClick={() => {
            eventBus.emit('soundSetting');
          }}
        >
          {t("sound.title")}
        </Button>
        <SoundSetting key="soundSetting" />
      </TabItem>
      <Dialog
        open={isShowCursorDialog.value}
        onOpenChange={(_, v) => {
          isShowCursorDialog.set(v.open);

          if (!v.open) {
            disposeCallbackRef.current.active?.();
            disposeCallbackRef.current.normal?.();
          }
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>鼠标自定义</DialogTitle>
            <DialogContent>
              <div className={configStyles.cursorRow}>
                <div>
                  <div>
                    <p>通常状态</p>
                  </div>
                  <div id="normalContainer" className={configStyles.previewContainer}>
                    <Button appearance="transparent" className={configStyles.fileBtn}>
                        点击替换
                      <input
                        className={configStyles.fileInput}
                        type="file"
                        multiple
                        onChange={(e) => {  handleUpload('normal', e.target.files, () => setCursorOptions('normal', 'imgs', Array.from(e.target.files || []).map(x => `./cursor/${x.name}`))); }}
                        accept=".png,.apng"
                      />
                    </Button>
                    <div className={configStyles.preview}>
                      <Image48Regular />
                      <span>预览</span>
                    </div>
                  </div>
                  <div>
                    <span>间隔：</span>
                    <Input
                      value={cursorOptions.value.normal.interval.toString()}
                      onChange={(e) => {
                        setCursorOptions('normal', 'interval', e.target.value);
                      }}
                    />  
                    <span className={configStyles.unitLabel}>毫秒</span>
                  </div>
                </div>
                <div>
                  <div>
                    <p>可互动状态</p>
                  </div>
                  <div id="activeContainer" className={configStyles.previewContainer}>
                    <Button appearance="transparent" className={configStyles.fileBtn}>
                        点击替换
                      <input
                        className={configStyles.fileInput}
                        type="file"
                        multiple
                        onChange={(e) => {  handleUpload('active', e.target.files, () => setCursorOptions('active', 'imgs', Array.from(e.target.files || []).map(x => `./cursorActive/${x.name}`))); }}
                        accept=".png,.apng"
                      />
                    </Button>
                    <div className={configStyles.preview}>
                      <Image48Regular />
                      <span>预览</span>
                    </div>
                  </div>
                  <div>
                    <span>间隔：</span>
                    <Input
                      value={cursorOptions.value.active.interval.toString()}
                      onChange={(e) => {
                        setCursorOptions('active', 'interval', e.target.value);
                      }}
                    />  
                    <span className={configStyles.unitLabel}>毫秒</span>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => {
                disposeCallbackRef.current.active?.();
                disposeCallbackRef.current.normal?.();
                isShowCursorDialog.set(false);
              }}>取消</Button>
              <Button appearance='primary' onClick={() => {
                disposeCallbackRef.current.active?.();
                disposeCallbackRef.current.normal?.();
                isShowCursorDialog.set(false);
                updateCursorConfig();
              }}>确定</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
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
 * R18
 */
function GameConfigEditorR18(props: IGameConfigEditorMulti) {

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    props.onChange([`${checked}`]);
  };

  const boolMap = new Map<string | boolean, boolean>([
    ['true', true],
    ['false', false],
    [true, true],
    [false, false]
  ]);
  
  return (
    <Checkbox 
      checked={props.value?.length ? boolMap.get(props.value[0]) : false}
      onChange={(e) => handleCheckboxChange(e)}
    />
  );
}
