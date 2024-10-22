import { OggVorbisDecoder } from '@wasm-audio-decoders/ogg-vorbis';
import { OggOpusDecoder } from 'ogg-opus-decoder';

self.onmessage = async function (e) {
  const { url, arrayBuffer } = e.data;

  try {
    self.postMessage({ message: '尝试使用 Opus 解码' });
    // 尝试使用 Opus 解码
    const uint8BufferArray = new Uint8Array(arrayBuffer);
    const audioData = await decodeOpus(uint8BufferArray);
    self.postMessage({ audioData });
  } catch (error) {
    // Opus 解码失败，尝试使用 Vorbis 解码
    self.postMessage({ message: 'Opus 解码失败：' + error.message });
    try {
      const uint8BufferArray = new Uint8Array(arrayBuffer);
      const audioData = await decodeVorbis(uint8BufferArray);
      self.postMessage({ audioData });
    } catch (error) {
      self.postMessage({ errorMessage: 'Vorbis 解码失败，无法获取音频', error });
    }
  }
};

async function decodeVorbis(arrayBuffer) {
  const decoder = new OggVorbisDecoder();
  await decoder.ready;
  const audioData = await decoder.decode(arrayBuffer);
  return audioData;
}

async function decodeOpus(arrayBuffer) {
  const decoder = new OggOpusDecoder();
  await decoder.ready;
  const audioData = await decoder.decode(arrayBuffer);
  return audioData;
}
