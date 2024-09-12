import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';
import ChooseFile from '../../ChooseFile/ChooseFile';

export default function ShowValue(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.showValue.');
  const name = useValue<string>('');
  const switchValue = useValue<boolean>(false);
  const x = useValue<string>('');
  const y = useValue<string>('');
  const showProgressValue = useValue<boolean>(false);
  const progressBarBgStyleValue = useValue({ image: '' });
  const progressBarStyleValue = useValue({ image: '' });
  const maxValue = useValue(100);

  const parseStyle = (styleString: string) => {
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
  
      return style;
    }
  };

  useEffect(() => {
    if (props.sentence.content !== '') {
      name.set(props.sentence.content);
    }

    props.sentence.args.forEach((k) => {
      if (k.key === 'x') {
        x.set(String(k.value));
      } else if (k.key === 'y') {
        y.set(String(k.value));
      } else if (k.key === 'switchValue') {
        switchValue.set(k.value as boolean);
      } else if (k.key === 'showProgress') {
        showProgressValue.set(k.value as boolean);
      } else if (k.key === 'progressBarBgStyle') {
        progressBarBgStyleValue.set(parseStyle(k.value as string));
      } else if (k.key === 'progressBarStyle') {
        progressBarStyleValue.set(parseStyle(k.value as string));
      } else if (k.key === 'maxValue') {
        maxValue.set(Number(k.value));
      }
    });
  }, []);

  function setContent() {
    
    let content = `showValue:${name.value.trim()}`;

    if (typeof x.value === 'string') {
      content += ` -x=${x.value}`;
    }

    if (typeof y.value === 'string') {
      content += ` -y=${y.value}`;
    }

    if (switchValue.value === true) {
      content += ` -switchValue=true`;
    }

    if (showProgressValue.value === true) {
      content += ` -showProgress=true`;
      let styleContent: string[] = [];
      Object.keys((progressBarBgStyleValue.value)).forEach((key) => {
        let newKey = key as 'image';
        if (progressBarBgStyleValue.value[newKey] !== undefined) {
          styleContent.push(`${key}=${progressBarBgStyleValue.value[newKey]}`);
        }
      });
      content += ` -progressBarBgStyle={${styleContent.join(',')}}`;
      styleContent = [];
      Object.keys((progressBarStyleValue.value)).forEach((key) => {
        let newKey = key as 'image';
        if (progressBarStyleValue.value[newKey] !== undefined) {
          styleContent.push(`${key}=${progressBarStyleValue.value[newKey]}`);
        }
      });
      content += ` -progressBarStyle={${styleContent.join(',')}}`;
      content += ` -maxValue=${maxValue.value}`;
    }

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions title={t('options.name')} key="showValue-1">
          <input
            value={name.value}
            onChange={(e) => {
              const newValue = e.target.value;
              name.set(newValue ?? '');
            }}
            onBlur={setContent}
            className={styles.sayInput}
            style={{ width: '200px' }}
          />
        </CommonOptions>
        <CommonOptions title={t('transform.title')} key="showValue-2">
          {t('transform.x')}
          {'\u00a0'}
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={x.value} 
            onChange={(e) => {
              const newValue = e.target.value;
              x.set(newValue ?? '');
            }}
            onBlur={setContent}
          />
          {'\u00a0'}
          {'\u00a0'}
          {t('transform.y')}
          {'\u00a0'}
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={y.value} 
            onChange={(e) => {
              const newValue = e.target.value;
              y.set(newValue ?? '');
            }}
            onBlur={setContent}
          />
        </CommonOptions>
        <CommonOptions title='显示/关闭' key="showValue-3">
          <TerreToggle 
            title="" 
            onText='是' 
            offText='否' 
            isChecked={!!switchValue.value} 
            onChange={(newValue) => {
              switchValue.set(newValue);
              setContent();
            }} 
          />
        </CommonOptions>
        <CommonOptions title='显示进度条' key="showValue-4">
          <TerreToggle 
            title="" 
            onText='显示' 
            offText='隐藏' 
            isChecked={!!showProgressValue.value} 
            onChange={(newValue) => {
              showProgressValue.set(newValue);
              setContent();
            }} 
          />
        </CommonOptions>
        {showProgressValue.value && <>
          <CommonOptions title="进度条背景样式" key="showValue-5">
            <span style={{ marginRight: 8 }}>{progressBarBgStyleValue.value.image}</span>
            <ChooseFile
              sourceBase="ui"
              onChange={(fileDesc) => {
                progressBarBgStyleValue.set({ ...progressBarBgStyleValue.value, image: fileDesc?.name ?? '' });
                setContent();
              }}
              extName={['.png', '.jpg', '.webp']}
            />
          </CommonOptions>
          <CommonOptions title="进度条样式" key="showValue-6">
            <span style={{ marginRight: 8 }}>{progressBarStyleValue.value.image}</span>
            <ChooseFile
              sourceBase="ui"
              onChange={(fileDesc) => {
                progressBarStyleValue.set({ ...progressBarStyleValue.value, image: fileDesc?.name ?? '' });
                setContent();
              }}
              extName={['.png', '.jpg', '.webp']}
            />
          </CommonOptions>
          <CommonOptions title="变量最大值" key="showValue-7">
            <input
              value={maxValue.value}
              type="number"
              onChange={(e) => {
                const newValue = e.target.value;
                maxValue.set(Number(newValue));
              }}
              onBlur={setContent}
              className={styles.sayInput}
            />
          </CommonOptions>
        </>}
        
      </div>
    </div>
  );
}
