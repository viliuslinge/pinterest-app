import React, { Component } from 'react';
import { FirebaseService } from '../../api/FirebaseService';
import styles from './Profile.scss';
import Post from '../../components/Post/Post';
import CreatePost from '../../components/CreatePost/CreatePost';
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton';
import { Modal } from 'antd';

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

  closePostModal = (e) => {
    this.setState({ postModalVisible: false });
  }

  getUserProfile = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.props.match.params.id)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() },

        () => {
          this.unsubscribeUserPosts = firebaseService
            .subscribeToUserActivePosts(posts => {
              this.setState({ userActivePosts: posts })},
              this.state.user.uid
            )
          }
        );
      });
  }

  componentDidMount() {
    this.getUserProfile();
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

        <hr className={styles.horizontalRuler} />

        <div className={styles.postsContainer}>
          {
            this.state.user && this.state.user.uid === this.props.user.uid &&
            <div onClick={this.openPostModal}>
              <CreatePostButton />
            </div>
          }
          {
            this.state.userActivePosts &&
            this.state.userActivePosts.map(post => {
              return <Post {...this.props} key={post.postId} data={post} user={this.props.user} />
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