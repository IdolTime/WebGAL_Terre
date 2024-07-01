import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';

export default function ShowValue(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.showValue.');
  const name = useValue<string>('');
  const switchValue = useValue<boolean>(false);
  const x = useValue<string>('');
  const y = useValue<string>('');

  useEffect(() => {
    if (props.sentence.content !== '') {
        name.set(props.sentence.content)
    }

    props.sentence.args.forEach((k) => {
      if (k.key === 'x') {
        x.set(String(k.value));
      } else if (k.key === 'y') {
        y.set(String(k.value));
      } else if (k.key === 'switchValue') {
        switchValue.set(k.value as boolean);
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

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions title={t('options.name')} key={"showValue-1"}>
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
        <CommonOptions title={t('transform.title')} key={'showValue-2'}>
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
        <CommonOptions title='显示/关闭' key={'showValue-3'}>
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
      </div>
    </div>
  );
}
