import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor/index";
import {Select, useId} from "@fluentui/react-components";
import s from './propertyEditor.module.scss';

export default function WGFontWeight(props: IPropertyEditorProps) {

  const selectId = useId();

  return <div className={s.propertyEditor}>
    <div className={s.propertyEditorText}>字重</div>
    <Select value={props.prop.propValue} id={selectId} onChange={(_, data) => {
      props.prop.propValue = data.value;
      props.onSubmit();
    }}>
      <option>normal</option>
      <option>bold</option>
    </Select>
  </div>;
}