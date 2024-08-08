import styles from "./gameElement.module.scss";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setDashboardShow, setEditingGame } from "../../store/statusReducer";
import { useValue } from "../../hooks/useValue";
import useVarTrans from "@/hooks/useVarTrans";
import { GameInfo, GameOriginInfo } from "./DashBoard";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api";
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, Toast, Toaster, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { Delete24Filled, Delete24Regular, FolderOpen24Filled, FolderOpen24Regular, MoreVertical24Filled, MoreVertical24Regular, Open24Filled, Open24Regular, Rename24Filled, Rename24Regular, bundleIcon } from "@fluentui/react-icons";
import { request } from "@/utils/request";

interface IGameElementProps {
  gameInfo: GameOriginInfo;
  checked: boolean;
  onClick: () => void;
  refreash?: () => void;
}

export default function GameElement(props: IGameElementProps) {

  const soureBase = "background";
  const t = useVarTrans('dashBoard.');
  const dispatch = useDispatch();

  const MoreVerticalIcon = bundleIcon(MoreVertical24Filled, MoreVertical24Regular);
  const FolderOpenIcon = bundleIcon(FolderOpen24Filled, FolderOpen24Regular);
  const OpenIcon = bundleIcon(Open24Filled, Open24Regular);
  const RenameIcon = bundleIcon(Rename24Filled, Rename24Regular);
  const DeleteIcon = bundleIcon(Delete24Filled, Delete24Regular);
  const [loadingStatusMap, setLoadingStatusMap] = useState<{ [key: string]: number }>({});

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title: string, type: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
      </Toast>,
      { position: 'top', timeout: 3000, intent: type }
    );

  const statusMap = {
    0: "上传游戏",
    1: "上传中",
    2: "上传成功",
    3: "上传失败",
  };

  const enterEditor = async (gameName: string, gId: number) => {
    const callback = () => {
      dispatch(setEditingGame(gameName));
      dispatch(setDashboardShow(false));
    };
    const res = await request.post("/api/manageGame/checkGameFolder", { gameName: props.gameInfo.gName });

    if (res.data.status === 'success') {
      callback();
    } else {
      await request.post("/api/manageGame/createGame", { gameName: props.gameInfo.gName, gId: props.gameInfo.gId });
      callback();
    }
  };

  let className = styles.gameElement_main;
  if (props.checked) {
    className = className + " " + styles.gameElement_checked;
  }

  // 滚动到当前选择的游戏
  useMemo(
    () => {
      props.checked &&
        setTimeout(() => {
          document.getElementById(props.gameInfo.gName)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    },
    [props.gameInfo.gName, props.checked]
  );

  const isShowDeleteDialog = useValue(false);
  const isShowRenameDialog = useValue(false);
  const newGameName = useValue(props.gameInfo.gName);

  const openInFileExplorer = () => {
    api.manageGameControllerOpenGameDict(props.gameInfo.gName, props.gameInfo.gId);
  };

  const previewInNewTab = async () => {
    const res = await request.post("/api/manageGame/checkGameFolder", { gameName: props.gameInfo.gName });

    if (res.data.status === 'success') {
      window.open(`/games/${props.gameInfo.gName}`, "_blank");
    } else {
      await request.post("/api/manageGame/createGame", { gameName: props.gameInfo.gName, gId: props.gameInfo.gId });
      window.open(`/games/${props.gameInfo.gName}`, "_blank");
    }
  };

  const renameThisGame = (gameName: string, newGameName: string) => {
    axios.post("/api/manageGame/rename",
      { source: `public/games/${gameName}/`, newName: newGameName }
    ).then(() => {
      props.refreash?.();
      isShowRenameDialog.set(false);
    });
  };

  const deleteThisGame = () => {
    axios.post("/api/manageGame/delete", { source: `public/games/${props.gameInfo.gName}` }).then(() => {
      props.refreash?.();
      isShowDeleteDialog.set(false);
    }
    );
  };

  const uploadGame = (gameName: string, gId: number) => {
    if (loadingStatusMap[gameName] === 1 || loadingStatusMap[gameName] === 2) {
      return;
    }
    setLoadingStatusMap({ ...loadingStatusMap, [gameName]: 1 });
    request.post("/api/manageGame/uploadGame", { gameName, gId }).then((res) => {
      if (res.data.status === 'success') {
        setLoadingStatusMap({ ...loadingStatusMap, [gameName]: 2 });
        notify("上传成功", "success");
      } else {
        setLoadingStatusMap({ ...loadingStatusMap, [gameName]: 3 });
        notify(res.data.message, "error");
      }
    }).catch((err) => {
      setLoadingStatusMap({ ...loadingStatusMap, [gameName]: 3 });
      notify(err.message, "error");
    });
  };

  return (
    <>
      <div onClick={props.onClick} className={className} id={props.gameInfo.gName}>
        <img
          src={props.gameInfo.gCover}
          alt={props.gameInfo.gName}
          className={styles.gameElement_cover}
        />
        <div className={styles.gameElement_title}>
          <span>{props.gameInfo.gName}</span>
        </div>
        <div className={styles.gameElement_sub}>
          <span className={styles.gameElement_dir}>{props.gameInfo.gName}</span>
          <div className={styles.gameElement_action} onClick={(event) => event.stopPropagation()}>
            <Button size="small" appearance='primary' onClick={() => uploadGame(props.gameInfo.gName, props.gameInfo.gId)}>
              {statusMap[loadingStatusMap[props.gameInfo.gName] as keyof typeof statusMap] || statusMap[0]}
            </Button>
            <Button size="small" appearance='primary' onClick={() => enterEditor(props.gameInfo.gName, props.gameInfo.gId)}>{t('preview.editGame')}</Button>
            <Menu>
              <MenuTrigger>
                <MenuButton appearance='subtle' icon={<MoreVerticalIcon />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<FolderOpenIcon />} onClick={() => openInFileExplorer()}>{t('menu.openInFileExplorer')}</MenuItem>
                  <MenuItem icon={<OpenIcon />} onClick={() => previewInNewTab()}>{t('menu.previewInNewTab')}</MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => isShowDeleteDialog.set(true)}>{t('menu.deleteGame')}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
      <Toaster toasterId={toasterId} />
      {/* 重命名对话框 */}
      <Dialog
        open={isShowRenameDialog.value}
        onOpenChange={() => isShowRenameDialog.set(!isShowRenameDialog.value)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('dialogs.renameDir.title')}</DialogTitle>
            <DialogContent>
              <Input
                style={{ width: '100%' }}
                defaultValue={props.gameInfo.gName}
                onChange={(event) => newGameName.set(event.target.value ? event.target.value.trim() : props.gameInfo.gName)}
                onKeyDown={(event) => (event.key === 'Enter') && renameThisGame(props.gameInfo.gName, newGameName.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowRenameDialog.set(false)}>{t('$common.exit')}</Button>
              <Button appearance='primary' onClick={() => renameThisGame(props.gameInfo.gName, newGameName.value)}>{t('$common.rename')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {/* 删除对话框 */}
      <Dialog
        open={isShowDeleteDialog.value}
        onOpenChange={() => isShowDeleteDialog.set(!isShowDeleteDialog.value)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t('dialogs.deleteGame.title')}</DialogTitle>
            <DialogContent>{t('dialogs.deleteGame.subtext', { gameName: props.gameInfo.gName })}</DialogContent>
            <DialogActions>
              <Button appearance='secondary' onClick={() => isShowDeleteDialog.set(false)}>{t('$common.exit')}</Button>
              <Button appearance='primary' onClick={deleteThisGame}>{t('$common.delete')}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
