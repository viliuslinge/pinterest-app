import React, { Component } from 'react';
import styles from './Home.scss';
import Post from '../../components/Post/Post';
import { FirebaseService } from '../../api/FirebaseService';
import GridLayout from '../../utils/grid-layout';
import { Spin } from 'antd';

const firebaseService = new FirebaseService();

class Home extends Component {
  
  state = {
    activePosts: null
  }
  unsubscribeActivePosts = undefined;
  screenEvent;
  // lastQueryElement;
  // holdNextQuery = false;

  getActivePosts = () => {
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
    this.unsubscribeActivePosts = firebaseService
      .subscribeToAllActivePosts(posts => {
        this.setState({ activePosts: GridLayout.calcGrid(posts) });
      }
    )
  }

  // getActivePosts = () => {
  //   this.holdNextQuery = true;
  //   firebaseService.getAllActivePosts((posts, lastQueryElement) => {
  //       if (this.state.activePosts) {
  //         let concatPosts = this.state.activePosts.concat(posts)
  //         this.setState({ activePosts: GridLayout.calcGrid(concatPosts) }, () => this.holdNextQuery = false);
  //       } else {
  //         this.setState({ activePosts: GridLayout.calcGrid(posts) }, () => this.holdNextQuery = false);
  //       }
  //       this.lastQueryElement = lastQueryElement
  //     },
  //     this.lastQueryElement
  //   )
  // }

  // loadNextQuery = () => {
  //   let post = this.state.activePosts[this.state.activePosts.length - 1]
  //   let scrollPosition = post.posBottom + (((GridLayout.columnWidth / post.ratio) + 65) / 3);
  //   if (window.pageYOffset + window.innerHeight > scrollPosition && this.holdNextQuery === false) {
  //     this.getActivePosts()
  //   }
  // }

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

  componentDidMount() {
    this.getActivePosts();
    this.calcMediaQueries()
    window.addEventListener('scroll', this.loadNextQuery, false);
  }

  componentWillUnmount() {
    if (this.screenEvent) {
      this.screenEvent.removeListener(this.updatePosts);
    }
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
    window.removeEventListener('scroll', this.loadNextQuery, false);
  }

  render() {
    return (
      <div
        className={styles.postsContainer}
        style={{ width: `${this.calcGridWidth()}px` }}>
        {
          !this.state.activePosts &&
          <div className={styles.loading}>
            <Spin size="large"/>
          </div>
        }
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
    );
  }
}

export default Home;