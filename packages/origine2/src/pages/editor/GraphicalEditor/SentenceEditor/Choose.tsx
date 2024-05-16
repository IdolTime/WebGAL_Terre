import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '../../../../hooks/useValue';
import { cloneDeep } from 'lodash';
import ChooseFile from '../../ChooseFile/ChooseFile';
import useTrans from '@/hooks/useTrans';
import { Button } from '@fluentui/react-components';
import { useMemo } from 'react';
import WhenARG from '../components/WhenARG';
import { getWhenARGExpression } from '@/utils/utils';

interface UseValueData {
  _value: string;
  set: (newValue: string) => void;
  value: string;
}

interface Variable {
  name: UseValueData | null;
  value: UseValueData | null;
  operator: UseValueData | null;
}

interface Option {
  text: string;
  jump: string;
  style: Style;
  showCondition: string;
  enableCondition: string;
  showVariable: Variable;
  enableVariable: Variable;
}

interface Style {
  x?: number;
  y?: number;
  scale?: number;
  fontSize?: number;
  fontColor?: string;
  image?: string;
}

const styleRegex = /\$\{(.*?)\}/;
export default function Choose(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.choose.');
  const chooseItems = useValue(props.sentence.content.split('|').map((e) => e.split(':')));

  const setStyle = (index: number, key: string, value?: number | string) => {
    const mainPart = chooseItems.value[index][0];
    const styleMatch = mainPart.match(styleRegex);
    const mainPartRegex = /(?:->|\})?\s*([^\s]+)$/;
    const mainPartMatch = mainPart.match(mainPartRegex);
    const text = mainPartMatch ? mainPartMatch[1] : ' ';
    const newList = cloneDeep(chooseItems.value);
    let updatedScript = '';

    if (styleMatch) {
      const styleStr = styleMatch[1];
      const styleProps = styleStr.split(',');
      const style: Record<string, number | string> = {};

      styleProps.forEach((prop) => {
        const [k, v] = prop.split('=');
        if (k && v) {
          style[k.trim()] = isNaN(Number(v.trim())) ? v.trim() : Number(v.trim());
        }
      });

      // Update the style property
      if (value !== undefined) {
        style[key] = value;
      } else {
        delete style[key];
      }

      // Reconstruct the script string with updated style
      const updatedStyleStr = Object.keys(style)
        .map((k) => `${k}=${style[k]}`)
        .join(',');
      updatedScript = mainPart.replace(styleRegex, `\${${updatedStyleStr}}`);
    } else {
      // If there is no style, add a new style
      const styleStr = `\${${key}=${value}}`;
      const splited = mainPart.split(text);
      updatedScript = splited[0] + styleStr + text.trim();
    }

    newList[index][0] = updatedScript;
    chooseItems.set(newList);
  };

  const setOptionName = (index: number, newValue: string) => {
    const newList = cloneDeep(chooseItems.value);
    const parts = newList[index][0].split('->');
    if (parts.length > 1) {
      parts[1] = newValue;
      newList[index][0] = parts.join('->');
    } else {
      const styleMatch = parts[0].match(styleRegex);
      if (styleMatch) {
        newList[index][0] = `${styleMatch[0]}${newValue}`;
      } else {
        newList[index][0] = newValue;
      }
    }

    chooseItems.set(newList);
  };

  // eslint-disable-next-line max-params
  const setCondition = (index: number, condition: 'show' | 'enable', variable: Variable) => {
    const newList = cloneDeep(chooseItems.value);
    const mainPart = newList[index][0];
    let oldStr = '';
    if (condition === 'show') {
      const showConditionPart = mainPart.match(/\((.*)\)/);
      if (showConditionPart) {
        oldStr = showConditionPart[0];
      }
    } else {
      const enableConditionPart = mainPart.match(/\[(.*)\]/);
      if (enableConditionPart) {
        oldStr = enableConditionPart[0];
      }
    }

    let newStr = `${variable.name?.value}${variable.operator?.value}${variable.value?.value}`;
    newStr = condition === 'show' ? `(${newStr})` : `[${newStr}]`;
    if (!oldStr) {
      const symbolIndex = mainPart.indexOf('->');
      if (symbolIndex !== -1) {
        newList[index][0] = mainPart.slice(0, symbolIndex) + newStr + mainPart.slice(symbolIndex);
      } else {
        const styleMatch = mainPart.match(styleRegex);
        if (styleMatch) {
          newList[index][0] = mainPart.replace(styleMatch[0], `${styleMatch[0]}${newStr}->`);
        } else {
          newList[index][0] = newStr + '->' + mainPart;
        }
      }
    } else {
      newList[index][0] = mainPart.replace(oldStr, newStr);
    }

    chooseItems.set(newList);
  };

  const parse = (script: string) => {
    const parts = script.split('->');
    const conditonPart = parts.length > 1 ? parts[0] : null;
    const mainPart = parts.length > 1 ? parts[1] : parts[0];
    const mainPartNodes = mainPart.split(':');
    const text = mainPartNodes[0].replace(/\${[^{}]*}/, '');
    const option: Option = {
      text,
      jump: mainPartNodes[1],
      style: {
        x: undefined,
        y: undefined,
        scale: undefined,
        fontSize: undefined,
        fontColor: undefined,
        image: undefined,
      },
      showCondition: '',
      enableCondition: '',
      showVariable: {
        name: null,
        value: null,
        operator: null,
      },
      enableVariable: {
        name: null,
        value: null,
        operator: null,
      },
    };

    // Extract style information
    const styleRegex = /\$\{(.*?)\}/;
    const styleMatch = conditonPart ? conditonPart.match(styleRegex) : mainPart.match(styleRegex);
    if (styleMatch) {
      const styleStr = styleMatch[1];
      const styleProps = styleStr.split(',');
      const style: Record<string, string | number> = {}; // Change to specific type if possible

      // Parse each style property
      styleProps.forEach((prop) => {
        const [key, value] = prop.split('=');
        if (key && value) {
          style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
        }
      });

      option.style = style;
    }

    if (conditonPart !== null) {
      const showConditionPart = conditonPart.match(/\((.*)\)/);
      if (showConditionPart) {
        option.showCondition = showConditionPart[1];
      }
      const enableConditionPart = conditonPart.match(/\[(.*)\]/);
      if (enableConditionPart) {
        option.enableCondition = enableConditionPart[1];
      }
    }

    const valExpArr = getWhenARGExpression(option.showCondition);
    option.showVariable.name = useValue(valExpArr[0] ?? '');
    option.showVariable.operator = useValue(valExpArr[1] ?? '>');
    option.showVariable.value = useValue(valExpArr[2] ?? '');

    const valExpArr2 = getWhenARGExpression(option.enableCondition);
    option.enableVariable.name = useValue(valExpArr2[0] ?? '');
    option.enableVariable.operator = useValue(valExpArr2[1] ?? '>');
    option.enableVariable.value = useValue(valExpArr2[2] ?? '');

    return option;
  };

  const parsedItems = chooseItems.value.map((item) => parse(item.join(':')));

  const options = useMemo(() => {
    return parsedItems;
  }, [chooseItems]);

  const submit = () => {
    const chooseItemsStr = chooseItems.value.map((e) => e.join(':'));
    const submitStr = chooseItemsStr.join('|');
    props.onSubmit(`choose:${submitStr};`);
  };

  const chooseList = chooseItems.value.map((item, i) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          justifyContent: 'center',
          padding: '0 0 4px 0',
        }}
        key={i}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Button
            onClick={() => {
              const newList = cloneDeep(chooseItems.value);
              newList.splice(i, 1);
              chooseItems.set(newList);
              submit();
            }}
          >
            {t('delete')}
          </Button>
          <span style={{ marginLeft: '6px' }}>选项名称</span>
          <input
            value={options[i].text}
            onChange={(ev) => {
              const newValue = ev.target.value;
              setOptionName(i, newValue);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder={t('option.name')}
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
          <span style={{ marginRight: '6px' }}>跳转 {options[i].jump}</span>
          <ChooseFile
            sourceBase="scene"
            onChange={(newFile) => {
              const newValue = newFile?.name ?? '';
              const newList = cloneDeep(chooseItems.value);
              newList[i][1] = newValue;
              chooseItems.set(newList);
              submit();
            }}
            extName={['.txt']}
          />
          <span style={{ margin: '0 6px 0 6px' }}>按钮样式 {options[i].style.image}</span>
          <ChooseFile
            sourceBase="ui"
            onChange={(newFile) => {
              const newValue = newFile?.name ?? '';

              if (newFile) {
                setStyle(i, 'image', newValue);
              } else {
                setStyle(i, 'image', undefined);
              }

              submit();
            }}
            extName={['.jpg', '.png', 'webp']}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '96px', marginBottom: '8px' }}>
          <span style={{ marginLeft: '6px' }}>按钮位置X</span>
          <input
            type="number"
            value={options[i].style.x}
            onChange={(ev) => {
              setStyle(i, 'x', ev.target.value);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder="X"
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
          <span style={{ marginLeft: '6px' }}>按钮位置Y</span>
          <input
            type="number"
            value={options[i].style.y}
            onChange={(ev) => {
              setStyle(i, 'y', ev.target.value);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder="Y"
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
          <span style={{ marginLeft: '6px' }}>缩放</span>
          <input
            type="number"
            value={options[i].style.scale}
            onChange={(ev) => {
              setStyle(i, 'scale', ev.target.value);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder="缩放"
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '96px', marginBottom: '8px' }}>
          <span style={{ marginLeft: '6px' }}>文字大小</span>
          <input
            type="number"
            value={options[i].style.fontSize}
            onChange={(ev) => {
              setStyle(i, 'fontSize', ev.target.value);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder="文字大小"
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
          <span style={{ marginLeft: '6px' }}>文字颜色</span>
          <input
            type="color"
            value={options[i].style.fontColor || '#8E354A'}
            onChange={(ev) => {
              setStyle(i, 'fontColor', ev.target.value);
            }}
            onBlur={submit}
            className={styles.sayInput}
            placeholder="文字大小"
            style={{ width: '10%', margin: '0 6px 0 6px' }}
          />
        </div>
        <WhenARG
          style={{ paddingLeft: '102px' }}
          name={options[i].showVariable.name!.value}
          setName={(value) => {
            options[i].showVariable.name!.set(value);
            setCondition(i, 'show', options[i].showVariable);
          }}
          operator={options[i].showVariable.operator!.value}
          setOperator={(value) => {
            options[i].showVariable.operator!.set(value);
            setCondition(i, 'show', options[i].showVariable);
          }}
          value={options[i].showVariable.value!.value}
          setValue={(value) => {
            options[i].showVariable.value!.set(value);
            setCondition(i, 'show', options[i].showVariable);
          }}
          submit={() => submit()}
          tips="隐藏"
        />
        <WhenARG
          style={{ paddingLeft: '102px' }}
          name={options[i].enableVariable.name!.value}
          setName={(value) => {
            options[i].enableVariable.name!.set(value);
            setCondition(i, 'enable', options[i].enableVariable);
          }}
          operator={options[i].enableVariable.operator!.value}
          setOperator={(value) => {
            options[i].enableVariable.operator!.set(value);
            setCondition(i, 'enable', options[i].enableVariable);
          }}
          value={options[i].enableVariable.value!.value}
          setValue={(value) => {
            options[i].enableVariable.value!.set(value);
            setCondition(i, 'enable', options[i].enableVariable);
          }}
          submit={() => submit()}
          tips="禁用"
        />
      </div>
    );
  });

  return (
    <div className={styles.sentenceEditorContent}>
      {chooseList}
      <Button
        onClick={() => {
          const newList = cloneDeep(chooseItems.value);
          newList.push(t('option.option', 'option.chooseFile'));
          chooseItems.set(newList);
          submit();
        }}
      >
        {t('add')}
      </Button>
    </div>
  );
}
