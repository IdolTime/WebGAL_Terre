/* eslint-disable max-params */
import CryptoJS from 'crypto-js';

function arrayBufferToWordArray(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const words = [];
  for (let i = 0; i < uint8Array.length; i += 4) {
    words.push((uint8Array[i] << 24) | (uint8Array[i + 1] << 16) | (uint8Array[i + 2] << 8) | uint8Array[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(words, uint8Array.length);
}

async function decryptChunk(encryptedChunk, key, iv) {
  const encryptedWordArray = arrayBufferToWordArray(encryptedChunk);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedWordArray }, key, { iv });

  const decryptedData = new Uint8Array(decrypted.sigBytes);
  for (let i = 0; i < decrypted.sigBytes; i++) {
    decryptedData[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return decryptedData;
}

// eslint-disable-next-line max-params
export async function decryptVideoInChunks(encryptedData, key, iv, type, chunkSize = 16 * 1024 * 1024) {
  const keyHex = CryptoJS.enc.Hex.parse(key);
  const ivHex = CryptoJS.enc.Hex.parse(iv);

  const totalChunks = Math.ceil(encryptedData.byteLength / chunkSize);
  const decryptedChunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkStart = i * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, encryptedData.byteLength);
    const encryptedChunk = encryptedData.slice(chunkStart, chunkEnd);

    const decryptedChunk = await decryptChunk(encryptedChunk, keyHex, ivHex);
    decryptedChunks.push(decryptedChunk);
  }

  const totalDecryptedLength = decryptedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const decryptedData = new Uint8Array(totalDecryptedLength);

  let offset = 0;
  for (const chunk of decryptedChunks) {
    decryptedData.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([decryptedData], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

// eslint-disable-next-line max-params
export async function decryptVideo(encryptedData, key, iv, type) {
  const algorithm = { name: 'AES-CBC', iv: iv };
  const cryptoKey = await crypto.subtle.importKey('raw', key, algorithm, false, ['decrypt']);
  const decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedData);
  return new Blob([new Uint8Array(decryptedData)], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

self.onmessage = async function (event) {
  const { encryptedData, key, iv, type, supportCrypto } = event.data;
  let videoBlob;

  try {
    if (supportCrypto) {
      videoBlob = await decryptVideo(encryptedData, key, iv, type);
    } else {
      videoBlob = await decryptVideoInChunks(encryptedData, key, iv, type);
    }
  } catch (error) {
    self.postMessage({ errorMessage: '视频加载失败', error });
  }

  self.postMessage({ blobData: videoBlob });
};
