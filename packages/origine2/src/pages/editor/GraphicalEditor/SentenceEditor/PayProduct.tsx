import CommonOptions from '../components/CommonOption';
import { ISentenceEditorProps } from './index';
import styles from './sentenceEditor.module.scss';
import { useValue } from '@/hooks/useValue';
import { useEffect } from 'react';

export default function PayProduct(props: ISentenceEditorProps) {
  const name = useValue<string>('');
  const productId = useValue<number>(0);
  const amount = useValue<number>(100);
  const chapter = useValue<number>(1);

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
      }
    });
  }, []);

  function setContent() {
    
    let content = `payProduct:${productId.value}`;

    content += ` -amount=${amount.value}`;
    content += ` -name=${name.value.trim()}`;
    content += ` -chapter=${chapter.value}`;

    props.onSubmit(content + ';');
  }

  return (
    <div className={styles.sentenceEditorContent}>
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
          <span style={{ marginLeft: '8px' }}>星光</span>
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
