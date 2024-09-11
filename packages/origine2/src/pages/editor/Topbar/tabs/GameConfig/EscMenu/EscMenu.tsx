import { FC, useState, useEffect } from 'react';
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
  Select,
} from '@fluentui/react-components';
import { useSelector } from 'react-redux';
import { cloneDeep, debounce } from "lodash";
import axios from "axios";
import {RootState} from "@/store/origineStore";
import { WebgalParser } from "@/pages/editor/GraphicalEditor/parser";
import { WebgalConfig } from "idoltime-parser/build/types/configParser/configParser";
import { useValue } from "@/hooks/useValue";
import { eventBus } from '@/utils/eventBus';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import FontFile from '@/pages/editor/FontFile/FontFile'
import { IConfigESCMenus, EMenuKey, ECommandKey } from './escMenuInterface';
import { defaultEscMenuConfig, getMenuKeyToName, getCommandKey } from './config';
import { boolMap } from '../SoundSetting/config';
import styles from './escMenu.module.scss';

interface IProps {
  value: string;
}

export const EscMenu: FC<IProps> = (props: IProps) => {
  const state = useSelector((state: RootState) => state.status.editor);
  const [escMenuDialogOpen, setESCMenuDialogOpen] = useState(false);
  const [editOptions, setEditOptions] = useState(defaultEscMenuConfig);

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

  const handleOpenDialog = () => setESCMenuDialogOpen(true);

  useEffect(() => {
    eventBus.on('escMenu', handleOpenDialog);
    getGameConfig();
    return () => {
      eventBus.off('escMenu', handleOpenDialog);
    };
  }, []);

  useEffect(() => {
    if (gameConfig.value?.length) {
      const newOptions = cloneDeep(editOptions)
        gameConfig.value.forEach(item => {
          switch (item.command) {
            case ECommandKey.ContinueGameButton:
              newOptions[0] = {
                ...newOptions[0],
                ...parseStringArray(item.options)
              }
              break;
            case ECommandKey.BackToLevelButton:
              newOptions[1] = {
                ...newOptions[1],
                ...parseStringArray(item.options)
              };
              break;
              case ECommandKey.SettingButton:
                newOptions[2] = {
                  ...newOptions[2],
                  ...parseStringArray(item.options)
                };
              break;
            case ECommandKey.ExitGameButton:
              newOptions[3] = {
                ...newOptions[3],
                ...parseStringArray(item.options)
              };
              break;
          }
        })
        setEditOptions(newOptions);
    }

}, [gameConfig.value])

function parseStringArray(arr: any[]) {
  const obj = {}
   arr.forEach((item: { key: string, value: string }) => {
      item.value?.split(',').forEach(pair => {
          const [key, value] = pair?.split('=');
          const val = key === 'hide' ? boolMap.get(value) : value;
          // @ts-ignore
          obj[key] = val
      });
  });
  return obj;
}

  const updateGameConfig = () => {
    const newConfig = cloneDeep(gameConfig.value);
    
    editOptions.forEach((item) => {
      const vals: string[] = [];
      const newOptions: any[] = [];
      // 参数不包括key和type include
      const notIncludeKeys = ['key', 'type'];

      Object.keys(item).forEach((key) => {
        // @ts-ignore
        if (!notIncludeKeys.includes(key) && item[key]) {
          // @ts-ignore
          vals.push(`${key}=${item[key]}`)
        }
      });

      newOptions.push({
          key: item.key,
          value: vals.join(',')
      })

      const index = newConfig.findIndex(e => e.command === item.type);
      if (index >= 0) {
        newConfig[index].options = newOptions
      } else {
        newConfig.push({command: getCommandKey(item.key as EMenuKey), args: [], options: [...newOptions]});
      }
    })

    gameConfig.set(newConfig);
  }

  const submit = () => {
    updateGameConfig();
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    const form = new URLSearchParams();
    form.append("gameName", state.currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form).then(getGameConfig);
  }

  const updateConfig = (idx: number, key: string, value: boolean | string | number) => {
    const newOptions = [...editOptions];
    // @ts-ignore
    newOptions[idx][key] = value;
    setEditOptions(newOptions)
  }

  // 封装提取数字部分并处理非数字字符的函数
const processNumericInput = (input: string) => {
  const regex = /^\d*$/; // 正则表达式，匹配数字
  let newValue = input;
  if (newValue.length > 0 && !(/^\d/.test(newValue))) {
      return '';
  }
  //@ts-ignore
  const numberPart = newValue.match(/^\d*/)[0];
  const nonNumberPart = newValue.substring(numberPart.length);
  if (nonNumberPart.length > 0) {
      newValue = numberPart + nonNumberPart.replace(/\D/g, '');
  }
  return newValue;
};

  const btnPositionOptions = [
    { name: '居中', value: 'center' },
    { name: '左对齐', value: 'flex-start' },
    { name: '右对齐', value: 'flex-end' },
    { name: '自定义', value: 'custom' },
  ]

  const alignOptions = [
    { name: '居中', value: 'center' },
    { name: '左对齐', value: 'left' },
    { name: '右对齐', value: 'right' },
  ]


  function renderConfig(data: IConfigESCMenus, index: number) {
    const { key, hide, name, btnImage, btnSound, btnPosition, fontFamily, fontSize, fontColor, align, x, y, scale } = data;
    return (
      <div className={styles.row} key={key}>
        <div className={styles.col1}>{getMenuKeyToName(key as EMenuKey)}</div>
        <div className={styles.col2}>
          <div className={styles.item}>
            <span>隐藏</span>
            <Checkbox
              checked={hide}
              onChange={(_, data) => {
                const checked = data.checked as boolean;
                updateConfig(index, 'hide', checked);
              }}
            />
          </div>
          <div className={styles.item}>
            <span>选项名称</span>
            <Input
              style={{ width: '100px' }}
              value={name}
              // placeholder={getMenuKeyToName(key as EMenuKey)}
              placeholder={''}
              onChange={(e) => {
                const newValue = e.target.value as string;
                updateConfig(index, 'name', newValue);
              }}
            />
          </div>
          <div className={styles.item} style={{ flexWrap: 'wrap' }}>
            <span className={styles.btnImage}>
              <label>按钮样式</label>
              <span title={btnImage}>{btnImage}</span>
            </span>
            <ChooseFile
              sourceBase={'ui'}
              extName={['.png', '.jpg', '.jpeg', '.gif']}
              onChange={(file) => {
                const img = file?.name ?? '';
                updateConfig(index, 'btnImage', img);
              }}
            />
          </div>
          <div className={styles.item} style={{ flexWrap: 'wrap' }}>
            <span className={styles.btnImage}>
              <label>按钮点击音效</label>
              <span title={btnSound}>{btnSound}</span>
            </span>
            <ChooseFile
              sourceBase={'bgm'}
              extName={[".mp3", ".ogg", ".wav"]}
              onChange={(file) => {
                const se = file?.name ?? '';
                updateConfig(index, 'btnSound', se);
              }}
            />
          </div>

          <div className={styles.item}>
            <span>按钮位置</span>
            <Select 
              style={{ width: '100px' }} 
              value={btnPosition}
              onChange={(e, data) => {
                updateConfig(index, 'btnPosition', data.value);
              }}
            >
              {btnPositionOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className={styles.col3}>
          <div className={styles.item}>
            <span>文字字体</span>
            <FontFile 
              value={fontFamily} 
              onChange={(val: string) => {
                updateConfig(index, 'fontFamily', val);
              }}
            />
          </div>
          <div className={styles.item}>
            <span>文字字号</span>
            <Input
              style={{ width: '70px' }}
              value={fontSize as string}
              onChange={(e) => {
                let newValue = e.target.value as string;
                newValue = processNumericInput(newValue)
                updateConfig(index, 'fontSize', newValue);
              }}
            />
          </div>
          <div className={styles.item}>
            <span>对齐方式</span>
            <Select 
              style={{ width: '100px' }} 
              value={align}
              onChange={(e, data) => {
                updateConfig(index, 'align', data.value);
              }}
            >
            {alignOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.name}</option>
              ))}
            </Select>
          </div>

          <div className={styles.item}>
            <span>文字颜色</span>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                const newValue = e.target.value as string;
                updateConfig(index, 'fontColor', newValue);
              }}
            />
          </div>

          <div className={styles.item}>
            <span>按钮位置X</span>
            <Input
              style={{ width: '70px' }}
              placeholder="X"
              value={x as string}
              disabled={btnPosition !== 'custom'}
              onChange={(e) => {
                let newValue = e.target.value as string;
                newValue = processNumericInput(newValue)
                updateConfig(index, 'x', newValue);
              }}
            />
          </div>
          <div className={styles.item}>
            <span>按钮位置Y</span>
            <Input
              style={{ width: '70px' }}
              placeholder="Y"
              value={y as string}
              disabled={btnPosition !== 'custom'}
              onChange={(e) => {
                let newValue = e.target.value as string;
                newValue = processNumericInput(newValue)
                updateConfig(index, 'y', newValue);
              }}
            />
          </div>
          <div className={styles.item}>
            <span>缩放</span>
            <Input
              style={{ width: '50px' }}
              placeholder="缩放"
              value={scale as string}
              onChange={(e) => {
                let newValue = e.target.value as string;
                newValue = processNumericInput(newValue)
                updateConfig(index, 'scale', newValue);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={escMenuDialogOpen} onOpenChange={(event, data) => setESCMenuDialogOpen(data.open)}>
      <DialogSurface style={{ maxWidth: '1200px' }}>
        <DialogBody>
          <DialogTitle>ESC菜单设置</DialogTitle>
          <DialogContent>
            <div>{editOptions.map(renderConfig)}</div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="secondary"
                onClick={() => {
                  setESCMenuDialogOpen(false);
                }}
              >
                取消
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={() => {
                submit();
                setESCMenuDialogOpen(false);
              }}
            >
              确认
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
