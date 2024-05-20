import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';

export default function SetVar(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.setVar.');
  const arr = props.sentence.content.split('=');
  const name = useValue(arr[0] ?? '');
  const value = useValue(arr[1] ?? '');

  function setContent() {
    props.onSubmit(`setVar:${name.value.trim()}=${value.value.trim()};`);
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
      </div>
    </div>
  );
}
