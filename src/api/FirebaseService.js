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
              this.updateUserProfileImage(id, upload.url, fileName);
              return;
            } else {
              console.log('File not uploaded');
            }
          })
      }
    )
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

  createPostFromDoc(doc) {
    const data = doc.data()
    return {
      postId: doc.id,
      imageName: data.imageName,
      description: data.description,
      photoURL: data.photoURL,
      status: data.status,
      user_uid: data.user_uid,
      created_at: data.created_at
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
              this.updatePostImage(id, upload.url, fileName);
              return;
            } else {
              console.log('File not uploaded');
            }
          })
      }
    )
  }

  updatePostImage(id, uploadURL, fileName) {
    const postData = {
      photoURL: uploadURL || '',
      imageName: fileName || ''
    }
    this.getPost(id).set(postData, {merge: true});
  }

  deleteImage(fileName) {
    return storage.ref().child(`posts/${fileName}`).delete();
  }

  deletePost(id) {
    return this.getPost(id).delete();
  }
}