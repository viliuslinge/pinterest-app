import React, { Component } from 'react';
import Signup from '../../components/Signup/Signup';
import Login from '../../components/Login/Login';

import Landing from '../Landing/Landing';
import Home from '../Home/Home';
import Post from '../../components/Post/Post';

import Navbar from '../../ui/Navbar/Navbar';
import Profile from '../Profile/Profile';
import { FirebaseService } from '../../api/FirebaseService';
import { auth } from '../../firebase';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const firebaseService = new FirebaseService();

class Root extends Component {

  state = {
    user: null
  }

  unsubscribe = undefined;
  unsubscribeAuth = undefined;

  componentDidMount() {
    this.unsubscribeAuth = auth.onAuthStateChanged(data => {
      if (data) {
        if (!this.unsubscribe) {
          this.unsubscribe = firebaseService.getProfile(data.uid)
            .onSnapshot( (user) => {
                if (user.exists) {
                  this.setState({ user: user.data() })
                } else {
                  console.log("No such document!")
                }}, (error) => {
                  console.log(error);
                }
              )
            }
      } else {
        this.unsubscribe && this.unsubscribe()
        this.setState({ user: null });
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribeAuth()
  }

  render() {
    return (
      <Router>
        <div>
          <Route render={
            (props) => <Navbar {...props} user={this.state.user}/>
          }/>
          <Switch>
            <Route exact path="/" component={Landing}/>
            <Route exact path="/signup" render={
              (props) => <Signup {...props} user={this.state.user}/>
            }/>
            <Route exact path="/login" render={
              (props) => <Login {...props} user={this.state.user}/>
            }/>
            <Route exact path="/home" component={Home}/>
            <Route exact path="/post" render={
              (props) => <Post {...props} user={this.state.user}/>
            }/>
            <Route exact path="/profile" render={
              (props) => <Profile {...props} user={this.state.user}/>
            }/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Root;