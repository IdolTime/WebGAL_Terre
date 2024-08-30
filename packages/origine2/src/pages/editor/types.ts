import { InfoConfig, ICollectionImages, defaultCollectionVideos } from '@/pages/editor/Topbar/tabs/ViewConfig/confg'


export enum TitleSceneButtonKey {
  Game_start_button = 'Game_start_button', // 开始
  Game_achievement_button = 'Game_achievement_button', // 成就
  Game_storyline_button = 'Game_storyline_button', // 故事线
  Game_extra_button = 'Game_extra_button', // bgm和图片收藏
  Game_collection_button = 'Game_collection_button', // 图鉴
  Game_option_button = 'Game_option_button', // 设置
  Game_load_button = 'Game_load_button', // 读取
  Game_continue_button = 'Game_continue_button', // 继续游戏
}

export interface UIItemConfig {
  label: string;
  type?: 'image' | 'text' | 'container' | 'placeholder' | 'bgm' | 'bg' | 'video';
  hasHoverStyle?: boolean;
  hasXY?: boolean;
  hasWidthHeight?: boolean;
  hasText?: boolean;
  positionType?: 'absolute' | 'relative';
  customStyle?: {
    marginLeft?: {
      type: 'number',
      label: string,
    };
    marginRight?: {
      type: 'number',
      label: string,
    },
    columnGap?: {
      type: 'number',
      label: string,
    },
    rowGap?: {
      type: 'number',
      label: string,
    },
    gap?: {
      type: 'number',
      label: string,
    },
    alignPosition?: {
      type: 'string',
      label: string,
    }
  },
  info?: InfoConfig,
  images?: ICollectionImages
}

export enum IndicatorItemKey {
  indicatorLeft = 'indicatorLeft',
  indicatorRight = 'indicatorRight',
  indicator = 'indicator',
}

export enum CommonItemKey {
  content = 'content',
  background = 'background',
  extra = 'extra',
  collectionInfoTitle = 'collection_info_title',
  collectionInfoList = 'collection_info_list',
}

export enum SliderItemKey {
  slider = 'slider',
  sliderBg = 'sliderBg',
  sliderThumb = 'sliderThumb',
}

export enum collectionItemInfoKey {
  collectionInfo = 'collection_info',
  collectionImages = 'collection_images',
  collectionVideos = 'collection_videos'
}
export interface CollectionItemKey {
  key: AllKey;
  content: "";
  args: {
    hide: boolean;
    style?: Style;
    info?: InfoConfig;
    images?: ICollectionImages;
    videos?: typeof defaultCollectionVideos;
  }
}

export interface ContainerItem {
  key: AllKey;
  content: "";
  args: {
    hide: boolean;
    style?: Style;
    hoverStyle?: Style;
    contentStyle?: Style;
    contentHoverStyle?: Style;
    backgroundStyle?: Style;
    backgroundHoverStyle?: Style;
    extraStyle?: Style;
    extraHoverStyle?: Style;
  }
}

export interface SliderContainerItem {
  key: AllKey;
  content: "";
  args: {
    hide: boolean;
    style?: Style;
    sliderStyle?: Style;
    sliderBgStyle?: Style;
    sliderThumbStyle?: Style;
  }
}

export interface IndicatorContainerItem {
  key: AllKey;
  content: "";
  args: {
    hide: boolean;
    style?: Style;
    indicatorStyle?: Style;
    indicatorHoverStyle?: Style;
    indicatorLeftStyle?: Style;
    indicatorLeftHoverStyle?: Style;
    indicatorRightStyle?: Style;
    indicatorRightHoverStyle?: Style;
  }
}

export const titleSceneButtonConfig: Record<TitleSceneButtonKey, UIItemConfig> = {
  [TitleSceneButtonKey.Game_start_button]: {
    hasHoverStyle: true,
    label: '开始游戏',
    positionType: 'absolute'
  },
  [TitleSceneButtonKey.Game_achievement_button]: {
    hasHoverStyle: true,
    label: '成就',
  },
  [TitleSceneButtonKey.Game_storyline_button]: {
    hasHoverStyle: true,
    label: '故事线',
  },
  [TitleSceneButtonKey.Game_extra_button]: {
    hasHoverStyle: true,
    label: '鉴赏',
  },
  [TitleSceneButtonKey.Game_collection_button]: {
    hasHoverStyle: true,
    label: '图鉴',
  },
  [TitleSceneButtonKey.Game_option_button]: {
    hasHoverStyle: true,
    label: '设置',
  },
  [TitleSceneButtonKey.Game_load_button]: {
    hasHoverStyle: true,
    label: '读取存档',
  },
  [TitleSceneButtonKey.Game_continue_button]: {
    hasHoverStyle: true,
    label: '继续游戏',
  },
};

export enum LoadSceneButtonKey {
  Load_back_button = 'Load_back_button',
}

export const loadSceneButtonConfig: Record<LoadSceneButtonKey, UIItemConfig & { children?: Record<string, UIItemConfig> }> = {
  [LoadSceneButtonKey.Load_back_button]: {
    hasHoverStyle: true,
    label: '返回',
  },
};

export enum StorylineSceneButtonKey {
  Storyline_back_button = 'Storyline_back_button',
}

export const storylineSceneButtonConfig: Record<StorylineSceneButtonKey, UIItemConfig> = {
  [StorylineSceneButtonKey.Storyline_back_button]: {
    hasHoverStyle: true,
    label: '返回',
  },
};

export enum AchievementSceneButtonKey {
  Achievement_back_button = 'Achievement_back_button',
}


