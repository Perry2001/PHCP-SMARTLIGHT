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



document.getElementById("change-to-admin").addEventListener("click", function () {
    window.location.href = "./admin-login.html";
});



// Import the 'auth' object from firebaseConfig.js
import { auth, database, firebase } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { ref, get, getDatabase } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// onclick listener for login button
document.querySelector('form').addEventListener('submit', loginUser);

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate that none of the fields are empty
    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                const uid = user.uid;
                const userRef = ref(getDatabase(), 'user/' + uid);

                get(userRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const position = snapshot.val().position;

                            // Redirect to the appropriate dashboard
                            const status = snapshot.val().status;

                            if (status === 'true') {
                                window.location.href = "../logged/user/dashboard.html";

                            } else {
                                alert("Your account is still pending approval. Please wait for the admin to approve your account.");
                            }

                        } else {
                            // Handle the case where the user data doesn't exist
                            console.log("User data not found" + userRef);
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking user position:", error);
                    });
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

