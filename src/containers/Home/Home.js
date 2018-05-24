import React, { Component } from 'react';
import { auth } from '../../firebase';

class Home extends Component {

  signout = () => {
    auth.signOut()
      .then(() => this.props.history.push('/'));
  }

  render() {
    return (
      <div>
        <p>Home page</p>
        <button onClick={this.signout}>Signout</button>
      </div>
    );
  }
}

export default Home;