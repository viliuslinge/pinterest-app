import React, { Component } from 'react';
import { Avatar, Popconfirm, message, Button } from 'antd';
import styles from './Post.scss';
import { FirebaseService } from '../../api/FirebaseService';
import NumberFormatter from '../../utils/number-formatter';

const firebaseService = new FirebaseService();

class Post extends Component {
  
  state = {
    user: null,
  }

  unsubscribe = undefined;

  deletePost = () => {
    firebaseService.deletePost(this.props.data.postId)
      .then(() => {
        firebaseService.deleteImage(this.props.data.imageName)
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
    message.success('Your post has been deleted.');
  };

  componentWillMount() {
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
      backgroundImage: `url(${this.props.data.photoURL})`
    }

    return (
      <div className={styles.itemContainer}>
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
                <Popconfirm
                  title="Are you sure delete this post?"
                  onConfirm={this.deletePost}
                  okText="Yes" cancelText="No">
                  <Button
                    className={styles.deleteButton}
                    size="large"
                    icon="delete" />
                </Popconfirm>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Post;