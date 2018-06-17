import React, { Component } from 'react';
import { functions } from '../../firebase';
import GridLayout from '../../utils/grid-layout';
import styles from './Search.scss';
import Post from '../../components/Post/Post';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();

class Search extends Component {

  state = {
    activePosts: null,
    searchMessage: ''
  }

  unsubscribeActivePosts;
  searchQuery;
  screenEvent;

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

  formatSearchQuery = () => {
    this.searchQuery = this.props.match.params.query.split(' ');
  }

  getRelatedPosts = () => {
  functions.httpsCallable('getRelatedPosts')(this.searchQuery)
    .then(result => {
      const resultArr = JSON.parse(result.data).hits.hits;
      let relatedPostsArr = [];
      for (let result of resultArr) {
        relatedPostsArr.push(result._source);
      };
      if (resultArr.length === 0) {
        this.setState({ searchMessage: 'Sorry, could not find any matching posts...' });
        this.getActivePosts();
      } else {
        this.setState({ searchMessage: `Search results for "${this.props.match.params.query}"` })
      }
      this.setState({ activePosts: GridLayout.calcGrid(relatedPostsArr) })
    })
  }

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

  componentDidMount() {
    this.formatSearchQuery();
    this.getRelatedPosts();
    this.calcMediaQueries();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.query !== prevProps.match.params.query) {
      this.setState({ activePosts: null }, () => {
        this.formatSearchQuery();
        this.getRelatedPosts();
      });
    }
  };

  componentWillUnmount() {
    if (this.screenEvent) {
      this.screenEvent.removeListener(this.updatePosts);
    }
    if (this.unsubscribeActivePosts) {
      this.unsubscribeActivePosts();
    }
  }

  render() {
    return (
      <div
        className={styles.postsContainer}
        style={{ width: `${this.calcGridWidth()}px` }}>
        <p className={styles.title}>{this.state.searchMessage}</p>
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
    )
  }
}

export default Search;