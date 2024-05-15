import React from 'react';
import { Dropdown, Option, OptionOnSelectData, SelectionEvents } from '@fluentui/react-components';
import styles from './whenARG.module.scss';
import editorStyles from '../SentenceEditor/sentenceEditor.module.scss';

interface WhenARGProps {
  name: string;
  setName: (value: string) => void;
  operator: string;
  setOperator: (value: string) => void;
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
}

const WhenARG: React.FC<WhenARGProps> = ({ name, setName, operator, setOperator, value, setValue, submit }) => {
  const handleOperatorChange = (event: SelectionEvents, data: OptionOnSelectData) => {
    console.log(data.optionValue);
    setOperator(data.optionValue ? data.optionValue : '');
    submit();
  };

  const operatorOptions = ['>', '<', '>=', '<=', '==', '!='];

  return (
    <div className={styles.container}>
      <p>条件：当数值</p>
      <input
        style={{ width: '100px' }}
        className={editorStyles.sayInput}
        value={name}
        onChange={(e) => {
          setName(e.target.value ?? '');
        }}
        onBlur={submit}
      />
      <Dropdown
        value={operator}
        onOptionSelect={handleOperatorChange}
        selectedOptions={[operator]}
        style={{ margin: '0 10px', minWidth: 0 }}
      >
        {operatorOptions.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Dropdown>
      <input
        style={{ width: '100px' }}
        className={editorStyles.sayInput}
        value={value}
        onChange={(e) => {
          setValue(e.target.value ?? '');
        }}
        onBlur={submit}
      />
    </div>
  );
};

export default WhenARG;
