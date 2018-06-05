import React, { Component } from 'react';
import styles from './Home.scss';
import Post from '../../components/Post/Post';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();

class Home extends Component {
  
  state = {
    activePosts: null,
  }
  unsubscribeActivePosts = undefined;

  componentDidMount() {
    this.unsubscribeActivePosts = firebaseService
      .subscribeToAllActivePosts(posts => {
        this.setState({ activePosts: posts })
      }
    )
  }

  componentWillUnmount() {
    this.unsubscribeActivePosts();
  }

  render() {
    return (
      <div className={styles.postsContainer}>
        {
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

