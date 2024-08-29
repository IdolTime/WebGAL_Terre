import { request } from './request';

export async function addGame(data: any): Promise<any> {
  return request('https://test-api.idoltime.games/author/game_add', {
    method: 'post',
    data
  });
}

export async function upload(file: File): Promise<any> {
  return request('https://test-api.idoltime.games/upload', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: {
      file
    }
  });
}

export async function getClassificationList(): Promise<any> {
  return request('https://test-api.idoltime.games/editor/classification/all_list', {
    method: 'get',
  });
}