/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { dirname, extname, join } from 'path';
import { createHash } from 'crypto';
import { existsSync } from 'fs';

export interface IFileInfo {
  name: string;
  isDir: boolean;
  extName: string;
  path: string;
}

export interface IUploadFileInfo {
  fileName: string;
  file: Buffer;
}

interface FileList {
  fileName: string;
  file: Buffer;
}

//TODO：安全性问题：访问文件系统前检查是否访问的是进程所在路径下。

@Injectable()
export class WebgalFsService {
  constructor(private readonly logger: ConsoleLogger) {}

  greet() {
    this.logger.log('Welcome to WebGAl Files System Service!');
  }

  /**
   * 获取目录下文件信息
   * @param dir 目录，需用 path 处理。
   */
  async getDirInfo(_dir: string) {
    const dir = decodeURI(_dir);
    const fileNames = await fs.readdir(dir);
    const dirInfoPromises = fileNames.map((e) => {
      const elementPath = this.getPath(`${dir}/${e}`);
      return new Promise((resolve) => {
        fs.stat(elementPath).then((result) => {
          const ret: IFileInfo = {
            name: e,
            isDir: result.isDirectory(),
            extName: extname(elementPath),
            path: elementPath,
          };
          resolve(ret);
        });
      });
    });
    return await Promise.all(dirInfoPromises);
  }

  /**
   * 复制（递归复制），路径需使用 path 处理。
   * @param src 源文件夹
   * @param dest 目标文件夹
   */
  async copy(src: string, dest: string) {
    return await fs.cp(decodeURI(src), decodeURI(dest), { recursive: true });
  }

  /**
   * 将字符串路径解析，根目录是进程运行目录
   * @param rawPath 字符串路径
   */
  getPathFromRoot(rawPath: string) {
    return join(process.cwd(), ...decodeURI(rawPath).split('/'));
  }

  /**
   * 新建文件夹
   * @param src 文件夹建立目录，必须用 path 处理过。
   * @param dirName 文件夹名称
   */
  async mkdir(src, dirName) {
    return await fs
      .mkdir(join(decodeURI(src), decodeURI(dirName)))
      .catch(() => {
        this.logger.log('跳过文件夹创建');
      });
  }

  /**
   * 将字符串路径解析
   * @param rawPath 字符串路径
   */
  getPath(_rawPath: string) {
    const rawPath = decodeURI(_rawPath);
    if (rawPath[0] === '/') {
      return join('/', ...rawPath.split('/'));
    }
    return join(...rawPath.split('/'));
  }

  /**
   * 对文件进行重命名
   * @param path 文件原路径
   * @param newName 新文件名
   */
  async renameFile(path: string, newName: string) {
    // 取出旧文件的路径
    const oldPath = join(...decodeURI(path).split(/[\/\\]/g));
    const pathAsArray = path.split(/[\/\\]/g);
    const newPathAsArray = pathAsArray.slice(0, pathAsArray.length - 1);
    const newPath = join(...newPathAsArray, decodeURI(newName));

    return await new Promise((resolve) => {
      fs.rename(oldPath, newPath)
        .then(() => resolve('File renamed!'))
        .catch(() => resolve('File not exist!'));
    });
  }

  /**
   * 删除文件
   * @param path 文件路径
   */
  async deleteFile(path: string) {
    return await new Promise((resolve) => {
      this.logger.log(path);
      fs.unlink(decodeURI(path))
        .then(() => resolve('File Deleted'))
        .catch(() => resolve('File not exist!'));
    });
  }

