import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';

export default function ClearScreen(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.clearScreen.');
  const enabled = useValue<boolean>(true);
  const nextValue = useValue<boolean>(true);

  useEffect(() => {
    const nextItem = props.sentence.args.find((k) => k.key === 'next');
    if (nextItem) {
      nextValue.set(nextItem.value as boolean);
    }
  }, []);

  function setContent() {
    let content = `clearScreen:true`;

    if (nextValue.value === true) {
      content += ` -next=true`;
    }

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
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
