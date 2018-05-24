import React, { Component } from 'react';

class Landing extends Component {
  render() {
    return (
      <div className="">
        <button onClick={() => this.props.history.push('/signup')}>Signup</button>
        <button onClick={() => this.props.history.push('/login')}>Login</button>
      </div>
    );
  }
}

export default Landing;