  /**
   * 删除文件或目录
   * @param path
   */
  async deleteFileOrDirectory(_path: string): Promise<boolean> {
    try {
      const path = decodeURI(_path);

      const stat = await fs.stat(path);

      if (stat.isDirectory()) {
        const files = await fs.readdir(path);
        await Promise.all(
          files.map(async (file) => {
            const filePath = `${path}/${file}`;
            await this.deleteFileOrDirectory(filePath);
          }),
        );
        await fs.rmdir(path);
      } else {
        await fs.unlink(path);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 重命名文件或目录
   * @param path
   * @param newName
   */
  async renameFileOrDirectory(
    _path: string,
    newName: string,
  ): Promise<boolean> {
    try {
      const path = decodeURI(_path);

      const dir = path.substr(0, path.lastIndexOf('/') + 1);
      const newPath = dir + decodeURI(newName);

      await fs.rename(path, newPath);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(_path: string): Promise<boolean> {
    const path = decodeURI(_path);

    return await fs
      .stat(path)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * 检查文件夹是否存在
   * @param path 文件夹路径
   * @returns
   */
  async existsDir(path: string): Promise<boolean> {
    return await fs
      .stat(path)
      .then((stats) => stats.isDirectory())
      .catch(() => false);
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns
   */
  async existsFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isFile(); // 检查路径是否为文件
    } catch (error) {
      return false; // 如果发生错误，通常是文件不存在
    }
  }

  /**
   * 创建一个空文件
   * @param path 文件路径
   */
  async createEmptyFile(path: string) {
    return await new Promise<string>((resolve) => {
      fs.writeFile(decodeURI(path), '')
        .then(() => resolve('created'))
        .catch(() => resolve('path error or no right.'));
    });
  }

  async updateTextFile(path: string, content: string) {
    return await new Promise((resolve) => {
      fs.writeFile(decodeURI(path), content)
        .then(() => resolve('Updated.'))
        .catch(() => resolve('path error or no right.'));
    });
  }
  /**
   * 替换文本文件中的文本
   * @param path 文件路径
   * @param text 要替换的文本
   * @param newText 替换后的文本
   */
  async replaceTextFile(
    _path: string,
    text: string | string[],
    newText: string | string[],
  ) {
    try {
      const path = decodeURI(_path);

      const textFile: string | unknown = await this.readTextFile(path);

      if (typeof textFile === 'string') {
        let newTextFile: string = textFile;
        if (typeof text === 'string' && typeof newText === 'string') {
          newTextFile = newTextFile.replace(new RegExp(text, 'g'), newText);
        } else if (typeof text === 'object' && typeof newText === 'string') {
          text.map((item) => {
            newTextFile = newTextFile.replace(new RegExp(item, 'g'), newText);
          });
        } else if (
          typeof text === 'object' &&
          typeof newText === 'object' &&
          text.length === newText.length
        ) {
          text.map((item, index) => {
            newTextFile = newTextFile.replace(
              new RegExp(item, 'g'),
              newText[index],
            );
          });
        } else return false;

        return await new Promise((resolve) => {
          fs.writeFile(path, newTextFile)
            .then(() => resolve('Replaced.'))
            .catch(() => resolve('Path error or no text'));
        });
      } else return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取文本文件
   * @param path 要读取的文本文件路径
   */
  async readTextFile(path: string): Promise<string> {
    return await new Promise((resolve) => {
      fs.readFile(decodeURI(path))
        .then((r) => resolve(r.toString()))
        .catch(() => resolve('file not exist'));
    });
  }

  async writeFiles(
    _targetDirectory: string,
    fileList: FileList[],
  ): Promise<boolean> {
    try {
      const targetDirectory = decodeURI(_targetDirectory);
      await fs.mkdir(this.getPathFromRoot(targetDirectory), {
        recursive: true,
      });
      for (const file of fileList) {
        await fs.writeFile(
          `${this.getPathFromRoot(targetDirectory)}/${decodeURI(
            file.fileName,
          )}`,
          file.file,
        );
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * 替换图标文件
   * @param newIconPath 要写入的图标文件路径
   * @param oldIconPath 读取的图标文件路径
   */
  async replaceIconFile(newIconPath, oldIconPath) {
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

  async writeJSONFile(path: string, data: any) {
    return await new Promise((resolve) => {
      fs.writeFile(decodeURI(path), JSON.stringify(data))
        .then(() => resolve('Created.'))
        .catch(() => resolve('Path error or no right.'));
    });
  }

  async readJSONFile(path: string) {
    return await new Promise((resolve) => {
      fs.readFile(decodeURI(path))
        .then((r) => resolve(JSON.parse(r.toString())))
        .catch(() => resolve('file not exist'));
    });
  }

  async copyDirAsync(src, dest) {
    try {
      // Create the destination directory if it doesn't exist
      await fs.mkdir(dest, { recursive: true });

      // Read the contents of the source directory
      const entries = await fs.readdir(src, { withFileTypes: true });

      // Iterate over each item in the source directory
      for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
          // Recursively copy sub-directories
          await this.copyDirAsync(srcPath, destPath);
        } else {
          // Copy files
          await fs.copyFile(srcPath, destPath);
        }
      }
    } catch (err) {
      console.error('Error copying directory:', err);
    }
  }

  // 计算文件的哈希值
  async calculateFileHash(filePath: string) {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // 递归遍历目录，生成包含文件路径和哈希值的对象
  async generateHashForDirectory(directoryPath: string, relativePath = '') {
    const hashData: Record<string, string> = {};
    const items = await fs.readdir(directoryPath);

    const ignoreFiles = {
      '.DS_Store': true,
      'hash.json': true,
    };

    for (const item of items) {
      if (ignoreFiles[item]) continue;
      const itemPath = join(directoryPath, item);
      const stats = await fs.stat(itemPath);
      const itemRelativePath = join(relativePath, item); // 文件的相对路径

      if (stats.isFile()) {
        const fileHash = await this.calculateFileHash(itemPath);
        hashData[itemRelativePath] = fileHash; // 使用相对路径作为 key
      } else if (stats.isDirectory()) {
        // 递归处理子目录
        const subDirHash = await this.generateHashForDirectory(
          itemPath,
          itemRelativePath,
        );
        Object.assign(hashData, subDirHash); // 合并子目录中的文件哈希结果
      }
    }

    return hashData;
  }

  async generateHashJson(
    directoryPath: string,
    hashFilePath: string,
  ): Promise<[string[], Record<string, string>]> {
    const currentHash = await this.generateHashForDirectory(directoryPath);
    let changedFiles: string[] = [];

    if (existsSync(hashFilePath)) {
      const previousHash = JSON.parse(await fs.readFile(hashFilePath, 'utf-8'));

      // 检查哪些文件发生了变化
      changedFiles = Object.keys(currentHash).filter(
        (file) => currentHash[file] !== previousHash[file],
      );
    }

    return [changedFiles, currentHash];
  }

  // 复制文件并确保目录结构
  async copyChangedFiles(
    changedFiles: string[],
    sourceDir: string,
    targetDir: string,
  ) {
    await this.clearDirectory(targetDir);
    for (const file of changedFiles) {
      const sourceFilePath = join(sourceDir, file);
      const targetFilePath = join(targetDir, file);

      // 确保目标目录存在
      const targetDirPath = dirname(targetFilePath);
      await fs.mkdir(targetDirPath, { recursive: true });

      // 复制文件
      await fs.copyFile(sourceFilePath, targetFilePath);
      console.log(`Copied ${sourceFilePath} to ${targetFilePath}`);
    }
  }

  async clearDirectory(directoryPath: string) {
    const isExist = await existsSync(directoryPath);

    if (isExist) {
      // 删除整个目录
      await fs.rm(directoryPath, { recursive: true, force: true });
    }
  }
}
