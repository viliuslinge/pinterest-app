import React, { Component } from 'react';
import Signup from '../../components/Signup/Signup';
import Login from '../../components/Login/Login';
import Landing from '../Landing/Landing';
import Home from '../Home/Home';
import Navbar from '../../ui/Navbar/Navbar';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

class Root extends Component {

  render() {
    return (
      <Router>
        <div>
          <Route component={Navbar} />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/home" component={Home} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Root;