
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input } from "@fluentui/react-components";
import {origineStore} from "@/store/origineStore";
import { setGameChapterId } from '@/store/statusReducer';
import { ISentenceEditorProps } from "./index";
import CommonTips from "../components/CommonTips";
import CommonOptions from "../components/CommonOption";
import useTrans from "@/hooks/useTrans";
import { useValue } from "@/hooks/useValue";
import styles from "./sentenceEditor.module.scss";

export default function EventData(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.eventData.');
  const dispatch = useDispatch();
  const editor = origineStore.getState().status.editor;

  useEffect(() => {
    if (!props.sentence.content) {
      dispatch(setGameChapterId(editor.gameChapterId + 1));
    }   
  }, [])


  const chapterId = useValue(props.sentence.content || editor.gameChapterId);
  const submit = () => {
    props.onSubmit(`eventData:${chapterId.value} -next;`);
  };


  return (
    <div className={styles.sentenceEditorContent}>
        <CommonOptions key="chapterId" title="章节ID">
            <Input 
                value={chapterId.value?.toString()}
                onBlur={submit}
                onChange={(e) => {
                    chapterId.set(e.target.value);
                }} 
            />
        </CommonOptions>
        <CommonTips text={t('tip')} />
    </div>
  )
}
