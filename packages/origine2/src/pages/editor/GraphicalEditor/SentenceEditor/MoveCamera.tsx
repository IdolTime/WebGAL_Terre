import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';

export default function MoveCamera(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.moveCamera.');
  const enabled = useValue<boolean>(true);
  const duration = useValue<number>(0);
  const nextValue = useValue<boolean>(true);
  const x = useValue<string>('');
  const y = useValue<string>('');

  useEffect(() => {
    props.sentence.args.forEach((k) => {
      if (k.key === 'x') {
        x.set(String(k.value));
      } else if (k.key === 'y') {
        y.set(String(k.value));
      } else if (k.key === 'next') {
        nextValue.set(k.value as boolean);
      } else if (k.key === 'duration') {
        duration.set(Number(k.value) / 1000);
      }
    });
  }, []);

  function setContent() {
    
    let content = `moveCamera:true`;

    if (typeof x.value === 'string') {
      content += ` -x=${x.value}`;
    }

    if (typeof y.value === 'string') {
      content += ` -y=${y.value}`;
    }

    if (typeof duration.value === 'number') {
      content += ` -duration=${duration.value * 1000}`;
    }

    if (nextValue.value === true) {
      content += ` -next=true`;
    }

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions title={t('transform.title')} key="showValue-2">
          {t('transform.x')}
          {'\u00a0'}
          <input 
            type='number'
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
            type='number'
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
        <CommonOptions title={t('options.duration')} key="showValue-5">
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={duration.value} 
            type="number"
            onChange={(e) => {
              const newValue = Number(e.target.value);
              duration.set(newValue ?? 0);
            }}
            onBlur={setContent}
          />
          <span style={{ marginLeft: '5px' }}>秒</span>
        </CommonOptions>
        <CommonOptions title={t('options.next')} key="showValue-3">
          <TerreToggle 
            title="" 
            onText='是' 
            offText='否' 
            isChecked={!!nextValue.value} 
            onChange={(newValue) => {
              nextValue.set(newValue);
              setContent();
            }} 
          />
        </CommonOptions>
      </div>
    </div>
  );
}
