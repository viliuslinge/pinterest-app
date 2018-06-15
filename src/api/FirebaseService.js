import { auth, db, storage } from '../firebase';
import { ImgCompressor } from './ImgCompressor';

const imgCompressor = new ImgCompressor();

export class FirebaseService {

  // AUTH SERVICES

  emailSignUp(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then(data => {
        return this.updateUserData(data.user);
      });
  }

  emailLogIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  updateUserData(user) {
    const userRef = db.doc(`users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Guest',
      surname: user.surname || '',
      about: user.about || '',
      photoURL: user.photoURL || 'https://goo.gl/8kwFW5',
      profileImageName:  user.photoImageName || ''
    }
    return userRef.set(userData, {merge: true});
  }

  // USER SERVICES

  getProfile(id) {
    return db.doc(`users/${id}`);
  }

  uploadUserProfileImage(event, id) {
    let upload = event.file.originFileObj;

    if (!upload) {
      console.log('No files found');
      return;
    }

    imgCompressor.compressImage(upload)
      .then((result) => {
        upload = result;
        const storageRef = storage.ref()
        const fileName = new Date().getTime();
        const uploadTask = storageRef.child(`users/${fileName}`).put(upload);
    
        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => { console.log(error) },
          () => {
            uploadTask.snapshot.ref.getDownloadURL()
              .then((downloadURL) => {
                if (downloadURL) {
                  upload.url = downloadURL;
                  this.updateUserProfileImage(id, upload.url, fileName);
                  return;
                } else { console.log('File not uploaded') }
              })
          }
        )
      })
      .catch((error) => console.log(error))
  }

  updateUserProfileImage(id, uploadURL, fileName) {
    const userData = {
      photoURL: uploadURL || '',
      profileImageName: fileName || ''
    }
    return this.getProfile(id).set(userData, {merge: true});
  }

  deleteProfileImage(id, fileName) {
    return this.updateUserProfileImage(id)
      .then(
        () => { storage.ref().child(`users/${fileName}`).delete() }
      )
  }

  // TAG SERVICES

  getTagList() {
    return db.doc(`tags/tagList`)
  }

  updateTagList(selectedTagsArr) {
    this.getTagList().get().then(data => {
      let newList = new Set(data.data().tags);
      for (let tag of selectedTagsArr) {
        newList.add(tag);
      }
      this.getTagList().set({tags: Array.from(newList)}, {merge: true});
    });
  }

  // POST SERVICES

  generateRandomId() {
    const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return randLetter + new Date().getTime();
  }

  getPost(id) {
    return db.doc(`posts/${id}`);
  }

  createPost(id, postDetails, event) {
    let upload = event.file.originFileObj;
    if (!upload) { return console.log('No files found') };
    let post = {
      postId: this.generateRandomId(),
      created_at: new Date().getTime(),
      description: postDetails.description,
      tags: postDetails.tags,
      status: postDetails.status,
      user_uid: id,
      photoURL: '',
      imageName: this.generateRandomId(),
      thumbnailURL: '',
      thumbnailName: this.generateRandomId(),
      ratio: ''
    }
    return new Promise(resolve => {
      this.calcImageRatio(post, upload, resolve)
    });
  }

  calcImageRatio(post, upload, resolve) {
    let img = new Image();
    let _URL = window.URL || window.webkitURL;
    img.src = _URL.createObjectURL(upload);
    img.onload = (data) => {
      post.ratio = (data.path[0].width / data.path[0].height).toFixed(4);
      this.uploadImage(post, upload, resolve);
    }
  }

  uploadImage(post, upload, resolve) {
    const uploadImage = storage.ref().child(`posts/${post.imageName}`).put(upload);
      uploadImage.on(
        'state_changed',
        snapshot => {},
        error => { console.log(error) },
        () => { uploadImage.snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            post.photoURL = downloadURL;
            this.uploadThumbnail(post, upload, resolve);
          })
          .catch(err => console.log(err));
        }
      )
  }

  uploadThumbnail(post, upload, resolve) {
    imgCompressor.compressImage(upload)
      .then(compressedImage => {
        const uploadThumbnail = storage.ref().child(`thumbnails/${post.thumbnailName}`).put(compressedImage)
        uploadThumbnail.on(
          'state_changed',
          (snapshot) => {},
          (error) => { console.log(error) },
          () => { uploadThumbnail.snapshot.ref.getDownloadURL()
            .then(downloadURL => {
              post.thumbnailURL = downloadURL;
              resolve(this.sendPostToFirebase(post))
            })
            .catch(err => console.log(err));
          }
        )
      })
      .catch((err) => { console.log('fail') })
  }

  sendPostToFirebase(post) {
    return db.collection('posts').doc(post.postId).set(post);
  }

  deleteImage(fileName) {
    return storage.ref().child(`posts/${fileName}`).delete();
  }

  deleteThumbnail(fileName) {
    return storage.ref().child(`thumbnails/${fileName}`).delete();
  }

  deletePost(id) {
    return this.getPost(id).delete();
  }

  createPostFromDoc(doc) {
    const data = doc.data()
    return {
      postId: doc.id,
      description: data.description,
      photoURL: data.photoURL,
      imageName: data.imageName,
      thumbnailURL: data.thumbnailURL,
      thumbnailName: data.thumbnailName,
      tags: data.tags,
      status: data.status,
      user_uid: data.user_uid,
      created_at: data.created_at,
      ratio: data.ratio
    }
  }

  subscribeToAllActivePosts(callbackFunction) {
     return db.collection('posts')
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .onSnapshot(snapshot => {
        const allPosts = []
        snapshot.forEach(doc => allPosts.push(this.createPostFromDoc(doc)))
        callbackFunction(allPosts);
      }
    );
  }

  subscribeToUserActivePosts(callbackFunction, user_uid) {
    return db.collection('posts')
      .where('status', '==', 'active')
      .where('user_uid', '==', user_uid)
      .orderBy('created_at', 'desc')
      .onSnapshot(snapshot => {
        const allPosts = []
        snapshot.forEach(doc => allPosts.push(this.createPostFromDoc(doc)))
        callbackFunction(allPosts);
      }
    );
  }
}