import React, { Component } from 'react';
import { FirebaseService } from '../../api/FirebaseService';
import { Input, Button } from 'antd';
import styles from './Signup.scss';

const firebaseService = new FirebaseService();

class Signup extends Component {

  state = {
    email: {
      value: '',
      error: ''
    },
    password: {
      value: '',
      error: ''
    },
    loading: false,
    signupError: null
  }

  validationMessage = {
    email: {
      required: 'Oops! Please enter an email address',
      pattern: `That doesn't look like a valid email address`,
      valid: ''
    },
    password: {
      required: 'Please enter a password',
      pattern: 'It must contain at least one letter and one number',
      minlength: 'Sorry.. it must be 6 characters minimum',
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
    const patternPassword = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/g;

    if (this.state.password.value.length === 0) {
      return this.setError('password', 'required')
    };
    if (this.state.password.value.length < 6) {
      return this.setError('password', 'minlength')
    };
    if (patternPassword.test(this.state.password.value) === false) {
      return this.setError('password', 'pattern')
    };
    return this.setError('password', 'valid')
  }

  handleSignup = event => {
    event.preventDefault();
    this.handleLoading();
    if (this.state.loginError) {
      this.setState({ loginError: null })
    }
    firebaseService.emailSignUp(this.state.email.value, this.state.password.value)
      .catch(() => {
        this.handleLoading();
        this.setState({ signupError: 'This email is already registered' });
      })
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

  handleLoading = () => {
    this.setState({ loading: !this.state.loading });
  }

  render() {
    const isValid =
      this.state.email.value &&
      this.state.password.value &&
      !this.state.password.error &&
      !this.state.email.error;

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Sign up</h1>

        <div className={styles.signupMessage}>
          {
            this.state.signupError &&
            <p className={styles.signupError}>{this.state.signupError}</p>
          }
        </div>

        <form
          className={styles.form}
          onSubmit={this.handleSignup}
          noValidate>
          
          <div className={styles.inputBox}>
            <Input
              size="large"
              type="email"
              name="email"
              placeholder="Email"
              value={this.state.email.value}
              onChange={this.handleChange}/>
            { 
              this.state.email.error &&
              <p className={styles.validation}>{this.state.email.error}</p>
            }
          </div>
          
          <div className={styles.inputBox}>
            <Input
              size="large"
              type="password"
              name="password"
              placeholder="Password"
              value={this.state.password.value}
              onChange={this.handleChange}/>
            { 
              this.state.password.error &&
              <p className={styles.validation}>{this.state.password.error}</p>
            }
          </div>
          
          <Button
            size="large"
            className={styles.button}
            type="primary"
            loading={this.state.loading}
            htmlType="submit"
            disabled={!isValid}>
            { this.state.loading ? 'Loading' : 'Signup' }
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Already a member?</p>
          <a onClick={() => this.props.history.push('/login')}>Log in</a>
        </div>
      </div>
    )
  }
}

export default Signup;