import { RootState } from "@/store/origineStore";
import userDataReducer, { setUserInfo } from "@/store/userDataReducer";
import { request } from "@/utils/request";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";


export function useGetUserInfo() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.userData.editorToken);

  useEffect(() => {
    if (!token) return;

    request.post("https://test-api.idoltime.games/editor/user_info").then((res) => {
      if (res.data.code === 0) {
        console.log("获取用户信息成功", res.data.data);
        localStorage.setItem("editorUserInfo", JSON.stringify(res.data.data));
        dispatch(setUserInfo(res.data.data));
      } else {
        console.log("获取用户信息失败");
        localStorage.removeItem("editorToken");
        localStorage.removeItem("editorUserInfo");
        location.hash = '/login';
      }
    });
  }, [token, dispatch]);
}