export const achievementSceneButtonConfig: Record<AchievementSceneButtonKey, UIItemConfig> = {
  [AchievementSceneButtonKey.Achievement_back_button]: {
    label: '返回',
  },
};

export enum ExtraSceneButtonKey {
  Extra_back_button = 'Extra_back_button',
  Extra_bgm_button = 'Extra_bgm_button',
  Extra_video_button = 'Extra_video_button',
}

export const extraSceneButtonConfig: Record<ExtraSceneButtonKey, UIItemConfig> = {
  [ExtraSceneButtonKey.Extra_back_button]: {
    label: '返回',
  },
  [ExtraSceneButtonKey.Extra_bgm_button]: {
    label: '切换BGM标签',
  },
  [ExtraSceneButtonKey.Extra_video_button]: {
    label: '切换VIDEO标签',
  },
};

export enum ExtraSceneOtherKey {
  Extra_title = 'Extra_title',
  Extra_bg = 'Extra_bg',
  Extra_bgm_locked_item_bg = 'Extra_bgm_locked_item_bg',
  Extra_bgm_unlocked_item = 'Extra_bgm_unlocked_item',
  Extra_video_unlocked_item = 'Extra_video_unlocked_item',
  Extra_indicator = 'Extra_indicator',
  Extra_video_locked_item_bg = 'Extra_video_locked_item_bg',
}

export const extraSceneOtherConfig: Record<ExtraSceneOtherKey, UIItemConfig & {
  children?: { [key: string]: UIItemConfig }
}> = {
  [ExtraSceneOtherKey.Extra_title]: {
    label: '标题',
  },
  [ExtraSceneOtherKey.Extra_bg]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: {
    label: '未解锁BGM元素背景',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      columnGap: {
        type: 'number',
        label: '列间距',
      },
      rowGap: {
        type: 'number',
        label: '行间距',
      },
    },
  },
  [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: {
    type: 'container',
    label: '已解锁BGM元素',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      columnGap: {
        type: 'number',
        label: '列间距',
      },
      rowGap: {
        type: 'number',
        label: '行间距',
      },
    },
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '已解锁bgm文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: 'bgm元素背景',
      },
      [CommonItemKey.extra]: {
        type: 'image',
        hasText: false,
        label: '播放按钮',
      },
    }
  },
  [ExtraSceneOtherKey.Extra_video_unlocked_item]: {
    type: 'container',
    label: '已解锁VIDEO元素',
    hasXY: false,
    hasHoverStyle: false,
    children: {
      [CommonItemKey.content]: {
        type: 'placeholder',
        label: '已解锁video图片元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: 'video元素背景',
      },
    }
  },
  [ExtraSceneOtherKey.Extra_video_locked_item_bg]: {
    label: '未解锁VIDEO元素背景',
    hasXY: false,
    hasHoverStyle: false,
  },
  [ExtraSceneOtherKey.Extra_indicator]: {
    type: 'container',
    label: '翻页指示器',
    hasHoverStyle: false,
    hasWidthHeight: false,
    customStyle: {
      alignPosition: {
        type: 'string',
        label: '对齐方式',
      }
    },
    children: {
      [IndicatorItemKey.indicatorLeft]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向左翻页',
        customStyle: {
          marginRight: {
            type: 'number',
            label: '右边距',
          },
        }
      },
      [IndicatorItemKey.indicatorRight]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向右翻页',
        customStyle: {
          marginLeft: {
            type: 'number',
            label: '左边距',
          },
        }
      },
      [IndicatorItemKey.indicator]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '指示器',
        customStyle: {
          gap: {
            type: 'number',
            label: '间隔',
          },
        },
      },
    }
  },
};

export enum OptionSceneButtonKey {
  Option_back_button = 'Option_back_button',
}

export const optionSceneButtonConfig: Record<OptionSceneButtonKey, UIItemConfig> = {
  [OptionSceneButtonKey.Option_back_button]: {
    label: '返回',
  },
};

export enum CollectionSceneButtonKey {
  Collection_back_button = 'Collection_back_button',
  Collection_detail_dialog_prev_button = 'Collection_detail_dialog_prev_button',
  Collection_detail_dialog_next_button = 'Collection_detail_dialog_next_button'
}

export enum CollectionSceneOtherKey {
  Collection_title = 'Collection_title',
  Collection_bg = 'Collection_bg',
  Collection_img1 = 'Collection_img1',
  Collection_img2 = 'Collection_img2',
  Collection_img3 = 'Collection_img3',
  Collection_detail_bg = 'Collection_detail_bg',
  Collection_detail_title = 'Collection_detail_title',
  Collection_detail_dialog_bg = 'Collection_detail_dialog_bg',
  Collection_detail_dialog_text = 'Collection_detail_dialog_text',
}

export const collectionSceneButtonConfig: Record<CollectionSceneButtonKey, UIItemConfig> = {
  [CollectionSceneButtonKey.Collection_back_button]: {
    label: '返回',
  },
  [CollectionSceneButtonKey.Collection_detail_dialog_prev_button]: {
    label: '详情弹窗上一个按钮元素',
  },
  [CollectionSceneButtonKey.Collection_detail_dialog_next_button]: {
    label: '详情弹窗下一个按钮元素',
  }
};

