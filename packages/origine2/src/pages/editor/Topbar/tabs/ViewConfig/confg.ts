export interface IStyleConfig {
  x?: {
    type: 'number';
    label: string;
  };
  y?: {
    type: 'number';
    label: string;
  };
  scale?: {
    type: 'number';
    label: string;
  };
  fontSize?: {
    type: 'number';
    label: string;
  };
  fontColor?: {
    type: 'color';
    label: string;
  };
  image?: {
    type: 'image';
    label: string;
  };
  width?: {
    type: 'number';
    label: string;
  };
  height?: {
    type: 'number';
    label: string;
  };
  marginLeft?: {
    type: 'number';
    label: string;
  };
  marginRight?: {
    type: 'number';
    label: string;
  };
  gap?: {
    type: 'number';
    label: string;
  };
  rowGap?: {
    type: 'number';
    label: string;
  };
  columnGap?: {
    type: 'number';
    label: string;
  };
  alignPosition?: {
    type: 'string';
    label: string;
  };
}

export const defaultStyle: IStyleConfig = {
  x: {
    type: 'number',
    label: 'x',
  },
  y: {
    type: 'number',
    label: 'y',
  },
  scale: {
    type: 'number',
    label: '缩放',
  },
  fontSize: {
    type: 'number',
    label: '字体大小',
  },
  fontColor: {
    type: 'color',
    label: '字体颜色',
  },
  image: {
    type: 'image',
    label: '图片',
  },
  width: {
    type: 'number',
    label: '宽度',
  },
  height: {
    type: 'number',
    label: '高度',
  },
};

export interface InfoConfig {
  name: {
    type: 'string';
    label: string;
  };
  height: {
    type: 'number';
    label: string;
  };
  weight: {
    type: 'number';
    label: string;
  };
  bustSize: {
    type: 'number';
    label: string;
  };
  waistSize: {
    type: 'number';
    label: string;
  };
  hipSize: {
    type: 'number';
    label: string;
  };
  description: {
    type: 'string';
    label: string;
  };
  image: {
    type: 'string';
    label: '图片'
  };
}

export const defaultInfo: InfoConfig = {
  name: {
    type: 'string',
    label: '名字'
  },
  height: {
    type: 'number',
    label: '身高'
  },
  weight: {
    type: 'number',
    label: '体重'
  },
  bustSize: {
    type: 'number',
    label: '胸围'
  },
  waistSize: {
    type: 'number',
    label: '腰围'
  },
  hipSize: {
    type: 'number',
    label: '臀围'
  },
  description: {
    type: 'string',
    label: '描述'
  },
  image: {
    type: 'string',
    label: '图片'
  }
};

export interface ICollectionImages {
  img1: {
    type: 'string';
    label: string;
  },
  img2: {
    type: 'string';
    label: string;
  },
  img3: {
    type: 'string';
    label: string;
  },
  img4: {
    type: 'string';
    label: string;
  },
  img5: {
    type: 'string';
    label: string;
  },
  img6: {
    type: 'string';
    label: string;
  },
  img7: {
    type: 'string';
    label: string;
  },
  img8: {
    type: 'string';
    label: string;
  },
  img9: {
    type: 'string';
    label: string;
  },
  img10: {
    type: 'string';
    label: string;
  }
}

export const defaultCollectionImages: ICollectionImages = {
  img1: {
    type: 'string',
    label: '图片1'
  },
  img2: {
    type: 'string',
    label: '图片2'
  },
  img3: {
    type: 'string',
    label: '图片3'
  },
  img4: {
    type: 'string',
    label: '图片4'
  },
  img5: {
    type: 'string',
    label: '图片5'
  },
  img6: {
    type: 'string',
    label: '图片6'
  },
  img7: {
    type: 'string',
    label: '图片7'
  },
  img8: {
    type: 'string',
    label: '图片8'
  },
  img9: {
    type: 'string',
    label: '图片9'
  },
  img10: {
    type: 'string',
    label: '图片10'
  }
};

export const defaultCollectionVideos = {
  video1: {
    type: 'string',
    label: '视频1'
  },
  video2: {
    type: 'string',
    label: '视频2'
  },
  video3: {
    type: 'string',
    label: '视频3'
  },
  video4: {
    type: 'string',
    label: '视频4'
  },
  video5: {
    type: 'string',
    label: '视频5'
  },
  video6: {
    type: 'string',
    label: '视频6'
  },
  video7: {
    type: 'string',
    label: '视频7'
  },
  video8: {
    type: 'string',
    label: '视频8'
  },
  video9: {
    type: 'string',
    label: '视频9',
  },
  video10: {
    type: 'string',
    label: '视频10',
  }
};

export interface IBtnSoundConfig {
  clickSound?: {
    type: 'string';
    label: string;
  };
  hoverSound?: {
    type: 'string';
    label: string;
  }
}

export interface IBtnLink {
  link: {
    type: 'string';
    label: string;
  };
}

export const defaultBtnLinkConfig: IBtnLink = {
  link: {
    type: 'string',
    label: '链接'
  }
}


export const defaultBtnSoundConfig: IBtnSoundConfig  = {
  clickSound: {
    type: 'string',
    label: '点击音效'
  },
  // hoverSound: {
  //   type: 'string',
  //   label: '悬停音效'
  // }
};

export const alignPositionOptions = [
  { name: '顶部对齐', value: 'top-center' },
  { name: '底部对齐', value: 'bottom-center' }
];

export interface IStyleConfigArr {
  label: string;
  style: IStyleConfig;
  key: string;
  info?: InfoConfig;
  images?: ICollectionImages;
  videos?: typeof defaultCollectionVideos;
  btnSound?: IBtnSoundConfig;
  buttonLink?: IBtnLink;
}