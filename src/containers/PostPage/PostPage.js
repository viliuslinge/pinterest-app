import React, { Component } from 'react';
import styles from './PostPage.scss';
import PostDetails from '../../components/PostDetails/PostDetails';
import { FirebaseService } from '../../api/FirebaseService';
import { Button, Icon } from 'antd';
import Post from '../../components/Post/Post';

const firebaseService = new FirebaseService();

class PostPage extends Component {

  state = {
    currentPost: null,
    user: null,
    activePosts: null,
    currentPostId: null
  }

  unsubscribePost;
  unsubscribeUser;
  unsubscribeActivePosts;
  
  returnPreviousPage = () => {
    this.props.history.goBack();
  }

  getCurrentPost = () => {
    this.unsubscribePost = firebaseService.getPost(this.state.currentPostId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.setState({ currentPost: doc.data() });
          this.getPostUser();
        } else {
          console.log("Could not receive selected post!");
        }
      });
  }

  getAllActivePosts = () => {
    this.unsubscribeActivePosts = firebaseService
      .subscribeToAllActivePosts(posts => {
        this.setState({ activePosts: posts })
      }
    )
  }

  getPostUser = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.state.currentPost.user_uid)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() });
      });
  }
  
  redirectToUserProfile = (id) => {
    this.props.history.push(`/profile/${id}`);
  }

  componentDidMount() {
    // this.currentPostId = this.props.match.params.id;
    this.setState({ currentPostId: this.props.match.params.id }, () => {
      this.getCurrentPost();
      this.getAllActivePosts();
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('fdsff')
  //   this.currentPostId = nextProps.match.params.id;
  //   this.getCurrentPost();
  // }

  componentWillUnmount() {
    this.unsubscribePost();
    this.unsubscribeActivePosts();
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
    };
  }

  static getDerivedStateFromProps(props, state) {
    // console.log(props.match.params.id);
    return props ? { currentPostId: props.match.params.id } : null;
  }

  componentDidUpdate() {
    console.log(this.state.currentPostId);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.currentPostContainer}>
          {
            this.state.currentPost && this.state.user &&
            <div>
              <Button size="large" onClick={this.returnPreviousPage} className={styles.backButton}>
                <Icon type="left" />Back
              </Button>
              <PostDetails
                user={this.state.user}
                post={this.state.currentPost}
                handleRedirect={this.redirectToUserProfile} />
            </div>
          }
          </div>
          <div className={styles.postsContainer}>
          {
            this.state.currentPost && 
            this.state.activePosts &&
            this.state.activePosts.map(post => {
              return <Post
                      {...this.props}
                      key={post.postId}
                      data={post}
                      user={this.props.user} />
            })
          }
        </div>
      </div>
    )
  }
}

export default PostPage;