export const collectionSceneOtherConfig: Record<CollectionSceneOtherKey, UIItemConfig & { children?: Record<string, UIItemConfig> }> = {
  [CollectionSceneOtherKey.Collection_title]: {
    type: 'image',
    label: '标题',
  },
  [CollectionSceneOtherKey.Collection_bg]: {
    label: '背景',
    type: 'bg',
    hasHoverStyle: false
  },
  [CollectionSceneOtherKey.Collection_img1]: {
    label: '图鉴1',
    type: 'container',
    hasXY: false,
    hasHoverStyle: false,
    children: {
      [collectionItemInfoKey.collectionInfo]: {
        type: 'image',
        hasText: true,
        hasHoverStyle: false,
        label: '图鉴信息',
      },
      [CommonItemKey.content]: {
        type: 'text',
        label: '详情界面信息',
      },
      [collectionItemInfoKey.collectionImages]: {
        type: 'image',
        label: '详情界面信息图片列表',
        hasXY: false,
        hasHoverStyle: false,
      },
      [collectionItemInfoKey.collectionVideos]: {
        type: 'video',
        label: '详情界面信息视频列表',
        hasXY: false,
        hasHoverStyle: false,
      },
    }
  },
  [CollectionSceneOtherKey.Collection_img2]: {
    label: '图鉴2',
    type: 'container',
    hasXY: false,
    hasHoverStyle: false,
    children: {
      [collectionItemInfoKey.collectionInfo]: {
        type: 'image',
        hasText: true,
        hasHoverStyle: false,
        label: '图鉴信息',
      },
      [CommonItemKey.content]: {
        type: 'text',
        label: '详情界面信息',
      },
      [collectionItemInfoKey.collectionImages]: {
        type: 'image',
        label: '详情界面信息图片列表',
        hasXY: false,
        hasHoverStyle: false,
      },
      [collectionItemInfoKey.collectionVideos]: {
        type: 'video',
        label: '详情界面信息视频列表',
        hasXY: false,
        hasHoverStyle: false,
      },
    }
  },
  [CollectionSceneOtherKey.Collection_img3]: {
    type: 'container',
    label: '图鉴3',
    hasXY: false,
    hasHoverStyle: false,
    children: {
      [collectionItemInfoKey.collectionInfo]: {
        type: 'image',
        hasText: true,
        hasHoverStyle: false,
        label: '图鉴信息',
      },
      [CommonItemKey.content]: {
        type: 'text',
        label: '详情界面信息',
      },
      [collectionItemInfoKey.collectionImages]: {
        type: 'image',
        label: '详情界面信息图片列表',
        hasXY: false,
        hasHoverStyle: false,
      },
      [collectionItemInfoKey.collectionVideos]: {
        type: 'video',
        label: '详情界面信息视频列表',
        hasXY: false,
        hasHoverStyle: false,
      },
    }
  },
  [CollectionSceneOtherKey.Collection_detail_title]: {
    type: 'image',
    label: '详情界面标题',
  },
  [CollectionSceneOtherKey.Collection_detail_bg]: {
    label: '详情界面背景',
    type: 'bg',
    hasHoverStyle: false
  },
  [CollectionSceneOtherKey.Collection_detail_dialog_bg]: {
    type: 'bg',
    label: '详情弹窗元素背景',
    hasHoverStyle: false
  },
  [CollectionSceneOtherKey.Collection_detail_dialog_text]: {
    label: '详情弹窗元素样式',
    type: 'text',
    hasHoverStyle: false,
    hasXY: false
  }
};

export enum OptionSceneOtherKey {
  Option_title = 'Option_title',
  Option_bg = 'Option_bg',
  // Option_window_label = 'Option_window_label',
  // Option_text_speed_label = 'Option_text_speed_label',
  // Option_global_volume_label = 'Option_global_volume_label',
  // Option_bg_music_volume_label = 'Option_bg_music_volume_label',
  // Option_effect_volume_label = 'Option_effect_volume_label',
  // Option_voice_volume_label = 'Option_voice_volume_label',
  // Option_voice_slider = 'Option_voice_slider',
  // Option_text_speed_slider = 'Option_text_speed_slider',
  Option_global_volume_slider = 'Option_global_volume_slider',
  // Option_bg_music_volume_slider = 'Option_bg_music_volume_slider',
  Option_effect_volume_slider = 'Option_effect_volume_slider',
  // Option_fullscreen_checkbox_label = 'Option_fullscreen_checkbox_label',
  // Option_window_checkbox_label = 'Option_window_checkbox_label',
  Option_fullscreen_checkbox = 'Option_fullscreen_checkbox',
  Option_window_checkbox = 'Option_window_checkbox',
  Option_videoSize1080_checkbox = 'Option_videoSize1080_checkbox',
  Option_videoSize720_checkbox = 'Option_videoSize720_checkbox',
  Options_light_slider = 'Options_light_slider'
}

