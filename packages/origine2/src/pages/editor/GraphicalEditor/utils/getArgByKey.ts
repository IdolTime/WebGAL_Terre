import { ISentence } from "idoltime-parser/src/interface/sceneInterface";
import { cloneDeep } from "lodash";
import { useSelector } from "react-redux";
import {WebgalConfig} from "idoltime-parser/build/es/configParser/configParser";
import { RootState } from "@/store/origineStore";
import {useValue} from "@/hooks/useValue";
import {WebgalParser} from "@/pages/editor/GraphicalEditor/parser";
import axios from "axios";

export const getArgByKey = (sentence: ISentence, key: string): boolean | string | number => {
  for (const arg of sentence.args) {
    if (arg.key === key) {
      return arg.value;
    }
  }
  return "";
};

export const updateGameConfigSimpleByKey = (key: string, value: string) => {
  const gameConfig = useValue<WebgalConfig>([]);
  const currentEditingGame = useSelector((state: RootState) => state.status.editor.currentEditingGame);

  const parseAndSetGameConfigState = (data: string) => {
    console.log('parse config\n', data);
    gameConfig.set(WebgalParser.parseConfig(data));
  }

  const getGameConfig = () => {
    return axios
      .get(`/api/manageGame/getGameConfig/${currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };


  const updateGameConfig = () => {
    const newConfig = WebgalParser.stringifyConfig(gameConfig.value);
    const form = new URLSearchParams();
    form.append("gameName", currentEditingGame);
    form.append("newConfig", newConfig);
    axios.post(`/api/manageGame/setGameConfig/`, form)
  }

  const updateGameConfigKey = () => {
    getGameConfig().then(() => {
      const newConfig = cloneDeep(gameConfig.value);
      const index = newConfig.findIndex(e => e.command === key);
      if (index >= 0) {
        newConfig[index].args = [value];
      } else {
        newConfig.push({command: key, args: [value], options: []});
      }
      gameConfig.set(newConfig);
      updateGameConfig();
    })
  }

  return {
    updateGameConfigKey,
  }
};

