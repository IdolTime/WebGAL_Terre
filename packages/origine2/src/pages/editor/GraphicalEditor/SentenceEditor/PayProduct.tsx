import { Dropdown, Option } from '@fluentui/react-components';
import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import { useEffect } from 'react';

const salesTypeMap = new Map([['1', '星石'], ['2', '星光']]);

export default function PayProduct(props: ISentenceEditorProps) {
  const name = useValue<string>('');
  const productId = useValue<number>(0);
  const amount = useValue<number>(100);
  const chapter = useValue<number>(1);
  const error = useValue<string>('');
  const salesType = useValue('1');

  useEffect(() => {
    if (props.sentence.content !== '') {
      productId.set(Number(props.sentence.content));
    } else {
      productId.set(Date.now());
    }

    props.sentence.args.forEach((k) => {
      if (k.key === 'amount') {
        amount.set(Number(k.value));
      } else if (k.key === 'name') {
        name.set(k.value.toString());
      } else if (k.key === 'chapter') {
        chapter.set(Number(k.value));
      } else if (k.key === 'salesType') {
        salesType.set(k.value.toString());
      }
    });
  }, []);

  function setContent() {
    
    let content = `payProduct:${productId.value}`;

    content += ` -amount=${amount.value}`;
    content += ` -name=${name.value.trim()}`;
    content += ` -chapter=${chapter.value}`;
    content += ` -salesType=${salesType.value}`;

    if (!name.value) {
      error.set('请填写章节名称');
    } else {
      error.set('');
    }

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent} style={{ paddingBottom: 20 }}>
      <div className={styles.editItem}>
        <CommonOptions title="付费ID" key="payProduct-1">
          <input
            value={productId.value}
            disabled
            className={styles.sayInput}
            style={{ width: '200px' }}
          />
        </CommonOptions>
        <CommonOptions title="章节名称" key="payProduct-2">
          <div style={{ position: 'relative' }}>
            <input 
              className={styles.sayInput}
              style={{ width: '80px' }}
              value={name.value} 
              onChange={(e) => {
                const newValue = e.target.value;
                name.set(newValue ?? '');
              }}
              onBlur={setContent}
            />
            <p style={{ position: 'absolute', bottom: -33, color: '#e12222', whiteSpace: 'nowrap' }}>{error.value}</p>
          </div>
        </CommonOptions>
        <CommonOptions title='付费金额' key="payProduct-4">
          <span style={{ marginRight: '8px' }}>定价</span>
          <input 
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={amount.value} 
            onChange={(e) => {
              const newValue = Number(e.target.value);
              amount.set(newValue ?? 0);
            }}
            onBlur={setContent}
          />
        </CommonOptions>
        <CommonOptions title='售卖类型' key="payProduct-9">
          <span style={{ marginRight: '8px' }}>售卖单位</span>
          <Dropdown
            value={salesTypeMap.get(salesType.value)}
            selectedOptions={[salesType.value.toString()]}
            onOptionSelect={(ev, data) => {
              salesType.set(data.optionValue || '');
              setContent();
            }}
            style={{ minWidth: 0 }}
          >
            <Option value="1">星石</Option>
            <Option value="2">星光</Option>
          </Dropdown>
        </CommonOptions>
        <CommonOptions title='章节' key="payProduct-5">
          <span style={{ marginRight: '8px' }}>第</span>
          <input 
            type="number"
            className={styles.sayInput}
            style={{ width: '80px' }}
            value={chapter.value} 
            onChange={(e) => {
              const newValue = Number(e.target.value);
              chapter.set(newValue ?? 1);
            }}
            onBlur={setContent}
          />
          <span style={{ marginLeft: '8px' }}>章</span>
        </CommonOptions>
      </div>
    </div>
  );
}
