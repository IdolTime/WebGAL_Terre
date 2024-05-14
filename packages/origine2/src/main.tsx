import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import { en } from "./translations/en";
import { zhCn } from "./translations/zh-cn";
import { jp } from "./translations/jp";
import 'primereact/resources/themes/fluent-light/theme.css';
import "primereact/resources/primereact.min.css";
import "./primereact.scss";
import { BrandVariants, createLightTheme, createDarkTheme, FluentProvider, makeStyles, Theme } from "@fluentui/react-components";

const terre: BrandVariants = { 
  10: "#020306",
  20: "#111725",
  30: "#152642",
  40: "#17325A",
  50: "#163E73",
  60: "#124B8D",
  70: "#0558A8",
  80: "#2A65B4",
  90: "#4672BC",
  100: "#5D80C3",
  110: "#728ECA",
  120: "#859CD1",
  130: "#98ABD8",
  140: "#ABB9DF",
  150: "#BEC8E7",
  160: "#D0D7EE"
};

const lightTheme: Theme = {
  ...createLightTheme(terre),
};

const darkTheme: Theme = {
  ...createDarkTheme(terre), 
};

darkTheme.colorBrandForeground1 = terre[110];
darkTheme.colorBrandForeground2 = terre[120];

function initTranslation() {
  i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
      resources: {
        en: { translation: en },
        zhCn: { translation: zhCn },
        jp: { translation: jp },
      },
      lng: 'zhCn', // if you're using a language detector, do not define the lng option
      fallbackLng: 'zhCn',

      interpolation: {
        escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
      },
    })
    .then(() => console.log('IdolTime i18n Ready!'));
}

initTranslation();
initializeIcons();

// 不用 StrictMode，因为会和 react-butiful-dnd 冲突
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <FluentProvider theme={lightTheme} style={{width: '100%', height: '100%'}}>
    <App />
  </FluentProvider>
  // </React.StrictMode>
);
