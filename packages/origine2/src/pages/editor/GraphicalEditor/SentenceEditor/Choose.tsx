import styles from "./sentenceEditor.module.scss";
import { cloneDeep } from "lodash";
import ChooseFile from "../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import { Button, Dropdown, Option, Input, Switch } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import WhenARG from '../components/WhenARG';
import { getWhenARGExpression } from '@/utils/utils';
import TerreToggle from "@/components/terreToggle/TerreToggle";
import CommonOptions from "../components/CommonOption";
import { useValue } from "@/hooks/useValue";
import { getArgByKey } from '../utils/getArgByKey';

interface IOptions {
  text: string;
  jump: string;
  showCondition: Variable;
  enableCondition: Variable;
  shouldPay?: boolean;
  amount?: number;
  productId?: number;
  salesType?: string;
  style: {
    x?: number;
    y?: number;
    scale?: number;
    fontSize?: number;
    fontColor?: string;
    image?: string;
    countdown?: number;
  },
}

interface Variable {
  name?: string;
  value?: string;
  operator?: string;
}

const salesTypeMap = new Map([['1', '星石'], ['2', '星光']]);

const parse = (script: string) => {
  const parts = script.split('->');
  const conditonPart = parts.length > 1 ? parts[0] : null;
  const mainPart = parts.length > 1 ? parts[1] : parts[0];
  const mainPartNodes = mainPart.split(':');

  const text = mainPartNodes[0].replace(/[\$\#]{[^{}]*}/, '');
  const option: IOptions = {
    text,
    jump: mainPartNodes[1],
    style: {
      x: undefined,
      y: undefined,
      scale: undefined,
      fontSize: undefined,
      fontColor: undefined,
      image: undefined
    },
    showCondition: {},
    enableCondition: {},
  };

  // Extract style information
  const styleRegex = /\$\{(.*?)\}/;
  const styleMatch = mainPart.match(styleRegex);
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

    option.style = style;
  }

  const payInfoMatch = /\#\{(.*?)\}/.exec(mainPart);
  if (payInfoMatch) {
    const payInfoStr = payInfoMatch[1];
    const payInfoProps = payInfoStr.split(',');
    let productId = 0;
    let amount = 0;
    let salesType = '1';

    payInfoProps.forEach((prop) => {
      const [key, value] = prop.split('=');
      if (key === 'productId') {
        productId = isNaN(Number(value.trim())) ? 0 : Number(value.trim());
      } else if (key === 'amount') {
        amount = isNaN(Number(value.trim())) ? 0 : Number(value.trim());
      } else if (key === 'salesType') {
        salesType = value.trim();
      }
    });

    if (productId > 0 && amount > 0) {
      option.shouldPay = true;
      option.productId = productId;
      option.amount = amount;
      option.salesType = salesType;
    }
  }

  let showCondition = '';
  let enableCondition = '';

  if (conditonPart !== null) {
    const showConditionPart = conditonPart.match(/\((.*)\)/);
    if (showConditionPart) {
      showCondition = showConditionPart[1];
    }
    const enableConditionPart = conditonPart.match(/\[(.*)\]/);
    if (enableConditionPart) {
      enableCondition = enableConditionPart[1];
    }
  }

  const valExpArr = getWhenARGExpression(showCondition);
  option.showCondition.name = valExpArr[0] ?? '';
  option.showCondition.operator = valExpArr[1] ?? '>';
  option.showCondition.value = valExpArr[2] ?? '';

  const valExpArr2 = getWhenARGExpression(enableCondition);
  option.enableCondition.name = valExpArr2[0] ?? '';
  option.enableCondition.operator = valExpArr2[1] ?? '>';
  option.enableCondition.value = valExpArr2[2] ?? '';

  return option;
};

export default function Choose(props: any) {
  const t = useTrans('editor.graphical.sentences.choose.');
  const content = props.chooseValue ? props.chooseValue : props.sentence.content;
  const [options, setOptions] = useState<IOptions[]>(content.split('|').map(parse));
  const [isChooseEvent, setIsChooseEvent] = useState(props?.sentence ? !!getArgByKey(props.sentence, 'isChooseEvent') : false);
  const [chooseEventId, setChooseEventId] = useState(props?.sentence ? getArgByKey(props.sentence, 'chooseEventId') : '');

  useEffect(() => {
    const value = content.split('|');
    const newOption = value.map((item: string) => parse(item));
    setOptions(newOption);
  }, [content]);

  const setStyle = (index: number, key: 'x' | 'y' | 'scale' | 'fontSize' | 'fontColor' | 'image' | 'countdown', value?: number | string) => {
    const newList = [...options];
    if (value === undefined) {
      delete newList[index].style[key];
    } else {
      newList[index].style[key] = value as any;
    }
    setOptions(newList);
  };

  const setCondition = (index: number, condition: 'show' | 'enable', variable: Variable) => {
    const newList = [...options];

    if (condition === 'show') {
      newList[index].showCondition = variable;
    } else {
      newList[index].enableCondition = variable;
    }
    setOptions(newList);
  };

  const setOption = (index: number, key: 'shouldPay' | 'amount' | 'salesType', value: boolean | string | number | undefined) => {
    const newList = [...options];

    if (value === undefined) {
      delete newList[index][key];
    } else {
      // @ts-ignore
      newList[index][key] = value;
    }

    if (key === 'shouldPay') {
      if (value) {
        newList[index].productId = Date.now();
        newList[index].amount = 100;
        newList[index].salesType = value as string;
      } else {
        delete newList[index].productId;
        delete newList[index].amount;
        delete newList[index].salesType;
      }
    }

    setOptions(newList);
    return newList;
  };

  const submit = (_options: any) => {
    const optionStr = _options.map((item: any) => {
      let showCondition = '';
      let enableCondition = '';
      let styleContent = '';
      let arrow = '';

      if (item.showCondition.name || item.showCondition.value) {
        showCondition = `(${item.showCondition.name}${item.showCondition.operator}${item.showCondition.value})`;
        arrow = '->';
      }

      if (item.enableCondition.name || item.enableCondition.value) {
        enableCondition = `[${item.enableCondition.name}${item.enableCondition.operator}${item.enableCondition.value}]`;
        arrow = '->';
      }

      Object.keys((item.style)).forEach((key) => {
        let newKey = key as 'x' | 'y' | 'scale' | 'fontSize' | 'fontColor' | 'image';
        if (item.style[newKey] !== undefined) {
          styleContent += `${key}=${item.style[newKey]},`;
        }
      });

      const style = styleContent ? `\${${styleContent}}` : '';
      let mainPart = showCondition + enableCondition + arrow + style;
      let text = item.text || '';
      let jump = item.jump || '';

      if (item.shouldPay && item.productId && item.amount) {
        mainPart += `#{productId=${item.productId},amount=${item.amount},salesType=${item.salesType}}`;
      }

      return mainPart + text + ':' + jump;
    });

    let chooseEventIdStr = '';
    if (isChooseEvent) {
      chooseEventIdStr = ` -chooseEventId=${chooseEventId} -isChooseEvent=${isChooseEvent}`;
    }

    if (props.chooseValue) {
      props.onSubmit((optionStr.join('|') + props.isChoose ? chooseEventIdStr : '') + ';');
    } else {
      props.onSubmit(`choose:${optionStr.join('|') + chooseEventIdStr};`);
    }
  };

  const chooseList = options.map((item: any, i: number) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: '100%', justifyContent: "center", padding: '0 0 4px 0' }} key={i}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <Button
            onClick={() => {
              const newList = cloneDeep(options);
              newList.splice(i, 1);
              setOptions(newList);
              submit(newList);
            }}
          >
            {t('delete')}
          </Button>
          <span style={{ marginLeft: '6px' }}>选项名称</span>
          <input value={item.text}
            onChange={(ev) => {
              const newValue = ev.target.value;
              const newList = cloneDeep(options);
              newList[i].text = newValue;
              setOptions(newList);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder={t('option.name')}
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
          <span style={{ marginRight: '6px' }}>跳转 {item.jump}</span>
          <ChooseFile sourceBase="scene" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";
            const newList = cloneDeep(options);
            newList[i].jump = newValue;
            setOptions(newList);
            submit(newList);
          }} extName={[".txt"]} />
          <span style={{ margin: '0 6px 0 6px' }}>按钮样式 {item.style.image}</span>
          <ChooseFile sourceBase="ui" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";

            if (newFile) {
              setStyle(i, 'image', newValue);
            } else {
              setStyle(i, 'image', undefined);
            }
            submit(options);
          }} extName={[".jpg", ".png", "webp"]} />
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: "96px", marginBottom: "8px" }}>
          <span style={{ marginLeft: '6px' }}>按钮位置X</span>
          <input type="number" value={item.style.x}
            onChange={(ev) => {
              setStyle(i, 'x', ev.target.value);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="X"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
          <span style={{ marginLeft: '6px' }}>按钮位置Y</span>
          <input type="number" value={item.style.y}
            onChange={(ev) => {
              setStyle(i, 'y', ev.target.value);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="Y"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
          <span style={{ marginLeft: '6px' }}>缩放</span>
          <input type="number" value={item.style.scale}
            onChange={(ev) => {
              setStyle(i, 'scale', ev.target.value);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="缩放"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: "96px" }}>
          <span style={{ marginLeft: '6px' }}>文字大小</span>
          <input type="number" value={item.style.fontSize}
            onChange={(ev) => {
              setStyle(i, 'fontSize', ev.target.value);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="文字大小"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
          <span style={{ marginLeft: '6px' }}>文字颜色</span>
          <input type="color" value={item.style.fontColor || '#8E354A'}
            onChange={(ev) => {
              setStyle(i, 'fontColor', ev.target.value);
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="文字颜色"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: "96px", marginTop: '6px' }}>
          <span style={{ marginLeft: '6px' }}>倒计时选项</span>
          <TerreToggle title="" onChange={(newValue) => {
            if (newValue) {
              setStyle(i, 'countdown', 5);
            } else {
              setStyle(i, 'countdown', undefined);
            }
          }} onText='是' offText='否' isChecked={!!item.style.countdown} />
          {item.style.countdown !== undefined && <span style={{ marginLeft: '20px' }}>倒计时时间</span>}
          {item.style.countdown !== undefined && <input type="number" value={item.style.countdown}
            onChange={(ev) => {
              setStyle(i, 'countdown', Number(ev.target.value));
            }}
            onBlur={() => submit(options)}
            className={styles.sayInput}
            placeholder="倒计时时间"
            style={{ width: "10%", margin: "0 6px 0 6px" }}
          />}
          {item.style.countdown !== undefined && <span style={{ marginLeft: '4px' }}>秒</span>}
          <span style={{ marginLeft: '32px' }}>付费选项</span>
          <TerreToggle title="" onChange={(newValue) => {
            const newOptions = setOption(i, 'shouldPay', newValue);
            submit(newOptions);
          }} onText='是' offText='否' isChecked={!!item.shouldPay} />
          {!!item.shouldPay && (
            <>
              <span style={{ marginLeft: '20px' }}>付费价格</span>
              <input
                type="number"
                value={item.amount}
                onChange={(ev) => {
                  setOption(i, 'amount', Number(ev.target.value));
                }}
                onBlur={() => submit(options)}
                className={styles.sayInput}
                placeholder="价格"
                style={{ width: "10%", margin: "0 6px 0 6px" }}
              />
              <span style={{ marginLeft: 20, marginRight: 6 }}>售卖单位</span>
              <Dropdown
                value={salesTypeMap.get(item.salesType)}
                selectedOptions={[item.salesType]}
                onOptionSelect={(ev, data) => {
                  const newOptions = setOption(i, 'salesType', data.optionValue);
                  submit(newOptions);
                }}
                style={{ minWidth: 0 }}
              >
                <Option value="1">星石</Option>
                <Option value="2">星光</Option>
              </Dropdown>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '102px' }}>
          <span>条件：</span>
          <WhenARG
            name={options[i].showCondition.name ?? ''}
            setName={(value) => {
              setCondition(i, 'show', {
                ...options[i].showCondition,
                name: value
              });
            }}
            operator={options[i].showCondition.operator ?? '>'}
            setOperator={(value) => {
              setCondition(i, 'show', {
                ...options[i].showCondition,
                operator: value,
              });
            }}
            value={options[i].showCondition.value ?? ''}
            setValue={(value) => {
              setCondition(i, 'show', {
                ...options[i].showCondition,
                value,
              });
            }}
            submit={() => submit(options)}
            tips="否则隐藏"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '102px' }}>
          <span>条件：</span>
          <WhenARG
            name={options[i].enableCondition.name ?? ''}
            setName={(value) => {
              setCondition(i, 'enable', {
                ...options[i].enableCondition,
                name: value
              });
            }}
            operator={options[i].enableCondition.operator ?? '>'}
            setOperator={(value) => {
              setCondition(i, 'enable', {
                ...options[i].enableCondition,
                operator: value,
              });
            }}
            value={options[i].enableCondition.value ?? ''}
            setValue={(value) => {
              setCondition(i, 'enable', {
                ...options[i].enableCondition,
                value,
              });
            }}
            submit={() => submit(options)}
            tips="否则禁用"
          />
        </div>
      </div>
    );
  });

  return (
    <div className={styles.sentenceEditorContent}>
      <div style={{ display: "flex", alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ marginLeft: '6px' }}>选项埋点</span>
        <Switch
          checked={isChooseEvent}
          onChange={(ev, data) => {
            setIsChooseEvent(data.checked ?? false);
          }}
        />
        {isChooseEvent ? '是' : '否'}
        {isChooseEvent && (
          <>
            <span style={{ margin: '0 6px 0 10px' }}>选项ID</span>
            <Input
              value={isChooseEvent ? chooseEventId?.toString() : ''}
              onBlur={() => submit(options)}
              onChange={(ev) => {
                setChooseEventId(ev.target.value);
              }}
            />
          </>
        )}
      </div>

      {chooseList}
      <Button
        onClick={() => {
          const newList = cloneDeep(options);
          const trans = t('option.option', 'option.chooseFile');
          newList.push({
            text: trans[0],
            jump: trans[1],
            style: {},
            showCondition: {},
            enableCondition: {}
          });
          setOptions(newList);
          submit(newList);
        }}>
        {t('add')}
      </Button>
    </div>);
}
