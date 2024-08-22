import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import { useEffect } from 'react';
import ChooseFile from '../../ChooseFile/ChooseFile';
import { fileType } from 'idoltime-parser/src/interface/assets';

export default function ChangeAffnity(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeAffinity.');
  const rolePicture = useValue('');
  const numberPicture = useValue('');
  const soundEffect = useValue('');

  useEffect(() => {
    rolePicture.set(props.sentence.content);
    props.sentence.args.forEach((k) => {
      if (k.key === 'number') {
        numberPicture.set(k.value.toString());
      } else if (k.key === 'sound') {
        soundEffect.set(k.value.toString());
      }
    });
  }, []);

  function setContent() {
    
    let content = `changeAffinity:${rolePicture.value}`;
    content += ` -number=${numberPicture.value}`;

    if (soundEffect.value !== '') {
      content += ` -sound=${soundEffect.value}`;
    }

    props.onSubmit(content + ';');
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
        <CommonOptions title={t('options.number')} key="showValue-3">
          <span style={{ marginRight: '6px' }}>{numberPicture.value}</span>
          <ChooseFile sourceBase="ui" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";

            numberPicture.set(newValue);
            setContent();
          }} extName={[".jpg", ".png", "webp"]} />
        </CommonOptions>
        <CommonOptions title={t('options.sound')} key="showValue-4">
          <span style={{ marginRight: '6px' }}>{soundEffect.value}</span>
          <ChooseFile sourceBase="vocal" onChange={(newFile) => {
            const newValue = newFile?.name ?? "";

            soundEffect.set(newValue);
            setContent();
          }} extName={[".mp3", ".ogg", ".wav"]} />
        </CommonOptions>
      </div>
    </div>
  );
}
