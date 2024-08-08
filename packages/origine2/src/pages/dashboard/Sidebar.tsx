import GameElement from "./GameElement";
import styles from "./sidebar.module.scss";
import { useState } from "react";
import useTrans from "@/hooks/useTrans";
import { GameOriginInfo } from "./DashBoard";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1 } from "@fluentui/react-components";
import {  bundleIcon, ArrowSync24Filled, ArrowSync24Regular } from "@fluentui/react-icons";
import { request } from "@/utils/request";

interface ISidebarProps {
  gameList: GameOriginInfo[];
  currentSetGame: string | null;
  setCurrentGame: (currentGame: string) => void;
  refreash?: () => void;
}

export default function Sidebar(props: ISidebarProps) {
  const t = useTrans('dashBoard.');

  const SyncIcon = bundleIcon(ArrowSync24Filled, ArrowSync24Regular);

  const [createGameFormOpen, setCreateGameFormOpen] = useState(false);
  const [newGameName, setNewGameName] = useState(t('createNewGame.dialog.defaultName') || 'NewGame');

  return <div className={`${styles.sidebar_main} ${!props.currentSetGame ? styles.sidebar_main_fullwidth : ""}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t('titles.gameList')}</span>
      <Button appearance='primary' icon={<SyncIcon />} onClick={props.refreash}>刷新游戏列表</Button>
    </div>
    <div className={styles.game_list}>
      {
        props.gameList.map(e => {
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
            refreash={props.refreash}
            gameInfo={e}
            key={e.gId}
            checked={checked} 
          />;
        })
      }
    </div>
  </div>;
}
