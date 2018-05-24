import React, { Component } from 'react';
import { FirebaseService } from '../../api/auth';
import { auth } from '../../firebase';

const firebaseService = new FirebaseService();

class Login extends Component {

  state = {
    email: {
      value: '',
      error: ''
    },
    password: {
      value: '',
      error: ''
    },
    user:  null
  }

  validationMessage = {
    email: {
      required: 'Oops! Please enter an email address',
      pattern: `That doesn't look like a valid email address`,
      valid: ''
    },
    password: {
      required: 'Please enter a password',
      valid: ''
    }
  }

  setError = (input, validation) => {
    this.setState(state => ({
      [input]: {
        ...state[input],
        error: this.validationMessage[input][validation],
      }
    }));
  }

  validateEmail = () => {
    const patternEmail = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+/g;

    if (this.state.email.value.length === 0) {
      return this.setError('email', 'required')
    };
    if (patternEmail.test(this.state.email.value) === false) {
      return this.setError('email', 'pattern')
    };
    return this.setError('email', 'valid')
  }

  validatePassword = () => {
    if (this.state.password.value.length === 0) {
      return this.setError('password', 'required')
    };
    return this.setError('password', 'valid')
  }

  handleLogin = event => {
    event.preventDefault();
    firebaseService.emailLogIn(this.state.email.value, this.state.password.value)
  }

  handleChange = event => {
    const content = event.target.value;
    const name = event.target.name;
    this.setState(state => ({
      [name]: {
        ...state[name],
        value: content 
      }
    }), () => name === 'email' ? this.validateEmail() : this.validatePassword());
  }

  componentDidMount() {
    auth.onAuthStateChanged(data => {
      if (data) {
        this.setState({ user: data }, () => this.props.history.push('/home'));
      } else {
        this.setState({ user: null });
      }
    })
  }

  render() {
    const isValid =
      this.state.email.value &&
      this.state.password.value &&
      !this.state.password.error &&
      !this.state.email.error;

    return (
      <div className="App">
        <form
          onSubmit={this.handleLogin}
          noValidate>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={this.state.email.value}
            onChange={this.handleChange}/>
          { 
            this.state.email.error && <p>{this.state.email.error}</p>
          }

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={this.state.password.value}
            onChange={this.handleChange}/>
          { 
            this.state.password.error && <p>{this.state.password.error}</p>
          }
            
          <button type="submit" disabled={!isValid}>Login</button>
        </form>
      </div>
    )
  }
}

export default Login;