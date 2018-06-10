import React, { Component } from 'react';
import styles from './PostPage.scss';
import PostDetails from '../../components/PostDetails/PostDetails';
import { FirebaseService } from '../../api/FirebaseService';
import { Button, Icon } from 'antd';
import Post from '../../components/Post/Post';
import GridLayout from '../../utils/grid-layout';

const firebaseService = new FirebaseService();

class PostPage extends Component {

  state = {
    currentPost: null,
    user: null,
    activePosts: null
  }

  unsubscribePost;
  unsubscribeUser;
  unsubscribeActivePosts;
  
  returnPreviousPage = () => {
    this.props.history.goBack();
  }

  getCurrentPost = () => {
    if (this.unsubscribePost) {
      this.unsubscribePost();
    }
    this.unsubscribePost = firebaseService.getPost(this.props.match.params.id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.setState({ currentPost: doc.data() }, () => {
            this.getPostUser();
          });
        } else {
          console.log("Could not receive selected post!");
        }
      });
  }

  getAllRelatedPosts = () => {
    this.unsubscribeActivePosts = firebaseService
      .subscribeToRelatedPosts(posts => {
        this.setState({ activePosts: posts })
      },
      this.state.currentPost.tags
    )
  }

  getPostUser = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.state.currentPost.user_uid)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() }, () => {
          this.getAllRelatedPosts();
        });
      });
  }
  
  redirectToUserProfile = (id) => {
    this.props.history.push(`/profile/${id}`);
  }

  componentDidMount() {
    this.getCurrentPost();
  }

  componentWillUnmount() {
    if (this.unsubscribePost) {
      this.unsubscribePost();
    }
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.setState({
        currentPost: null,
        user: null,
        activePosts: null
      }, () => {
        this.getCurrentPost();
      });
    }
  };

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

        <div className={styles.postsBackground}>
          {
            this.state.currentPost && 
            this.state.activePosts &&
            this.state.activePosts[0] &&
            <div>
              <p className={styles.title}>More like this</p>
              <div className={styles.postsContainer}>
                {
                  !this.state.activePosts[0].length &&
                  this.state.activePosts.map(post => {
                    return <Post
                      {...this.props}
                      key={post.postId}
                      data={post}
                      width={GridLayout.columnWidth}
                      user={this.props.user} />
                  })
                }
                { 
                  this.state.activePosts[0].length &&
                  this.state.activePosts.map(arr => {
                    return arr.map(post => {
                      return <Post
                        {...this.props}
                        key={post.postId}
                        data={post}
                        width={GridLayout.columnWidth}
                        user={this.props.user} />
                    })
                  })
                }
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default PostPage;

