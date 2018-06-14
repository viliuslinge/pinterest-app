import firebase from 'firebase'
require('firebase/firestore')

const config = {
  apiKey: "AIzaSyCIGAJY2DAahdxXxXOTs5virhrzKfKJwjk",
  authDomain: "pinterest-app-react-6d3db.firebaseapp.com",
  databaseURL: "https://pinterest-app-react-6d3db.firebaseio.com",
  projectId: "pinterest-app-react-6d3db",
  storageBucket: "gs://pinterest-app-react-6d3db.appspot.com",
  messagingSenderId: "189594110088"
};

firebase.initializeApp(config);

export const db = firebase.firestore()
db.settings({timestampsInSnapshots: true})
export const functions = firebase.functions()
export const storage = firebase.storage()
export const auth = firebase.auth()
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()