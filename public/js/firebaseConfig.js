import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd3Xzw_AmhSbMcfbwHyMrKFR_GxK2OqrA",
  authDomain: "phcp-smartlight.firebaseapp.com",
  databaseURL: "https://phcp-smartlight-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phcp-smartlight",
  storageBucket: "phcp-smartlight.appspot.com",
  messagingSenderId: "208487238165",
  appId: "1:208487238165:web:0ea79bc854d0344c525c1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };  // Export both auth and database together
