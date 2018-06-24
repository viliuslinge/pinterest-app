import React, { Component } from 'react';
import { message, Upload, Button, Icon, Tabs, Input, Select } from 'antd';
import { FirebaseService } from '../../api/FirebaseService';
import { ImgCompressor } from '../../api/ImgCompressor';
import styles from './CreatePost.scss';

const firebaseService = new FirebaseService();
const imgCompressor = new ImgCompressor();
const TabPane = Tabs.TabPane;
const { TextArea } = Input;
const Option = Select.Option;

class Post extends Component {

  state = {
    loading: false,
    activeTabKey: '1',
    thumbnailURL: null,
    imageFile: null,
    postDescription: '',
    tagValidation: ''
  }

  tags = [];
  selectedTagsArr = [];

  handleNextStep = () => {
    if (this.state.loading) {
      this.setLoadingOff()
    };
    this.setState({ activeTabKey: String(+this.state.activeTabKey + 1) })
  }

  handlePreviousStep = () => {
    this.setState({ activeTabKey: String(+this.state.activeTabKey - 1) })
  }

  setLoadingOn = () => {
    this.setState({ loading: true });
  }

  setLoadingOff = () => {
    this.setState({ loading: false });
  }

  createNewPost = () => {
    if (this.selectedTagsArr.length === 0) {
      return this.setState({ tagValidation: 'Please add at least one tag' });
    }
    this.setLoadingOn();
    const postDetails = {
      description: this.state.postDescription,
      tags: this.selectedTagsArr,
      status: 'active'
    }
    firebaseService.createPost(this.props.uid, postDetails, this.state.imageFile)
      .then((data) => {
        this.setLoadingOff();
        this.props.closeModal();
        this.updateTagList();
        message.success('Your post has been shared!');
      })
      .catch((error) => {
        console.error(error);
        message.error('Oops..something went wrogn. Try again!');
      });
  }

  handleImageUpload = (event) => {
    const validator = /image\/[.]*/;
    if (validator.test(event.file.type)) {
      if (event.file.status === 'uploading') {
        this.setLoadingOn();
      }
      if (event.file.status === 'done') {
        let _URL = window.URL || window.webkitURL;
        imgCompressor.compressImage(event.file.originFileObj)
          .then((result) => {
            this.setState({
              imageFile: event,
              thumbnailURL: _URL.createObjectURL(result)
            });
          })
        return;
      }
      if (event.file.status === 'error') {
        if (this.state.loading) {
          this.setLoadingOff()
        };
        return message.warning('Oops, something went wrong! Try again');
      }
    } else if (!validator.test(event.file.type)) {
      message.warning('Oops, file type should be image!');
    }
  }

  handleInputChange = (event) => {
    this.setState({ postDescription: event.target.value });
  }

  handleTagChange = (value) => {
    if (this.state.tagValidation) {
      this.setState({ tagValidation: '' });
    };
    let tagsArr = [];
      for (let tag of value) {
        tag = tag.replace(/\s/g, '');
        tag = tag.charAt(0).toUpperCase() + tag.slice(1);
        tagsArr.push(tag);
      };
    this.selectedTagsArr = tagsArr;
  }

  getTagList = () => {
    firebaseService.getTagList().get().then(data => {
      const currentTagsArr = data.data().tags
      for (let tag of currentTagsArr) {
        this.tags.push(<Option key={tag}>{tag}</Option>);
      }
    })
  }

  updateTagList = () => {
    firebaseService.updateTagList(this.selectedTagsArr);
  }

  deleteImage = () => {
    this.setLoadingOff();
    this.setState({
      imageFile: null,
      thumbnailURL: null
    });
  }

  componentDidMount() {
    this.getTagList();
  }

  render() {
    const imageStyle = {
      backgroundImage: `url(${this.state.thumbnailURL})`
    }

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
        <Tabs activeKey={this.state.activeTabKey} size="small" tabBarStyle={{ display: 'none' }}>
          <TabPane tab="1.Upload" key="1" disabled>
            <p className={styles.hint}>
              Click below and upload any picture you want!
            </p>
            <Upload
              name="avatar"
              listType="picture-card"
              className={styles['avatar-uploader']}
              showUploadList={false}
              action=""
              accept="image/*"
              onChange={this.handleImageUpload}>
              {
                this.state.thumbnailURL
                  ? <div id="photo" className={styles.imageUploaded} style={imageStyle}></div>
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

          <TabPane tab="2.Describe" key="2" disabled>
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

          <TabPane tab="3.Tag" key="3" disabled>
            <p className={styles.hint}>
              Add at least one tag and share your post with others!
            </p>

            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Select or write your own"
              onChange={this.handleTagChange}>
              {this.tags}
            </Select>
            { 
              this.state.tagValidation &&
              <p className={styles.validation}>{this.state.tagValidation}</p>
            }

            <div className={styles.buttonContainer}>
              <Button
                size="large"
                onClick={this.handlePreviousStep}>
                Previous
              </Button>
              <Button
                size="large"
                type="primary"
                loading={this.state.loading}
                onClick={this.createNewPost}>
                { this.state.loading ? 'Loading' : 'Share!' }
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default Post;