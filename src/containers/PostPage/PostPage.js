import React, { Component } from 'react';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();

class PostPage extends Component {

  currentPostId;

  getCurrentPost = () => {
    firebaseService.getPost(this.currentPostId).get()
      .then((doc) => {
        if (doc.exists) {
          console.log(doc.data())
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => console.log(error))
  }

  componentDidMount() {
    this.currentPostId = this.props.match.params.id;
    this.getCurrentPost();
  }

  render() {
    return (
      <div>
        {
          this.props.sendCurrentPost && this.props.sendCurrentPost.postId
        }
      </div>
    )
  }
}

export default PostPage;