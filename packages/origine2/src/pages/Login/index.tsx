import styles from "./login.module.scss";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/store/origineStore";
import { useHashRoute } from "@/hooks/useHashRoute";
import {setSourceList, setGId} from "@/store/statusReducer";
// import { observer } from "mobx-react";
import type { FormProps } from 'antd';
import { Button, Form, Input, message } from 'antd';
import { login, getResourceList } from '@/services'
import md5 from 'js-md5'
// import { useRootStores } from "@/stores";

type FieldType = {
  Email?: string;
  password?: string;
  gId?:string
};


export default function Login() {
  const isShowLogin = useSelector((state: RootState) => state.status.login.showLogin);
  const dispatch = useDispatch();
  useHashRoute();
  // const isAutoHideToolbar = useSelector((state:RootState)=>state.userData.isAutoHideToolbar);

  // function handleMainAreaClick(){
  //   if(isAutoHideToolbar){
  //     dispatch(statusActions.setCurrentTopbarTab(undefined));
  //   }
  // }
  const onFinish: FormProps<FieldType>['onFinish'] = async(values) => {
    console.log('Success:', values);
    const res = await login({
      email: values.Email as string,
      password: md5.md5(values.password as string),
      gId: Number(values.gId)
    }).catch(() => {
      message.error('登录失败, 请重试')
    })
    if (res.data.code === 0) {
      localStorage.setItem('userToken', res.data.data)
      getResourceList({ 
        page: 1,
        pageSize: 9999,
        gId: Number(values.gId),
        gType: '',
        resourceType: 0,
        query: ''
      }).then(res => {
        message.success('登录成功')
        location.href= '/'
        dispatch(setSourceList(res.data?.data?.data || []))
        dispatch(setGId(Number(values.gId)))
        localStorage.setItem('sourceList', JSON.stringify(res.data?.data?.data || []))
        localStorage.setItem('gId', values.gId as string)
      })
    } else if (res.data.code === 10027) {
      message.error('作品ID错误')
    } else {
      message.error('登录失败, 请重试')
    }
  };
  
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return <>
    {
      isShowLogin && 
        <div className={styles.login}>
          <div className={styles.container}>
            <div className={styles.title}>欢迎登入编辑器系统</div>
            <Form
              name="basic"
              layout="vertical"
              style={{ width: 400, margin: '0 auto'}}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              size="large"
              autoComplete="off"
            >
              <Form.Item<FieldType>
                label={<label style={{ color: "white" }}>Email</label>}
                name="Email"
                rules={[{ type: 'email', required: true, message: '请输入邮箱' }]}
              >
                <Input placeholder="邮箱" />
              </Form.Item>

              <Form.Item<FieldType>
                label={<label style={{ color: "white" }}>Password</label>}
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
              <Form.Item<FieldType>
                label={<label style={{ color: "white" }}>作品ID</label>}
                name="gId"
                rules={[{ required: true, message: '请输入作品ID' }]}
              >
                <Input placeholder="作品ID" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{background: '#1677ff', width: '400px', marginTop: '10px'}}>
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
    }
  </>;
}