export const optionSceneOtherConfig: Record<OptionSceneOtherKey, UIItemConfig & { children?: Record<string, UIItemConfig> }> = {
  [OptionSceneOtherKey.Option_title]: {
    type: 'image',
    label: '标题',
  },
  [OptionSceneOtherKey.Option_bg]: {
    label: '背景',
    type: 'bg',
    hasHoverStyle: false,
  },
  // [OptionSceneOtherKey.Option_window_label]: {
  //   type: 'container',
  //   label: '画面模式',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '画面模式文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '画面模式背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_text_speed_label]: {
  //   type: 'container',
  //   label: '文本速度',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '文本速度文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '文本速度背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_global_volume_label]: {
  //   type: 'container',
  //   label: '全局音量',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '全局音量文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '全局音量背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_bg_music_volume_label]: {
  //   type: 'container',
  //   label: '背景音量',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '背景音量文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '背景音量背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_effect_volume_label]: {
  //   type: 'container',
  //   label: '音效音量',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '音效音量文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '音效音量背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: {
  //   type: 'container',
  //   label: '全屏模式',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '全屏模式文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '全屏模式背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_window_checkbox_label]: {
  //   type: 'container',
  //   label: '窗口模式',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '窗口模式文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '窗口模式背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_voice_volume_label]: {
  //   type: 'container',
  //   label: '语音音量',
  //   children: {
  //     [CommonItemKey.content]: {
  //       type: 'text',
  //       label: '语音音量文字元素',
  //     },
  //     [CommonItemKey.background]: {
  //       type: 'image',
  //       hasText: false,
  //       label: '语音音量背景',
  //     },
  //   }
  // },
  // [OptionSceneOtherKey.Option_voice_slider]: {
  //   type: 'container',
  //   label: '语音音量',
  //   children: {
  //     [SliderItemKey.slider]: {
  //       label: '语音音量滑动条',
  //       hasHoverStyle: false,
  //     },
  //     [SliderItemKey.sliderBg]: {
  //       hasHoverStyle: false,
  //       label: '语音音量滑动条背景',
  //     },
  //     [SliderItemKey.sliderThumb]: {
  //       hasHoverStyle: false,
  //       label: '语音音量滑动条拇指',
  //     },
  //   }
  // },
  [OptionSceneOtherKey.Option_global_volume_slider]: {
    type: 'container',
    label: '全局音量',
    children: {
      [SliderItemKey.slider]: {
        label: '全局音量滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '全局音量滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '全局音量滑动条拇指',
      },
    }
  },
  // [OptionSceneOtherKey.Option_bg_music_volume_slider]: {
  //   type: 'container',
  //   label: '背景音量',
  //   children: {
  //     [SliderItemKey.slider]: {
  //       label: '背景音量滑动条',
  //       hasHoverStyle: false,
  //     },
  //     [SliderItemKey.sliderBg]: {
  //       hasHoverStyle: false,
  //       label: '背景音量滑动条背景',
  //     },
  //     [SliderItemKey.sliderThumb]: {
  //       hasHoverStyle: false,
  //       label: '背景音量滑动条拇指',
  //     },
  //   }
  // },
  [OptionSceneOtherKey.Option_effect_volume_slider]: {
    type: 'container',
    label: '音效',
    children: {
      [SliderItemKey.slider]: {
        label: '音效滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '音效滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '音效滑动条拇指',
      },
    }
  },
  [OptionSceneOtherKey.Options_light_slider]: {
    type: 'container',
    label: '亮度',
    children: {
      [SliderItemKey.slider]: {
        label: '亮度滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '亮度滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '亮度滑动条拇指',
      },
    }
  },
  [OptionSceneOtherKey.Option_fullscreen_checkbox]: {
    label: '全屏模式复选框',
    positionType: 'absolute',
  },
  [OptionSceneOtherKey.Option_window_checkbox]: {
    label: '窗口模式复选框',
    positionType: 'absolute',
  },
  [OptionSceneOtherKey.Option_videoSize1080_checkbox]: {
    label: '视频尺寸1080P复选框',
  },
  [OptionSceneOtherKey.Option_videoSize720_checkbox]: {
    label: '视频尺寸720P复选框',
  },
  // [OptionSceneOtherKey.Option_text_speed_slider]: {
  //   type: 'container',
  //   label: '文本速度滑动条',
  //   children: {
  //     [SliderItemKey.slider]: {
  //       label: '文本速度滑动条',
  //       hasHoverStyle: false,
  //     },
  //     [SliderItemKey.sliderBg]: {
  //       hasHoverStyle: false,
  //       label: '文本速度滑动条背景',
  //     },
  //     [SliderItemKey.sliderThumb]: {
  //       hasHoverStyle: false,
  //       label: '文本速度滑动条拇指',
  //     },
  //   }
  // },
};

export enum AchievementSceneOtherKey {
  Achievement_title = 'Achievement_title',
  Achievement_progress_bg = 'Achievement_progress_bg',
  Achievement_progress_text = 'Achievement_progress_text',
  Achievement_progress = 'Achievement_progress',
  Achievement_notUnlock = 'Achievement_notUnlock',
}

export const achievementSceneOtherConfig: Record<AchievementSceneOtherKey, UIItemConfig> = {
  [AchievementSceneOtherKey.Achievement_title]: {
    label: '标题',
  },
  [AchievementSceneOtherKey.Achievement_progress_bg]: {
    label: '成就进度背景',
    type: 'bg',
    hasXY: false,
    hasHoverStyle: false,
  },
  [AchievementSceneOtherKey.Achievement_progress_text]: {
    label: '成就进度文字',
    type: 'text',
    hasXY: false,
    hasHoverStyle: false,
  },
  [AchievementSceneOtherKey.Achievement_progress]: {
    label: '成就进度条',
    type: 'image',
    hasXY: true,
    hasHoverStyle: true,
  },
  [AchievementSceneOtherKey.Achievement_notUnlock]: {
    label: '未解锁成就元素',
    type: 'image',
    hasXY: false,
    hasHoverStyle: false,
    hasText: false
  }
};

export enum StorylineSceneOtherKey {
  Storyline_title = 'Storyline_title',
}

export const storylineSceneOtherConfig: Record<StorylineSceneOtherKey, UIItemConfig> = {
  [StorylineSceneOtherKey.Storyline_title]: {
    label: '标题',
  },
};

export enum LoadSceneOtherKey {
  Load_bg = 'Load_bg',
  Load_title = 'Load_title',
  Load_item = 'Load_item',
  Load_locked_item = 'Load_locked_item',
  Load_indicator = 'Load_indicator',
}

