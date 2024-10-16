import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSidebar";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/store/origineStore";
import MainArea from "./MainArea/MainArea";
import { Splitter, SplitterPanel } from "primereact/splitter";
import {statusActions} from "@/store/statusReducer";
import { useEffect } from "react";
import { request } from "@/utils/request";
import { GameOriginInfo } from "../dashboard/DashBoard";
import axios from "axios";


export default function Editor() {
  const isShowDashboard = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const editorState = useSelector((state: RootState) => state.status.editor);
  const isShowPreview = editorState.showPreview;
  const dispatch = useDispatch();
  const currentTag = editorState.currentSidebarTag;
  const isAutoHideToolbar = useSelector((state:RootState)=>state.userData.isAutoHideToolbar);
  const userInfo = useSelector((state:RootState)=>state.userData.userInfo);

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

  function handleMainAreaClick(){
    if(isAutoHideToolbar){
      dispatch(statusActions.setCurrentTopbarTab(undefined));
    }
  }

  useEffect(() => {
    if (editorState.currentEditingGame && userInfo.userId) {
      getGameListFromServer().then(gameList => {
        const currentGame = gameList.find(e => e.gName === editorState.currentEditingGame);

        if (currentGame) {
          axios.post("/api/manageGame/syncGameId", { gameName: currentGame.gName, gameId: currentGame.gId });
        }
      });
    }
  }, [editorState.currentEditingGame, userInfo]);

  return <>
    {!isShowDashboard && <div className={styles.editor}>
      <TopBar />
      <div className={styles.container} onClick={()=>handleMainAreaClick()}>
        {/* <Splitter style={{ height: "100%", flex: 1 }}> */}
        {/*  <SplitterPanel size={15} minSize={15} */}
        {/*    style={{ display: (isShowPreview || currentTag !== 0) ? undefined : "none" }}><EditorSideBar /></SplitterPanel> */}
        {/*  <SplitterPanel minSize={30}><MainArea /></SplitterPanel> */}
        {/* </Splitter> */}
        <EditorSideBar />
        <MainArea />
      </div>
    </div>}
  </>;
}
