export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.13',
  buildTime: '2024-07-16T14:04:57.485Z', // 编译时会通过 version-sync.js 自动更新
};
