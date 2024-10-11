import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import useTrans from "@/hooks/useTrans";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import { getArgByKey } from "../utils/getArgByKey";
import { useRef, useEffect, useCallback } from 'react';
import Choose from "./Choose";

export default function PlayVideo(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.video.options.');
  const isNoFile = props.sentence.content === '';

  const configs = useValue({
    fileName: props.sentence.content,
    isSkipOff: !!getArgByKey(props.sentence, "skipOff"),
    isLoop: !!getArgByKey(props.sentence, "loop"),
    isChoose: !!getArgByKey(props.sentence, "choose"),
    continueBgm: !!getArgByKey(props.sentence, "continueBgm"),
    keep: !!getArgByKey(props.sentence, "keep"),
    id: getArgByKey(props.sentence, "id"),
    continue: !!getArgByKey(props.sentence, "continue"),
  });

  const chooseValueRef = useRef(
    (props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) ||
    '选项:选择场景文件|选项:选择场景文件'
  );

  const initComanRef: any = [];
  if (configs.value.isSkipOff) {
    initComanRef.push('-skipOff=true');
  }
  if (configs.value.isLoop) {
    initComanRef.push('-loop=true');
  }
  if (configs.value.isChoose) {
    initComanRef.push(`-choose=${chooseValueRef.current}`);
  }
  if (configs.value.continueBgm) {
    initComanRef.push('-continueBgm=true');
  }
  if (configs.value.keep) {
    initComanRef.push('-keep=true');
  }
  if (configs.value.id) {
    initComanRef.push(`-id=${configs.value.id}`);
  }
  if (configs.value.continue) {
    initComanRef.push('-continue');
  }

  const commandRef = useRef<any>(initComanRef);

  useEffect(() => {
    chooseValueRef.current = (props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) || '选项:选择场景文件|选项:选择场景文件';
  }, [props.sentence]);

  const updateCommandRef = (value: boolean, commandStr: string) => {
    setTimeout(() => {
      let res: any = [];
      if (value) {
        res = [...commandRef.current, commandStr];
      } else {
        res = commandRef.current.filter((item: string) => item !== commandStr);
      }
      commandRef.current = res;
      dispacthProps(res);
    }, 0);
  };

  const submit = () => updateCommandRef(configs.value.isSkipOff, '-skipOff=true');
  const submitLoop = () => updateCommandRef(configs.value.isLoop, '-loop=true');
  const submitChoose = useCallback(() => updateCommandRef( configs.value.isChoose, `-choose=${chooseValueRef.current}`), [configs.value.isChoose]);
  const submitContinueBgm = () => updateCommandRef(configs.value.continueBgm, '-continueBgm=true');

  const onChoose = (val: string) => {
    const idx = commandRef.current.findIndex((item: string) => item === `-choose=${chooseValueRef.current}`);
    const res = commandRef.current.map((ele: any, i: number) => {
      if (i === idx) {
        return `-choose=${val}`;
      }
      return ele;
    });
    commandRef.current = res;
    chooseValueRef.current = val;
    dispacthProps(res);
  };

  function dispacthProps(res: any) {
    const str = res.join(' ');
    if (res.length > 0) {
      props.onSubmit(`playVideo:${configs.value.fileName} ${str};`);
    } else {
      props.onSubmit(`playVideo:${configs.value.fileName};`);
    }
  }

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title="关闭视频">
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            configs.set({ ...configs.value, fileName: '请选择视频文件' });
          } else {
            configs.set({ ...configs.value, fileName: 'none' });
          }
          submit();
        }} onText="关闭视频" offText="显示视频" isChecked={isNoFile} />
      </CommonOptions>
      <CommonOptions title="视频ID（可选" key="101">
        <input value={configs.value.id as string}
          onChange={(ev) => {
            const newValue = ev.target.value;
            configs.set({ ...configs.value, id: newValue });
          }}
          onBlur={() => {
            updateCommandRef(
              (configs.value.id as string).trim() !== "", 
              `-id=${(configs.value.id as string).trim()}`
            );
          }}
          className={styles.sayInput}
          placeholder="视频ID"
          style={{ width: "100%" }}
        />
      </CommonOptions>
      {!isNoFile && (
        <>
          <CommonOptions key="1" title={t('file.title')}>
            <>
              {(configs.value.fileName) + "\u00a0\u00a0"}
              <ChooseFile sourceBase="video" onChange={(fileDesc) => {
                configs.set({ ...configs.value, fileName: fileDesc?.name ?? "" });
                submit();
              }}
              extName={[".mp4", ".webm", ".ogg", ".flv"]} />
            </>
          </CommonOptions>
          <CommonOptions key="3" title='循环播放视频'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, isLoop: newValue });
              submitLoop();
            }} onText='是' offText='否' isChecked={configs.value.isLoop} />
          </CommonOptions>
          <CommonOptions key="4" title='开启分支选择'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, isChoose: newValue });
              submitChoose();
            }} onText='是' offText='否' isChecked={configs.value.isChoose} />
          </CommonOptions>
          <CommonOptions key="5" title='继续播放BGM'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, continueBgm: newValue });
              submitContinueBgm();
            }} onText='继续' offText='暂停' isChecked={configs.value.continueBgm} />
          </CommonOptions>
          <CommonOptions key="102" title='持续播放'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, keep: newValue });
              updateCommandRef(newValue, '-keep=true');
            }} onText='是' offText='否' isChecked={configs.value.keep} />
          </CommonOptions>
          <CommonOptions key="5" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, continue: newValue });
              updateCommandRef(newValue, '-continue');
            }} onText={t('$editor.graphical.sentences.common.options.goNext.on')} offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={configs.value.continue} />
          </CommonOptions>
        </>
      )}
    </div>
    {configs.value.isChoose &&
      <Choose chooseValue={chooseValueRef.current} onSubmit={onChoose} />}
  </div>;
}
