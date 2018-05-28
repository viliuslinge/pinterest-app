import React, { Component } from 'react';
import { Upload, Button, Icon, Tabs, Input } from 'antd';
import { FirebaseService } from '../../api/FirebaseService';
import styles from './Post.scss';

const firebaseService = new FirebaseService();
const TabPane = Tabs.TabPane;
const { TextArea } = Input;

class Post extends Component {

  state = {
    user_uid: null,
    postId: null,
    postData: null,
    postDescription: '',
    activeTabKey: '1'
  }

  unsubscribe = undefined;

  createNewPost = () => {
    firebaseService.createPost(this.state.user_uid)
      .then((data) => {
        this.setState({ postId: data.id })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  uploadImage = (event) => {
    firebaseService.uploadPostImage(event, this.state.postId)
    this.unsubscribe = firebaseService.getPost(this.state.postId)
      .onSnapshot((data) => {
        if (data.exists) {
          this.setState({ postData: data.data() })
        } else {
          console.log("No such document!")
        }}, (error) => {
          console.log(error);
        }
      )
  }

  handleNextStep = () => {
    this.setState({ activeTabKey: String(+this.state.activeTabKey + 1) })
  }

  handlePreviousStep = () => {
    this.setState({ activeTabKey: String(+this.state.activeTabKey - 1) })
  }

  handleInputChange = (event) => {
    this.setState({ postDescription: event.target.value });
  }

  updateNewPost = () => {
    firebaseService.getPost(this.state.postId)
      .update({ 
        description: this.state.postDescription ,
        status: 'active'
      });
  }

  componentDidMount() {
    this.createNewPost();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props.user ? {user_uid: props.user.uid} : null;
  }

  render() {
    return (
      <div>
        <Tabs activeKey={this.state.activeTabKey}>
          <TabPane tab="1.Upload" key="1" disabled>
            <p>Click below and upload any picture you want!</p>
            {
              this.state.postData &&
              <img
                className={styles.profilePic}
                src={this.state.postData.photoURL}
                alt=""/>
            }
            <Upload onChange={this.uploadImage} fileList={false}>
              <Button>
                <Icon type="upload" /> Click to Upload
              </Button>
            </Upload>
            <Button
              type="primary"
              size="large"
              onClick={this.handleNextStep}>
              Next
            </Button>
          </TabPane>

          <TabPane tab="2.Comment" key="2" disabled>
            <p>Write down all your ideas here!</p>
            <TextArea
              rows={4}
              size="large"
              type="textarea"
              placeholder="Description"
              value={this.state.postDescription}
              onChange={this.handleInputChange}/>

            <Button
              type="primary"
              size="large"
              onClick={this.handlePreviousStep}>
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={this.handleNextStep}>
              Next
            </Button>
          </TabPane>

          <TabPane tab="3.Share" key="3" disabled>
            <p>Review your post and share it with others!</p>
            <Button
              type="primary"
              size="large"
              onClick={this.handlePreviousStep}>
              Previous
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={this.updateNewPost}>
              Share!
            </Button>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default Post;