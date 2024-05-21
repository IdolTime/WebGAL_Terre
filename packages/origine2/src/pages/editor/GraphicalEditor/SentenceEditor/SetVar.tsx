import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';

export default function SetVar(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.setVar.');
  const arr = props.sentence.content.split('=');
  const name = useValue(arr[0] ?? '');
  const value = useValue(arr[1] ?? '');
  const minValue = useValue<number | undefined>(undefined);
  const maxValue = useValue<number | undefined>(undefined);
  const globalVariable = useValue<boolean | undefined>(undefined);

  useEffect(() => {
    props.sentence.args.forEach((k) => {
      if (k.key === 'minValue') {
        minValue.set(Number(k.value));
      } else if (k.key === 'maxValue') {
        maxValue.set(Number(k.value));
      } else if (k.key === 'global') {
        globalVariable.set(k.value as boolean);
      }
    });
  }, [props.sentence]);

  function setContent() {
    let content = `setVar:${name.value.trim()}=${value.value.trim()}`;

    if (typeof minValue.value === 'number') {
      content += ` -minValue=${minValue.value}`;
    }

    if (typeof maxValue.value === 'number') {
      content += ` -maxValue=${maxValue.value}`;
    }

    if (globalVariable.value === true) {
      content += ` -global=true`;
    }

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions title={t('options.name')} key="1">
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
        <CommonOptions title={t('options.value')} key="2">
          <input
            value={value.value}
            onChange={(ev) => {
              const newValue = ev.target.value;
              value.set(newValue ?? '');
            }}
            onBlur={setContent}
            className={styles.sayInput}
            style={{ width: '200px' }}
          />
        </CommonOptions>
        <CommonOptions key="9" title='全局变量'>
          <TerreToggle title="" onChange={(newValue) => {
            globalVariable.set(newValue);
            setContent();
          }} onText='是' offText='否' isChecked={!!globalVariable.value} />
        </CommonOptions>
        <CommonOptions title={t('options.minValue')} key="3">
          <input
            value={minValue.value}
            type="number"
            onChange={(ev) => {
              const newValue = Number(ev.target.value.trim());
              minValue.set(newValue);
            }}
            onBlur={setContent}
            className={styles.sayInput}
            style={{ width: '200px' }}
          />
        </CommonOptions>
        <CommonOptions title={t('options.maxValue')} key="3">
          <input
            value={maxValue.value}
            type="number"
            onChange={(ev) => {
              const newValue = Number(ev.target.value.trim());
              maxValue.set(newValue);
            }}
            onBlur={setContent}
            className={styles.sayInput}
            style={{ width: '200px' }}
          />
        </CommonOptions>
      </div>
    </div>
  );
}
