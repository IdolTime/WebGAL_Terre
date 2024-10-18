import CommonOptions from "../components/CommonOption";
import { ISentenceEditorProps } from "./index";
import styles from "./sentenceEditor.module.scss";
import { commandType } from "idoltime-parser/src/interface/sceneInterface";
import { useValue } from "../../../../hooks/useValue";
import { getArgByKey } from "../utils/getArgByKey";
import ChooseFile from "../../ChooseFile/ChooseFile";
import CommonTips from "../components/CommonTips";
import useTrans from "@/hooks/useTrans";
import { Dropdown, Option } from "@fluentui/react-components";
import { useState } from "react";

export default function UnlockExtra(props: ISentenceEditorProps) {
  const t = useTrans('editor.graphical.sentences.unlockCg.options.');

  const extra = new Map([
    ["unlockCg", t('type.options.cg')],
    ["unlockCg2", t('type.options.video')],
    ["unlockBgm", t('type.options.bgm')],
  ]);

  // Consolidate useValue into a single state object
  const unlockExtraState = useValue({
    fileName: props.sentence.content,
    unlockName: getArgByKey(props.sentence, "name").toString() ?? "",
    unlockSeries: getArgByKey(props.sentence, "series").toString() ?? "",
    unlockType: props.sentence.command === commandType.unlockCg ? "unlockCg" : "unlockBgm",
    poster: getArgByKey(props.sentence, "poster").toString() ?? "",
    isVideo: props.sentence.content.includes(".mp4") || props.sentence.content.includes(".flv"),
  });

  const submit = () => {
    const { fileName, unlockName, unlockSeries, unlockType, poster } = unlockExtraState.value;
    if (unlockName === "") {
      // props.onSubmit(`${unlockType}:;`);
    }
    
    props.onSubmit(`${unlockType}:${fileName}${unlockName !== "" ? " -name=" + unlockName : ""}${unlockSeries !== "" ? " -series=" + unlockSeries : ""}${poster !== "" ? " -poster=" + poster : ""};`);
  };

  return (
    <div className={styles.sentenceEditorContent}>
      <CommonTips text={t('tips.afterEdit')} />
      <div className={styles.editItem}>
        <CommonOptions key="1" title={t('type.title')}>
          <Dropdown
            value={extra.get(unlockExtraState.value.unlockType + (unlockExtraState.value.isVideo ? "2" : ""))}
            selectedOptions={[unlockExtraState.value.unlockType + (unlockExtraState.value.isVideo ? "2" : "")]}
            onOptionSelect={(event, data) => {
              const newUnlockType = data.optionValue?.toString() ?? "";
              const isVideo = newUnlockType === "unlockCg2";

              // Update the useValue object state
              unlockExtraState.set({
                ...unlockExtraState.value,
                unlockType: isVideo ? "unlockCg" : newUnlockType,
                isVideo: isVideo,
                fileName: newUnlockType !== unlockExtraState.value.unlockType ? "" : unlockExtraState.value.fileName,
              });

              submit();
            }}
            style={{ minWidth: 0 }}
          >
            {Array.from(extra.entries()).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Dropdown>
        </CommonOptions>

        <CommonOptions key={2} title={t('file.title')}>
          <>
            {unlockExtraState.value.fileName}{"\u00a0"}
            <ChooseFile
              sourceBase={
                unlockExtraState.value.unlockType === "unlockCg"
                  ? unlockExtraState.value.isVideo ? "video" : "background"
                  : "bgm"
              }
              onChange={(newFile) => {
                unlockExtraState.set({
                  ...unlockExtraState.value,
                  fileName: newFile?.name ?? "",
                });
                submit();
              }}
              extName={
                unlockExtraState.value.unlockType === "unlockCg"
                  ? unlockExtraState.value.isVideo
                    ? [".mp4", ".flv"]
                    : [".png", ".jpg", ".webp"]
                  : [".mp3", ".ogg", ".wav"]
              }
            />
          </>
        </CommonOptions>

        <CommonOptions title={t('name.title')}>
          <input
            value={unlockExtraState.value.unlockName}
            onChange={(ev) =>
              unlockExtraState.set({
                ...unlockExtraState.value,
                unlockName: ev.target.value,
              })
            }
            onBlur={submit}
            className={styles.sayInput}
            style={{ width: "200px" }}
            placeholder={t('name.placeholder')}
          />
        </CommonOptions>
        
        {unlockExtraState.value.unlockType === "unlockCg"&& unlockExtraState.value.isVideo && (
          <CommonOptions title={t('poster.title')}>
            <>
              {unlockExtraState.value.poster}{"\u00a0"}
              <ChooseFile
                sourceBase="image"
                onChange={(newFile) => {
                  unlockExtraState.set({
                    ...unlockExtraState.value,
                    poster: newFile?.name ?? "",
                  });
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}
              />
            </>
          </CommonOptions>)
        }
      </div>
    </div>
  );
}
