import React, { Component } from 'react';
import styles from './Navbar.scss';
import Logo from '../../assets/logo.svg'
import { auth } from '../../firebase';

import { Button, Avatar, Menu, Dropdown, Icon } from 'antd';

class Navbar extends Component {

  signout = () => {
    auth.signOut()
      .then(() => {
        this.props.history.push('/');
        localStorage.removeItem('currentUser');
      });
  }

  render() {

    const userMenu = (
      <Menu>
        <Menu.Item
          key="0"
          onClick={() => this.props.history.push('/profile')}>
          Profile
        </Menu.Item>
        <Menu.Item
          key="1"
          onClick={this.signout}>
          Sign out
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.navbar}>
        <img
          className={styles.logo}
          src={Logo}
          alt="Clapp"
          onClick={() => this.props.history.push('/')} />
        {
          !this.props.user &&
          <div className={styles.navtools}>
            <Button onClick={() => this.props.history.push('/signup')}>Signup</Button>
            <Button onClick={() => this.props.history.push('/login')}>Login</Button>
          </div>
        }
        {
          this.props.user &&
          <div>
            <Button
              type="primary"
              shape="circle"
              icon="plus"
              onClick={() => this.props.history.push('/post')} />
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button size="large" style={{ marginLeft: 8 }}>
                <Avatar
                  size="small"
                  src={this.props.user.photoURL} />
                {this.props.user.name}
                <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
        }
      </div>
    )
  }
}

export default Navbar;