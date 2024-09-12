import {
  BadRequestException,
  Body,
  ConsoleLogger,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  IUploadFileInfo,
  WebgalFsService,
} from '../webgal-fs/webgal-fs.service';
import { Request } from 'express';
import { ManageGameService } from './manage-game.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LspService } from '../lsp/lsp.service';
import { createCipheriv } from 'node:crypto';
import {
  // ... (其他的导入)
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CheckGameFolderDto,
  CreateGameDto,
  CreateNewSceneDto,
  DeleteFileDto,
  DeleteFileOrDirDto,
  EditFileNameDto,
  EditSceneDto,
  EditTextFileDto,
  GameConfigDto,
  MkDirDto,
  RenameDto,
  UploadFilesDto,
  UploadGameDto,
  UploadPaymentConfigurationDto,
} from './manage-game.dto';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

@Controller('api/manageGame')
@ApiTags('Manage Game')
export class ManageGameController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageGame: ManageGameService,
    private readonly logger: ConsoleLogger,
    private readonly lspServerce: LspService,
  ) {}

  @Get('gameList')
  @Get('gameList')
  @ApiOperation({ summary: 'Retrieve game list' })
  @ApiResponse({ status: 200, description: 'Returned game list.' })
  async getGameList() {
    // 如果游戏文件夹不存在就创建
    if (!(await this.webgalFs.existsDir('public/games')))
      await this.webgalFs.mkdir('public', 'games');
    return await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot('/public/games'),
    );
  }

  @Post('syncMaterials')
  @ApiResponse({ status: 200, description: 'Returned game materials.' })
  async syncMaterials(
    @Headers('editorToken') editorToken: string,
    @Body() body: { data: { gameName: string } },
  ) {
    try {
      await this.manageGame.syncMaterials(editorToken, body.data.gameName);

      return { status: 'success' };
    } catch (error) {
      return { status: 'failed', data: null, message: error.message };
    }
  }

  @Post('createGame')
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 200, description: 'Game creation result.' })
  @ApiBody({ type: CreateGameDto, description: 'Game creation data' })
  async createGame(@Body() createGameData: CreateGameDto) {
    const createResult = await this.manageGame.createGame(
      createGameData.gameName,
      createGameData.gId,
      createGameData.localInfo,
    );
    if (createResult) {
      return { status: 'success' };
    } else {
      return { status: 'failed' }; // Note: Typo correction 'filed' -> 'failed'
    }
  }

  @Post('checkGameFolder')
  @ApiOperation({ summary: 'Check if the game folder exists' })
  @ApiResponse({ status: 200, description: 'Check result.' })
  @ApiBody({
    type: CheckGameFolderDto,
    description: 'Boolean value of the result',
  })
  async checkGameFolder(@Body() checkGameFolderData: CheckGameFolderDto) {
    const checkResult = await this.manageGame.checkGameFolder(
      checkGameFolderData.gameName,
    );
    if (checkResult) {
      return { status: 'success' };
    } else {
      return { status: 'failed' }; // Note: Typo correction 'filed' -> 'failed'
    }
  }

  @Post('uploadGame')
  @ApiOperation({ summary: 'Upload a game' })
  @ApiResponse({ status: 200, description: 'Game upload result.' })
  @ApiBody({ type: UploadGameDto, description: 'Game upload data' })
  async uploadGame(
    @Body() uploadGameData: UploadGameDto,
    @Headers('editorToken') editorToken: string,
  ) {
    try {
      const uploadResult = await this.manageGame.uploadGame(
        uploadGameData.gameName,
        uploadGameData.gId,
        editorToken,
      );
      if (uploadResult) {
        return { status: 'success', key: uploadResult };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      return { status: 'failed', message: error.message };
    }
  }

  @Get('openGameDict/:gameName') // <-- Define the route parameter using :gameName
  @ApiOperation({ summary: 'Open Game Dictionary' })
  @ApiResponse({
    status: 200,
    description: 'Opens the dictionary for a specified game.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game.',
  }) // <-- Swagger description for the route parameter
  async openGameDict(@Param('gameName') gameName: string, @Query('gId') gId) {
    // <-- Use @Param decorator to fetch the gameName
    gameName = decodeURI(gameName); // Optionally decode the URI if necessary
    this.manageGame.openGameDictionary(gameName, gId).then();
  }

  @Get('openGameAssetsDict/:gameName') // <-- Define the route parameter using :gameName
  @ApiOperation({ summary: 'Open Game Assets Dictionary' })
  @ApiResponse({
    status: 200,
    description: 'Opens the assets dictionary for a specified game.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game.',
  })
  async openGameAssetsDict(
    @Param('gameName') gameName: string,
    @Query('subFolder') subFolder: string,
  ) {
    gameName = decodeURI(gameName); // Optionally decode the URI if necessary
    this.manageGame.openAssetsDictionary(gameName, subFolder).then();
  }

  @Get('ejectGameAsWeb/:gameName') // Use :gameName to define the route parameter
  @ApiOperation({ summary: 'Eject Game As Web App' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as a web app.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as web app.',
  }) // Swagger description for the route parameter
  async ejectGameAsWeb(@Param('gameName') gameName: string) {
    // Fetch gameName using @Param decorator
    gameName = decodeURI(gameName); // Optionally decode the URI
    this.manageGame
      .exportGame(gameName, 'web')
      .then(() => this.logger.log(`${gameName} export as web app`));
  }

  @Get('ejectGameAsExe/:gameName/:gamePackageName')
  @ApiOperation({ summary: 'Eject Game As EXE' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as an EXE (Windows Electron App).',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as EXE.',
  })
  @ApiParam({
    name: 'gamePackageName',
    type: String,
    description: 'Description of the gamePackageName parameter.',
  })
  async ejectGameAsExe(
    @Param('gameName') gameName: string,
    @Param('gamePackageName') gamePackageName: string,
  ) {
    gameName = decodeURI(gameName);
    gamePackageName = decodeURI(gamePackageName);
    this.manageGame
      .exportGame(gameName, 'electron-windows', true, gamePackageName)
      .then(() => this.logger.log(`${gameName} export as exe`));
  }

  @Get('ejectGameAsAndroid/:gameName')
  @ApiOperation({ summary: 'Eject Game As Android App' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as an Android app.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as an Android app.',
  })
  async ejectGameAsAndroid(@Param('gameName') gameName: string) {
    gameName = decodeURI(gameName);
    this.manageGame
      .exportGame(gameName, 'android')
      .then(() => this.logger.log(`${gameName} export as android`));
  }

  @Get('readGameAssets/:readDirPath(*)')
  @ApiOperation({ summary: 'Read Game Assets' })
  @ApiResponse({
    status: 200,
    description: 'Retrieve the assets of the specified game directory.',
  })
  @ApiParam({
    name: 'readDirPath',
    type: String,
    description:
      'Path of the game directory to read assets from, including subdirectories.',
  })
  async readGameAssets(@Param('readDirPath') readDirPath: string) {
    readDirPath = decodeURI(readDirPath);
    const dirPath = this.webgalFs.getPathFromRoot(
      `public/games/${readDirPath}`,
    );
    const dirInfo = await this.webgalFs.getDirInfo(dirPath);
    return { readDirPath, dirPath, dirInfo };
  }

  @Post('editFileName')
  @ApiOperation({ summary: 'Edit File Name' })
  @ApiResponse({ status: 200, description: 'Successfully renamed the file.' })
  @ApiResponse({ status: 400, description: 'Failed to rename the file.' })
  @ApiBody({ type: EditFileNameDto, description: 'File renaming data' })
  async editFileName(@Body() editFileNameData: EditFileNameDto) {
    return await this.webgalFs.renameFile(
      editFileNameData.path,
      editFileNameData.newName,
    );
  }

  @Post('deleteFile')
  @ApiOperation({ summary: 'Delete File' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the file.' })
  @ApiResponse({ status: 400, description: 'Failed to delete the file.' })
  @ApiBody({ type: DeleteFileDto, description: 'File deletion data' })
  async deleteFile(@Body() deleteFileData: DeleteFileDto) {
    return await this.webgalFs.deleteFile(deleteFileData.path);
  }

  @Post('createNewScene')
  @ApiOperation({ summary: 'Create a New Scene' })
  @ApiResponse({ status: 200, description: 'Successfully created the scene.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to create the scene or scene already exists.',
  })
  @ApiBody({ type: CreateNewSceneDto, description: 'Scene creation data' })
  async createNewScene(
    @Body() createNewSceneData: CreateNewSceneDto,
  ): Promise<string | void> {
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${createNewSceneData.gameName}/game/scene/${createNewSceneData.sceneName}.txt`,
    );

    if (await this.webgalFs.exists(path)) {
      throw new BadRequestException('Scene already exists');
    }

    return this.webgalFs.createEmptyFile(path);
  }

  @Post('editScene')
  @ApiOperation({ summary: 'Edit Scene' })
  @ApiResponse({ status: 200, description: 'Scene edited successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to edit the scene.' })
  async editScene(@Body() editSceneData: EditSceneDto) {
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${editSceneData.gameName}/game/scene/${editSceneData.sceneName}`,
    );
    const sceneData = JSON.parse(editSceneData.sceneData) as { value: string };
    return this.webgalFs.updateTextFile(path, sceneData.value);
  }

  @Post('editTextFile')
  @ApiOperation({ summary: 'Edit TextFile' })
  @ApiResponse({ status: 200, description: 'File edited successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to edit the file.' })
  async editTextFile(@Body() editTextFileData: EditTextFileDto) {
    const path = editTextFileData.path;
    const filePath = this.webgalFs.getPathFromRoot(`public/${path}`);
    return this.webgalFs.updateTextFile(filePath, editTextFileData.textFile);
  }

  @Get('getGameConfig/:gameName')
  @ApiOperation({ summary: 'Get Game Configuration' })
  @ApiResponse({ status: 200, description: 'Returned game configuration.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to get the game configuration.',
  })
  async getGameConfig(@Param('gameName') gameName: string) {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${decodeURI(gameName)}/game/config.txt`,
    );
    return this.webgalFs.readTextFile(configFilePath);
  }

  @Post('setGameConfig')
  @ApiOperation({ summary: 'Set Game Configuration' })
  @ApiResponse({
    status: 200,
    description: 'Game configuration set successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to set the game configuration.',
  })
  async setGameConfig(@Body() gameConfigData: GameConfigDto) {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${gameConfigData.gameName}/game/config.txt`,
    );
    return this.webgalFs.updateTextFile(
      configFilePath,
      gameConfigData.newConfig,
    );
  }

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload Files' })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to upload files.' })
  async uploadFiles(
    @UploadedFiles() files,
    @Body() uploadFilesDto: UploadFilesDto,
  ) {
    const algorithm = 'aes-256-cbc';
    const hexKey =
      '40e6ad429a13020a07be290c5ef1d7dc7e45e5c4bf34d54a5664282627946e4d';
    const hexValue = '9d6bac74c64ee8714e7959cef75271d0';
    const key = Buffer.from(hexKey, 'hex');
    const iv = Buffer.from(hexValue, 'hex');
    const marker = 'ENCRYPTED';

    // Encrypt video data
    const encryptFile = (fileBuffer: Buffer) => {
      const cipher = createCipheriv(algorithm, key, iv);
      const encryptedBuffer = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final(),
      ]);
      const markerBuffer = Buffer.from(marker);
      return Buffer.concat([markerBuffer, encryptedBuffer]);
    };

    // 确保目标目录存在，如果不存在则创建它
    const targetDirectory = uploadFilesDto.targetDirectory;
    if (!existsSync(targetDirectory)) {
      mkdirSync(targetDirectory, { recursive: true });
    } else if (uploadFilesDto.clearTargetDirectory) {
      rmSync(targetDirectory, { recursive: true, force: true });
      mkdirSync(targetDirectory, { recursive: true });
    }

    const fileInfos: IUploadFileInfo[] = files.map((file) => {
      let encryptedFile = file.buffer;
      const encryptedFileFormat = ['.mp4', '.flv', '.webm', '.ogv'];
      const shouldEncrptFile = encryptedFileFormat.some((f) =>
        file.originalname.toLowerCase().endsWith(f),
      );

      if (shouldEncrptFile) {
        encryptedFile = encryptFile(file.buffer);
      }

      return { fileName: file.originalname, file: encryptedFile };
    });

    return this.webgalFs.writeFiles(targetDirectory, fileInfos);
  }

  @Post('mkdir')
  @ApiOperation({ summary: 'Create Directory' })
  @ApiResponse({ status: 200, description: 'Directory created successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to create directory.' })
  async mkDir(@Body() fileOperationDto: MkDirDto) {
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot(fileOperationDto.source),
      fileOperationDto.name,
    );
    return true;
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete File or Directory' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the file or directory.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete the file or directory.',
  })
  async deleteFileOrDir(@Body() fileOperationDto: DeleteFileOrDirDto) {
    return this.webgalFs.deleteFileOrDirectory(
      this.webgalFs.getPathFromRoot(fileOperationDto.source),
    );
  }

  @Post('rename')
  @ApiOperation({ summary: 'Rename File or Directory' })
  @ApiResponse({
    status: 200,
    description: 'Successfully renamed the file or directory.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to rename the file or directory.',
  })
  async rename(@Body() fileOperationDto: RenameDto) {
    return this.webgalFs.renameFile(
      this.webgalFs.getPathFromRoot(fileOperationDto.source),
      fileOperationDto.newName,
    );
  }

  @Post('updatePaymentConfig')
  @ApiOperation({ summary: 'Update Payment Configuration' })
  @ApiResponse({
    status: 200,
    description: 'Payment configuration updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update payment configuration.',
  })
  async updatePaymentConfig(
    @Body() paymentConfigData: UploadPaymentConfigurationDto,
    @Headers('editorToken') editorToken: string,
  ) {
    return this.manageGame.uploadGamePaymentConfig(
      paymentConfigData.gameName,
      paymentConfigData.gId,
      editorToken,
    );
  }
}
