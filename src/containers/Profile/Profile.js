import React, { Component } from 'react';
import { FirebaseService } from '../../api/FirebaseService';
import styles from './Profile.scss';
import Post from '../../components/Post/Post';
import CreatePost from '../../components/CreatePost/CreatePost';
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton';
import { Modal, Divider } from 'antd';
import GridLayout from '../../utils/grid-layout';

const firebaseService = new FirebaseService();

class Profile extends Component {

  state = {
    postModalVisible: false,
    userActivePosts: null,
    user: null
  }

  unsubscribeUserPosts;
  unsubscribeUser;

  openPostModal = () => {
    this.setState({ postModalVisible: true });
  }

  closePostModal = () => {
    this.setState({ postModalVisible: false });
  }

  getUserProfile = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.props.match.params.id)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() },

        () => {
          this.unsubscribeUserPosts = firebaseService
            .subscribeToUserActivePosts(posts => {
              this.setState({ userActivePosts: GridLayout.calcGrid(posts) })
            },
              this.state.user.uid
            )
          }
        );
      });
  }

  calcGridWidth = () => {
    const width = Math.floor((window.innerWidth) / GridLayout.columnWidth) * GridLayout.columnWidth;
    return width !== 0 ? width : GridLayout.columnWidth;
  }

  calcMediaQueries = () => {
    const gridWidth = this.calcGridWidth();
    let screenEvent = window.matchMedia(`(min-width: ${gridWidth}px) and (max-width: ${gridWidth + 275}px)`);
    const updatePosts = () => {
      this.setState({ userActivePosts: GridLayout.calcGrid(this.state.userActivePosts) });
      screenEvent.removeListener(updatePosts);
      this.calcMediaQueries();
    }   
    screenEvent.addListener(updatePosts);
  }

  componentDidMount() {
    this.getUserProfile();
    this.calcMediaQueries()
  }

  componentWillUnmount() {
    if (this.unsubscribeUserPosts) {
      this.unsubscribeUserPosts();
    }
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.setState({
        userActivePosts: null,
        user: null
      }, () => {
        this.getUserProfile();
      });
    }
  };

  render() {
    const imageStyle = {
      backgroundImage: this.state.user ? `url(${this.state.user.photoURL})` : 'none'
    }

    return (
      <div className={styles.container}>
        {
          this.state.user &&
          <div className={styles.profileContainer}>
            <div>
              <h1 className={styles.name}>
                {this.state.user.name} {this.state.user.surname}
              </h1>
              <p>{this.state.user.email}</p>
              <p className={styles.about}>{this.state.user.about}</p>
            </div>
            <div className={styles.profilePic} style={imageStyle}></div>
          </div>
        }
        
        <div
          className={styles.postsContainer}
          style={{ width: `${this.calcGridWidth()}px` }}>
          {
            this.state.user && this.state.user.uid === this.props.user.uid &&
            <div onClick={this.openPostModal}>
              <CreatePostButton width={GridLayout.columnWidth}/>
            </div>
          }
          {
            this.state.userActivePosts &&
            <div className={styles.menuContainer}>
              <Divider>My posts</Divider>
            </div>
          }
          {
            this.state.userActivePosts &&
            this.state.userActivePosts.map(post => {
              return <Post
                      {...this.props}
                      key={post.postId}
                      data={post}
                      width={GridLayout.columnWidth}
                      user={this.props.user} />
            })
          }
        </div>

        <Modal
          title="Create New Pin"
          visible={this.state.postModalVisible}
          footer={null}
          width={420}
          onCancel={this.closePostModal}>
          {
            this.state.postModalVisible &&
            <CreatePost closeModal={this.closePostModal} {...this.props.user}/>
          }
        </Modal>
      </div>
    )
  }
}

export default Profile;