import React, { Component } from 'react';
import styles from './PostPage.scss';
import PostDetails from '../../components/PostDetails/PostDetails';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();

class PostPage extends Component {

  state = {
    currentPost: null,
    user: null
  }

  currentPostId;
  unsubscribe;

  getCurrentPost = () => {
    this.unsubscribePost = firebaseService.getPost(this.currentPostId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.setState({ currentPost: doc.data() });
          this.getPostUser();
        } else {
          console.log("Could not receive selected post!");
        }
      });
  }

  getPostUser = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.state.currentPost.user_uid)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      });
  }

  componentDidMount() {
    this.currentPostId = this.props.match.params.id;
    this.getCurrentPost();
  }

  componentWillUnmount() {
    this.unsubscribePost();
    this.unsubscribeUser();
  }

  render() {
    return (
      <div className={styles.container}>
        {
          this.state.currentPost && this.state.user &&
          <PostDetails user={this.state.user} post={this.state.currentPost}/>
        }
      </div>
    )
  }
}

export default PostPage;