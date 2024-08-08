import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import { useEffect } from 'react';

export default function FinishTrial(props: ISentenceEditorProps) {

  useEffect(() => {
    props.onSubmit('finishTrial:true;');
  }, []);

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.commandInfo}>此指令将结束游戏的试玩部分</div>
    </div>
  );
}
