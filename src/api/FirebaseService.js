import { auth, db, storage } from '../firebase';

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
      photoURL: user.photoURL || 'https://goo.gl/8kwFW5'
    }
    return userRef.set(userData, {merge: true});
  }

  // USER SERVICES

  getProfile(id) {
    return db.doc(`users/${id}`);
  }

  uploadUserProfileImage(event, id) {
    const upload = event.file.originFileObj;
    if (!upload) {
      console.log('No files found');
      return;
    }

    const storageRef = storage.ref()
    const fileName = new Date().getTime();
    const uploadTask = storageRef.child(`users/${fileName}`).put(upload);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, (error) => {
        console.log(error);
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL()
          .then((downloadURL) => {
            if (downloadURL) {
              upload.url = downloadURL;
              this.changeUserProfileImage(upload, id);
              return;
            } else {
              console.log('File not uploaded');
            }
          })
      }
    )
  }

  changeUserProfileImage(upload, id) {
    return this.getProfile(id).update({ photoURL: upload.url });
  }

  // POST SERVICES

  createPost(id) {
    return db.collection('posts').add({
      created_at: new Date().getTime(),
      imageName: '',
      description: '',
      photoURL: '',
      status: 'draft',
      user_uid: id
    })
  }

  getPost(id) {
    return db.doc(`posts/${id}`);
  }

  uploadPostImage(event, id) {
    const upload = event.file.originFileObj;
    if (!upload) {
      console.log('No files found');
      return;
    }

    const storageRef = storage.ref()
    const fileName = new Date().getTime();
    const uploadTask = storageRef.child(`posts/${fileName}`).put(upload);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, (error) => {
        console.log(error);
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL()
          .then((downloadURL) => {
            if (downloadURL) {
              upload.url = downloadURL;
              this.updatePostImage(upload, id, fileName);
              return;
            } else {
              console.log('File not uploaded');
            }
          })
      }
    )
  }

  updatePostImage(upload, id, fileName) {
    const postData = {
      photoURL: upload.url,
      imageName: fileName
    }
    return this.getPost(id).set(postData, {merge: true});
  }

  deleteImage(id, pictureName) {
    return this.getPost(id).update({
      imageName: '',
      photoURL: ''
    }).then(
      () => { storage.ref().child(`posts/${pictureName}`).delete() }
    )
  }
}