import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import { useValue } from "../../../../hooks/useValue";
import useTrans from "@/hooks/useTrans";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import VideoChoose from './VideoChoose';
import { getArgByKey } from "../utils/getArgByKey";
import { useState, useCallback, useRef, useEffect } from 'react';

export default function PlayVideo(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.video.options.');
  const fileName = useValue(props.sentence.content);
  const isSkipOff = useValue(!!getArgByKey(props.sentence, "skipOff"));
  const isLoop = useValue(!!getArgByKey(props.sentence, "loop"));
  const isChoose = useValue(!!getArgByKey(props.sentence, "choose"));
  const chooseValueRef = useRef((props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) ||'选项:选择场景文件|选项:选择场景文件');

  const initComanRef: any = [];
  if (isSkipOff.value) {
    initComanRef.push('-skipOff=true');
  }
  if (isLoop.value) {
    initComanRef.push('-loop=true');
  }
  if (isChoose.value) {
    initComanRef.push(`-choose=${chooseValueRef.current}`);
  }
  const commandRef = useRef<any>(initComanRef);

  useEffect(() => {
    chooseValueRef.current = (props.sentence.args.filter(ele => ele.key === 'choose')[0]?.value as string) ||'选项:选择场景文件|选项:选择场景文件';
  }, [props.sentence]);

  // 启用视频跳过
  const submit = () => {
    let res: any = [];
    if (isSkipOff.value) {
      res = [...commandRef.current, '-skipOff=true'];
    } else {
      res = commandRef.current.filter((item: string) => item !== '-skipOff=true');
    }
    commandRef.current = res;
    dispacthProps(res);
  };

  // 循环播放视频
  const submitLoop = () => {
    let res: any = [];
    if (isLoop.value) {
      res = [...commandRef.current, '-loop=true'];
    } else {
      res = commandRef.current.filter((item: string) => item !== '-loop=true');
    }
    commandRef.current = res;
    dispacthProps(res);
  };

  // 是否选择分支
  const submitCoose = useCallback(() => {
    let res: any = [];
    if (isChoose.value) {
      res = [...commandRef.current, `-choose=${chooseValueRef.current}`];
    } else {
      res = commandRef.current.filter((item: string) => item !== `-choose=${chooseValueRef.current}`);
    }
    commandRef.current = res;
    dispacthProps(res);
  }, [isChoose]);

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

  function dispacthProps(res:any) {
    const str = res.join(' ');
    if (res.length > 0) {
      props.onSubmit(`playVideo:${fileName.value} ${str};`);
    } else {
      props.onSubmit(`playVideo:${fileName.value};`);
    }
  }

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="1" title={t('file.title')}>
        <>
          {fileName.value + "\u00a0\u00a0"}
          <ChooseFile sourceBase="video" onChange={(fileDesc) => {
            fileName.set(fileDesc?.name ?? "");
            submit();
          }}
          extName={[".mp4", ".webm", ".ogg", ".flv"]} />
        </>
      </CommonOptions>
      <CommonOptions key="3" title='循环播放视频'>
        <TerreToggle title="" onChange={(newValue) => {
          isLoop.set(newValue);
          submitLoop();
        }} onText='是' offText='否' isChecked={isLoop.value} />
      </CommonOptions>
      <CommonOptions key="4" title='开启分支选择'>
        <TerreToggle title="" onChange={(newValue) => {
          isChoose.set(newValue);
          submitCoose();
        }} onText='是' offText='否' isChecked={isChoose.value} />
      </CommonOptions>
    </div>
    {isChoose.value &&
      <VideoChoose chooseValue={chooseValueRef.current} onSubmit={onChoose} />}
  </div>;
}
