import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Signup from '../components/Signup';

class Landing extends Component {
  redirectSignup = () => {
    this.props.history.push('/signup')
  }

  redirectLogin = () => {
    this.props.history.push('/login')
  }

  render() {
    return (
      <div>
        <button onClick={this.redirectSignup}>Signup</button>
        <button onClick={this.redirectLogin}>Login</button>
      </div>
    );
  }
}

export default Landing;