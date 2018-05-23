import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Signup from './components/Signup';
import Login from './components/Login';
import Landing from './containers/Landing';
import Home from './containers/Home';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/home" component={Home} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/login" component={Login} />
    </Switch>
  </Router>, document.getElementById('root'));
registerServiceWorker();