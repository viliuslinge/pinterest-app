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

  // POST SERVICES

  createPost(id) {
    return db.collection('posts').add({
      created_at: new Date().getTime(),
      description: '',
      photoURL: '',
      imageName: '',
      thumbnailURL: '',
      thumbnailName: '',
      tags: {},
      status: 'draft',
      user_uid: id,
      ratio: ''
    })
  }

  getPost(id) {
    return db.doc(`posts/${id}`);
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

  // subscribeToRelatedPosts(callbackFunction, tags) {
  //   let allPosts = []
  //   let tagsArr = []
  //   for (let tag in tags) {
  //     tagsArr.push(tag);
  //   }
  //   for (let i = 0; i < tagsArr.length; i++) {
  //     db.collection('posts')
  //       .where(`tags.${tagsArr[i]}`, '==', true)
  //       .onSnapshot(snapshot => {
  //         if (i === 0) {
  //           allPosts = []
  //         }
  //         snapshot.forEach(doc => allPosts.push(this.createPostFromDoc(doc)));
  //         callbackFunction(allPosts);
  //       })
  //   }
  // }

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

  // getUserActivePosts(user_uid) {
  //   return db.collection('posts')
  //     .where('status', '==', 'active')
  //     .where('user_uid', '==', user_uid)
  //     .orderBy('created_at', 'desc')
  //     .get()
  //     .then((snapshot) => {
  //       const allPosts = []
  //       snapshot.forEach(doc => allPosts.push(this.createPostFromDoc(doc)))
  //       return allPosts
  //     })
  //     .catch(() => [])
  // }

  uploadPostImage(event, id) {
    let upload = event.file.originFileObj;
    let uploadThumb;

    if (!upload) {
      console.log('No files found');
      return;
    }

    const storageRef = storage.ref()
    const imageName = new Date().getTime();
    const uploadImage = storageRef.child(`posts/${imageName}`).put(upload);

    uploadImage.on(
      'state_changed',
      (snapshot) => {},
      (error) => { console.log(error) },
      () => {
        uploadImage.snapshot.ref.getDownloadURL()
          .then((downloadURL) => {
            if (downloadURL) {
              this.getImageRatio(event, id, downloadURL, imageName);
              return;
            } else { console.log('Image not uploaded') }
          })
      }
    )

    imgCompressor.compressImage(upload)
      .then((result) => {
        uploadThumb = result;
        const thumbnailName = new Date().getTime();
        const uploadThumbnail = storageRef.child(`thumbnails/${thumbnailName}`).put(uploadThumb);

        uploadThumbnail.on(
          'state_changed',
          (snapshot) => {},
          (error) => { console.log(error) },
          () => {
            uploadThumbnail.snapshot.ref.getDownloadURL()
              .then((downloadURL) => {
                if (downloadURL) {
                  uploadThumb.url = downloadURL;
                  this.updatePostThumbnail(id, uploadThumb.url, thumbnailName);
                  return;
                } else { console.log('Thumbnail not uploaded') }
              })
          }
        )
      })
      .catch((err) => { console.log('fail') })
  }

  getImageRatio(event, id, downloadURL, imageName) {
    let img = new Image();
    let _URL = window.URL || window.webkitURL;
    img.src = _URL.createObjectURL(event.file.originFileObj);
    img.onload = (data) => {
      const imgRatio = (data.path[0].width / data.path[0].height).toFixed(4)
      this.updatePostImage(id, downloadURL, imageName, imgRatio);
    }
  }

  updatePostImage(id, uploadURL, imageName, imgRatio) {
    const postData = {
      ratio: imgRatio || '',
      photoURL: uploadURL || '',
      imageName: imageName || ''
    }
    this.getPost(id).set(postData, {merge: true});
  }

  updatePostThumbnail(id, thumbnailURL, thumbnailName) {
    const postData = {
      thumbnailURL: thumbnailURL || '',
      thumbnailName: thumbnailName || ''
    }
    this.getPost(id).set(postData, {merge: true});
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
}