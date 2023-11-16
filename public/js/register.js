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
    const course = document.getElementById('course').value;
    const year = document.getElementById('year').value;
    const phone = document.getElementById('phone').value;

    // Validate passwords
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Validate that none of the fields are empty
    if (firstName && lastName && email && password && confirmPassword && course && year && phone) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                const uid = user.uid;

                console.log("Before set operation");
              // Save additional user information to Realtime Database
              const userRef = ref(database, 'users/' + uid);  // Use ref() function
              set(userRef, {
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  course: course,
                  year: year,
                  phone: phone
              });
              console.log("Before set operation");

                console.log(user);
                alert("Account created successfully!");
                //add 2 seconds delay
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
