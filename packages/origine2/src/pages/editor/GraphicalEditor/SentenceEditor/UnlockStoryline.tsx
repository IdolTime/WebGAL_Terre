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
 * 成就系统-解锁成就
 */
export default function UnlockStoryline(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.unlockStoryline.');
  const isNoFile = props.sentence.content === '';
  const bgFile = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, 'name').toString() ?? '');
  const unlockSeries = useValue(getArgByKey(props.sentence, 'series').toString() ?? '');
  const { updateExpandIndex } = useExpand();

  const x = useValue<string>('');
  const y = useValue<string>('');

  useEffect(() => {
    props.sentence.args.forEach((k) => {
      if (k.key === 'name') {
        unlockName.set(k.value.toString());
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
    const name = unlockName.value !== '' ? ` -name=${unlockName.value}` : '';

    let content = '';
    if (bgFile.value !== 'none' && name !== '') {
      content = `unlockStoryline:${bgFile.value}${axisX}${axisY}${name} -next;`;
      props.onSubmit(content);
    } 
    // else {
    // content = `unlockStoryline:${bgFile.value} -next;`;
    // }
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
            value={unlockName.value}
            onBlur={submit}
            className={styles.sayInput}
            style={{ width: '200px' }}
            placeholder={t('options.name.placeholder')}
            onChange={(ev) => {
              const newValue = ev.target.value;
              unlockName.set(newValue);
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