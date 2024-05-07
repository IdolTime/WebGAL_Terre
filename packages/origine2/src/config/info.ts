export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.13',
  buildTime: '2024-05-06T15:20:58.666Z', // 编译时会通过 version-sync.js 自动更新
};
