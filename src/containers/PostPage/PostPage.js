import React, { Component } from 'react';
import styles from './PostPage.scss';
import PostDetails from '../../components/PostDetails/PostDetails';
import { FirebaseService } from '../../api/FirebaseService';
import { Button, Icon } from 'antd';
import Post from '../../components/Post/Post';
import GridLayout from '../../utils/grid-layout';
import { functions } from '../../firebase';

const firebaseService = new FirebaseService();

class PostPage extends Component {

  state = {
    currentPost: null,
    user: null,
    activePosts: null
  }

  unsubscribeUser;
  unsubscribeActivePosts;
  screenEvent;
  
  returnPreviousPage = () => {
    this.props.history.push('/home');
  }

  getCurrentPost = () => {
    firebaseService.getPost(this.props.match.params.id)
      .get().then((doc) => {
        if (doc.exists) {
          this.setState({ currentPost: doc.data() }, () => {
            this.getPostUser();
          });
        } else {
          console.log("Could not receive selected post!");
        }
      })
  }

  getPostUser = () => {
    this.unsubscribeUser = firebaseService.getProfile(this.state.currentPost.user_uid)
      .onSnapshot(doc => {
        this.setState({ user: doc.data() }, () => {
          this.getRelatedPosts()
        });
      });
  }
  
  redirectToUserProfile = (id) => {
    this.props.history.push(`/profile/${id}`);
  }

  calcGridWidth = () => {
    const width = Math.floor((window.innerWidth) / GridLayout.columnWidth) * GridLayout.columnWidth;
    return width !== 0 ? width : GridLayout.columnWidth;
  }

  calcMediaQueries = () => {
    const gridWidth = this.calcGridWidth();
    this.screenEvent = window.matchMedia(`(min-width: ${gridWidth}px) and (max-width: ${gridWidth + 275}px)`);
    this.screenEvent.addListener(this.updatePosts);
  }

  updatePosts = () => {
    this.setState({ activePosts: GridLayout.calcGrid(this.state.activePosts) });
    this.screenEvent.removeListener(this.updatePosts);
    this.calcMediaQueries();
  } 

  getRelatedPosts = () => {
    functions.httpsCallable('getRelatedPosts')(this.state.currentPost.tags)
      .then(result => {
        const resultArr = JSON.parse(result.data).hits.hits;
        let relatedPostsArr = [];
        for (let result of resultArr) {
          if (result._id === this.props.match.params.id) {
            continue;
          }
          relatedPostsArr.push(result._source);
        };
        this.setState({ activePosts: GridLayout.calcGrid(relatedPostsArr) })
      })
  } 

  componentDidMount() {
    this.getCurrentPost();
    this.calcMediaQueries()
  }

  componentWillUnmount() {
    if (this.screenEvent) {
      this.screenEvent.removeListener(this.updatePosts);
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
              <div
                className={styles.postsContainer}
                style={{ width: `${this.calcGridWidth()}px` }}>
                {
                  this.state.activePosts &&
                  this.state.activePosts.map(post => {
                    return <Post
                      {...this.props}
                      key={post.postId}
                      data={post}
                      width={GridLayout.columnWidth}
                      user={this.props.user} />
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