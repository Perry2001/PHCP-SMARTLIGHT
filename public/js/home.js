// Import the 'auth' object from firebaseConfig.js
import { auth } from "./firebaseConfig.js";

// Check user authentication status
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, continue with the page logic
        console.log("User is signed in:", user);

        // Your existing home.js logic goes here

    } else {
        // No user is signed in, redirect to login page
        console.log("User is not signed in.");
        window.location.href = "../index.html";
    }
});


document.getElementById('logout').addEventListener('click', logout);

// Function to handle logout
function logout() {
    // Show a confirmation dialog
    const confirmLogout = confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
        auth.signOut().then(() => {
            // Sign-out successful.
            console.log("User signed out");
            window.location.href = "../index.html"; // Redirect to the login page after logout
        }).catch((error) => {
            // An error happened.
            console.error("Logout error:", error.message);
        });
    }
}


const toggle = () => {
    const nav = document.getElementById("topnav");
    nav.className === "topnav" ? nav.className += " responsive" : nav.className = "topnav";
};