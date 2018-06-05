import React, { Component } from 'react';
import { Avatar, message, Button, Modal } from 'antd';
import styles from './Post.scss';
import { FirebaseService } from '../../api/FirebaseService';
import NumberFormatter from '../../utils/number-formatter';
import EditPost from '../EditPost/EditPost';

const firebaseService = new FirebaseService();

class Post extends Component {
  
  state = {
    user: null,
    postModalVisible: false
  }

  unsubscribe = undefined;

  openSelectedPost = () => {
    this.props.history.push(`/post/${this.props.data && this.props.data.postId}`);
  }

  openPostModal = () => {
    this.setState({ postModalVisible: true });
  }

  closePostModal = () => {
    this.setState({ postModalVisible: false });
  }

  componentDidMount() {
    this.unsubscribe = firebaseService.getProfile(this.props.data.user_uid)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const imageStyle = {
      backgroundImage: `url(${this.props.data.thumbnailURL})`
    }

    return (
      <div onClick={this.openSelectedPost} className={styles.itemContainer}>
        <div className={styles.item}>
          <div className={styles.image} style={imageStyle}></div>
          <div className={styles.detailsContainer}>
            {
              this.props.data.description
                ? <p className={styles.description}>{this.props.data.description}</p>
                : <p className={styles.description}>...</p>
            }
            <div className={styles.infoContainer}>
              <div>
                <p className={styles.date}>
                  {NumberFormatter.formatMilisecondsToDate(this.props.data.created_at)}
                </p>
                {
                  this.state.user && 
                  <div className={styles.userContainer}>
                    <Avatar size="small" src={this.state.user.photoURL} />
                    <p className={styles.name}>{this.state.user.name}</p>
                  </div>
                }
              </div>
              {
                this.props.user.uid === this.props.data.user_uid &&
                <Button
                  size="large"
                  icon="edit"
                  className={styles.editButton}
                  onClick={this.openPostModal} />
              }

              <Modal
                title="Edit Post"
                visible={this.state.postModalVisible}
                footer={null}
                width={730}
                onCancel={this.closePostModal}>
                {
                  this.state.postModalVisible &&
                  <EditPost closeModal={this.closePostModal} post={this.props.data} />
                }
              </Modal>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Post;