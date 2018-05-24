import { auth, db } from '../firebase';

export class FirebaseService {
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
      email: user.email
    }
    return userRef.set(userData, {merge: true});
  }
}