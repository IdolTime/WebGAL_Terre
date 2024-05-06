export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.13',
  buildTime: '2024-05-06T07:51:36.023Z', // 编译时会通过 version-sync.js 自动更新
};
