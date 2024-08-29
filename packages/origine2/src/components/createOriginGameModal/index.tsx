import styles from "./index.module.scss";
import styled from 'styled-components';
import {
  Form,
  Input,
  Select,
  Col, 
  Modal, 
  Radio, 
  Row, 
  Upload, 
  UploadProps, 
  message,
  InputNumber
} from 'antd';
import { useEffect, useState } from 'react';
import { addGame, upload, getClassificationList } from "@/utils/services";
import Loading from "../Loading";

import UploadClose from '@/assets/uploadClose.svg';
import UploadIcon from '@/assets/uploadIcon.svg';
import RewardLeft from '@/assets/rewardLeft.svg';
import RewardRight from '@/assets/rewardRight.svg';

type FileType = Parameters<NonNullable<UploadProps['beforeUpload']>>[0];
const CustomModal = styled(Modal)`
  .ant-modal-content {
    background: linear-gradient(180deg, #EAE7FE 0%, #F9EAFB 100%); !important;
    border-radius: 12px !important;     
    padding: 20px 36px !important;           
  }
`;

const CustomFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    color: #707083; 
    font-size: 16px;
    font-weight: 600;
    font-family: "SourceHan-Serif";
  }
`;

const CustomRadioGroup = styled(Radio.Group)`
  .ant-radio-wrapper {
    color: #707083; /* 更改文字颜色 */
    font-family: "SourceHan-Serif";
    font-weight: 600;
    font-size: 16px;
  }
  .ant-radio-wrapper-checked {
    color: #B072EF;
  }
  .ant-radio-wrapper:hover .ant-radio-inner {
    border-color: #B072EF;
  }

  .ant-radio-inner {
    width: 20px; /* 更改 Radio 的大小 */
    height: 20px; /* 更改 Radio 的大小 */
    border-color: #707083; /* 更改边框颜色 */
    background: transparent;
  }

  .ant-radio-inner::after {
    background-color: #B072EF; /* 更改选中状态的颜色 */
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #B072EF; /* 更改选中状态的边框颜色 */
    background: transparent;
  }

  .ant-radio-checked .ant-radio-inner::after {
    background-color: #B072EF; /* 更改选中状态的颜色 */
    transform: scale(0.8);
  }
`;

const CustomSelect = styled(Select)`
  &:hover .ant-select-selector {
    border-color: #D4C1E6 !important;
  }
  .ant-select-selection-placeholder {
    font-family: 'SourceHan-Serif';
  }

  .ant-select-dropdown {
    background-color: #f9f9f9 !important; /* 更改下拉菜单背景颜色 */
  }

  .ant-select-item-option-selected {
    background-color: #e6f7ff !important; /* 更改选中项背景颜色 */
  }
