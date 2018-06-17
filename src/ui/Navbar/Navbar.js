import React, { Component } from 'react';
import styles from './Navbar.scss';
import Logo from '../../assets/logo.svg'
import { auth } from '../../firebase';
import CreatePost from '../../components/CreatePost/CreatePost';
import { Modal, Button, Menu, Dropdown, Icon, Select } from 'antd';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();
const Option = Select.Option;

class Navbar extends Component {

  state = {
    postModalVisible: false,
    navbarVisible: true,
    filteredTags: [],
    searchQuery: ''
  }

  tags = [];
  unsubscribe;

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

  getTagList = () => {
    this.unsubscribe = firebaseService.getTagList().onSnapshot(
      doc => this.tags = doc.data().tags
    )
  }

  removeTagList = () => {
    this.setState({ filteredTags: [] });
  }

  handleTagChange = (value) => {
    if (value) {
      let regExp = new RegExp('^' + value.replace(/[^\w\d]/g, ''), 'i')
      let tagList = this.tags.filter(tag => (regExp.test(tag)));
      this.setState({ filteredTags: tagList });
    } else {
      this.setState({ filteredTags: [] });
    }
    this.setState({ searchQuery: value });
  }

  handleSearch = (event) => {
    if ((event.keyCode === 13 || !event.keyCode) && this.state.searchQuery) {
      let queryString =  this.state.searchQuery.split(' ').filter(query => !!query).join('%20');
      this.props.history.push(`/search/${queryString}`);
    }
  }

  componentDidMount() {
    this.getTagList();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.removeTagList();
  }

  static getDerivedStateFromProps(props, state) {
    if ((/^\/post/).test(props.location.pathname)) {
      return { navbarVisible: false };
    }
    if (!(/^\/search/).test(props.location.pathname)) {
      return { 
        searchQuery: '',
        navbarVisible: true
      };
    }
    return { navbarVisible: true };
  }

  render() {
    const options = this.state.filteredTags.map(tag => <Option key={tag}>{tag}</Option>)

    const userMenu = (
      <Menu>
        <Menu.Item
          key="0"
          onClick={() => this.props.history.replace(`/profile/${this.props.user.uid}`)}>
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
      <div>
        {
          this.state.navbarVisible &&
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
              <div className={styles.search}>
                <Select
                  mode="combobox"
                  style={{ width: '100%' }}
                  placeholder="Search"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onInputKeyDown={this.handleSearch}
                  value={this.state.searchQuery}
                  onChange={this.handleTagChange}>
                  {options}
                </Select>
                <Button
                  className={styles.button}
                  onClick={this.handleSearch} 
                  icon="search" />
              </div>
            }
            {
              this.props.user &&
              <div className={styles.navtools}>
                <Button
                  className={styles.button}
                  type="primary"
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
                  <Button style={{ marginLeft: 10 }} className={styles.button}>
                    {this.props.user.name}
                    <Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
            }
          </div>
        }
      </div>
    )
  }
}

export default Navbar;