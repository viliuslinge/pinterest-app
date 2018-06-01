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
    userActivePosts: null
  }

  unsubscribeUserPosts = undefined;

  openPostModal = () => {
    this.setState({ postModalVisible: true });
  }

  closePostModal = (e) => {
    this.setState({ postModalVisible: false });
  }

  componentDidMount() {
    this.unsubscribeUserPosts = firebaseService
      .subscribeToUserActivePosts(posts => {
        this.setState({ userActivePosts: posts })},
        this.props.user.uid
      )
  }

  componentWillUnmount() {
    this.unsubscribeUserPosts();
  }

  render() {
    const imageStyle = {
      backgroundImage: `url(${this.props.user.photoURL})`
    }

    return (
      <div className={styles.container}>
        <div className={styles.profileContainer}>
          <div>
            <h1 className={styles.name}>{this.props.user.name}</h1>
            <p>{this.props.user.email}</p>
          </div>
          <div className={styles.profilePic} style={imageStyle}></div>
        </div>

        <hr className={styles.horizontalRuler} />

        <div className={styles.postsContainer}>
          <div onClick={this.openPostModal}>
            <CreatePostButton />
          </div>
          {
            this.state.userActivePosts &&
            this.state.userActivePosts.map(post => {
              return <Post key={post.postId} data={post} />
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
            <CreatePost sharePost={this.closePostModal} {...this.props.user}/>
          }
        </Modal>
      </div>
    )
  }
}

export default Profile;