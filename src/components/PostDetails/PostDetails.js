import React, { Component } from 'react';
import styles from './PostDetails.scss';
import { Avatar } from 'antd';
import Formatter from '../../utils/number-formatter';

class PostDetails extends Component {

  handleImageLoading = (event) => {
    event.target.classList.add(styles.imageVisible);
    event.target.previousElementSibling.style.display = 'none'
  }

  requestForRedirect = () => {
    this.props.handleRedirect(this.props.user.uid)
  }

  convertObjectToArray = () => {
    let tagsArr = [];
    for (let tag in this.props.post.tags) {
      tagsArr.push(tag)
    }
    return tagsArr
  }

  render() {
    return (
      <div className={styles.container}>
        <img
          src={this.props.post.thumbnailURL}
          alt=""
          style={{ filter: 'blur(1px)' }}
          className={styles.imageVisible}/>
        <img
          src={this.props.post.photoURL}
          alt=""
          className={styles.imageInvisible}
          onLoad={this.handleImageLoading}/>

        <div className={styles.detailsContainer}>
          <div className={styles.userContainer}>
            <Avatar
              size="large"
              src={this.props.user.photoURL}
              className={styles.avatar}
              onClick={this.requestForRedirect} />
            <p className={styles.name} onClick={this.requestForRedirect}>
              {this.props.user.name}
            </p>
            <p className={styles.name} onClick={this.requestForRedirect}>
              {this.props.user.surname}
            </p>
          </div>
          <p className={styles.description}>{this.props.post.description}</p>
          <p className={styles.date}>
            {Formatter.formatMilisecondsToDate(this.props.post.created_at)}
          </p>
          <div className={styles.tagContainer}>
            {
              this.props.post.tags &&
              Formatter.formatTags(this.convertObjectToArray()).map(tag => {
                return <p key={tag} className={styles.tag}>{tag}</p>
              })
            }
          </div> 
        </div>
      </div>
    )
  }
}

export default PostDetails; 