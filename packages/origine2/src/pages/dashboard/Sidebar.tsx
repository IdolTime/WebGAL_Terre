import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import { useRef, useState } from "react";
import useTrans from "@/hooks/useTrans";
import { GameOriginInfo } from "./DashBoard";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1 } from "@fluentui/react-components";
import {  bundleIcon, ArrowSync24Filled, ArrowSync24Regular, Add24Filled, Add24Regular } from "@fluentui/react-icons";
import { request } from "@/utils/request";
import CreateOriginGameModal from "@/components/createOriginGameModal";


interface ISidebarProps {
  gameList: GameOriginInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  refresh: () => void;
  createGame: (gName: string, gId: number, localInfo: any) => Promise<{ status: string }>;
}

export default function Sidebar(props: ISidebarProps) {
  const t = useTrans('dashBoard.');

  const SyncIcon = bundleIcon(ArrowSync24Filled, ArrowSync24Regular);
  const AddIcon = bundleIcon(Add24Filled, Add24Regular);

  const [createGameFormOpen, setCreateGameFormOpen] = useState(false);
  const [newGameName, setNewGameName] = useState(t('createNewGame.dialog.defaultName') || 'NewGame');
  const [showoCreateGameDialog, setShowCreateGameDialog] = useState(false);

  const showCreateOriginGameModal = useRef(() => {
    setShowCreateGameDialog(true);
  }).current;

  return <>
    <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
      <div className={styles.sidebar_top}>
        <span className={styles.sidebar_top_title}>{t('titles.gameList')}</span>
        <div>
          <Button appearance='primary' icon={<AddIcon/>} onClick={showCreateOriginGameModal} style={{ marginRight: 24 }}>新建本地游戏</Button>
          <Button appearance='primary' icon={<SyncIcon />} onClick={props.refresh}>刷新游戏列表</Button>
        </div>
      </div>
      <div className={styles.game_list}>
        {
          props.gameList.map((e, index) => {
            const checked = props.currentSetGame === e.gName;
            return <GameElement
              onClick={async () => {
                const res = await request.post("/api/manageGame/checkGameFolder", { gameName: e.gName });

                if (res.data.status === 'success') {
                  props.setCurrentGame(e.gName);
                } else {
                  await request.post("/api/manageGame/createGame", { gameName: e.gName, gId: e.gId });
                  props.setCurrentGame(e.gName);
                }
              }}
              refresh={props.refresh}
              gameInfo={e}
              key={e.gId + index}
              checked={checked} 
            />;
          })
        }
      </div>
    </div>
    <CreateOriginGameModal
      open={showoCreateGameDialog}
      onClose={() => setShowCreateGameDialog(false)}
      createGame={props.createGame}
    />
  </>;
}
