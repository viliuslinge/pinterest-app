import React, { Component } from 'react';
import { FirebaseService } from '../../api/FirebaseService';
import { message, Input, Upload, Button } from 'antd';
import styles from './Settings.scss'

const firebaseService = new FirebaseService();
const { TextArea } = Input;

class Settings extends Component {

  state = {
    name: '',
    surname: '',
    about: ''
  }

  handleChange = event => {
    const content = event.target.value;
    const name = event.target.name;
    this.setState({ [name]: content });
  }

  saveUserSettings = () => {
    firebaseService.getProfile(this.props.user.uid)
      .update({ ...this.state })
      .then(message.success('Settings have been saved!'))
  }

  uploadImage = (event) => {
    if (this.props.user && this.props.user.profileImageName) {
      this.deleteImage();
    }
    firebaseService.uploadUserProfileImage(event, this.props.user.uid);
  }

  deleteImage = () => {
    firebaseService.deleteProfileImage(this.props.user.uid, this.props.user.profileImageName);
  }

  static getDerivedStateFromProps(props, state) {
    return props.user ? {
      name: props.user.name,
      surname: props.user.surname,
      about: props.user.about
    } : null;
  }

  render() {
    const imageStyle = {
      backgroundImage: `url(${this.props.user.photoURL})`
    }

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>

        <div className={styles.settingsContainer}>
          <div className={styles.pictureContainer}>
            <div className={styles.profilePic} style={imageStyle}></div>
            <Upload onChange={this.uploadImage} fileList={false}>
              <Button size="large">Change picture</Button>
            </Upload>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputBox}>
              <label className={styles.label} htmlFor="name">First Name</label>
              <Input
                id="name"
                size="large"
                name="name"
                type="text"
                placeholder="First name"
                value={this.state.name}
                onChange={this.handleChange} />
            </div>

            <div className={styles.inputBox}>
              <label className={styles.label} htmlFor="name">Last Name</label>
              <Input
                id="surname"
                size="large"
                name="surname"
                type="text"
                placeholder="Last name"
                value={this.state.surname}
                onChange={this.handleChange} />
            </div>

            <div className={styles.inputBox}>
              <label className={styles.label} htmlFor="about">About</label>
              <TextArea
                id="about"
                rows={4}
                size="large"
                name="about"
                type="textarea"
                placeholder="About you"
                value={this.state.about}
                onChange={this.handleChange}/>
            </div>

            <div className={styles.inputBox}>
              <label className={styles.label}>Email</label>  
              <p>{this.props.user.email}</p>
            </div>
          </div>
        </div>
        
        <Button
          className={styles.saveButton}
          onClick={this.saveUserSettings}
          size="large"
          type="primary">
          Save settings
        </Button>
      </div>
    )
  }
}

export default Settings;