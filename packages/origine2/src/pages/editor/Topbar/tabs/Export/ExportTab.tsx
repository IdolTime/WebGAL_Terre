import TopbarTab from "@/pages/editor/Topbar/components/TopbarTab";
import {TabItem} from "@/pages/editor/Topbar/components/TabItem";
import {IconWithTextItem} from "@/pages/editor/Topbar/components/IconWithTextItem";
import useTrans from "@/hooks/useTrans";
import s from './export.module.scss';
// import AndroidIcon from "material-icon-theme/icons/android.svg";
import {api} from "@/api";
import {origineStore} from "@/store/origineStore";
import { Desktop24Filled, Desktop24Regular, Globe24Filled, Globe24Regular, bundleIcon } from "@fluentui/react-icons";

export function ExportTab() {
  const t = useTrans('editor.topBar.');
  const editor = origineStore.getState().status.editor
  const DesktopIcon = bundleIcon(Desktop24Filled, Desktop24Regular);
  // const GlobeIcon = bundleIcon(Globe24Filled, Globe24Regular);

  return <TopbarTab>
    <TabItem title={t("$导出")}>
      <IconWithTextItem 
        icon={<DesktopIcon aria-label="Export Exe" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.exe')}
        onClick={() => {
          const gamePackageName  = editor.gamePackageName || editor.currentEditingGame;
          api.manageGameControllerEjectGameAsExe(`${editor.currentEditingGame}/${gamePackageName}`,)
        }}
      />

      {/* <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsWeb(gameName)}
        icon={<GlobeIcon aria-label="Export Web" className={s.iconColor}/>}
        text={t('commandBar.items.release.items.web')}/> */}
  
      {/* <IconWithTextItem onClick={() => api.manageGameControllerEjectGameAsAndroid(gameName)}
        icon={<img src={AndroidIcon} className={s.iconColor} alt="Export Android"/>}
        text={t('commandBar.items.release.items.android')}/> */}
    </TabItem>
  </TopbarTab>;
}
