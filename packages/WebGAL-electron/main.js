const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * 关闭默认菜单栏
 */
Menu.setApplicationMenu(null);

/**
 * 在应用启动前，添加硬件加速相关的命令行参数
 */
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist'); // 忽略黑名单，确保 GPU 加速被启用

/**
 * 动态读取文件并设置应用名称和 appId
 */
const configFilePath = path.join(__dirname, './public/game/config.txt');

let gameKey = 'defaultGameKey';
let gameName = 'defaultGameName';

if (fs.existsSync(configFilePath)) {
    const configData = fs.readFileSync(configFilePath, 'utf-8');

    // 使用正则表达式提取 Game_key 和 Game_name
    const gameKeyMatch = configData.match(/Game_key:(.*?);/);
    const gameNameMatch = configData.match(/Game_name:(.*?);/);

    if (gameKeyMatch && gameKeyMatch[1]) {
        gameKey = gameKeyMatch[1].trim();
    }
    if (gameNameMatch && gameNameMatch[1]) {
        gameName = gameNameMatch[1].trim();
    }
}

// 动态设置应用的名称和 appId
app.setName(gameName);
app.setAppUserModelId(`com.projectx.idoltime.${gameKey}`);  // 设置 appId

/**
 * 在应用启动后打开窗口
 */
app.whenReady().then(() => {
    createWindow();
    // 适配 Mac OS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

/**
 * 打开窗口
 */
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            webgl: true,  // 确保启用 WebGL
            hardwareAcceleration: true  // 确保启用硬件加速
        }
    });

    win.loadFile('./public/index.html').then(r => console.log(r));

    // 注册快捷键 Ctrl + F12 切换开发者工具
    globalShortcut.register("Ctrl+F12", () => {
        win.isFocused() && win.webContents.toggleDevTools();
    });

    // 注册快捷键 Cmd + Option + I 切换开发者工具 (macOS)
    globalShortcut.register("CommandOrControl+Option+I", () => {
        win.isFocused() && win.webContents.toggleDevTools();
    });
};

/**
 * 在关闭所有窗口时退出应用
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
