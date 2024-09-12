export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.13',
  buildTime: '2024-09-12T12:09:28.038Z', // 编译时会通过 version-sync.js 自动更新
};
