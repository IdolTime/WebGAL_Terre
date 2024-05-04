import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import ChooseFile from "../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import { Button } from "@fluentui/react-components";

export default function Choose(props: any) {
  const t = useTrans('editor.graphical.sentences.choose.');
  const chooseItems = useValue(props.chooseValue.split("|").map((e: any) => e.split(":")));

  const submit = () => {
    const chooseItemsStr = chooseItems.value.map((e: any) => e.join(":"));
    const submitStr = chooseItemsStr.join("|");
    props.onSubmit(submitStr);
  };

  const chooseList = chooseItems.value.map((item: any, i:number) => {
    return <div style={{ display: "flex", width:'100%', alignItems: "center",padding:'0 0 4px 0' }} key={i}>
      <Button
        onClick={()=>{
          const newList = cloneDeep(chooseItems.value);
          newList.splice(i,1);
          chooseItems.set(newList);
          submit();
        }}
      >
        删除本句
      </Button>
      <input value={item[0]}
        onChange={(ev) => {
          const newValue = ev.target.value;
          const newList = cloneDeep(chooseItems.value);
          newList[i][0] = newValue;
          chooseItems.set(newList);
        }}
        onBlur={submit}
        className={styles.sayInput}
        placeholder={t('option.name')}
        style={{ width: "50%", margin: "0 6px 0 6px" }}
      />
      {
        item[1] + "\u00a0"
      }
      <ChooseFile sourceBase="scene" onChange={(newFile) => {
        const newValue = newFile?.name ?? "";
        const newList = cloneDeep(chooseItems.value);
        newList[i][1] = newValue;
        chooseItems.set(newList);
        submit();
      }} extName={[".txt"]} />
    </div>;
  });
  return <div className={styles.sentenceEditorContent}  style={{'width': '100%'}}>
    {chooseList}
    <Button
      onClick={() => {
        const newList = cloneDeep(chooseItems.value);
        newList.push(t('option.option', 'option.chooseFile'));
        chooseItems.set(newList);
        submit();
      }}>
      {t('add')}
    </Button>
  </div>;
}
