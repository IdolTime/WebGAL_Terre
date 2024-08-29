import styles from "./index.module.scss";
import LoadingGif from '@/assets/loading.gif';

interface propsType {
  open: boolean
}

export default function Loading({ open }: propsType) {
  return (
    
    <div className={styles.loadingContainer}>
      {
        open ? 
          <img src={LoadingGif} alt="" />
          : null
      }
    </div>
  );
}