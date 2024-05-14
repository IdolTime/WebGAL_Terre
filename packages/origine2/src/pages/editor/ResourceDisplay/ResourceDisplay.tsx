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

function ResourceComponent({ resourceType, resourceUrl }: IResourceDisplayProps) {
  const url = processResourceUrl(resourceUrl);
  const flvPlayerRef = useRef<FlvJs.Player | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (resourceType === ResourceType.Video) {
      if (FlvJs.isSupported() && videoRef.current) {
        flvPlayerRef.current = FlvJs.createPlayer({
          type: url.endsWith('.flv') ? 'flv' : 'mp4',
          url: url
        });
        flvPlayerRef.current.attachMediaElement(videoRef.current);
        flvPlayerRef.current.load();
        // flvPlayerRef.current.play();
      } else if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
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
