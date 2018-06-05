import React, { Component } from 'react';
import styles from './PostDetails.scss';
import { Avatar } from 'antd';

class PostDetails extends Component {

  handleImageLoading = (event) => {
    event.target.classList.add(styles.imageVisible);
    event.target.previousElementSibling.style.display = 'none'
  }

  render() {
    return (
      <div className={styles.container}>
        <img
          src={this.props.post.thumbnailURL}
          alt=""
          className={styles.imageVisible}/>
        <img
          src={this.props.post.photoURL}
          alt=""
          className={styles.imageInvisible}
          onLoad={this.handleImageLoading}/>
          
        <div className={styles.detailsContainer}>
          <div className={styles.userContainer}>
            <Avatar size="large" src={this.props.user.photoURL} />
            <p>{this.props.user.name}</p>
            <p>{this.props.user.surname}</p>
          </div>
          
          <p>{this.props.post.description}</p>
          <p>{this.props.post.created_at}</p>
          <p>{this.props.post.tags}</p>
        </div>
      </div>
    )
  }
}

export default PostDetails;