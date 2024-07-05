import * as React from "react";
import {
  Field,
  Input,
  Image,
  Button,
  Divider,
} from "@fluentui/react-components";
import {
  PersonRegular,
  PasswordRegular,
  BuildingBankLinkRegular,
  Album24Regular,
} from "@fluentui/react-icons";
import { authScreenStyles } from "./styles";
import { MessageBarType } from "@fluentui/react";
import axios from "axios";
export const LoginPage = () => {
  const styles = authScreenStyles();
  const [email, setEmail] = React.useState("");
  const [invitationCode, setInvitationCode] = React.useState("");
  const [checkCode, setCheckCode] = React.useState("");
  const [verificationCodeSended, setVerificationCodeSended] = React.useState(false);

  const handleLogin = async () => {
    if (!email) {
      alert("请输入邮箱");
    }

    // 邮箱正则验证
    if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
      alert("请输入正确的邮箱");
      return;
    }

    // if (!invitationCode) {
    //   alert("请输入邀请码");
    //   return;
    // }

    if (!checkCode) {
      alert("请输入邮箱验证码");
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", { email, invitationCode: invitationCode || undefined, checkCode });

      if (res.data.access_token) {
        localStorage.setItem("editor-token", res.data.access_token);
        window.location.href = "/";
      }
    } catch (error: any) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className={styles.root}>
      <Image
        alt="SmoothFile Logo"
        src="imgs/logo.png"
        fit="center"
        loading="lazy"
      />
      <div className={styles.inputList}>
        <Field
          label="邮箱"
          validationState="none"
          validationMessage=""
          required
        >
          <Input size="large" type="email" contentBefore={<BuildingBankLinkRegular />} onChange={(e) => setEmail(e.target.value)} value={email} />
        </Field>
        <div className={styles.codeRow}>
          <Field
            className={styles.input}
            label="邮箱验证码"
            validationState="none"
            validationMessage=""
            required
          >
            <Input size="large" contentBefore={<Album24Regular />} onChange={(e) => setCheckCode(e.target.value)} value={checkCode} />
          </Field>
          <Button size="large" className={styles.button} appearance="primary" onClick={(e) => {
            if (verificationCodeSended) {
              return;
            }

            if (!email) {
              alert("请输入邮箱");
            }

            // 邮箱正则验证
            if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email)) {
              alert("请输入正确的邮箱");
              return;
            }

            // 发送验证码
            axios.post("https://test-api.idoltime.games/sendMailCode", {
              email: email,
              type: 1,
            }).then(() => {
              setVerificationCodeSended(true);
            }).catch((e) => {
              alert('发送失败，请稍后重试');
            });
          }}>
            {verificationCodeSended ? "已发送" : "发送"}
          </Button>
        </div>
        <Field
          className={styles.input}
          label="邀请码"
          validationState="none"
          validationMessage=""
          // required
        >
          <Input
            type="text"
            size="large"
            contentBefore={<PasswordRegular />}
            onChange={(e) => setInvitationCode(e.target.value)}
            value={invitationCode}
          />
        </Field>
        <Button size="large" className={styles.button} appearance="primary" onClick={handleLogin}>
          登录
        </Button>
      </div>
      <div style={{ marginTop: "30px" }}>
        <Divider className={styles.copyRightFont}>
          IdolTime | 创造下一个游戏世代.
        </Divider>
      </div>
    </div>
  );
};