export const loadSceneOtherConfig: Record<LoadSceneOtherKey, UIItemConfig & { children?: Record<string, UIItemConfig> }> = {
  [LoadSceneOtherKey.Load_bg]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [LoadSceneOtherKey.Load_title]: {
    label: '标题',
  },
  [LoadSceneOtherKey.Load_item]: {
    label: '存档元素',
    type: 'container',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      rowGap: {
        type: 'number',
        label: '行间距',
      },
      columnGap: {
        type: 'number',
        label: '列间距',
      },
    },
    children: {
      [CommonItemKey.content]: {
        type: 'placeholder',
        label: '存档图片',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '存档元素背景',
      },
      [CommonItemKey.extra]: {
        type: 'text',
        label: '存档文字',
      }
    }
  },
  [LoadSceneOtherKey.Load_locked_item]: {
    label: '未解锁存档元素',
    hasXY: false,
    customStyle: {
      rowGap: {
        type: 'number',
        label: '行间距',
      },
      columnGap: {
        type: 'number',
        label: '列间距',
      },
    }
  },
  [LoadSceneOtherKey.Load_indicator]: {
    type: 'container',
    hasHoverStyle: false,
    hasWidthHeight: false,
    label: '翻页指示器',
    children: {
      [IndicatorItemKey.indicatorLeft]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向左翻页',
        customStyle: {
          marginRight: {
            type: 'number',
            label: '右边距',
          },
        }
      },
      [IndicatorItemKey.indicatorRight]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向右翻页',
        customStyle: {
          marginLeft: {
            type: 'number',
            label: '左边距',
          },
        }
      },
      [IndicatorItemKey.indicator]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '指示器',
        customStyle: {
          gap: {
            type: 'number',
            label: '间距',
          },
        },
      },
    }
  },
};

export enum TitleSceneOtherKey {
  Title_img = 'Title_img',
  Title_bgm = 'Title_bgm',
}

export const titleSceneOtherConfig: Record<TitleSceneOtherKey, UIItemConfig> = {
  [TitleSceneOtherKey.Title_img]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [TitleSceneOtherKey.Title_bgm]: {
    hasHoverStyle: false,
    label: '背景音乐',
    type: 'bgm',
  },
};

export interface Info {
  name?: {
    type: 'number',
    label: string,
  },
  height?: {
    type: 'number',
    label: string,
  },

  weight?: {
    type: 'number',
    label: string,
  },

  bustSize?: {
    type: 'number',
    label: string,
  },
  waistSize?: {
    type: 'number',
    label: string,
  },
  hipSize: {
    type: 'number',
    label: string,
  },
  description: {
    type: 'number',
    label: string,
  },
  image: {
    type: 'string',
    label: 'string'
  }
}

export interface Style {
  x?: number;
  y?: number;
  scale?: number;
  image?: string;
  fontSize?: number;
  fontColor?: string;
  countdown?: number;
  position?: 'absolute' | 'relative';
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  width?: number;
  height?: number;
  marginLeft?: number;
  marginRight?: number;
  alignPosition?: 'top' | 'bottom';
}

export type ButtonKey = LoadSceneButtonKey | TitleSceneButtonKey | OptionSceneButtonKey | StorylineSceneButtonKey | AchievementSceneButtonKey | ExtraSceneButtonKey | CollectionSceneButtonKey;
export type OtherKey = LoadSceneOtherKey | TitleSceneOtherKey | OptionSceneOtherKey | StorylineSceneOtherKey | AchievementSceneOtherKey | ExtraSceneOtherKey | CollectionSceneOtherKey;
type AllKey = ButtonKey | OtherKey;

export interface ButtonItem {
  key: AllKey;
  content: string,
  args: {
    hide: boolean,
    style: Style,
    hoverStyle?: Style
  }
}

export interface TitleSceneUIConfig {
  key: Scene.title;
  other: { [key in TitleSceneOtherKey]: ButtonItem };
  buttons: { [key in TitleSceneButtonKey]: ButtonItem };
}

export interface LoadSceneUIConfig {
  key: Scene.load;
  other: {
    [LoadSceneOtherKey.Load_bg]: ButtonItem;
    [LoadSceneOtherKey.Load_title]: ButtonItem;
    [LoadSceneOtherKey.Load_item]: ContainerItem;
    [LoadSceneOtherKey.Load_locked_item]: ButtonItem;
    [LoadSceneOtherKey.Load_indicator]: IndicatorContainerItem;
  };
  buttons: { [key in LoadSceneButtonKey]: ButtonItem };
}

export interface StorylineSceneUIConfig {
  key: Scene.storyline;
  other: { [key in StorylineSceneOtherKey]: ButtonItem };
  buttons: { [key in StorylineSceneButtonKey]: ButtonItem };
}

/**
 * 成就页面UI配置项
 */
export interface AchievementSceneUIConfig {
  key: Scene.achievement;
  other: { 
    // [key in AchievementSceneOtherKey]: ButtonItem;
    [AchievementSceneOtherKey.Achievement_title]: ButtonItem;
    [AchievementSceneOtherKey.Achievement_progress_bg]: ButtonItem;
    [AchievementSceneOtherKey.Achievement_progress_text]: ButtonItem;
    [AchievementSceneOtherKey.Achievement_progress]: ButtonItem;
    [AchievementSceneOtherKey.Achievement_notUnlock]: ButtonItem;
  };
  buttons: { [key in AchievementSceneButtonKey]: ButtonItem };
}

