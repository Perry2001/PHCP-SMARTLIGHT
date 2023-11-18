const inputs = document.querySelectorAll(".input");


function addcl() {
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus");
}

function remcl() {
    let parent = this.parentNode.parentNode;
    if (this.value == "") {
        parent.classList.remove("focus");
    }
}


inputs.forEach(input => {
    input.addEventListener("focus", addcl);
    input.addEventListener("blur", remcl);
});




// Import the 'auth' object from firebaseConfig.js
import { auth, database } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// onclick listener for login button
document.querySelector('form').addEventListener('submit', loginUser);

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate that none of the fields are empty
    if (email && password) {
        // Sign in the user
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Check the status in the Realtime Database
                checkUserStatus(user.uid);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
            });
    } else {
        alert("Please fill in both email and password.");
    }
}

function checkUserStatus(uid) {
    const userRef = database.ref('users/' + uid);

    userRef.once('value')
        .then((snapshot) => {
            const status = snapshot.child('status').val();

            if (status === true) {
                // Redirect to the dashboard
                window.location.href = "../logged/home.html";
            } else {
                // Display a message or take other actions for inactive accounts
                alert("Your account is inactive. Please contact support.");
                // Optionally, sign the user out
                auth.signOut();
            }
        })
        .catch((error) => {
            console.error("Error checking user status:", error);
        });
}
