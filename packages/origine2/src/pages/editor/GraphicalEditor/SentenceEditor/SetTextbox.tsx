import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import useTrans from "@/hooks/useTrans";
import { getArgByKey } from "../utils/getArgByKey";

export default function SetTextbox(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.setTextBox.options.');
  const isHideTextbox = useValue(props.sentence.content === "hide");
  const isGoNext = useValue(!!getArgByKey(props.sentence, "continue"));
  const submit = () => {
    props.onSubmit(`setTextbox:${isHideTextbox.value ? "hide" : "on"} ${isGoNext.value ? "-continue" : ""};`);
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t('hide.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isHideTextbox.set(newValue);
          submit();
        }} onText={t('hide.on')} offText={t('hide.off')} isChecked={isHideTextbox.value} />
      </CommonOptions>
      <CommonOptions key="2" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t('$editor.graphical.sentences.common.options.goNext.on')}
        offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={isGoNext.value}/>
      </CommonOptions>
    </div>
  </div>;
}
