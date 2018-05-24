import React, { Component } from 'react';
import Signup from '../../components/Signup/Signup';
import Login from '../../components/Login/Login';
import Landing from '../Landing/Landing';
import Home from '../Home/Home';
import Navbar from '../../ui/Navbar/Navbar';

import { auth } from '../../firebase';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

class Root extends Component {
  state = {
    user: null
  }

  componentDidMount() {
    auth.onAuthStateChanged(data => {
      if (data) {
        this.setState({ user: data });
      } else {
        this.setState({ user: null });
      }
    })
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
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Root;