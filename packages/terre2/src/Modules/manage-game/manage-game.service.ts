/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { _open } from 'src/util/open';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as process from 'process';
import { basename, dirname, resolve } from 'path';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { join, extname } from 'path';
import axios from 'axios';
import { readdir } from 'fs/promises';

import { spawn, spawnSync } from 'child_process';
import { CreateGameDto, GameMaterialItem } from './manage-game.dto';

/**
 * 替换图标文件
 * @param newIconPath 要写入的图标文件路径
 * @param oldIconPath 读取的图标文件路径
 */
async function replaceIconFile(newIconPath: string, oldIconPath: string) {
  // @ts-ignore
  fs.readFile(newIconPath, (err, data) => {
    if (err) {
      console.error('Error reading the new icon file:', err);
      return;
    }
    // @ts-ignore
    fs.writeFile(oldIconPath, data, (err) => {
      if (err) {
        console.error('Error writing the new icon to icon.icns:', err);
        return;
      }
      console.log('Icon replacement successful!');
    });
  });
}

@Injectable()
export class ManageGameService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 替换windows exe icon
   * @param exePath exe文件路径
   * @param iconPath 替换icon路径
   */
  private async updateExeIcon(
    exePath: string,
    iconPath: string,
    isExist: boolean,
    callback?: () => void,
  ) {
    if (isExist) {
      console.info('isExist: ', isExist);
      const command = this.webgalFs.getPathFromRoot(
        '/assets/rcedit/bin/rcedit-x64.exe',
      );
      const args = [exePath, '--set-icon', iconPath];

      const child = spawn(command, args);

      child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      child.on('close', (code) => {
        console.log(`update exe icon end >>>>> ${code}`);
        if (code === 0) {
          console.log('Icon replacement successful!');
          callback && callback();
        } else {
          console.error('Icon replacement failed!');
        }
      });
    } else {
      console.info('update exe icon end >>>>>');
    }
  }

  /**
   * 打开游戏文件夹
   */
  async openGameDictionary(gameName: string, gId: number) {
    const path = this.webgalFs.getPathFromRoot(`public/games/${gameName}`);
    const isExist = await this.webgalFs.existsDir(path);

    if (!isExist) {
      await this.createGame(gameName, gId);
    }

    await _open(path);
  }
  /**
   * 打开游戏资源文件夹
   */
  async openAssetsDictionary(gameName: string, subFolder?: string) {
    const path = this.webgalFs.getPathFromRoot(
      `public/games/${gameName}/game/${subFolder}`,
    );
    await _open(path);
  }

  /**
   * 从模板创建游戏
   * @param gameName
   */
  async createGame(
    gameName: string,
    gId: number,
    localInfo?: CreateGameDto['localInfo'],
  ): Promise<boolean> {
    // 检查是否存在这个游戏
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/games`),
    );
    let isThisGameExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === gameName && info.isDir) {
        isThisGameExist = true;
      }
    });
    if (isThisGameExist) {
      return false;
    }

    // 创建文件夹
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot('/public/games'),
      gameName,
    );
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
    );
    // 递归复制
    await this.webgalFs.copy(
      this.webgalFs.getPathFromRoot(
        '/assets/templates/IdolTime_Template/game/',
      ),
      gameDir,
    );

    let configFile: string = await this.webgalFs.readTextFile(
      `${gameDir}/config.txt`,
    );

    if (localInfo) {
      const fileName = basename(localInfo.detailPic);
      configFile = configFile.replace(/(Title_img:)[^;\s]+/, `$1${fileName}`);

      axios({
        method: 'get',
        url: localInfo.detailPic,
        responseType: 'arraybuffer', // 改为 arraybuffer 来处理二进制数据
      })
        .then((response) => {
          return new Promise<void>((resolve, reject) => {
            // 写入文件
            fs.writeFileSync(
              join(gameDir, 'background', fileName),
              response.data,
            );
            console.log(`File ${fileName} downloaded successfully`);
            resolve();
          });
        })
        .catch((err) => {
          console.log(`资源 ${localInfo.detailPic} 下载失败: ${err.message}`);
        });
      await this.webgalFs.writeJSONFile(`${gameDir}/gameInfo.json`, localInfo);
    }

    await this.webgalFs.updateTextFile(
      `${gameDir}/config.txt`,
      `${configFile}Game_id:${gId};\n`,
    );

    return true;
  }

  // 同步资源
  async syncMaterials(editorToken: string, gameName: string): Promise<void> {
    try {
      const res = await axios.get(
        'https://test-api.idoltime.games/editor/sync/resource',
        {
          headers: {
            editorToken,
          },
        },
      );

      if (res.data.code !== 0) {
        throw new Error(res.data.message);
      }

      const list = res.data.data as GameMaterialItem[];
      const fileNameMap = {
        1: 'animation',
        2: 'background',
        3: 'bgm',
        4: 'figure',
        5: 'texture',
        6: 'ui',
        7: 'video',
      };

      const gameDir = this.webgalFs.getPathFromRoot(
        `/public/games/${gameName}/game/`,
      );

      // 收集所有的下载任务
      const downloadTasks = list.flatMap((item) => {
        const folder = fileNameMap[item.resourceType];
        return item.resourceList.map((resource) => {
          const fileName = `${resource.resourceName}_${resource.resourceId}`;
          const ext = resource.resourceUrl.split('.').pop();
          const filePath = join(gameDir, folder, `${fileName}.${ext}`);

          // 返回一个新的 Promise，表示下载任务
          return axios({
            method: 'get',
            url: resource.resourceUrl,
            responseType: 'arraybuffer', // 改为 arraybuffer 来处理二进制数据
          })
            .then((response) => {
              return new Promise<void>((resolve, reject) => {
                // 写入文件
                fs.writeFileSync(filePath, response.data);
                console.log(`Download destination: ${filePath}`);
                console.log(`File ${fileName} downloaded successfully`);
                resolve();
              });
            })
            .catch((err) => {
              throw new Error(
                `资源 ${resource.resourceName} 下载失败: ${err.message}`,
              );
            });
        });
      });

      // 等待所有下载任务完成
      await Promise.all(downloadTasks);
      console.log('All resources downloaded successfully');
    } catch (error) {
      console.error('Error syncing materials:', error.message);
      throw error; // 重新抛出错误以便调用者处理
    }
  }

  /**
   * 压缩游戏目录并上传到 S3
   * @param gameName 游戏名称
   * @param bucketName S3 存储桶名称
   * @param s3Key 上传到 S3 的文件键
   */
  async uploadGame(gameName: string, gId: number, token: string) {
    await this.exportGame(gameName, 'web', false);
    const gameDir = this.webgalFs.getPathFromRoot(
      `/Exported_Games/${gameName}`,
    );
    const now = Date.now();
    let gameWebDir = join(gameDir, 'web');
    let gameMobileDir = join(gameDir, 'wap');
    const gameRootDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
    );
    const changedFilesDir = join(gameDir, 'changedFiles');
    const webChangedFilesDir = join(changedFilesDir, 'web');
    const mobileChangedFilesDir = join(changedFilesDir, 'wap');
    const bundleFile = process.platform === 'darwin' ? 'ToPack' : 'ToPack.exe';
    // 获取打包工具
    const bundleCommand = this.webgalFs.getPathFromRoot(
      '/assets/tools/' + bundleFile,
    );
    const hashJSONPath = join(gameWebDir, 'hash.json');
    let size = 0;

    const args = [gameRootDir, gameMobileDir];

    const prevMobileHash = await this.webgalFs.readJSONFile(
      join(gameMobileDir, '_md5.json'),
    );

    const [changedFiles, hashData] = await this.webgalFs.generateHashJson(
      gameWebDir,
      join(gameWebDir, 'hash.json'),
    );

    spawnSync(bundleCommand, args, {
      env: process.env, // 使用相同的环境变量
      stdio: 'inherit', // 继承标准输入输出，便于调试
      cwd: dirname(bundleCommand),
    });

    const addressJSONFile = await this.webgalFs.readJSONFile(
      join(gameMobileDir, '_address.json'),
    );

    if (typeof addressJSONFile === 'object') {
      Object.values(addressJSONFile).forEach((item) => {
        size += item[1];
      });
    }

    if (changedFiles.length > 0) {
      await this.webgalFs.copyChangedFiles(
        changedFiles,
        gameWebDir,
        webChangedFilesDir,
      );

      const currentMobileHash = await this.webgalFs.readJSONFile(
        join(gameMobileDir, '_md5.json'),
      );

      const changedMobileFileKeys = Object.keys(currentMobileHash).filter(
        (file) => currentMobileHash[file] !== prevMobileHash[file],
      );
      const changedMobileFiles = changedMobileFileKeys.map((key) => {
        return currentMobileHash[key];
      });

      await this.webgalFs.copyChangedFiles(
        changedMobileFiles,
        gameMobileDir,
        mobileChangedFilesDir,
      );

      if (changedMobileFiles.length > 0) {
        fs.copyFileSync(
          join(gameMobileDir, '_address.json'),
          join(mobileChangedFilesDir, '_address.json'),
        );
        fs.copyFileSync(
          join(gameMobileDir, '_address.hash'),
          join(mobileChangedFilesDir, '_address.hash'),
        );
        fs.copyFileSync(
          join(gameMobileDir, '_md5.json'),
          join(mobileChangedFilesDir, '_md5.json'),
        );
      }
    }

    try {
      if (!gId) {
        const localInfo = await this.webgalFs.readJSONFile(
          `${gameRootDir}/gameInfo.json`,
        );

        if (typeof localInfo === 'object') {
          const res = await axios.post(
            `https://test-api.idoltime.games/editor/game/add`,
            localInfo,
            {
              headers: {
                'Content-Type': 'application/json',
                editorToken: token,
              },
            },
          );

          if (res.data.code !== 0) {
            throw new Error(res.data.message);
          }

          gId = res.data.data;
        }
      }

      // 上传游戏付费配置
      const payRes = await this.uploadGamePaymentConfig(gId, gameName, token);

      if (payRes.status === 'failed') {
        throw new Error('上传付费配置失败');
      }

      const configFile: string = await this.webgalFs.readTextFile(
        `${gameRootDir}/config.txt`,
      );
      const newGameId = gId;
      const updatedText = configFile.replace(
        /(Game_id:)\d+;/,
        `$1${newGameId};`,
      );
      await this.webgalFs.updateTextFile(
        `${gameRootDir}/config.txt`,
        updatedText,
      );
    } catch (error) {
      throw new Error(error.message);
    }

    let key = `${gId}_${now}_web.zip`;
    let mobileKey = `${gId}_${now + 100}_wap.zip`;
    let zipFilePath = `${gameDir}/${key}`;
    let mobileZipFilePath = `${gameDir}/${mobileKey}`;
    const hasUploadedGame = await this.webgalFs.existsFile(hashJSONPath);
    let incrementalUpload = false;

    if (hasUploadedGame && changedFiles.length === 0) {
      throw new Error('没有需要上传的文件');
    }

    if (hasUploadedGame) {
      key = `${gId}_${now}_web_increment.zip`;
      mobileKey = `${gId}_${now + 100}_wap_increment.zip`;
      zipFilePath = `${changedFilesDir}/${key}`;
      mobileZipFilePath = `${changedFilesDir}/${mobileKey}`;
      gameWebDir = webChangedFilesDir;
      gameMobileDir = mobileChangedFilesDir;
      incrementalUpload = true;

      fs.writeFileSync(
        join(gameWebDir, 'hash.json'),
        JSON.stringify(hashData, null, 2),
      );
    }

    // 创建压缩包
    await Promise.all([
      this.compressDirectory(gameWebDir, zipFilePath),
      this.compressDirectory(gameMobileDir, mobileZipFilePath),
    ]);

    // 上传压缩包
    const [res, res2] = await Promise.all([
      axios.post(
        `https://test-api.idoltime.games/editor/game/${
          incrementalUpload ? 'increment' : 'game'
        }_put_object_pre_sign`,
        { fileName: key },
        {
          headers: {
            'Content-Type': 'application/json',
            editorToken: token,
          },
        },
      ),
      axios.post(
        `https://test-api.idoltime.games/editor/game/${
          incrementalUpload ? 'increment' : 'game'
        }_put_object_pre_sign`,
        { fileName: mobileKey },
        {
          headers: {
            'Content-Type': 'application/json',
            editorToken: token,
          },
        },
      ),
    ]);

    const resData = res.data;
    const res2Data = res2.data;

    if (resData.code === 0 && res2Data.code === 0) {
      const url = resData.data as string;
      const fileStream = fs.createReadStream(zipFilePath);
      const mobileFileStream = fs.createReadStream(mobileZipFilePath);
      const fileSize = fs.statSync(zipFilePath).size;
      const mobileFileSize = fs.statSync(mobileZipFilePath).size;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const axios2 = require('axios');

      const [uploadRes, uploadRes2] = await Promise.all([
        axios2.put(url, fileStream, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileSize.toString(),
          },
          body: fileStream,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
        axios2.put(res2Data.data as string, mobileFileStream, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': mobileFileSize.toString(),
          },
          body: mobileFileStream,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      ]);

      if (uploadRes.status !== 200 || uploadRes2.status !== 200) {
        throw new Error('上传失败');
      }

      const approvalLink = `https://idol-unzip-dst.s3.ap-southeast-1.amazonaws.com/${gId}/${now}/web/index.html`;

      const approvalRes = await axios.post(
        `https://test-api.idoltime.games/editor/author/game_approval_upload`,
        {
          gId,
          approvalLink: hasUploadedGame ? undefined : approvalLink,
          fileName: key,
          mobileFileName: mobileKey,
          size: size.toString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            editorToken: token,
          },
        },
      );

      const approvalResData = approvalRes.data;

      // 删除本地压缩包
      fs.unlinkSync(zipFilePath);
      fs.unlinkSync(mobileZipFilePath);

      if (approvalResData.code === 0) {
        fs.writeFileSync(hashJSONPath, JSON.stringify(hashData, null, 2));
        return true;
      } else {
        throw new Error(approvalResData.message);
      }
    } else {
      throw new Error(resData.code !== 0 ? resData.message : res2Data.message);
    }
  }

  private async compressDirectory(
    sourceDir: string,
    outPath: string,
  ): Promise<void> {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  // 获取游戏配置
  async getGameConfig(gameName: string) {
    interface Config {
      Game_name: string;
      Description: string;
      Game_key: string;
      Package_name: string;
      Game_Icon: string;
      Game_Js_Link: string;
      Game_Css_Link: string;
    }
    const config: Config = {
      Game_name: '',
      Description: '',
      Game_key: '',
      Package_name: '',
      Game_Icon: '',
      Game_Js_Link: '',
      Game_Css_Link: '',
    };
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
    );
    // 读取配置文件
    const configFile: string | unknown = await this.webgalFs.readTextFile(
      `${gameDir}/config.txt`,
    );
    if (typeof configFile === 'string') {
      configFile
        .replace(/[\r\n]/g, '')
        .split(';')
        .filter((commandText) => commandText !== '')
        .map((commandText) => {
          const i = commandText.indexOf(':');
          const arr = [commandText.slice(0, i), commandText.slice(i + 1)];
          config[arr[0]] = arr[1];
        });
    }
    return {
      ...config,
      Package_name:
        config.Package_name === ''
          ? 'com.openwebgal.demo'
          : config.Package_name,
    };
  }

  /**
   * 导出游戏
   * @param gameName 游戏名称
   * @param ejectPlatform 导出平台
   */
  async exportGame(
    gameName: string,
    ejectPlatform: 'web' | 'electron-windows' | 'android',
    openFileExplorer = true,
    gamePackageName?: string,
  ) {
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
    );

    // 导出包名，如果配置中没有，则默认使用游戏名
    const appName = (gamePackageName && gamePackageName) || gameName;

    // 如果导出文件夹不存在就创建
    if (!(await this.webgalFs.existsDir('Exported_Games')))
      await this.webgalFs.mkdir('Exported_Games', '');

    const electronTemplateDir = resolve(
      process.cwd(),
      'assets/templates/IdolTime_Electron_Template/',
    );

    if (!(await this.webgalFs.existsDir(electronTemplateDir)))
      await this.webgalFs.mkdir(electronTemplateDir, '');

    // 检查导出文件夹是否存在这个游戏
    const exportedGamesDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/Exported_Games`),
    );
    let isThisGameExist = false;
    exportedGamesDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === gameName && info.isDir) {
        isThisGameExist = true;
      }
    });
    // 获取游戏配置
    const gameConfig = await this.getGameConfig(gameName);
    // 获取导出目录
    const exportDir = this.webgalFs.getPathFromRoot(
      `/Exported_Games/${gameName}`,
    );
    if (!isThisGameExist) {
      // 创建游戏导出目录
      await this.webgalFs.mkdir(exportDir, '');
    }

    // 将游戏复制到导出目录，并附加对应的模板
    // 导出 electron-windows
    if (ejectPlatform === 'electron-windows') {
      if (process.platform === 'win32') {
        const electronExportDir = this.webgalFs.getPath(
          `${exportDir}/electron-windows`,
        );
        await this.webgalFs.mkdir(electronExportDir, '');
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot(
            `/assets/templates/IdolTime_Electron_Template/`,
          ),
          `${electronExportDir}/`,
        );
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot('/assets/templates/IdolTime_Template'),
          `${electronExportDir}/resources/app/public/`,
        );
        // 修改 manifest.json
        await this.webgalFs.replaceTextFile(
          `${electronExportDir}/resources/app/public/manifest.json`,
          ['IdolTime Demo', 'IdolTime'],
          [gameConfig.Description, gameConfig.Game_name],
        );
        // 删掉 Service Worker
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/resources/app/public/webgal-serviceworker.js`,
        );
        // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/resources/app/public/game/`,
        );
        await this.webgalFs.copy(
          gameDir,
          `${electronExportDir}/resources/app/public/game/`,
        );

        const iconDir = this.webgalFs.getPathFromRoot(
          `/public/games/${gameName}/game/background/${gameConfig.Game_Icon}`,
        );

        const exePath = join(electronExportDir, 'IdolTime.exe');

        if (gameConfig.Game_Icon && iconDir) {
          const isExist = await this.webgalFs.existsFile(exePath);
          await this.updateExeIcon(exePath, iconDir, isExist, () => {
            if (exePath && gamePackageName) {
              // 如果有配置新包名称，替换原来的应用名称
              this.webgalFs.renameFile(exePath, `${appName}.exe`);
            }
          });
        }

        if (openFileExplorer) {
          await _open(electronExportDir);
        }
      }
      if (process.platform === 'linux') {
        const electronExportDir = this.webgalFs.getPath(
          `${exportDir}/electron-linux`,
        );
        await this.webgalFs.mkdir(electronExportDir, '');
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot(
            `/assets/templates/IdolTime_Electron_Template/`,
          ),
          `${electronExportDir}/`,
        );
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot('/assets/templates/IdolTime_Template'),
          `${electronExportDir}/resources/app/public/`,
        );
        // 修改 manifest.json
        await this.webgalFs.replaceTextFile(
          `${electronExportDir}/resources/app/public/manifest.json`,
          ['WebGAL DEMO', 'WebGAL'],
          [gameConfig.Description, gameConfig.Game_name],
        );
        // 删掉 Service Worker
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/resources/app/public/webgal-serviceworker.js`,
        );
        // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/resources/app/public/game/`,
        );
        await this.webgalFs.copy(
          gameDir,
          `${electronExportDir}/resources/app/public/game/`,
        );

        if (openFileExplorer) {
          await _open(electronExportDir);
        }
      }
      if (process.platform === 'darwin') {
        const electronExportDir = this.webgalFs.getPath(
          `${exportDir}/${appName}.app`,
        );
        await this.webgalFs.mkdir(electronExportDir, '');
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot(
            `/assets/templates/IdolTime_Electron_Template/`,
          ),
          `${electronExportDir}/`,
        );
        await this.webgalFs.copy(
          this.webgalFs.getPathFromRoot('/assets/templates/IdolTime_Template'),
          `${electronExportDir}/Contents/Resources/app/public/`,
        );
        // 修改 manifest.json
        await this.webgalFs.replaceTextFile(
          `${electronExportDir}/Contents/Resources/app/public/manifest.json`,
          ['WebGAL DEMO', 'WebGAL'],
          [gameConfig.Description, gameConfig.Game_name],
        );
        // 删掉 Service Worker
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/Contents/Resources/app/public/webgal-serviceworker.js`,
        );
        // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
        await this.webgalFs.deleteFileOrDirectory(
          `${electronExportDir}/Contents/Resources/app/public/game/`,
        );
        await this.webgalFs.copy(
          gameDir,
          `${electronExportDir}/Contents/Resources/app/public/game/`,
        );

        // const iconDir = await this.webgalFs.getPath(
        //   `${electronExportDir}/Contents/Resources/app/public/game/background/`,
        // );

        // if (gameConfig.Game_Icon && iconDir) {
        //   await replaceIconFile(
        //     `${iconDir}/${gameConfig.Game_Icon}`,
        //     `${electronExportDir}/Contents/Resources/icon.icns`,
        //   );
        // }

        if (openFileExplorer) {
          await _open(exportDir);
        }
      }
    }
    // 导出 android
    if (ejectPlatform === 'android') {
      const androidExportDir = this.webgalFs.getPath(`${exportDir}/android`);
      await this.webgalFs.mkdir(androidExportDir, '');
      // 复制模板前尝试删除文件夹，防止包名更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/java/`,
      );
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(
          `/assets/templates/IdolTime_Android_Template/`,
        ),
        `${androidExportDir}/`,
      );
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/IdolTime_Template'),
        `${androidExportDir}/app/src/main/assets/webgal/`,
      );
      // 修改 manifest.json
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/src/main/assets/webgal/manifest.json`,
        ['WebGAL DEMO', 'WebGAL'],
        [gameConfig.Description, gameConfig.Game_name],
      );
      // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/assets/webgal/game/`,
      );
      await this.webgalFs.copy(
        gameDir,
        `${androidExportDir}/app/src/main/assets/webgal/game/`,
      );
      // 修改信息
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/settings.gradle`,
        'WebGAL',
        gameName,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/src/main/res/values/strings.xml`,
        'WebGAL',
        gameConfig.Game_name,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/build.gradle`,
        'com.openwebgal.demo',
        gameConfig.Package_name,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
        'com.openwebgal.demo',
        gameConfig.Package_name,
      );
      await this.webgalFs.mkdir(
        // eslint-disable-next-line prettier/prettier
        `${androidExportDir}/app/src/main/java/${gameConfig.Package_name.replace(/\./g, '/')}`,
        '',
      );
      await this.webgalFs.copy(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
        // eslint-disable-next-line prettier/prettier
        `${androidExportDir}/app/src/main/java/${gameConfig.Package_name.replace(/\./g, '/')}/MainActivity.kt`
      );
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
      );

      if (openFileExplorer) {
        await _open(androidExportDir);
      }
    }
    // 导出 Web
    if (ejectPlatform === 'web') {
      const webExportDir = this.webgalFs.getPath(`${exportDir}/web`);
      await this.webgalFs.mkdir(webExportDir, '');
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/IdolTime_Template'),
        `${webExportDir}/`,
      );
      // 修改 manifest.json
      await this.webgalFs.replaceTextFile(
        `${webExportDir}/manifest.json`,
        ['WebGAL DEMO', 'WebGAL'],
        [gameConfig.Description, gameConfig.Game_name],
      );
      // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(`${webExportDir}/game/`);
      await this.webgalFs.copy(gameDir, `${webExportDir}/game/`);

      if (openFileExplorer) {
        await _open(webExportDir);
      }
    }
  }

  /**
   * 检查游戏是否在本地存在
   * @param gameName
   */
  async checkGameFolder(gameName: string) {
    return await this.webgalFs.existsDir(
      this.webgalFs.getPathFromRoot(`/public/games/${gameName}`),
    );
  }

  /**
   * 上传游戏付费配置
   * @param gameName
   */
  async uploadGamePaymentConfig(
    gId: number,
    gameName: string,
    editorToken: string,
  ) {
    const dirPath = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/scene`,
    );

    try {
      const files = await readdir(dirPath);
      const txtFiles = files.filter((file) => extname(file) === '.txt');
      const data: IUploadPaymentConfiguration[] = [];

      for (const file of txtFiles) {
        const filePath = join(dirPath, file);
        const content = await this.webgalFs.readTextFile(filePath);
        const sentenceList = content.split('\n');

        for (const sentence of sentenceList) {
          if (sentence.startsWith('choose:')) {
            const payInfoMatch = /\#\{(.*?)\}/.exec(sentence);
            if (payInfoMatch) {
              const payInfoStr = payInfoMatch[1];
              const payInfoProps = payInfoStr.split(',');
              let productId = 0;
              let amount = 0;
              let salesType = 1;

              payInfoProps.forEach((prop) => {
                const [key, value] = prop.split('=');
                if (key === 'productId') {
                  productId = isNaN(Number(value.trim()))
                    ? 0
                    : Number(value.trim());
                } else if (key === 'amount') {
                  amount = isNaN(Number(value.trim()))
                    ? 0
                    : Number(value.trim());
                } else if (key === 'salesType') {
                  salesType = isNaN(Number(value.trim()))
                    ? 1
                    : Number(value.trim());
                }
              });

              if (productId > 0 && amount > 0) {
                data.push({
                  buy_type: 2,
                  buy_type_text: '付费选项',
                  sales_type: salesType,
                  sales_type_text: salesType === 1 ? '星石' : '星光',
                  sales_amount: amount,
                  is_pay: 1,
                  productId,
                });
              }
            }
          } else if (sentence.startsWith('payProduct:')) {
            const [command, _mainPart] = sentence.split(':');
            const mainPart = _mainPart.split(';')[0];

            if (mainPart) {
              const [productId, ...options] = mainPart.split(' -');
              let amount: number | null = null;
              let chapter = 0;
              let salesType = 1;

              options.forEach((option) => {
                const [key, value] = option.split('=');
                if (key === 'amount') {
                  amount = isNaN(Number(value.trim()))
                    ? 0
                    : Number(value.trim());
                } else if (key === 'chapter') {
                  chapter = isNaN(Number(value.trim()))
                    ? 0
                    : Number(value.trim());
                } else if (key === 'salesType') {
                  salesType = isNaN(Number(value.trim()))
                    ? 1
                    : Number(value.trim());
                }
              });

              if (productId && typeof chapter === 'number' && amount > 0) {
                data.push({
                  chapter: chapter,
                  buy_type: 1,
                  buy_type_text: '章节付费',
                  sales_type: salesType,
                  sales_type_text: salesType === 1 ? '星石' : '星光',
                  sales_amount: amount,
                  is_pay: 1,
                  productId: Number(productId),
                });
              }
            }
          }
        }
      }

      const res = await axios.post(
        `https://test-api.idoltime.games/editor/game/chapter_sales_set`,
        {
          gId,
          sales: data,
        },
        {
          headers: {
            editorToken,
          },
        },
      );

      if (res.data.code === 0) {
        return {
          status: 'success',
          message: res.data.message,
        };
      }

      return {
        status: 'failed',
        message: res.data.message,
      };
    } catch (error) {
      console.error('Failed to update payment configuration:', error);
      return {
        status: 'failed',
        message: error.message,
      };
    }
  }
}

interface IUploadPaymentConfiguration {
  id?: number;
  chapter?: number;
  buy_type: 1 | 2;
  buy_type_text: string;
  sales_type: number;
  sales_type_text: '星石' | '星光';
  sales_amount: number;
  is_pay: 1;
  productId: number;
}
