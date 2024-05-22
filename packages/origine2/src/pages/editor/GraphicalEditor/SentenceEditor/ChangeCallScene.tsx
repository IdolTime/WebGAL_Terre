import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { commandType } from 'webgal-parser/src/interface/sceneInterface';
import { useValue } from '../../../../hooks/useValue';
import ChooseFile from '../../ChooseFile/ChooseFile';
import TerreToggle from '../../../../components/terreToggle/TerreToggle';
import useTrans from '@/hooks/useTrans';
import WhenARG from '../components/WhenARG';
import { getWhenARGExpression } from '@/utils/utils';

export default function ChangeCallScene(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeCallScene.');
  const isCallScene = useValue(props.sentence.command === commandType.callScene);
  const fileName = useValue(props.sentence.content);
  const whenARG = props.sentence.args.find((arg) => arg.key === 'when');
  const valExpArr = getWhenARGExpression(String(whenARG?.value ?? ''));
  const whenName = useValue(valExpArr[0] ?? '');
  const whenOperator = useValue(valExpArr[1] ?? '>');
  const whenValue = useValue(valExpArr[2] ?? '');

  const submit = () => {
    let str = `${isCallScene.value ? 'callScene' : 'changeScene'}:${fileName.value}`;
    str += ` -when=${whenName.value}${whenOperator.value}${whenValue.value};`;
    props.onSubmit(str);
  };

  return (
    <div className={styles.sentenceEditorContent}>
      <div className={styles.editItem}>
        <CommonOptions key="1" title={t('options.file.title')}>
          <>
            {fileName.value}
            {'\u00a0'}
            <ChooseFile
              sourceBase="scene"
              onChange={(file) => {
                fileName.set(file?.name ?? '');
                submit();
              }}
              extName={['.txt']}
            />
          </>
        </CommonOptions>
        <CommonOptions key="2" title={t('options.call.title')}>
          <TerreToggle
            title=""
            onChange={(newValue) => {
              isCallScene.set(newValue);
              submit();
            }}
            onText={t('options.call.on')}
            offText={t('options.call.off')}
            isChecked={isCallScene.value}
          />
        </CommonOptions>
        <CommonOptions key="3" title="条件">
          <WhenARG
            name={whenName.value}
            setName={(value) => {
              whenName.set(value);
            }}
            operator={whenOperator.value}
            setOperator={(value) => {
              whenOperator.set(value);
            }}
            value={whenValue.value}
            setValue={(value) => {
              whenValue.set(value);
            }}
            submit={() => submit()}
          />
        </CommonOptions>
      </div>
    </div>
  );
}
