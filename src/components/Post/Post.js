import React, { Component } from 'react';
import { Avatar, Button, Modal } from 'antd';
import styles from './Post.scss';
import { FirebaseService } from '../../api/FirebaseService';
import NumberFormatter from '../../utils/number-formatter';
import PostEdit from '../PostEdit/PostEdit';

const firebaseService = new FirebaseService();

class Post extends Component {
  
  state = {
    user: null,
    postModalVisible: false
  }

  unsubscribe = undefined;

  openSelectedPost = (event) => {
    if (event.target.id !== 'edit-button' && !this.state.postModalVisible) {
      this.props.history.push(`/post/${this.props.data && this.props.data.postId}`);
    }
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

    const imagePosition = {
      height: `calc(${this.props.width}px / ${this.props.data.ratio} + 65px)`,
      width: `${this.props.width}px`,
      transform: `translate(${this.props.data.posLeft}px, ${this.props.data.posBottom}px)`
    }

    return (
      <div className={styles.itemContainer} style={imagePosition}>
      {
        this.state.user &&
        <div className={styles.item} onClick={this.openSelectedPost}>
          <div className={styles.image} style={imageStyle}></div>
          <div className={styles.detailsContainer}>
            {
              this.props.data.description
                ? <p className={styles.description}>{this.props.data.description}</p>
                : <p className={styles.description}>...</p>
            }
            <div className={styles.infoContainer}>
              <div>
                <div className={styles.userContainer}>
                  <Avatar size="small" src={this.state.user.photoURL} className={styles.avatar}/>
                  <div>
                    <p className={styles.name}>{this.state.user.name}</p>
                    <p className={styles.date}>
                      {NumberFormatter.formatMilisecondsToDate(this.props.data.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              {
                (/^\/profile\//).test(this.props.match.path) &&
                this.props.user.uid === this.props.data.user_uid &&
                <Button
                  id="edit-button"
                  icon="edit"
                  type="primary"
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
                  <PostEdit closeModal={this.closePostModal} post={this.props.data} />
                }
              </Modal>
            </div>
          </div>
        </div>
      }
      </div>
    )
  }
}

export default Post;