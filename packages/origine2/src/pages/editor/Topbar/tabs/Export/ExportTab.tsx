import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import useTrans from "@/hooks/useTrans";
import s from './export.module.scss';
import AndroidIcon from "material-icon-theme/icons/android.svg";
import {api} from "@/api";
import {origineStore} from "@/store/origineStore";
import { Desktop24Filled, Desktop24Regular, Globe24Filled, Globe24Regular, bundleIcon, Money20Regular, Money24Filled } from "@fluentui/react-icons";
import { request } from "@/utils/request";
import { Toast, Toaster, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";

export function ExportTab() {
  const t = useTrans('editor.topBar.');
  const gameName = origineStore.getState().status.editor.currentEditingGame;
  const GlobeIcon = bundleIcon(Globe24Filled, Globe24Regular);
  const DesktopIcon = bundleIcon(Desktop24Filled, Desktop24Regular);
  const MoneyIcon = bundleIcon(Money24Filled, Money20Regular);

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title: string, type: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
      </Toast>,
      { position: 'top', timeout: 3000, intent: type }
    );

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
    <Toaster toasterId={toasterId} />
  </TopbarTab>;
}
