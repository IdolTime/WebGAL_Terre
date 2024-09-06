import { useEffect, useRef, useState } from "react";
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
  isLocal: boolean,
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

  const gameInfoTempRef = useRef<{
    local: Array<GameOriginInfo>,
    server: Array<GameOriginInfo>,
  }>({
    local: [],
    server: [],
  });

  const [loadingFromServer, setLoadingFromServer] = useState(true);
  const [loadingFromLocal, setLoadingFromLocal] = useState(true);


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

  async function createGame(gameName:string, gId: number, localInfo: any) {
    gameInfoList.value.forEach(e => {
      if (e.gName === gameName) {
        messageRef.current!.showMessage(`${gameName} 已经存在`, 2000);
        return;
      }
    });
    const res = await axios.post("/api/manageGame/createGame", { gameName: gameName, gId, localInfo }).then(r => r.data);
    logger.info("创建结果：", res);
    messageRef.current!.showMessage(`${gameName} ` + trans('msgs.created'), 2000);
    refreshDashboard();
    setCurrentGame(null);

    return res;
  }

  async function getDirInfo() {
    return await axios.get("/api/manageGame/gameList").then(r => r.data);
  }

  function refreshDashboard() {
    gameInfoTempRef.current = {
      local: [],
      server: [],
    };
    setLoadingFromLocal(true);
    setLoadingFromServer(true);
    getGameListFromServer().then(gameList => {
      logger.info("服务器返回的游戏列表", gameList);
      gameInfoTempRef.current.server = gameList;
    }).finally(() => {
      setTimeout(() => {
        setLoadingFromServer(false);
      }, 16);
    });
    getDirInfo().then(response => {
      const gameList = (response as Array<IFileInfo>)
        .filter(e => e.isDir)
        .map(e => e.name);
      logger.info("本地返回的游戏列表", gameList);

      const getGameInfoList = gameList.map(
        async (gameName) : Promise<GameOriginInfo | null> => {
          const gameConfigData = (await axios.get(`/api/manageGame/getGameConfig/${gameName}`)).data;
          const gameConfig = WebgalParser.parseConfig(gameConfigData);
          const coverName = gameConfig.find(e => e.command === "Title_img")?.args?.join('') ?? "";
          const src = `/games/${gameName}/game/background/${coverName}`;
          const gId = gameConfig.find(e => e.command === "Game_id")?.args?.join('') ?? "";

          if (gId && gId !== '0') {
            return null;
          }

          return {
            gId: 0,
            authorId: userInfo.userId,
            authorName: userInfo.userName,
            authorNickName: userInfo.nickName,
            authorAvatar: userInfo.avatar,
            gType: '0',
            gName: gameName,
            state: '0',
            gCover: src,
            publicResource: 0,
            isAdmin: false,
            isLocal: true,
          };
        });

      Promise.all(getGameInfoList).then(list => {
        gameInfoTempRef.current.local = list.filter(x => x !== null) as Array<GameOriginInfo>;
      });
    }).finally(() => {
      setTimeout(() => {
        setLoadingFromLocal(false);
      }, 16);
    });
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  useEffect(() => {
    if (!loadingFromLocal && !loadingFromServer) {
      const gameListObject = gameInfoTempRef.current.server.reduce((p, c) => {
        p[c.gName] = c;
        return p;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      }, {} as { [key: string]: GameOriginInfo });

      gameInfoTempRef.current.local.forEach(e => {
        if (!gameListObject[e.gName]) {
          gameListObject[e.gName] = e;
        }
      });
      const list = Object.values(gameListObject);

      list.sort((a, b) => {
        if (a.isLocal && !b.isLocal) {
          return 1; // a 应该排在 b 后面
        }
        if (!a.isLocal && b.isLocal) {
          return -1; // a 应该排在 b 前面
        }
        return 0; // 顺序不变
      });

      gameInfoList.set(list);
    }
  }, [loadingFromLocal, loadingFromServer]);

  const refresh = () => {
    gameInfoList.set([]);
    refreshDashboard();
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
            createGame={createGame}
            refresh={refresh}
            setCurrentGame={setCurrentGame}
            currentSetGame={currentGame.value}
            gameList={gameInfoList.value}
          />
        </div>
      </div>}
  </>;
}
