import React, { Component } from 'react';
import { Input, Upload, Button, Icon } from 'antd';
import { FirebaseService } from '../../api/FirebaseService';
import styles from './Profile.scss';

const firebaseService = new FirebaseService();

class Profile extends Component {

  state = {
    editable: false,
    name: ''
  }

  handleEdit = () => {
    this.setState({ editable: !this.state.editable })
  }

  handleChange = (event) => {
    const value = event.target.value
    this.setState({ name: value })
  }

  saveUserName = () => {
    firebaseService.getProfile(this.props.user.uid)
      .update({ name: this.state.name })
      this.handleEdit();
  }

  uploadImage = (event) => {
    firebaseService.uploadUserProfileImage(event, this.props.user.uid);
  }

  static getDerivedStateFromProps(props, state) {
    return props.user ? {name: props.user.name} : null;
  }

  render() {
    return (
      <div className={styles.container}>
        {
          this.props.user &&
          <div>
            <p>{this.props.user.email}</p>
            {
              !this.state.editable &&
              <div>
                <p>{this.props.user.name}</p>
                <Button onClick={this.handleEdit}>Edit name</Button>
              </div>
            }
            {
              this.state.editable &&
              <div>
                <Input
                size="large"
                type="text"
                value={this.state.name}
                onChange={this.handleChange} />
                <Button onClick={this.saveUserName}>Save</Button>
              </div>
            }
            <img
              className={styles.profilePic}
              src={this.props.user.photoURL}
              alt=""/>

            <Upload onChange={this.uploadImage} fileList={false}>
              <Button>
                <Icon type="upload" /> Click to Upload
              </Button>
            </Upload>
          </div>   
        }
      </div>
    )
  }
}

export default Profile;