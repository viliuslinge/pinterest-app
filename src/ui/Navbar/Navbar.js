import React, { Component } from 'react';
import styles from './Navbar.scss';
import Logo from '../../assets/logo.svg'
import { auth } from '../../firebase';
import { Button } from 'antd';

class Navbar extends Component {

  signout = () => {
    auth.signOut()
      .then(() => this.props.history.push('/'));
  }

  render() {
    return (
      <div className={styles.navbar}>
        <img
          className={styles.navbar__logo}
          src={Logo}
          alt="Clapp"
          onClick={() => this.props.history.push('/')} />
        {
          !this.props.user &&
          <div>
            <Button onClick={() => this.props.history.push('/signup')}>Signup</Button>
            <Button onClick={() => this.props.history.push('/login')}>Login</Button>
          </div>
        }
        {
          this.props.user &&
          <Button onClick={this.signout}>Signout</Button>
        }
      </div>
    )
  }
}

export default Navbar;