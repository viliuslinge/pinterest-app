import React, { Component } from 'react';
import './Navbar.css';
import Logo from '../../assets/logo.svg'

class Navbar extends Component {
  render() {
    return (
      <div className="navbar">
        <img
          className="navbar__logo"
          src={Logo}
          alt="Clapp"
          onClick={() => this.props.history.push('/')} />
        <div>
          <button onClick={() => this.props.history.push('/signup')}>Signup</button>
          <button onClick={() => this.props.history.push('/login')}>Login</button>
        </div>
      </div>
    )
  }
}

export default Navbar;