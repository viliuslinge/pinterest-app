import React, { Component } from 'react';
import Signup from '../../components/Signup/Signup';
import Login from '../../components/Login/Login';
import Landing from '../Landing/Landing';
import Home from '../Home/Home';
import Search from '../Search/Search';
import Settings from '../Settings/Settings';
import PostPage from '../PostPage/PostPage';
import Navbar from '../../ui/Navbar/Navbar';
import Profile from '../Profile/Profile';
import styles from './Root.scss';
import { FirebaseService } from '../../api/FirebaseService';
import { auth } from '../../firebase';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { PrivateRoute, NoAuthRoute } from '../../components/PrivateRoute';

const firebaseService = new FirebaseService();

class Root extends Component {

  state = {
    user: null,
  }

  unsubscribe = undefined;
  unsubscribeAuth = undefined;

  setLocalStorage = () => {
    if (this.state.user) {
      localStorage.setItem('currentUser', JSON.stringify(this.state.user));
    }
  }

  getLocalStorage = () => {
    const localStorageItem = localStorage.getItem('currentUser');
    if (localStorageItem) {
      const currentUser = JSON.parse(localStorageItem);
      this.setState({ user: currentUser });
    } else {
      return null;
    }
  }

  componentWillMount() {
    this.getLocalStorage();
  }

  componentDidMount() {
    this.unsubscribeAuth = auth.onAuthStateChanged(data => {
      if (data) {
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
      } else {
        this.unsubscribe && this.unsubscribe()
        this.setState({ user: null });
      }
    })

    window.onbeforeunload = (e) => {
      this.setLocalStorage()
    }
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  render() {
    return (
      <Router>
        <div>
          <Route render={
            (props) => <Navbar {...props} user={this.state.user} />
          }/>
          <div className={styles.container}>
            <Switch >
              <Route exact path="/" component={Landing} />
              <NoAuthRoute
                user={this.state.user}
                path="/signup"
                component={Signup} />
              <NoAuthRoute
                user={this.state.user}
                path="/login"
                component={Login} />
              <PrivateRoute
                user={this.state.user}
                path="/home"
                component={Home} />
              <PrivateRoute
                user={this.state.user}
                path="/search/:query"
                component={Search} />
              <PrivateRoute
                user={this.state.user}
                path="/profile/:id"
                component={Profile} />
              <PrivateRoute
                user={this.state.user}
                path="/Settings"
                component={Settings} />
              <PrivateRoute
                user={this.state.user}
                path="/post/:id"
                component={PostPage} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default Root;