// Import the 'auth' object from firebaseConfig.js
import { auth, database } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// onclick listener for signup button
document.getElementById('signup').addEventListener('click', signup);


function signup(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const position = document.getElementById('position').value;
    const idNum = document.getElementById('idNum').value;
    const phone = document.getElementById('phone').value;
    const status = "false";

    // Validate passwords
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Validate that none of the fields are empty
    if (firstName && lastName && email && password && confirmPassword && position && idNum && phone) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                const uid = user.uid;

                // Determine the node based on the position
                let userNode = '';
                if (position === 'Admin') {
                    userNode = 'admin';
                } else if (position === 'Teacher') {
                    userNode = 'user';
                } else {
                    // Handle other positions if needed
                    alert("Unsupported position");
                    return;
                }

                // Save additional user information to the appropriate node in Realtime Database
                const userRef = ref(database, `${userNode}/${uid}`);
                set(userRef, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    position: position,
                    idNum: idNum,
                    phone: phone,
                    status: status
                    // You may include other fields like course and year here
                });

                console.log(user);
                alert("Account created successfully!");
                // Add 2 seconds delay
                setTimeout(function () {
                    window.location.href = "../index.html";
                }, 1000);
            })
            .catch((error) => {
                const errorMessage = error.message;
                alert(errorMessage);
            });
    } else {
        alert("Please fill in all the fields.");
    }
}