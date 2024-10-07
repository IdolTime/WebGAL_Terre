import SceneParser from 'idoltime-parser/build/cjs/index.cjs';
import { SCRIPT_CONFIG } from 'idoltime-parser/build/cjs/index.cjs';

export const WebgalParser = new SceneParser(
  () => {
    // do something
  },
  (fileName, assetType) => {
    return fileName;
  },
  [],
  SCRIPT_CONFIG,
);

/**
 * 场景解析器 - 编辑器版
 * @param rawScene 原始场景
 * @return {IScene} 解析后的场景
 */
export const parseScene = (rawScene: string) => {
  const parsedScene = WebgalParser.parse(rawScene, 'editing', 'editing.txt');
  console.log(`解析场景：${'editing'}，数据为：`, parsedScene);
  return parsedScene;
};
