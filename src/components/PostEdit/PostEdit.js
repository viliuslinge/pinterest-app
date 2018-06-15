import React, { Component } from 'react';
import { Input, Button, Select, message, Popconfirm } from 'antd';
import styles from './PostEdit.scss';
import { FirebaseService } from '../../api/FirebaseService';

const firebaseService = new FirebaseService();
const { TextArea } = Input;
const Option = Select.Option;

class PostEdit extends Component {

  state = {
    description: '',
    selectedTagsArr: null,
    tagValidation: ''
  }

  tags = [];

  handleTagChange = (value) => {
    if (this.state.tagValidation) {
      this.setState({ tagValidation: '' })
    }
    let tagsArr = [];
      for (let tag of value) {
        tag = tag.replace(/\s/g, '');
        tag = tag.charAt(0).toUpperCase() + tag.slice(1);
        tagsArr.push(tag);
      };
    this.setState({ selectedTagsArr: tagsArr });
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
    firebaseService.updateTagList(this.state.selectedTagsArr);
  }

  handleInputChange = (event) => {
    this.setState({ description: event.target.value });
  }

  updatePost = () => {
    if (this.state.selectedTagsArr.length === 0) {
      return this.setState({ tagValidation: 'Please add at least one tag' });
    }
    firebaseService.getPost(this.props.post.postId)
      .update({ 
        description: this.state.description,
        tags: this.state.selectedTagsArr
      });
    this.updateTagList();
    this.props.closeModal();
    message.success('Your post has been updated!');
  }

  deletePost = () => {
    firebaseService.deletePost(this.props.post.postId)
      .then(() => {
        firebaseService.deleteImage(this.props.post.imageName)
          .catch(error => console.log(error));
        firebaseService.deleteThumbnail(this.props.post.thumbnailName)
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
    message.success('Your post has been deleted.');
  };

  static getDerivedStateFromProps(props, state) {
    return props.post ? {
      description: props.post.description,
      selectedTagsArr: props.post.tags
    } : null;
  }

  componentDidMount() {
    this.getTagList();
  }
  
  render() {
    const imageStyle = {
      backgroundImage: `url(${this.props.post.thumbnailURL})`
    }

    return (
      <div className={styles.postContainer}>
        <div className={styles.contentContainer}>
          <div>
            <label className={styles.label} htmlFor="photo">Image</label>
            <div id="photo" className={styles.image} style={imageStyle}></div>
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="description">Description</label>
            <TextArea
              className={styles.description}
              id="description"
              rows={4}
              size="large"
              type="textarea"
              placeholder="Description"
              value={this.state.description}
              onChange={this.handleInputChange}/>

            <label className={styles.label} htmlFor="tags">Tags</label>
            <Select
              id="tags"
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Select or write your own"
              defaultValue={this.state.selectedTagsArr}
              onChange={this.handleTagChange}>
              {this.tags}
            </Select>
            { 
              this.state.tagValidation &&
              <p className={styles.validation}>{this.state.tagValidation}</p>
            }
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Popconfirm
            title="Are you sure want to delete this post?"
            onConfirm={this.deletePost}
            okText="Yes" cancelText="No">
            <Button
              className={styles.button}
              size="large"
              icon="delete" />
          </Popconfirm>

          <Button
            className={styles.button}
            size="large"
            onClick={this.props.closeModal}>
            Cancel
          </Button>
          
          <Button
            className={styles.button}
            type="primary"
            size="large"
            onClick={this.updatePost}>
            Save
          </Button>
        </div>
      </div>
    )
  }
}

export default PostEdit;