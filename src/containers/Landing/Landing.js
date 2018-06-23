import React from 'react';
import styles from './Landing.scss';
import { Button } from 'antd';
import Logo from '../../assets/logo.svg'

const Landing = (props) => (
  <div className={styles.container}>
    <img
      className={styles.logo}
      src={Logo}
      alt="Clapp" />
    <p className={styles.title}>login: testing@mail.com</p>
    <p className={styles.title}>pass: testing1</p>
    
    <div className={styles.buttons}>
      <Button
        className={styles.button}
        size="large"
        onClick={() => props.history.push('/signup')}>
        Signup
      </Button>
      <Button
        className={styles.button}
        size="large"
        onClick={() => props.history.push('/login')}>
        Login
      </Button>
    </div>
  </div>
)

export default Landing;