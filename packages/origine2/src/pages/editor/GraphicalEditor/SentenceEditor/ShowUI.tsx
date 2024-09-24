import { useEffect } from 'react';
import { useValue } from '@/hooks/useValue';
import useTrans from '@/hooks/useTrans';
import TerreToggle from '@/components/terreToggle/TerreToggle';
import CommonOptions from '../components/CommonOption';
import CommonTips from "../components/CommonTips";
import { ISentenceEditorProps } from './index';

import styles from './sentenceEditor.module.scss';


export default function ShowUI(props: ISentenceEditorProps) {
    const t = useTrans('editor.graphical.sentences.showUI.options.');
    const isHide = useValue(props.sentence.content === "hide");
    const submit = () => {
        props.onSubmit(`showUI:${isHide.value ? "hide" : "on"};`);
    };
    
    return (
        <div className={styles.sentenceEditorContent}>
            <div className={styles.editItem}>
            <CommonTips text={t('tip')} />
            <CommonOptions key="isNoDialog" title={t('hide.title')}>
                <TerreToggle 
                    title="" 
                    onText={t('hide.off')} 
                    offText={t('hide.on')} 
                    isChecked={isHide.value}
                    onChange={(newValue) => {
                        isHide.set(newValue);
                        submit();
                    }}
                />
            </CommonOptions>   
            </div>
        </div>
    )
}




