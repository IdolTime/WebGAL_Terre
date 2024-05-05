import {useDispatch, useSelector} from "react-redux";
import {RootState,} from "@/store/origineStore";
import {useEffect, useState} from "react";
import { Popover, Button, message } from "antd";
import { getGameDetail, getResourceList, getUserInfo } from "@/services";
import { setUserDetail, setSourceList } from "@/store/statusReducer";
import styles from "./header.module.scss";

function Header() {
  const [loading, setLoading] = useState(false);

  const userDetail = useSelector((state: RootState) => state.status.userInfo.userDetail);
  const gId = useSelector((state: RootState) => state.status.userInfo.gId) as number;

  const dispatch = useDispatch();

  useEffect(() => {
    if (window.location.hash.slice(0,6) !== '#login') {
      if (!localStorage.getItem('userToken')) {
        window.location.href = '/#login'
      } else {
        getUserInfo().then((res) => {
          if (res.data.code === 0) {
            getGameDetail({ gId }).then((result) => {
              dispatch(setUserDetail({
                ...res.data.data,
                gName: result.data.data.name
              }))
            })
            
          } else if (res.data.code === 401) {
            window.location.href = '/#login'
            localStorage.removeItem('userToken')
          }
        }).catch(() => {
          // window.location.href = '/#login'
        })
      }
    }
    
  }, [])

  function logout() {
    const handleLogout = () => {
      localStorage.removeItem('userToken')
      // window.location.href = '/#login'
      window.location.reload()
    }
    return (
      <div 
        onClick={handleLogout} 
        style={{
          cursor: 'pointer',
          color: 'white',
        }}
      >
        退出登录
      </div>
    )
  }

  function updateSource() {
    setLoading(true);
    getResourceList({
      page: 1,
      pageSize: 9999,
      gId: Number(gId),
      gType: '',
      resourceType: 0,
      query: "",
    }).then((res) => {
        message.success("更新成功");
        dispatch(setSourceList(res.data?.data?.data || []));
        localStorage.setItem(
            "sourceList",
            JSON.stringify(res.data?.data?.data || [])
        );
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <div>
      {
        window.location.hash.slice(0,6) !== '#login' && userDetail &&
          <div className={styles.container}>
            <Button style={{marginRight: '12px'}} onClick={() =>updateSource()} loading={loading}>更新素材库</Button>
            <div style={{marginRight: '12px'}}>作品名称：{userDetail.gName}</div>
            <Popover placement="bottom" content={logout} className={styles.flex} color="black">
              <img src={userDetail.avatar} alt="" className={styles.avatar} />
              <span>{userDetail.email}</span>
            </Popover>
          </div>
      }
    </div>
  );
}

export default Header;
