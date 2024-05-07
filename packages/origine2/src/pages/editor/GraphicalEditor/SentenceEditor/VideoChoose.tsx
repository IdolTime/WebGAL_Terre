import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { cloneDeep } from "lodash";
import ChooseFile from "../../ChooseFile/ChooseFile";
import useTrans from "@/hooks/useTrans";
import { Button } from "@fluentui/react-components";

export default function Choose(props: any) {
  const t = useTrans('editor.graphical.sentences.choose.');
  const chooseItems = useValue(props.chooseValue.split("|").map((e: any) => e.split(":")));

  const setStyle = (index: number, key: string, value: number | string) => {
    const styleRegex = /\$\{(.*?)\}/;
    const mainPart = chooseItems.value[index][0];
    const styleMatch = mainPart.match(styleRegex);
    const mainPartRegex = /(?:->|\})?\s*([^\s]+)$/;
    const mainPartMatch = mainPart.match(mainPartRegex);
    const text = mainPartMatch ? mainPartMatch[1] : ' ';
    const newList = cloneDeep(chooseItems.value);
    let updatedScript = '';
  
    if (styleMatch) {
      const styleStr = styleMatch[1];
      const styleProps = styleStr.split(',');
      const style: Record<string, number | string> = {};
  
      styleProps.forEach((prop: any) => {
        const [k, v] = prop.split('=');
        if (k && v) {
          style[k.trim()] = isNaN(Number(v.trim())) ? v.trim() : Number(v.trim());
        }
      });
  
      // Update the style property
      style[key] = value;
  
      // Reconstruct the script string with updated style
      const updatedStyleStr = Object.keys(style).map(k => `${k}=${style[k]}`).join(',');
      updatedScript = mainPart.replace(styleRegex, `\${${updatedStyleStr}}`);
    } else {
      // If there is no style, add a new style
      const styleStr = `\${${key}=${value}}`;
      const splited = mainPart.split(text);
      updatedScript = splited[0] + styleStr + text.trim();
    }

    newList[index][0] = updatedScript;
    chooseItems.set(newList);
  };

  const submit = () => {
    const chooseItemsStr = chooseItems.value.map((e: any) => e.join(":"));
    const submitStr = chooseItemsStr.join("|");
    props.onSubmit(submitStr);
  };


  const chooseList = chooseItems.value.map((item: any, i: number) => {
    return <div style={{ display: "flex", flexDirection: "column", width:'100%', justifyContent: "center",padding:'0 0 4px 0' }} key={i}>
      <div style={{  display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <Button
          onClick={()=>{
            const newList = cloneDeep(chooseItems.value);
            newList.splice(i,1);
            chooseItems.set(newList);
            submit();
          }}
        >
          {t('delete')}
        </Button>
        <span style={{ marginLeft: '6px' }}>选项名称</span>
        <input value={/(?:->|\})?\s*([^\s]+)$/.exec(item[i])?.[1] ?? ''}
          onChange={(ev) => {
            const newValue = ev.target.value;
            const newList = cloneDeep(chooseItems.value);
            newList[i][0] = newValue;
            chooseItems.set(newList);
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t('option.name')}
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
        <span style={{ marginRight: '6px' }}>跳转 {item[1]}</span>
        <ChooseFile sourceBase="scene" onChange={(newFile) => {
          const newValue = newFile?.name ?? "";
          const newList = cloneDeep(chooseItems.value);
          newList[i][1] = newValue;
          chooseItems.set(newList);
          submit();
        }} extName={[".txt"]} />
        <span style={{ margin: '0 6px 0 6px' }}>按钮样式 {/image=(\w+\.(?:png|jpg|webp))/.exec(item[0])?.[1]}</span>
        <ChooseFile sourceBase="ui" onChange={(newFile) => {
          const newValue = newFile?.name ?? "";

          if (newFile) {
            setStyle(i, 'image', newValue);
          }
        }} extName={[".jpg", ".png", "webp"]} />
      </div>
      <div style={{  display: "flex", alignItems: "center", paddingLeft: "96px", marginBottom: "8px"}}>
        <span style={{ marginLeft: '6px' }}>按钮位置X</span>
        <input type="number" value={/x=(\d+)/.exec(item[0])?.[1] ?? ''}
          onChange={(ev) => {
            setStyle(i, 'x', ev.target.value);
            submit();
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="X"
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
        <span style={{ marginLeft: '6px' }}>按钮位置X</span>
        <input type="number" value={/y=(\d+)/.exec(item[0])?.[1] ?? ''}
          onChange={(ev) => {
            setStyle(i, 'y', ev.target.value);
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="Y"
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
        <span style={{ marginLeft: '6px' }}>缩放</span>
        <input type="number" value={/scale=(\d+)/.exec(item[0])?.[1] ?? ''}
          onChange={(ev) => {
            setStyle(i, 'scale', ev.target.value);
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="缩放"
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
      </div>
      <div style={{  display: "flex", alignItems: "center", paddingLeft: "96px"}}>
        <span style={{ marginLeft: '6px' }}>文字大小</span>
        <input type="number" value={/fontSize=(\d+)/.exec(item[0])?.[1] ?? ''}
          onChange={(ev) => {
            setStyle(i, 'fontSize', ev.target.value);
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="文字大小"
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
        <span style={{ marginLeft: '6px' }}>文字颜色</span>
        <input type="color" value={/fontColor=(#[0-9A-Fa-f]{6})/.exec(item[0])?.[1] ?? ''}
          onChange={(ev) => {
            setStyle(i, 'fontColor', ev.target.value);
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder="文字大小"
          style={{ width: "10%", margin: "0 6px 0 6px" }}
        />
      </div>
    </div>;
  });
  return <div className={styles.sentenceEditorContent} style={{ width: '100%' }}>
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
