import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import useTrans from "@/hooks/useTrans";
import s from './export.module.scss';
// import AndroidIcon from "material-icon-theme/icons/android.svg";
import {api} from "@/api";
import {origineStore, RootState} from "@/store/origineStore";
import { Desktop24Filled, Desktop24Regular, Globe24Filled, Globe24Regular, bundleIcon, Money20Regular, Money24Filled } from "@fluentui/react-icons";
import { request } from "@/utils/request";
import { Toast, Toaster, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { WebgalParser } from "@/pages/editor/GraphicalEditor/parser";

export function ExportTab() {
  const t = useTrans('editor.topBar.');
  const editor = origineStore.getState().status.editor;
  const gameName = editor.currentEditingGame;
  const DesktopIcon = bundleIcon(Desktop24Filled, Desktop24Regular);
  const MoneyIcon = bundleIcon(Money24Filled, Money20Regular);
  const userInfo = useSelector((state: RootState) => state.userData.userInfo);
  const [gid, setGid] = useState(0);
  
  useEffect(() => {
    const getConfig = async () => {
      const gameConfigData = (await request.get(`/api/manageGame/getGameConfig/${gameName}`)).data;
      const gameConfig = WebgalParser.parseConfig(gameConfigData);
      const gId = gameConfig.find(e => e.command === "Game_id")?.args?.join('') ?? "";

      if (gId && gId !== '0') {
        setGid(Number(gId));
      }
    };
  }, []);


  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title: string, type: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
      </Toast>,
      { position: 'top', timeout: 3000, intent: type }
    );
  const GlobeIcon = bundleIcon(Globe24Filled, Globe24Regular);

  if (!gid && userInfo.editorType !== 2) return null;

  return <TopbarTab>
    <TabItem title={t("$导出")}>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsWeb(gameName)}
        icon={<GlobeIcon aria-label="Export Web" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.web')}/>
      <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsExe(gameName)}
        icon={<DesktopIcon aria-label="Export Exe" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.exe')}/>
      {/* <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsAndroid(gameName)}
        icon={<img src={AndroidIcon} className={s.iconColor} alt="Export Android"/>}
        text={t('commandBar.items.release.items.android')}/> */}
    </TabItem>
    {!!gid && (
      <TabItem title="上传付费配置">
        <IconWithTextItem onClick={() => {
        // request.post("https://test-api.idoltime.games/editor/game/chapter_sales_list", {
        //   gId: origineStore.getState().status.editor.currentGameId,
        // });
          request.post('/api/manageGame/updatePaymentConfig', {
            gameName,
            gId: origineStore.getState().status.editor.currentGameId,
          }).then((res) => {
            if (res.data.status === 'success') {
              notify("上传成功", "success");
            } else {
              notify(res.data.message, "error");
            }
          });
        }}
        icon={<MoneyIcon aria-label="Upload payment configuration" className={s.iconColor}/>}
        text="上传付费配置"
        />
      </TabItem>
    )}
    <Toaster toasterId={toasterId} />
  </TopbarTab>;
}
