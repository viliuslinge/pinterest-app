import React, { Component } from 'react';
import { FirebaseService } from '../api/auth';
import { auth } from '../firebase';

const firebaseService = new FirebaseService();

class Home extends Component {

  signout() {
    firebaseService.signout();
    return () => this.props.history.push('/');
  }

  render() {
    return (
      <div>
        <p>Home page</p>
        <button onClick={this.signout()}>Signout</button>
      </div>
    );
  }
}

export default Home;