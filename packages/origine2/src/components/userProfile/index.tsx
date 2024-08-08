import React, { useState } from 'react';
import {
  Persona,
  PersonaSize,
  ContextualMenu,
  DefaultButton,
  Stack,
} from '@fluentui/react';
import { IContextualMenuProps } from '@fluentui/react/lib/ContextualMenu';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/origineStore';
import {TriangleDown12Filled, TriangleDown12Regular, bundleIcon} from '@fluentui/react-icons';
import styles from "./user.module.scss";
import { useDispatch } from 'react-redux';
import { setEditorToken, setUserInfo } from '@/store/userDataReducer';

const UserProfile = () => {
  const userInfo = useSelector((state: RootState) => state.userData.userInfo);
  const [menuVisible, setMenuVisible] = useState(false);
  const [target, setTarget] = useState<EventTarget & HTMLDivElement>();
  const dispatch = useDispatch();

  const menuProps: IContextualMenuProps = {
    items: [
      // {
      //   key: 'changePassword',
      //   text: '修改密码',
      //   onClick: () => {
      //     console.log('修改密码 clicked');
      //   },
      // },
      {
        key: 'logout',
        text: '退出登录',
        onClick: () => {
          localStorage.removeItem('editorToken');
          localStorage.removeItem('editorUserInfo');
          dispatch(setUserInfo({
            userId: '',
            userName: '',
            nickName: '',
            avatar: '',
            email: '',
          }));
          dispatch(setEditorToken(''));
          console.log('退出登录 clicked');
        },
      },
    ],
    target,
    onDismiss: () => setMenuVisible(false),
  };

  return (
    <div className={styles.userProfile}>
      <Persona
        imageUrl={userInfo.avatar}
        size={PersonaSize.size40}
      />
      <div className={styles.infoGroup} onClick={(e) => {
        setMenuVisible(true);
        setTarget(e.currentTarget as EventTarget & HTMLDivElement);
      }}>
        <span className={styles.name}>{userInfo.nickName || userInfo.userName}</span>
        <TriangleDown12Filled className={styles.triangle} />
      </div>
      {menuVisible && <ContextualMenu {...menuProps} />}
    </div>
  );
};

export default UserProfile;
