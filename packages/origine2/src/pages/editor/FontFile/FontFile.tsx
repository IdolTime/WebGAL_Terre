import { FC, useState, useEffect } from 'react';
import { Select } from '@fluentui/react-components';
import { useValue } from "@/hooks/useValue";
import { getFileList } from '../ChooseFile/ChooseFile'
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/origineStore";

interface IProps {
    value: string;
    onChange: (value: string) => void;
}

interface IFileDescription {
    extName: string;
    isDir: boolean;
    name: string;
    path: string;
  }

const FontFile: FC<IProps> = (props: IProps) => {

    const gameName = useSelector((state: RootState) => state.status.editor.currentEditingGame);
    const currentDirFiles = useValue<string[]>([]);
    const extName= ['.otf', '.ttf']


    const updateFileList = ()=>{
        getFileList(gameName, 'font', extName).then(result => {
          const filteredFileList = result.map(file => file.name);
          currentDirFiles.set(filteredFileList);
        });
      };
    
      useEffect(() => {
        updateFileList();
      }, []);

    
    return (
        <Select 
            style={{ width: '100px' }} 
            value={props.value}
            onChange={(e, data) => {
                props.onChange(data.value as string);
            }}
        >
            <option value={''}>{'默认'}</option>
            {currentDirFiles.value.map((file: string) => {
                return <option key={file} value={file}>{file}</option>
            })}
        </Select>
    )
}

export default FontFile;