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
    poster: getArgByKey(props.sentence, "poster"),
  });

  const chooseValueRef = useRef(
    (props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) ||
    '选项:选择场景文件|选项:选择场景文件'
  );

  useEffect(() => {
    chooseValueRef.current = (props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) || '选项:选择场景文件|选项:选择场景文件';
  }, [props.sentence]);

  const generateString = () => {
    let res = '';
    if (configs.value.isSkipOff) {
      res += '-skipOff=true ';
    }
    if (configs.value.isLoop) {
      res += '-loop=true ';
    }
    if (configs.value.continueBgm) {
      res += '-continueBgm=true ';
    }
    if (configs.value.keep) {
      res += '-keep=true ';
    }
    if (configs.value.id) {
      res += `-id=${configs.value.id} `;
    }
    if (configs.value.poster) {
      res += `-poster=${configs.value.poster} `;
    }
    if (configs.value.isChoose) {
      res += `-choose=${chooseValueRef.current} `;
    }
    if (configs.value.continue) {
      res += '-continue=true ';
    }
    return res;
  };
  const updateProps = () => {
    setTimeout(() => {
      const res = generateString().trim();
      props.onSubmit(`playVideo:${configs.value.fileName}${res.length ? ' ' + res : ''};`);
    }, 16);
  };

  const onChoose = (val: string) => {
    configs.set({ ...configs.value, isChoose: !!val.trim() });
    chooseValueRef.current = val;
    updateProps();
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title="关闭视频">
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            configs.set({ ...configs.value, fileName: '请选择视频文件' });
          } else {
            configs.set({ ...configs.value, fileName: 'none' });
          }
          updateProps();
        }} onText="关闭视频" offText="显示视频" isChecked={isNoFile} />
      </CommonOptions>
      <CommonOptions title="视频ID（可选" key="101">
        <input value={configs.value.id as string}
          onChange={(ev) => {
            const newValue = ev.target.value;
            configs.set({ ...configs.value, id: newValue });
          }}
          onBlur={updateProps}
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
                updateProps();
              }}
              extName={[".mp4", ".webm", ".ogg", ".flv"]} />
            </>
          </CommonOptions>
          <CommonOptions key="3" title='循环播放视频'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, isLoop: newValue });
              updateProps();
            }} onText='是' offText='否' isChecked={configs.value.isLoop} />
          </CommonOptions>
          <CommonOptions key="poster" title='视频封面图'>
            <>
              {configs.value.poster}{"\u00a0"}
              <ChooseFile
                sourceBase="image"
                onChange={(newFile) => {
                  configs.set({ ...configs.value, poster: newFile?.name ?? "" });
                  updateProps();
                }}
                extName={[".png", ".jpg", ".webp"]}
              />
            </>
          </CommonOptions>
          <CommonOptions key="4" title='开启分支选择'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, isChoose: newValue });
              updateProps();
            }} onText='是' offText='否' isChecked={configs.value.isChoose} />
          </CommonOptions>
          <CommonOptions key="5" title='继续播放BGM'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, continueBgm: newValue });
              updateProps();
            }} onText='继续' offText='暂停' isChecked={configs.value.continueBgm} />
          </CommonOptions>
          <CommonOptions key="102" title='持续播放'>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, keep: newValue });
              updateProps();
            }} onText='是' offText='否' isChecked={configs.value.keep} />
          </CommonOptions>
          <CommonOptions key="5" title={t('$editor.graphical.sentences.common.options.goNext.title')}>
            <TerreToggle title="" onChange={(newValue) => {
              configs.set({ ...configs.value, continue: newValue });
              updateProps();
            }} onText={t('$editor.graphical.sentences.common.options.goNext.on')} offText={t('$editor.graphical.sentences.common.options.goNext.off')} isChecked={configs.value.continue} />
          </CommonOptions>
        </>
      )}
    </div>
    {!!configs.value.isChoose &&
      <Choose 
        chooseValue={chooseValueRef.current} 
        sentence={props.sentence} 
        onSubmit={onChoose}
        isChoose={configs.value.isChoose}
      />
    }
  </div>;
}
