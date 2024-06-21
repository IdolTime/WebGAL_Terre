cd packages/WebGAL-electron
npm i
npm run build
cd ../terre2/assets/templates/
mkdir IdolTime_Electron_Template
cd ../../../WebGAL-electron
cp -rf build/win-unpacked/* ../../packages/terre2/assets/templates/IdolTime_Electron_Template/
