export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.5.0',
  buildTime: '2024-04-04T06:24:48.463Z', // 编译时会通过 version-sync.js 自动更新
};
