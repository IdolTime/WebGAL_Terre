import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

// 设置 Authorization header
axiosInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('editor-token'); // 获取 token
  if (token) {
    config.headers = {
      ...config.headers,
      editorToken: token
    };
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const request = axiosInstance;
