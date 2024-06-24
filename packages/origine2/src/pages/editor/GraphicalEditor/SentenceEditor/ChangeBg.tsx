import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import {useExpand} from "@/hooks/useExpand";
import { Button, Input } from "@fluentui/react-components";

export default function ChangeBg(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.changeBg.');
  const isNoFile = props.sentence.content === "";
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const bgFile = useValue(props.sentence.content);
  const unlockName = useValue(getArgByKey(props.sentence, "unlockname").toString() ?? "");
  const unlockSeries = useValue(getArgByKey(props.sentence, "series").toString() ?? "");
  const {updateExpandIndex} = useExpand();
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const x = useValue<string>(getArgByKey(props.sentence, "x").toString() ?? "");
  const y = useValue<string>(getArgByKey(props.sentence, "y").toString() ?? "");

  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const durationStr = duration.value === "" ? '' : ` -duration=${duration.value}`;
    const transformStr = json.value === "" ? '' : ` -transform=${json.value}`;
    const xStr = x.value === "" ? '' : ` -x=${x.value}`;
    const yStr = y.value === "" ? '' : ` -y=${y.value}`;

    if (bgFile.value !== "none") {
      props.onSubmit(
        `changeBg:${bgFile.value}${isGoNextStr}${durationStr}${transformStr}${xStr}${yStr}${unlockName.value !== "" ? " -unlockname=" + unlockName.value : ""}${unlockSeries.value !== "" ? " -series=" + unlockSeries.value : ""};`);
    } else {
      props.onSubmit(`changeBg:${bgFile.value}${isGoNextStr};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('options.hide.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            bgFile.set(t('options.hide.choose'));
          } else
            bgFile.set("none");
          submit();
        }} onText={t('options.hide.on')} offText={t('options.hide.off')} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="1" title={t('options.file.title')}>
        <>
          {bgFile.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="background" onChange={(fileDesc) => {
            bgFile.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".png", ".jpg", ".webp"]}/>
        </>
      </CommonOptions>}
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')}
        offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value}/>
      </CommonOptions>
      {!isNoFile && <CommonOptions key="3" title={t('options.name.title')}>
        <input value={unlockName.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            unlockName.set(newValue);
          }}
          onBlur={submit}
          className={styles.sayInput}
          style={{width: "200px"}}
          placeholder={t('options.name.placeholder')}
        />
      </CommonOptions>}
      <CommonOptions key={'3'} title={t('options.axis.title')}>
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
      <CommonOptions key="23" title={t("options.displayEffect.title")}>
        <Button onClick={() => {
          updateExpandIndex(props.index);
        }}>{t('$打开效果编辑器')}</Button>
      </CommonOptions>
      <TerrePanel sentenceIndex={props.index} title={t("$效果编辑器")}>
        <div>
          <CommonTips
            text={t("$效果提示")}/>
          <EffectEditor json={json.value.toString()} onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}/>
          <CommonOptions key="10" title={t("$持续时间（单位为毫秒）")}>
            <div>
              <Input
                placeholder={t("$持续时间（单位为毫秒）")}
                value={duration.value.toString()}
                onChange={(_, data) => {
                  const newDuration = Number(data.value);
                  if (isNaN(newDuration) || data.value === '')
                    duration.set("");
                  else
                    duration.set(newDuration);
                }}
                onBlur={submit}
              />
            </div>
          </CommonOptions>
        </div>
      </TerrePanel>
    </div>
  </div>;
}
