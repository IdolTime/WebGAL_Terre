import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';
import ChooseFile from '../../ChooseFile/ChooseFile';

export default function ChangeAffnity(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeAffinity.');
  const rolePicture = useValue('');
  const numberPicture = useValue('');

  useEffect(() => {
    rolePicture.set(props.sentence.content);
    props.sentence.args.forEach((k) => {
      if (k.key === 'number') {
        numberPicture.set(k.value.toString());
      }
    });
  }, []);

  function setContent() {
    
    let content = `changeAffinity:${rolePicture.value}`;
    content += ` -number=${numberPicture.value};`;

    props.onSubmit(content);
  }

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions title={t('options.role')} key="showValue-2">
          <span style={{ marginRight: '6px' }}>{rolePicture.value}</span>
          <ChooseFile sourceBase="ui" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";

            rolePicture.set(newValue);
            setContent();
          }} extName={[".jpg", ".png", "webp"]} />
        </CommonOptions>
        <CommonOptions title={t('options.number')} key="showValue-2">
          <span style={{ marginRight: '6px' }}>{numberPicture.value}</span>
          <ChooseFile sourceBase="ui" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";

            numberPicture.set(newValue);
            setContent();
          }} extName={[".jpg", ".png", "webp"]} />
        </CommonOptions>
      </div>
    </div>
  );
}
