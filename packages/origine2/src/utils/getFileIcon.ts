import imageIcon from "material-icon-theme/icons/image.svg";
import audioIcon from "material-icon-theme/icons/audio.svg";
import videoIcon from "material-icon-theme/icons/video.svg";
import jsonIcon from "material-icon-theme/icons/json.svg";
import textIcon from "material-icon-theme/icons/document.svg";
import fontIcon from "material-icon-theme/icons/font.svg";
import folderImageIcon from 'material-icon-theme/icons/folder-images.svg';
import folderAudioIcon from 'material-icon-theme/icons/folder-audio.svg';
import folderVideoIcon from 'material-icon-theme/icons/folder-video.svg';
import folderJsonIcon from 'material-icon-theme/icons/folder-json.svg';
import folderTextIcon from 'material-icon-theme/icons/folder-docs.svg';
import folderFontIcon from 'material-icon-theme/icons/folder-font.svg';
import folderIcon from 'material-icon-theme/icons/folder.svg';

type FileType = "image" | "video" | "text" | "audio" | "json" | 'font' | "unknown";

export function extractExtension(filename: string): FileType {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "unknown";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExtensions = ["mp4", "webm", "ogg", "flv"];
  const audioExtensions = ["wav", "mp3", "ogg"];

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else if (audioExtensions.includes(extension)) {
    return "audio";
  } else if (extension === "txt") {
    return "text";
  } else if (extension === "json") {
    return "json";
  } else {
    return "unknown";
  }
}

export function getFileIcon(filename: string) {
  const filetype = extractExtension(filename);
  switch (filetype) {
  case "image":
    return imageIcon;
  case "audio":
    return audioIcon;
  case "video":
    return videoIcon;
  case "json" :
    return jsonIcon;
  case "text":
    return textIcon;
  case "font":
    return fontIcon;
  default:
    return textIcon;
  }
}

// Build the mapping
const fileMappings = new Map<string, FileType>();
fileMappings.set("animation", "json");
fileMappings.set("background", "image");
fileMappings.set("bgm", "audio");
fileMappings.set("figure", "image");
fileMappings.set("scene", "text");
fileMappings.set("tex", "image");
fileMappings.set("video", "video");
fileMappings.set("vocal", "audio");
fileMappings.set("ui", "image");
fileMappings.set("image", "image");
fileMappings.set("font", "font");

// The function
function getFileType(path: string): FileType {
  const splitPath = path.split(/[/\\]/); // handle both '/' and '\'
  const fileName = splitPath[splitPath.length - 1]; // get the last segment
  const fileType = fileMappings.get(fileName);
  return fileType ? fileType : "unknown";
}

export function getDirIcon(dirName:string){
  const filetype = getFileType(dirName);
  switch (filetype) {
  case "image":
    return folderImageIcon;
  case "audio":
    return folderAudioIcon;
  case "video":
    return folderVideoIcon;
  case "json" :
    return folderJsonIcon;
  case "text":
    return folderTextIcon;
  case "font":
    return folderFontIcon;
  default:
    return folderIcon;
  }
}
