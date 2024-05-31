import React, { useEffect, useRef } from "react";
import styles from "./resourceDisplay.module.scss";
import {JsonResourceDisplay} from "@/pages/editor/ResourceDisplay/JsonResourceDisplay/JsonResourceDisplay";
import FlvJs from "flv.js";

export enum ResourceType {
  Image = "image",
  Video = "video",
  Audio = "audio",
  Animation = "animation"
}

export interface IResourceDisplayProps {
  resourceType: ResourceType;
  resourceUrl: string;
  isHidden?: boolean;
}

// eslint-disable-next-line max-params
async function decryptVideo(encryptedData: ArrayBuffer, key: Uint8Array, iv: Uint8Array, type: 'mp4' | 'flv') {
  const algorithm = { name: 'AES-CBC', iv: iv };
  const cryptoKey = await crypto.subtle.importKey('raw', key, algorithm, false, ['decrypt']);
  const decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedData);
  return new Blob([new Uint8Array(decryptedData)], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

function ResourceComponent({ resourceType, resourceUrl }: IResourceDisplayProps) {
  const url = processResourceUrl(resourceUrl);
  const flvPlayerRef = useRef<FlvJs.Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoType = url.endsWith('.flv') ? 'flv' : 'mp4';

  useEffect(() => {
    if (resourceType !== ResourceType.Video) {
      return;
    }

    fetch(url).then((res) => {
      if (res.status > 200) {
        return null;
      }
      return res.arrayBuffer();
    }).then(async (dataBuffer) => {
      if (!dataBuffer) {
        return;
      }
      
      const marker = 'ENCRYPTED';
      const markerLength = marker.length;
      const signatureArray = new Uint8Array(dataBuffer.slice(0, markerLength));

      let isEncrypted = false;
      for (let i = 0; i < markerLength; i++) {
        if (String.fromCharCode(signatureArray[i]) !== marker[i]) {
          isEncrypted = false;
          break;
        }
        isEncrypted = true;
      }


      let videoBlob;
      if (isEncrypted) {
        const encryptedData = dataBuffer.slice(markerLength);
        const key = new Uint8Array([0x40,0xe6,0xad,0x42,0x9a,0x13,0x02,0x0a,0x07,0xbe,0x29,0x0c,0x5e,0xf1,0xd7,0xdc,0x7e,0x45,0xe5,0xc4,0xbf,0x34,0xd5,0x4a,0x56,0x64,0x28,0x26,0x27,0x94,0x6e,0x4d]);
        const iv = new Uint8Array([0x9d,0x6b,0xac,0x74,0xc6,0x4e,0xe8,0x71,0x4e,0x79,0x59,0xce,0xf7,0x52,0x71,0xd0]);
        videoBlob = await decryptVideo(encryptedData, key, iv, videoType);
      } else {
        videoBlob = new Blob([new Uint8Array(dataBuffer)], { type: `video/${videoType === 'mp4' ? 'mp4' : 'x-flv'}` });
      }

      if (FlvJs.isSupported() && videoRef.current) {
        flvPlayerRef.current = FlvJs.createPlayer({
          type: url.endsWith('.flv') ? 'flv' : 'mp4',
          url: URL.createObjectURL(videoBlob),
        });
        flvPlayerRef.current.attachMediaElement(videoRef.current);
        flvPlayerRef.current.load();
        // flvPlayerRef.current.play();
      } else if (videoRef.current) {
        videoRef.current.src = url;
      }
    });
    
    return () => {
      flvPlayerRef.current?.unload();
      flvPlayerRef.current?.detachMediaElement();
      flvPlayerRef.current?.destroy();
      flvPlayerRef.current = null;
    };
  }, []);

  switch (resourceType) {
  case ResourceType.Image:
    return <img className={styles.asset} src={url} alt="Resource"/>;
  case ResourceType.Video:
    return (
      <video ref={videoRef} className={styles.asset} controls>
        <source src={url}/>
          Your browser does not support the video tag.
      </video>
    );
  case ResourceType.Audio:
    return (
      <audio controls>
        <source src={url} type="audio/mpeg"/>
          Your browser does not support the audio tag.
      </audio>
    );
  case ResourceType.Animation:
    return <JsonResourceDisplay url={url} />;
  default:
    return <div>Invalid resource type</div>;
  }
}

const ResourceDisplay = ({resourceType, resourceUrl, isHidden = false}: IResourceDisplayProps) => {
  return (
    <div key={Math.random()} className={`${styles.resourceDisplay} ${isHidden ? styles.hidden : ""}`}>
      <ResourceComponent resourceType={resourceType} resourceUrl={resourceUrl} />
    </div>
  );
};

function processResourceUrl(url: string): string {
  // Do some processing on the resource URL here
  return extractPathAfterPublic(url);
}

export function extractPathAfterPublic(path: string): string {
  const parts = path.split(/[/\\]/);
  const publicIndex = parts.indexOf("public");

  if (publicIndex !== -1) {
    const slicedParts = parts.slice(publicIndex + 1);
    return slicedParts.join("/");
  } else {
    return "";
  }
}


export default ResourceDisplay;
