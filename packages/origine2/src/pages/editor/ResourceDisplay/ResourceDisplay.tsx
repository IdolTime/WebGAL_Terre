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

function getComponent(resourceType: ResourceType, resourceUrl: string) {
  const url = processResourceUrl(resourceUrl);
  const flvPlayerRef = useRef<FlvJs.Player | null>(null);

  useEffect(() => {
    if (resourceType === ResourceType.Video) {
      const videoElement = document.getElementById("videoElement") as HTMLVideoElement;
      
      if (FlvJs.isSupported() && videoElement) {
        flvPlayerRef.current = FlvJs.createPlayer({
          type: url.endsWith('.flv') ? 'flv' : 'mp4',
          url: url
        });
        flvPlayerRef.current.attachMediaElement(videoElement);
        flvPlayerRef.current.load();
        // flvPlayerRef.current.play();
      } else {
        videoElement.src = url;
      }
    }
  }, []);

  switch (resourceType) {
  case ResourceType.Image:
    return () => <img className={styles.asset} src={url} alt="Resource"/>;
  case ResourceType.Video:
    return () => (
      <video id="videoElement" className={styles.asset} controls>
        <source src={url} type="video/mp4"/>
          Your browser does not support the video tag.
      </video>
    );
  case ResourceType.Audio:
    return () => (
      <audio controls>
        <source src={url} type="audio/mpeg"/>
          Your browser does not support the audio tag.
      </audio>
    );
  case ResourceType.Animation:
    return () => <JsonResourceDisplay url={url} />;
  default:
    return () => <div>Invalid resource type</div>;
  }
}

const ResourceDisplay: React.FC<IResourceDisplayProps> = ({resourceType, resourceUrl, isHidden = false}) => {
  const Component = getComponent(resourceType, resourceUrl);

  return (
    <div className={`${styles.resourceDisplay} ${isHidden ? styles.hidden : ""}`}>
      <Component/>
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
