echo "Welcome to build IdolTime Editor, the editor of IdolTime."
# 安装依赖
yarn install --frozen-lockfile --network-timeout=300000
npm install rcedit cross-spawn-windows-exe

# 清理
rm -rf release

mkdir release

# 进入 Terre 目录
cd packages/terre2
yarn run build
yarn run pkg
cd dist
cp -r IdolTime_Editor.exe  ../../../release
rm IdolTime_Editor.exe
cd ../
mkdir Exported_Games
cp -r public assets Exported_Games ../../release
cd ../../

# 进入 Origine 目录
cd packages/origine2
yarn run build
cp -rf dist/* ../../release/public/
cd ../../

# 进入 Electron 目录
cd packages/WebGAL-electron
yarn install --frozen-lockfile
yarn run build
mkdir ../../release/assets/templates/IdolTime_Electron_Template
cp -rf build/win-unpacked/* ../../release/assets/templates/IdolTime_Electron_Template/
cd ../../

# 克隆 WebGAL Android 模板
# cd release/assets/templates/
# git clone https://github.com/nini22P/WebGAL-Android.git
# mv WebGAL-Android IdolTime_Android_Template
# MainActivity.kt 移动到主文件夹防止误删
# mv IdolTime_Android_Template/app/src/main/java/com/openwebgal/demo/MainActivity.kt IdolTime_Android_Template/app/src/main/java/MainActivity.kt
# cd ../../../

cd release

# 删除冗余文件
rm -rf Exported_Games/*
rm -rf public/games/*
rm -rf public/games/.gitkeep
rm -rf assets/templates/IdolTime_Template/game/video/*
rm -rf assets/templates/IdolTime_Template/game/video/.gitkeep
# rm -rf assets/templates/IdolTime_Android_Template/.github
# rm -rf assets/templates/IdolTime_Android_Template/.git
# rm -rf assets/templates/IdolTime_Android_Template/.gitattributes
# rm -rf assets/templates/IdolTime_Android_Template/app/src/main/assets/webgal/.gitkeep
# rm -rf assets/templates/IdolTime_Android_Template/app/src/main/java/com

echo "IdolTime Editor is now ready to be deployed."
