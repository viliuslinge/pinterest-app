import React, { Component } from 'react';
import { Avatar } from 'antd';
import styles from './Post.scss';
import { FirebaseService } from '../../api/FirebaseService';
import NumberFormatter from '../../utils/number-formatter';

const firebaseService = new FirebaseService();

class Post extends Component {
  
  state = {
    user: null,
  }

  unsubscribe = undefined;

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
              <p className={styles.date}>
                {NumberFormatter.formatMilisecondsToDate(this.props.data.created_at)}
              </p>
            </div>
            {
              this.state.user && 
              <div className={styles.userContainer}>
                <Avatar size="small" src={this.state.user.photoURL} />
                <p className={styles.name}>{this.state.user.name}</p>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Post;