`;


const formItemLayout = {
  labelCol: {
    span: 4 
  },
  wrapperCol: {
    span: 20 
  },
};

interface propsType {
  open: boolean
  onClose: () => void
  createGame: (gName: string, gId: number, localInfo: any) => Promise<{ status: string }>;
}

export default function createOriginGameModal({ open, onClose, createGame }: propsType) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabList, setTabList] = useState<any>([]);
  const [coverPic, setCoverPic] = useState('');
  const [detailPic, setDetailPic] = useState('');
  const [formInstance] = Form.useForm();
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    getClassificationList().then(res => {
      if (res.data.code === 0) {
        const ant = res.data.data || [];
        setTabList(ant);
      }
    });
  }, []);

  useEffect(() => {
    if (open) {
      formInstance.resetFields();
      setCoverPic('');
      setDetailPic('');
    }
  }, [open]);

  const onValuesChange = (changedValues: any, allValues: any) => {
    // 检查是否有任何字段有输入
    const hasInput = Object.values(allValues).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    });
    setIsChanged(hasInput);
  };

  const beforeUpload = async (file: FileType, type: string) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/webp'; //  || file.type === 'image/png' 
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/webp file!');
    }
    const num = type === 'coverPic' ? 2 : 3;
    const isLt2M = file.size / 1024 / 1024 < num;
    if (!isLt2M) {
      message.error(`Image must smaller than ${num}MB!`);
    }
    // 图片尺寸
    const x = type === 'coverPic' ? 320 : 1350;
    const y = type === 'coverPic' ? 180 : 760;
    const validPx = await isValidImgSize(file, x, y);
    if (!validPx) {
      message.error(`尺寸小于或等于${x}*${y}像素`);
    }

    return isJpgOrPng && isLt2M && validPx;
  };

  const customRequest = async (options: any, filed: string) => {
    if (uploading) {
      return;
    }
    setUploading(true);
    try {
      const res = await upload(options.file as FileType) || {};
      console.log('data', res);
      const data = res.data.data || '';
      formInstance.setFieldValue(filed, data);
      if (filed === 'coverPic') {
        setCoverPic(data);
      } else {
        setDetailPic(data);
      }
      setUploading(false);
    } catch {
      setUploading(false);
    }
  };

  const submit = async() => {
    const values = await formInstance.validateFields();
    console.log(values, 'values');
    setLoading(true);
    new Promise(() => {
      createGame(values.name, 0, values).then(res => {
        if (res.status === 'success') {
          message.success('创建成功');
          onClose();
        } else {
          message.error('创建失败');
        }
      });
    }).finally(() => {
      setLoading(false);
    });
  };
  
  return (
    <CustomModal
      title=""
      open={open}
      closable={false}
      footer={null}
      width={960}
      centered
      styles={{
        mask: {
          background: 'rgba(0,0,0,0.7)'
        }
      }}
    >
      <Loading open={loading || uploading} />
      <div className={styles.modalTitleBg}>提示</div>
      <div 
        className={styles.modalClose}
        onClick={() => onClose()}
      />
      <div className={styles.modalTitle}>
        <div>创建作品</div>
      </div>
      <Form 
        {...formItemLayout} 
        className={styles.modalForm}
        form={formInstance}
        onValuesChange={onValuesChange}
      >
        <Row>
          <Col span={12}>
            <CustomFormItem 
              label="名称" 
              name="name" 
              rules={[{ required: true, message: '请输入你的作品名称' }]}
              labelCol={{
                span: 8
              }}
              wrapperCol={{
                span: 16
              }}
            >
              <Input placeholder='请输入你的作品名称' className={styles.formItem} />
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem
              label="作品类型"
              name="gType"
              rules={[{ required: true, message: '请选择作品类型' }]}
              labelCol={{
                span: 6
              }}
              wrapperCol={{
                span: 18
              }}
            >
              <CustomRadioGroup>
                <Radio 
                  value="GAME_TYPE_AVG"
                >AVG游戏</Radio>
                <Radio 
                  value="GAME_TYPE_VIDEO"
                >视频游戏</Radio>
              </CustomRadioGroup>
            </CustomFormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <CustomFormItem 
              label="分类" 
              name="classificationIds" 
              rules={[{ required: true, message: '请选择分类' }]}
              labelCol={{
                span: 8
              }}
              wrapperCol={{
                span: 16
              }}
            >
              <CustomSelect 
                placeholder='请选择分类' 
                mode="multiple" 
                options={tabList || []}
                fieldNames={{
                  label: 'classificationName',
                  value: 'classificationId'
                }}
              />
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem
              label="标签"
              name="tags"
              rules={[{ required: true, message: '请输入标签' }]}
              labelCol={{
                span: 6
              }}
              wrapperCol={{
                span: 18
              }}
            >
              <CustomSelect
                mode="tags"
                placeholder="请输入标签回车确认, 最多5个"
                options={[]}
                maxCount={5}
              />
            </CustomFormItem>
          </Col>
        </Row>
        <CustomFormItem 
          label="描述" 
          name="description" 
          rules={[{ required: true, message: '请输入你的作品描述' }]}
        >
          <Input placeholder='请输入你的作品描述' className={styles.formItem} />
        </CustomFormItem>
        <CustomFormItem
          label="详细说明"
          name="summary"
          rules={[{ required: true, message: '请输入你的作品详细说明' }]}
        >
          <Input.TextArea 
            placeholder='请输入你的作品详细说明' 
            className={styles.formItem} 
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </CustomFormItem>
        <Row>
          <Col span={12}>
            <CustomFormItem noStyle shouldUpdate={(prevValues: any, currentValues: any) => prevValues.isFree !== currentValues.isFree}>
              {({ getFieldValue }) => (
                getFieldValue('isFree') === 1 ?
                  <CustomFormItem
                    label="是否试玩"
                    name="tryPlay"
                    rules={[{ required: true, message: '请选择是否试玩' }]}
                    labelCol={{
                      span: 8
                    }}
                    wrapperCol={{
                      span: 16
                    }}
                  >
                    <CustomRadioGroup>
                      <Radio 
                        value={2}
                      >是</Radio>
                      <Radio 
                        value={1}
                      >否</Radio>
                    </CustomRadioGroup>
                  </CustomFormItem>
                  : null
              )}
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem noStyle shouldUpdate={(prevValues: any, currentValues: any) => prevValues.isFree !== currentValues.isFree}>
              <CustomFormItem
                label="分辨率"
                name="gameView"
                rules={[{ required: true, message: '请选择游戏分辨率' }]}
                labelCol={{
                  span: 7
                }}
                wrapperCol={{
                  span: 17
                }}
              >
                <CustomRadioGroup>
                  <Radio 
                    value={1}
                  >横版<span style={{ fontSize: 12 }}>(适合PC游玩)</span></Radio>
                  <Radio 
                    value={2}
                  >竖版<span style={{ fontSize: 12 }}>(适合手机游玩)</span></Radio>
                </CustomRadioGroup>
              </CustomFormItem>
            </CustomFormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <CustomFormItem 
              label="售卖信息" 
              name="isFree" 
              rules={[{ required: true, message: '请选择售卖信息' }]}
              labelCol={{
                span: 8
              }}
              wrapperCol={{
                span: 16
              }}
              initialValue={1}
            >
              <CustomSelect 
                placeholder='请选择售卖信息' 
                options={[
                  {
                    label: '免费',
                    value: 2
                  },
                  {
                    label: '收费',
                    value: 1
                  }
                ]}
              />
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem noStyle shouldUpdate={(prevValues: any, currentValues: any) => prevValues.isFree !== currentValues.isFree}>
              {({ getFieldValue }) => (
                getFieldValue('isFree') === 1 ?
                  <CustomFormItem
                    label="单价"
                    name="salesAmount"
                    rules={[
                      { 
                        required: true, 
                        message: '请输入单价' 
                      },
                    ]}
                    labelCol={{
                      span: 6
                    }}
                    wrapperCol={{
                      span: 18
                    }}
                  >
                    <InputNumber placeholder='请输入单价（单位：星石）' className={styles.formItem} style={{width: '100%'}} />
                  </CustomFormItem>
                  : null
              )}
            </CustomFormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <CustomFormItem 
              label="封面图"
              name="coverPic"
              labelCol={{
                span: 8
              }}
              wrapperCol={{
                span: 12
              }}
              rules={[{ required: true, message: '请上传封面图' }]}
            >
              <Upload 
                showUploadList={false}
                customRequest={(options) => customRequest(options, 'coverPic')}
                disabled={uploading}
                beforeUpload={(file: any) => beforeUpload(file, 'coverPic') as any}
              >
                <div className={styles.uploadContainer}>
                  {
                    coverPic ?
                      <>
                        <img 
                          src={UploadClose} 
                          alt="" 
                          className={styles.uploadClose} 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCoverPic('');
                            formInstance.setFieldValue('coverPic', '');
                          }}
                        />
                        <img src={coverPic} alt="" className={styles.uploadImg}  />
                      </>
                      : <>
                        <img src={UploadIcon} alt="" />
                        <div>请上传</div>
                      </>
                  }
                </div>
              </Upload>
            </CustomFormItem>
          </Col>
          <Col span={12}>
            <CustomFormItem 
              label="详情图"
              labelCol={{
                span: 4
              }}
              wrapperCol={{
                span: 14
              }}
              name="detailPic"
              rules={[{ required: true, message: '请上传详情图' }]}
            >
              <Upload 
                showUploadList={false}
                customRequest={(options) => customRequest(options, 'detailPic')}
                disabled={uploading}
                beforeUpload={(file) => beforeUpload(file, 'detailPic') as any}
              >
                <div className={styles.uploadContainer}>
                  {
                    detailPic ?
                      <>
                        <img 
                          src={UploadClose}
                          alt="" 
                          className={styles.uploadClose} 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDetailPic('');
                            formInstance.setFieldValue('detailPic', '');
                          }}
                        />
                        <img src={detailPic} alt="" className={styles.uploadImg}  />
                      </>
                      : <>
                        <img src={UploadIcon} alt="" />
                        <div>请上传</div>
                      </>
                  }
                </div>
              </Upload>
            </CustomFormItem>
          </Col>
        </Row>
      </Form>
      <div className={styles.modalFooter}>
        <div className={styles.modalFooterCancel} onClick={() => onClose()}>
          <img 
            src={RewardLeft} alt="" 
          />
          取消
          <img 
            src={RewardRight}
            alt="" 
          />
        </div>
        <div 
          className={`${styles.modalFooterConfirm} ${isChanged ? styles.modalFooterConfirmNel : ''}`}
          onClick={() => {
            if (loading) return;
            submit();
          }}
        >
          <img 
            src={RewardLeft} alt="" 
          />
          确认
          <img 
            src={RewardRight}
            alt="" 
          />
        </div>
      </div>
    </CustomModal>
  );
}

function isValidImgSize (file: any, width: number, height: number) {
  return new Promise((resolve, reject) => {
    let _URL = window.URL || window.webkitURL;
    let img = new Image();
    img.onload = function () {
      let valid = false;
      console.log('width=', img.width, 'heihgt=', img.height);
      valid = img.width <= width && img.height <= height;
      return resolve(valid);
    };
    img.src = _URL.createObjectURL(file);
  });
};