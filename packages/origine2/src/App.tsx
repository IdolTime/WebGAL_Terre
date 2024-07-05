import "./App.css";
import {logger} from "./utils/logger";
import DashBoard from "./pages/dashboard/DashBoard";
import {Provider} from "react-redux";
import {origineStore, persistor} from "./store/origineStore";
import Editor from "./pages/editor/Editor";
import {useEffect, useState} from "react";
import "@icon-park/react/styles/index.css";
import axios from "axios";
import {mapLspKindToMonacoKind} from "./pages/editor/TextEditor/convert";
import * as monaco from "monaco-editor";
import Translation from "./components/translation/Translation";
import {lspSceneName} from "@/runtime/WG_ORIGINE_RUNTIME";
import './config/themes/theme.css';
import {PersistGate} from 'redux-persist/integration/react';
import './assets/font-family.css';
import { LoginPage } from "./pages/login";
import { useDispatch } from "react-redux";
import {setEditorToken} from "@/store/userDataReducer";
import { useHashRoute } from "./hooks/useHashRoute";
import { useGetUserInfo } from "./hooks/useGetUserInfo";


function App() {
  const dispatch = useDispatch();
  const [route, setRoute] = useState("/");
  useHashRoute();
  useGetUserInfo();

  useEffect(() => {
    logger.info("Welcome to IdolTime live editor!");

    // 防止多次注册，语言在初次进入的时候注册
    monaco.languages.register({id: "webgal"});
    /**
     * LSP
     */
    monaco.languages.registerCompletionItemProvider("webgal", {
      provideCompletionItems: (model, position) => {
        const editorValue = model.getValue();
        const params: any = {
          textDocument: {
            uri: lspSceneName.value
          },
          position: {line: position.lineNumber - 1, character: position.column - 1}
        };

        const data = {
          editorValue, params
        };

        return new Promise(resolve => {
          axios.post("/api/lsp/compile", data).then((response) => {
            // 处理 LSP 的响应
            const result = {
              suggestions: response.data.items.map((suggestion: any) => {
                return {...suggestion, kind: mapLspKindToMonacoKind(suggestion.kind)};
              })
            };
            resolve(result);
          });
        });
      }, triggerCharacters: ["-", "", ":", "\n"]
    });
  });

  useEffect(() => {
    const token = localStorage.getItem('editor-token');
    dispatch(setEditorToken(token || ''));

    // 监听hash变化，更新路由
    function handleHashChange() {
      const hash = window.location.hash.substring(2);
      setRoute(hash || '');
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('load', handleHashChange); // Handle the initial load

    // Initial display
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    // 将编辑器的根元素占满整个视口
    <div className="App">
      <Translation/>
      {route === '' && <DashBoard/>}
      {!!route && route !== 'login' && <Editor/>}
      {route === 'login' && <LoginPage />}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={origineStore}>
      <PersistGate loading={null} persistor={persistor}>
        <App/>
      </PersistGate>
    </Provider>
  );
};
