import React, { Component } from 'react';
import styles from './Navbar.scss';
import Logo from '../../assets/logo.svg'
import { auth } from '../../firebase';
import CreatePost from '../../components/CreatePost/CreatePost';
import { Modal, Button, Menu, Dropdown, Icon } from 'antd';

class Navbar extends Component {

  state = {
    postModalVisible: false
  }

  openPostModal = () => {
    this.setState({ postModalVisible: true });
  }

  closePostModal = () => {
    this.setState({ postModalVisible: false });
  }

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
          onClick={() => this.props.history.push(`/profile/${this.props.user.uid}`)}>
          Profile
        </Menu.Item>
        <Menu.Item
          key="1"
          onClick={() => this.props.history.push('/settings')}>
          Settings
        </Menu.Item>
        <Menu.Item
          key="2"
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
          onClick={() => {
            this.props.user
              ? this.props.history.push('/home')
              : this.props.history.push('/')
          }} />
        {
          !this.props.user &&
          <div className={styles.navtools}>
            <Button
              className={styles.button}
              onClick={() => this.props.history.push('/signup')}>
              Signup
            </Button>
            <Button
              className={styles.button}
              onClick={() => this.props.history.push('/login')}>
              Login
            </Button>
          </div>
        }
        {
          this.props.user &&
          <div>
            <Button
              icon="plus"
              onClick={this.openPostModal} />

            <Modal
              title="Create New Post"
              visible={this.state.postModalVisible}
              footer={null}
              width={420}
              onCancel={this.closePostModal}>
              {
                this.state.postModalVisible &&
                <CreatePost closeModal={this.closePostModal} {...this.props.user}/>
              }
            </Modal>

            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button style={{ marginLeft: 10 }}>
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