import request from './api'

export async function login(data: {
  email: string,
  password: string
  gId: number
}): Promise<any> {
  return request('/api/editorLogin', {
    method: 'POST',
    data,
  });
}

export async function getResourceList(params: {
  page: number,
  pageSize: number,
  gId: number,
  gType: string,
  resourceType: number,
  query: string
}): Promise<any> {
  return request('/api/editor/resource/list', {
    method: 'get',
    params,
  });
}

export async function getUserInfo(): Promise<any> {
  return request('/api/editor/user_info', {
    method: 'POST',
  });
}

export async function getGameDetail(data : {
  gId: number
}): Promise<any> {
  return request('/api/editor/game/detail', {
    method: 'POST',
    data
  });
}
