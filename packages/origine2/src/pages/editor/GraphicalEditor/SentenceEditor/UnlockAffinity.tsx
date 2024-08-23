import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import ChooseFile from '../../ChooseFile/ChooseFile';
import { useValue } from '../../../../hooks/useValue';
import { getArgByKey } from '../utils/getArgByKey';
import useTrans from '@/hooks/useTrans';
import CommonTips from '@/pages/editor/GraphicalEditor/components/CommonTips';
import { useExpand } from '@/hooks/useExpand';
import { useEffect } from 'react';


/**
 * 好感度系统-解锁好感人物
 */
export default function UnlockAffinity(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.unlockAffinity.');
  const bgFile = useValue(props.sentence.content);
  const name = useValue(getArgByKey(props.sentence, 'name').toString() ?? '');

  const x = useValue<string>('');
  const y = useValue<string>('');

  useEffect(() => {
    props.sentence.args.forEach((k) => {
      if (k.key === 'name') {
        name.set(k.value.toString());
      } else if (k.key === 'x') {
        x.set(String(k.value));
      } else if (k.key === 'y') {
        y.set(String(k.value));
      }
    });
  }, []);

  const submit = () => {
    const axisX = x.value !== '' ? ` -x=${x.value}` : '';
    const axisY = y.value !== '' ? ` -y=${y.value}` : '';
    const nameValue = name.value !== '' ? ` -name=${name.value}` : '';

    let content = '';
    if (bgFile.value !== 'none') {
      content = `unlockAffinity:${bgFile.value}${axisX}${axisY}${nameValue} -next;`;
      props.onSubmit(content);
    } 
  };

  return ( 
    <div className={styles.sentenceEditorContent}>
      <CommonTips text={t('tips.edit')}/>
      <div className={styles.editItem}>
        <CommonOptions key="1" title={t('options.file.title')}>
          {bgFile.value ? bgFile.value  : t('options.file.placeholder')}
          {'\u00a0\u00a0'}
          <ChooseFile
            sourceBase="ui"
            extName={['.png', '.jpg', '.webp']}
            onChange={(fileDesc) => {
              bgFile.set(fileDesc?.name ?? '');
              submit();
            }}
          />
        </CommonOptions>
        <CommonOptions key="2" title={t('options.name.title')}>
          <input
            value={name.value}
            onBlur={submit}
            className={styles.sayInput}
            style={{ width: '200px' }}
            placeholder={t('options.name.placeholder')}
            onChange={(ev) => {
              const newValue = ev.target.value;
              name.set(newValue);
            }}
          />
        </CommonOptions>
        <CommonOptions key="3" title={t('options.axis.title')}>
          {t('options.axis.x')}
          {'\u00a0'}
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={x.value} 
            onBlur={submit}
            onChange={(e) => {
              const newValue = e.target.value;
              x.set(newValue ?? '');
            }}
          />
          {'\u00a0'}
          {'\u00a0'}
          {t('options.axis.y')}
          {'\u00a0'}
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={y.value}
            onBlur={submit}
            onChange={(e) => {
              const newValue = e.target.value;
              y.set(newValue ?? '');
            }}  
          />
        </CommonOptions>
      </div>
    </div>
  );
}
