import React, { Component } from 'react';
import styles from './Home.scss';
import Post from '../../components/Post/Post';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();

class Home extends Component {
  
  state = {
    activePosts: null,
    shouldResetPostsGrid: false
  }
  unsubscribeActivePosts = undefined;
  grid = []

  getActivePosts = () => {
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
    this.unsubscribeActivePosts = firebaseService
      .subscribeToAllActivePosts(posts => {
        this.setState({ shouldResetPostsGrid: true }, () => {
          this.grid = [
            {posLeft: 0, posBottom: 0},
            {posLeft: 250, posBottom: 0},
            {posLeft: 500, posBottom: 0},
            {posLeft: 750, posBottom: 0},
            {posLeft: 1000, posBottom: 0},
          ]
        })
        
        this.setState({ activePosts: posts, shouldResetPostsGrid: false }, () => {
          this.calculatePosition()
        })
      }
    )
  }

  getIndex = () => {
    let num = Infinity;
    let index = 0;
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].posBottom < num) {
        num = this.grid[i].posBottom;
        index = i;
      }
    }
    return index;
  }

  calculatePosition = () => {
    const posts = this.state.activePosts
    let gridIndex = 0;
    let hasLoopedOneTime = false;

    for (let post of posts) {
      post.posLeft = this.grid[gridIndex].posLeft;
      post.posBottom = this.grid[gridIndex].posBottom;
      post.count = posts.indexOf(post);

      this.grid[gridIndex].posBottom =
        this.grid[gridIndex].posBottom + Math.round(250 / Number(post.ratio)) + 80;

      if (!hasLoopedOneTime) {
        gridIndex !== 4 ? gridIndex++ : hasLoopedOneTime = true; 
      }
      gridIndex = this.getIndex();
    }
  }

  componentDidMount() {
    this.getActivePosts();
  }

  componentWillUnmount() {
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
  }

  render() {
    return (
      <div className={styles.postsContainer}>
        {
          this.state.shouldResetPostsGrid === false &&
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
    );
  }
}

export default Home;