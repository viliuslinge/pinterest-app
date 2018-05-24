import React, { Component } from 'react';
import styles from './Landing.scss';
import { Button } from 'antd';

class Landing extends Component {
  render() {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Print'everest</h1>
        
        <div className={styles.buttons}>
          <Button
            size="large"
            onClick={() => this.props.history.push('/signup')}>
            Signup
          </Button>
          <Button
            size="large"
            onClick={() => this.props.history.push('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }
}

export default Landing;