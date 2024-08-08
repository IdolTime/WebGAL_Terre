import { useEffect, useRef } from "react";
import { useValue } from "../../hooks/useValue";
import axios from "axios";
import { logger } from "../../utils/logger";
import { Message, TestRefRef } from "../../components/message/Message";
import styles from "./dashboard.module.scss";
import Sidebar from "./Sidebar";
import GamePreview from "./GamePreview";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import useTrans from "@/hooks/useTrans";
import useLanguage from "@/hooks/useLanguage";
import { language } from "@/store/statusReducer";
// import About from "./About";
import { WebgalParser } from "../editor/GraphicalEditor/parser";
// import { Card, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Toolbar, ToolbarButton } from "@fluentui/react-components";
import { LocalLanguage24Filled, LocalLanguage24Regular, bundleIcon } from "@fluentui/react-icons";
import { request } from "@/utils/request";
import UserProfile from "@/components/userProfile";

// 返回的文件信息（单个）
interface IFileInfo {
  name: string;
  isDir: boolean;
}
// 游戏信息
export interface GameInfo {
  dir: string;
  title: string;
  cover: string;
}

export interface GameOriginInfo {
  gId: number,
  authorId: number,
  authorName: string,
  authorNickName: string,
  authorAvatar: string,
  gType: string,
  gName: string,
  state: string,
  gCover: string,
  publicResource: number,
  isAdmin: boolean,
}

export default function DashBoard() {

  const t = useTrans('editor.topBar.');
  const setLanguage = useLanguage();
  const trans = useTrans('dashBoard.');

  const LocalLanguageIcon = bundleIcon(LocalLanguage24Filled, LocalLanguage24Regular);

  const isDashboardShow:boolean = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const userInfo = useSelector((state: RootState) => state.userData.userInfo);

  const messageRef = useRef<TestRefRef>(null);

  // 当前选中的游戏
  const currentGame = useValue<string | null>(null);
  
  const setCurrentGame = (e: string | null) => currentGame.set(e);

  // 游戏列表
  const gameInfoList = useValue<Array<GameOriginInfo>>([]);

  async function getGameListFromServer(): Promise<Array<GameOriginInfo>> {
    if (!userInfo.userId) {
      return [];
    }
    return await request.get("https://test-api.idoltime.games/editor/game/list", {
      params: {
        page: 1,
        pageSize: 9999,
        authorId: userInfo.userId
      }
    }).then(r => {
      if (r.data.code === 0) {
        return r.data.data.data;
      } else {
        return [];
      }
    });
  }

  async function createGame(gameName:string, gId: number) {
    const res = await axios.post("/api/manageGame/createGame", { gameName: gameName, gId, }).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`${gameName} ` + trans('msgs.created'), 2000);
    refreashDashboard();
    setCurrentGame(null);
  }

  function refreashDashboard() {
    getGameListFromServer().then(gameList => {
      logger.info("返回的游戏列表", gameList);
      gameInfoList.set(gameList);
    });
  }

  useEffect(() => {
    refreashDashboard();

  }, []);

  const refreash = () => {
    gameInfoList.set([]);
    refreashDashboard();
    setCurrentGame(null);
  };

  return <>
    { isDashboardShow &&
      <div className={styles.dashboard_container}>
        <div className={styles.topBar}>
        IdolTime
          {/* <Toolbar>
            <About />
            <Menu>
              <MenuTrigger>
                <ToolbarButton aria-label={t('commandBar.items.language.text')} icon={<LocalLanguageIcon />}>{t('commandBar.items.language.text')}</ToolbarButton>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={() => setLanguage(language.zhCn)}>简体中文</MenuItem>
                  <MenuItem onClick={() => setLanguage(language.en)}>English</MenuItem>
                  <MenuItem onClick={() => setLanguage(language.jp)}>日本语</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </Toolbar> */}
          <UserProfile />
        </div>
        <div className={styles.dashboard_main}>
          <Message ref={messageRef} />
          {
            currentGame.value &&
                <GamePreview
                  currentGame={currentGame.value}
                  setCurrentGame={setCurrentGame}
                  gameInfo={gameInfoList.value.find(e => e.gName === currentGame.value)!}
                />
          }
          <Sidebar
            refreash={refreash}
            setCurrentGame={setCurrentGame}
            currentSetGame={currentGame.value}
            gameList={gameInfoList.value} />
        </div>
      </div>}
  </>;
}
