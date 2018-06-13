import React from 'react';
import styles from './CreatePostButton.scss';
import { Icon } from 'antd';

export const CreatePostButton = (props) => (
  <div className={styles.itemContainer}>
    <div className={styles.item}>
      <div className={styles.button}>
        <Icon className={styles.icon} type="plus" />
      </div>
      <p className={styles.title}>Create new post</p>
    </div>
  </div>
)