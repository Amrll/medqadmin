// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLrREOQhl2m7eyG3tTvp7PSOwWRK6EctY",
    authDomain: "medq-58cf2.firebaseapp.com",
    projectId: "medq-58cf2",
    storageBucket: "medq-58cf2.appspot.com",
    messagingSenderId: "822241317404",
    appId: "1:822241317404:web:a16e67a5ac2b60bf9bc5d9",
    measurementId: "G-2JN8GDFQX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);