export interface ExtraSceneUIConfig {
  key: Scene.extra;
  other: {
    [ExtraSceneOtherKey.Extra_bg]: ButtonItem;
    [ExtraSceneOtherKey.Extra_title]: ButtonItem;
    [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: ButtonItem;
    [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: ContainerItem;
    [ExtraSceneOtherKey.Extra_indicator]: IndicatorContainerItem;
    [ExtraSceneOtherKey.Extra_video_unlocked_item]: ContainerItem;
    [ExtraSceneOtherKey.Extra_video_locked_item_bg]: ButtonItem;
  };
  buttons: { [key in ExtraSceneButtonKey]: ButtonItem };
}

export interface OptionSceneUIConfig {
  key: Scene.option;
  other: {
    [OptionSceneOtherKey.Option_bg]: ButtonItem,
    [OptionSceneOtherKey.Option_title]: ButtonItem,
    // [OptionSceneOtherKey.Option_window_label]: ContainerItem,
    // [OptionSceneOtherKey.Option_text_speed_label]: ContainerItem,
    // [OptionSceneOtherKey.Option_text_speed_slider]: SliderContainerItem,
    // [OptionSceneOtherKey.Option_bg_music_volume_label]: ContainerItem,
    // [OptionSceneOtherKey.Option_bg_music_volume_slider]: SliderContainerItem,
    // [OptionSceneOtherKey.Option_effect_volume_label]: ContainerItem,
    [OptionSceneOtherKey.Options_light_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_effect_volume_slider]: SliderContainerItem,
    [OptionSceneOtherKey.Option_global_volume_slider]: SliderContainerItem,
    // [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: ContainerItem,
    [OptionSceneOtherKey.Option_fullscreen_checkbox]: ButtonItem,
    // [OptionSceneOtherKey.Option_window_checkbox_label]: ContainerItem,
    [OptionSceneOtherKey.Option_window_checkbox]: ButtonItem,
    [OptionSceneOtherKey.Option_videoSize1080_checkbox]: ButtonItem
    [OptionSceneOtherKey.Option_videoSize720_checkbox]: ButtonItem
    // [OptionSceneOtherKey.Option_global_volume_label]: ContainerItem,
    // [OptionSceneOtherKey.Option_voice_slider]: SliderContainerItem,
    // [OptionSceneOtherKey.Option_voice_volume_label]: ContainerItem
  };
  buttons: { [key in OptionSceneButtonKey]: ButtonItem };
}

export interface InfoItem {
  key: AllKey;
  content: string,
  args: {
    hide: boolean,
    style?: Style,
    info?: InfoConfig,
    images?: ICollectionImages,
    videos?: typeof defaultCollectionVideos,
  }
}

export interface CollectionSceneUIConfig {
  key: Scene.collection;
  other: {
    [CollectionSceneOtherKey.Collection_bg]: ButtonItem,
    [CollectionSceneOtherKey.Collection_title]: ButtonItem,
    [CollectionSceneOtherKey.Collection_img1]: InfoItem,
    [CollectionSceneOtherKey.Collection_img2]: InfoItem,
    [CollectionSceneOtherKey.Collection_img3]: InfoItem,
    [CollectionSceneOtherKey.Collection_detail_title]: ButtonItem,
    [CollectionSceneOtherKey.Collection_detail_bg]: ButtonItem,
    [CollectionSceneOtherKey.Collection_detail_dialog_bg]: ButtonItem,
    [CollectionSceneOtherKey.Collection_detail_dialog_text]: ButtonItem
  };
  buttons: { [key in CollectionSceneButtonKey]: ButtonItem };

}

export enum Scene {
  title = 'title',
  load = 'load',
  storyline = 'storyline',
  achievement = 'achievement',
  extra = 'extra',
  option = 'option',
  collection = 'collection',
}

export const sceneNameMap: Record<Scene, string> = {
  title: '标题界面',
  load: '读档界面',
  storyline: '故事线界面',
  achievement: '成就界面',
  extra: '鉴赏界面',
  option: '选项界面',
  collection: '图鉴界面',
};

export interface SceneUIConfig {
  [Scene.title]?: TitleSceneUIConfig,
  [Scene.load]?: LoadSceneUIConfig,
  [Scene.storyline]?: StorylineSceneUIConfig,
  [Scene.achievement]?: AchievementSceneUIConfig,
  [Scene.extra]?: ExtraSceneUIConfig,
  [Scene.option]?: OptionSceneUIConfig
  [Scene.collection]: CollectionSceneUIConfig
};

export const SceneKeyMap = {
  [Scene.title]: {
    buttons: TitleSceneButtonKey,
    other: TitleSceneOtherKey
  },
  [Scene.load]: {
    buttons: LoadSceneButtonKey,
    other: LoadSceneOtherKey
  },
  [Scene.storyline]: {
    buttons: StorylineSceneButtonKey,
    other: StorylineSceneOtherKey
  },
  [Scene.achievement]: {
    buttons: AchievementSceneButtonKey,
    other: AchievementSceneOtherKey
  },
  [Scene.extra]: {
    buttons: ExtraSceneButtonKey,
    other: ExtraSceneOtherKey
  },
  [Scene.option]: {
    buttons: OptionSceneButtonKey,
    other: OptionSceneOtherKey
  },
  [Scene.collection]: {
    buttons: CollectionSceneButtonKey,
    other: CollectionSceneOtherKey
  },
};

const generateArgs = (extraStyles: string[] = []) => {
  const args = {
    hide: false,
    style: {}
  };

  extraStyles.forEach(style => {
    // @ts-ignore
    args[style] = {};
  });

  return args;
};

export const sceneUIConfig: SceneUIConfig = {
  [Scene.title]: {
    key: Scene.title,
    other: {
      [TitleSceneOtherKey.Title_img]: {
        key: TitleSceneOtherKey.Title_img,
        content: "",
        args: {
          hide: false,
          style: {}
        }
      },
      [TitleSceneOtherKey.Title_bgm]: {
        key: TitleSceneOtherKey.Title_bgm,
        content: "",
        args: generateArgs(),
      }
    },
    buttons: {
      [TitleSceneButtonKey.Game_start_button]: {
        key: TitleSceneButtonKey.Game_start_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_load_button]: {
        key: TitleSceneButtonKey.Game_load_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_option_button]: {
        key: TitleSceneButtonKey.Game_option_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_storyline_button]: {
        key: TitleSceneButtonKey.Game_storyline_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_achievement_button]: {
        key: TitleSceneButtonKey.Game_achievement_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_extra_button]: {
        key: TitleSceneButtonKey.Game_extra_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_collection_button]: {
        key: TitleSceneButtonKey.Game_collection_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_continue_button]: {
        key: TitleSceneButtonKey.Game_continue_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    }
  },
  [Scene.load]: {
    key: Scene.load,
    other: {
      [LoadSceneOtherKey.Load_bg]: {
        key: LoadSceneOtherKey.Load_bg,
        content: "",
        args: generateArgs(),
      },
      [LoadSceneOtherKey.Load_title]: {
        key: LoadSceneOtherKey.Load_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [LoadSceneOtherKey.Load_item]: {
        key: LoadSceneOtherKey.Load_item,
        content: "",
        args: generateArgs(['contentStyle', 'backgroundStyle', 'extraStyle', 'contentHoverStyle', 'backgroundHoverStyle', 'extraHoverStyle']),
      },
      [LoadSceneOtherKey.Load_indicator]: {
        key: LoadSceneOtherKey.Load_indicator,
        content: "",
        args: generateArgs(['indicatorStyle', 'indicatorHoverStyle', 'indicatorLeftStyle', 'indicatorLeftHoverStyle', 'indicatorRightStyle', 'indicatorRightHoverStyle']),
      },
      [LoadSceneOtherKey.Load_locked_item]: {
        key: LoadSceneOtherKey.Load_locked_item,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [LoadSceneButtonKey.Load_back_button]: {
        key: LoadSceneButtonKey.Load_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    }
  },
  [Scene.storyline]: {
    key: Scene.storyline,
    other: {
      [StorylineSceneOtherKey.Storyline_title]: {
        key: StorylineSceneOtherKey.Storyline_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [StorylineSceneButtonKey.Storyline_back_button]: {
        key: StorylineSceneButtonKey.Storyline_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    }
  },
  [Scene.achievement]: {
    key: Scene.achievement,
    other: {
      [AchievementSceneOtherKey.Achievement_title]: {
        key: AchievementSceneOtherKey.Achievement_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [AchievementSceneOtherKey.Achievement_progress_bg]: {
        key: AchievementSceneOtherKey.Achievement_progress_bg,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [AchievementSceneOtherKey.Achievement_progress_text]: {
        key: AchievementSceneOtherKey.Achievement_progress_text,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [AchievementSceneOtherKey.Achievement_progress]: {
        key: AchievementSceneOtherKey.Achievement_progress,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [AchievementSceneOtherKey.Achievement_notUnlock]: {
        key: AchievementSceneOtherKey.Achievement_notUnlock,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [AchievementSceneButtonKey.Achievement_back_button]: {
        key: AchievementSceneButtonKey.Achievement_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    }
  },
  [Scene.extra]: {
    key: Scene.extra,
    other: {
      [ExtraSceneOtherKey.Extra_title]: {
        key: ExtraSceneOtherKey.Extra_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: {
        key: ExtraSceneOtherKey.Extra_bgm_unlocked_item,
        content: "",
        args: generateArgs(['contentStyle', 'backgroundStyle', 'extraStyle', 'backgroundHoverStyle', 'extraHoverStyle']),
      },
      [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: {
        key: ExtraSceneOtherKey.Extra_bgm_locked_item_bg,
        content: "",
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_indicator]: {
        key: ExtraSceneOtherKey.Extra_indicator,
        content: "",
        args: generateArgs(['indicatorStyle', 'indicatorHoverStyle', 'indicatorLeftStyle', 'indicatorLeftHoverStyle', 'indicatorRightStyle', 'indicatorRightHoverStyle']),
      },
      [ExtraSceneOtherKey.Extra_bg]: {
        key: ExtraSceneOtherKey.Extra_bg,
        content: "",
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_video_locked_item_bg]: {
        key: ExtraSceneOtherKey.Extra_video_locked_item_bg,
        content: "",
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_video_unlocked_item]: {
        key: ExtraSceneOtherKey.Extra_video_unlocked_item,
        content: "",
        args: generateArgs(['contentStyle', 'backgroundStyle', 'extraStyle', 'contentHoverStyle', 'backgroundHoverStyle', 'extraHoverStyle']),
      },
    },
    buttons: {
      [ExtraSceneButtonKey.Extra_back_button]: {
        key: ExtraSceneButtonKey.Extra_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneButtonKey.Extra_video_button]: {
        key: ExtraSceneButtonKey.Extra_video_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneButtonKey.Extra_bgm_button]: {
        key: ExtraSceneButtonKey.Extra_bgm_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
    }
  },
  [Scene.option]: {
    key: Scene.option,
    other: {
      [OptionSceneOtherKey.Option_bg]: {
        key: OptionSceneOtherKey.Option_bg,
        content: "",
        args: generateArgs(),
      },
      [OptionSceneOtherKey.Option_title]: {
        key: OptionSceneOtherKey.Option_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_fullscreen_checkbox]: {
        key: OptionSceneOtherKey.Option_fullscreen_checkbox,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_window_checkbox]: {
        key: OptionSceneOtherKey.Option_window_checkbox,
        content: "",
        args: generateArgs(['hoverStyle']),
      },

      [OptionSceneOtherKey.Option_videoSize1080_checkbox]: {
        key: OptionSceneOtherKey.Option_videoSize1080_checkbox,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_videoSize720_checkbox]: {
        key: OptionSceneOtherKey.Option_videoSize720_checkbox,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Options_light_slider]: {
        key: OptionSceneOtherKey.Options_light_slider,
        content: "",
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_effect_volume_slider]: {
        key: OptionSceneOtherKey.Option_effect_volume_slider,
        content: "",
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_global_volume_slider]: {
        key: OptionSceneOtherKey.Option_global_volume_slider,
        content: "",
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      // [OptionSceneOtherKey.Option_window_label]: {
      //   key: OptionSceneOtherKey.Option_window_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_text_speed_label]: {
      //   key: OptionSceneOtherKey.Option_text_speed_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_voice_volume_label]: {
      //   key: OptionSceneOtherKey.Option_voice_volume_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_window_checkbox_label]: {
      //   key: OptionSceneOtherKey.Option_text_speed_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_global_volume_label]: {
      //   key: OptionSceneOtherKey.Option_global_volume_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_bg_music_volume_label]: {
      //   key: OptionSceneOtherKey.Option_bg_music_volume_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_effect_volume_label]: {
      //   key: OptionSceneOtherKey.Option_effect_volume_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: {
      //   key: OptionSceneOtherKey.Option_fullscreen_checkbox_label,
      //   content: "",
      //   args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      // },
      // [OptionSceneOtherKey.Option_bg_music_volume_slider]: {
      //   key: OptionSceneOtherKey.Option_bg_music_volume_slider,
      //   content: "",
      //   args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      // },
      // [OptionSceneOtherKey.Option_text_speed_slider]: {
      //   key: OptionSceneOtherKey.Option_text_speed_slider,
      //   content: "",
      //   args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      // },
      // [OptionSceneOtherKey.Option_voice_slider]: {
      //   key: OptionSceneOtherKey.Option_voice_slider,
      //   content: "",
      //   args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      // },
    },
    buttons: {
      [OptionSceneButtonKey.Option_back_button]: {
        key: OptionSceneButtonKey.Option_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      }
    }
  },
  [Scene.collection]: {
    key: Scene.collection,
    other: {
      [CollectionSceneOtherKey.Collection_bg]: {
        key: CollectionSceneOtherKey.Collection_bg,
        content: "",
        args: generateArgs(),
      },
      [CollectionSceneOtherKey.Collection_title]: {
        key: CollectionSceneOtherKey.Collection_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },

      [CollectionSceneOtherKey.Collection_img1]: {
        key: CollectionSceneOtherKey.Collection_img1,
        content: "",
        args: generateArgs(['info', 'images']),
      },
      [CollectionSceneOtherKey.Collection_img2]: {
        key: CollectionSceneOtherKey.Collection_img2,
        content: "",
        args: generateArgs(['info', 'images']),
      },
      [CollectionSceneOtherKey.Collection_img3]: {
        key: CollectionSceneOtherKey.Collection_img3,
        content: "",
        args: generateArgs(['info', 'images']),
      },
      [CollectionSceneOtherKey.Collection_detail_title]: {
        key: CollectionSceneOtherKey.Collection_detail_title,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [CollectionSceneOtherKey.Collection_detail_bg]: {
        key: CollectionSceneOtherKey.Collection_detail_bg,
        content: "",
        args: generateArgs(),
      },

      [CollectionSceneOtherKey.Collection_detail_dialog_bg]: {
        key: CollectionSceneOtherKey.Collection_detail_dialog_bg,
        content: "",
        args: generateArgs(),
      },
      [CollectionSceneOtherKey.Collection_detail_dialog_text]: {
        key: CollectionSceneOtherKey.Collection_detail_dialog_text,
        content: "",
        args: generateArgs(['hoverStyle']),
      }
    },
    buttons: {
      [CollectionSceneButtonKey.Collection_back_button]: {
        key: CollectionSceneButtonKey.Collection_back_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [CollectionSceneButtonKey.Collection_detail_dialog_prev_button]: {
        key: CollectionSceneButtonKey.Collection_detail_dialog_prev_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      },
      [CollectionSceneButtonKey.Collection_detail_dialog_next_button]: {
        key: CollectionSceneButtonKey.Collection_detail_dialog_next_button,
        content: "",
        args: generateArgs(['hoverStyle']),
      }
    }
  },
};

export const sceneButtonConfig = {
  [Scene.title]: titleSceneButtonConfig,
  [Scene.load]: loadSceneButtonConfig,
  [Scene.storyline]: storylineSceneButtonConfig,
  [Scene.achievement]: achievementSceneButtonConfig,
  [Scene.extra]: extraSceneButtonConfig,
  [Scene.option]: optionSceneButtonConfig,
  [Scene.collection]: collectionSceneButtonConfig
};

export const sceneOtherConfig = {
  [Scene.title]: titleSceneOtherConfig,
  [Scene.load]: loadSceneOtherConfig,
  [Scene.storyline]: storylineSceneOtherConfig,
  [Scene.achievement]: achievementSceneOtherConfig,
  [Scene.extra]: extraSceneOtherConfig,
  [Scene.option]: optionSceneOtherConfig,
  [Scene.collection]: collectionSceneOtherConfig
};
