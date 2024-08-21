import { ConsoleLogger, Injectable } from '@nestjs/common';
import { _open } from 'src/util/open';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as process from 'process';
import { resolve } from 'path';
import * as archiver from 'archiver';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { join, extname } from 'path';
import axios from 'axios';
import { readdir } from 'fs/promises';

const { spawn } = require('child_process');


/**
 * 替换图标文件
 * @param newIconPath 要写入的图标文件路径
 * @param oldIconPath 读取的图标文件路径
 */
async function replaceIconFile(newIconPath: string, oldIconPath: string) {
  //@ts-ignore
  fs.readFile(newIconPath, (err, data) => {
    if (err) {
        console.error('Error reading the new icon file:', err);
        return;
    }
    //@ts-ignore
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
  private async updateExeIcon(exePath: string, iconPath: string, isExist: boolean) {
    if (isExist) {
      console.info('isExist: ', isExist)
      const command = this.webgalFs.getPathFromRoot(
        '/assets/rcedit/bin/rcedit-x64.exe'
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
        console.log(`子进程退出，退出码 ${code}`);
      });
    } else {
      console.info('update exe icon end >>>>>')
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
  async createGame(gameName: string, gId: number): Promise<boolean> {
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

    const configFile: string | unknown = await this.webgalFs.readTextFile(
      `${gameDir}/config.txt`,
    );
    await this.webgalFs.updateTextFile(
      `${gameDir}/config.txt`,
      `${configFile}Game_id:${gId};\n`,
    );

    return true;
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
    const key = `${gId}_${now}_web.zip`;
    const gameWebDir = join(gameDir, 'web');
    const zipFilePath = `${gameDir}/${key}`;

    // 创建压缩包
    await this.compressDirectory(gameWebDir, zipFilePath);

    const res = await axios.post(
      `https://test-api.idoltime.games/editor/game/game_put_object_pre_sign`,
      { fileName: key },
      {
        headers: {
          'Content-Type': 'application/json',
          editorToken: token,
        },
      },
    );

    const resData = res.data;

    if (resData.code === 0) {
      const url = resData.data as string;
      const fileStream = fs.createReadStream(zipFilePath);
      const fileSize = fs.statSync(zipFilePath).size;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const axios2 = require('axios');

      const uploadRes = await axios2.put(url, fileStream, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize.toString(),
        },
        body: fileStream,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (uploadRes.status !== 200) {
        throw new Error('上传失败');
      }

      const approvalLink = `https://idol-unzip-dst.s3.ap-southeast-1.amazonaws.com/${gId}/${now}/web/index.html`;

      const approvalRes = await axios.post(
        `https://test-api.idoltime.games/editor/author/game_approval_upload`,
        {
          gId,
          approvalLink,
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

      if (approvalResData.code === 0) {
        return true;
      } else {
        throw new Error(approvalResData.message);
      }
    } else {
      throw new Error(resData.message);
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

  private async uploadToS3(filePath: string, key: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);

    const target = {
      Bucket: 'idol-editor',
      Key: key,
      Body: fileStream,
    };

    try {
      const parallelUploads3 = new Upload({
        client: new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }),
        params: target,
        queueSize: 4, // optional concurrency configuration
        leavePartsOnError: false, // optional manually handle dropped parts
      });

      parallelUploads3.on('httpUploadProgress', (progress) => {
        console.log(progress);
      });

      await parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }
  }

  // 获取游戏配置
  async getGameConfig(gameName: string) {
    interface Config {
      Game_name: string;
      Description: string;
      Game_key: string;
      Package_name: string;
      Game_Icon: string;
    }
    const config: Config = {
      Game_name: '',
      Description: '',
      Game_key: '',
      Package_name: '',
      Game_Icon: '',
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
  ) {
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
    );

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
          `/public/games/${gameName}/game/background/${gameConfig.Game_Icon}`
        );
        const exePath = join(electronExportDir, 'IdolTime.exe');

        if (gameConfig.Game_Icon && iconDir) {
          const exePath = join(electronExportDir, 'IdolTime.exe')
          const isExist = await this.webgalFs.existsFile(exePath)
           await this.updateExeIcon(exePath, iconDir, isExist)
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
          `${exportDir}/${gameName}.app`,
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

        const iconDir = await this.webgalFs.getPath(
          `${electronExportDir}/Contents/Resources/app/public/game/background/`,
        );
        
        if (gameConfig.Game_Icon && iconDir) {
          await replaceIconFile(
            `${iconDir}/${gameConfig.Game_Icon}`, 
            `${electronExportDir}/Contents/Resources/icon.icns`
          );
        }

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
    gameName: string,
    gId: number,
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
                }
              });

              if (productId > 0 && amount > 0) {
                data.push({
                  buy_type: 2,
                  buy_type_text: '付费选项',
                  sales_type: 1,
                  sales_type_text: '星石',
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
                }
              });

              if (productId && typeof chapter === 'number' && amount > 0) {
                data.push({
                  chapter: chapter,
                  buy_type: 1,
                  buy_type_text: '章节付费',
                  sales_type: 1,
                  sales_type_text: '星石',
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
  sales_type: 1;
  sales_type_text: '星石';
  sales_amount: number;
  is_pay: 1;
  productId: number;
}
