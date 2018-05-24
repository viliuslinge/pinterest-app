import React, { Component } from 'react';
import styles from './Navbar.scss';
import Logo from '../../assets/logo.svg'
import { Button } from 'antd';

class Navbar extends Component {
  render() {
    return (
      <div className={styles.navbar}>
        <img
          className={styles.navbar__logo}
          src={Logo}
          alt="Clapp"
          onClick={() => this.props.history.push('/')} />
        <div>
          <Button onClick={() => this.props.history.push('/signup')}>Signup</Button>
          <Button onClick={() => this.props.history.push('/login')}>Login</Button>
        </div>
      </div>
    )
  }
}

export default Navbar;