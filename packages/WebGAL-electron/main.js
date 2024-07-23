const {app, BrowserWindow, globalShortcut, Menu} = require('electron');
// const localforage = require('localforage');

// let isFirstRun = true;

// // 清除 keyvaluepairs 数据（如果是第一次启动的话）
// const clearLocalForageData = async () => {
//     if (isFirstRun) {
//         try {
//             await localforage.clear(); // 清除所有数据
//             console.log('LocalForage data cleared.');
//             isFirstRun = false;
//         } catch (error) {
//             console.error('Error clearing LocalForage data:', error);
//         }
//     }
// };

/**
 * 关闭默认菜单栏
 */
Menu.setApplicationMenu(null);

/**
 * 在应用启动后打开窗口
 */
app.whenReady().then(() => {
    createWindow()
    // 适配 Mac OS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

/**
 * 打开窗口
 */
const createWindow = () => {
    // await clearLocalForageData()

    const win = new BrowserWindow({
        width: 1600,
        height: 900
    })

    win.loadFile('./public/index.html').then(r => console.log(r));

    // 注册快捷键 Ctrl + F12 切换开发者工具
    globalShortcut.register("Ctrl+F12", () => {
        win.isFocused() && win.webContents.toggleDevTools();
    });
}

/**
 * 在关闭所有窗口时退出应用
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})