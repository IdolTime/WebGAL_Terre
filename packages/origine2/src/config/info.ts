export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.13',
  buildTime: '2024-08-16T07:47:09.982Z', // 编译时会通过 version-sync.js 自动更新
};
