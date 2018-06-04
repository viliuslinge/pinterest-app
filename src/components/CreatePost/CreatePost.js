import React, { Component } from 'react';
import { message, Avatar, Upload, Button, Icon, Tabs, Input } from 'antd';
import { FirebaseService } from '../../api/FirebaseService';
import styles from './CreatePost.scss';

const firebaseService = new FirebaseService();
const TabPane = Tabs.TabPane;
const { TextArea } = Input;

class Post extends Component {

  state = {
    postId: null,
    postData: null,
    thumbnailURL: null,
    postDescription: '',
    activeTabKey: '1',
    loading: false
  }

  unsubscribe = undefined;

  createNewPost = () => {
    firebaseService.createPost(this.props.uid)
      .then((data) => {
        this.setState({ postId: data.id })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  uploadImage = (event) => {
    if (this.state.postData && this.state.postData.imageName) {
      this.deleteImage();
      this.setState({ loading: true });
    }
    firebaseService.uploadPostImage(event, this.state.postId)
    this.unsubscribe = firebaseService.getPost(this.state.postId)
      .onSnapshot((data) => {
        if (data.exists) {
          this.setState({
            postData: data.data(),
            thumbnailURL: data.data().thumbnailURL
          })
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

  handleImageUpload = (info) => {
    const validator = /image\/[.]*/;
    if (validator.test(info.file.type) && info.file.status === 'error') {
      this.setState({ loading: true });
      this.uploadImage(info)
      return;
    } else if (!validator.test(info.file.type) && info.file.status === 'error') {
      message.warning('Oops, file type should be image!');
    }
  }

  updateNewPost = () => {
    firebaseService.getPost(this.state.postId)
      .update({ 
        description: this.state.postDescription ,
        status: 'active'
      });
    this.props.closeModal();
    message.success('Your post has been shared!');
  }

  deleteImage = () => {
    this.setState({ loading: false });

    firebaseService.deleteImage(this.state.postData.imageName)
      .then(firebaseService.updatePostImage(this.state.postId))

    firebaseService.deleteThumbnail(this.state.postData.thumbnailName)
      .then(firebaseService.updatePostThumbnail(this.state.postId))
  }

  componentDidMount() {
    this.createNewPost();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {

    const uploadButton = (
      <div className={styles.imageUpload}>
        <Icon
          className={styles.uploadIcon}
          type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <div className={styles.postContainer}>
        <Tabs activeKey={this.state.activeTabKey}>
          <TabPane tab="1.Upload" key="1" disabled>
            <p className={styles.hint}>
              Click below and upload any picture you want!
            </p>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action=""
              accept="image/*"
              onChange={this.handleImageUpload}>
              {
                this.state.thumbnailURL
                  ? <img
                      src={this.state.thumbnailURL}
                      className={styles.imageUploaded}
                      alt="avatar" />
                  : uploadButton
              }
            </Upload>

            {
              this.state.thumbnailURL &&
              <div className={styles.buttonContainer}>
                <Button onClick={this.deleteImage} size="large" icon="delete" />
                <Button
                  type="primary"
                  size="large"
                  onClick={this.handleNextStep}>
                  Next
                </Button>
              </div>
            } 
          </TabPane>

          <TabPane tab="2.Comment" key="2" disabled>
            <p className={styles.hint}>
              Write down all your ideas here!
            </p>
            <TextArea
              rows={4}
              size="large"
              type="textarea"
              placeholder="Description"
              value={this.state.postDescription}
              onChange={this.handleInputChange}/>

            <div className={styles.buttonContainer}>
              <Button
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
            </div>
          </TabPane>

          <TabPane tab="3.Share" key="3" disabled>
            <p className={styles.hint}>
              Review your post and share it with others!
            </p>
            <img
              src={this.state.thumbnailURL}
              className={styles.imageUploadedReview}
              alt="post" />
            <div className={styles.userDetails}>
              <Avatar src={this.props.photoURL} />
              <p className={styles.userDetailsName}>{this.props.name}</p>
            </div>
            {
              this.state.postDescription
                ? <p className={styles.description}>{this.state.postDescription}</p>
                : <p className={styles.description}>...</p>
            }
            <div className={styles.buttonContainer}>
              <Button
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
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default Post;