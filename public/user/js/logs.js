document.addEventListener('DOMContentLoaded', function() {

    const database = firebase.database();


    // Reference to the "user" node in the database
    var usersRef = database.ref('user');

    // Opens the edit user modal and fetches the logs for the given user ID
    function viewLogs(userId) {
        // Fetch logs for the user from the logs/{userId} node in the database
        var logsRef = database.ref('logs/' + userId);
        logsRef.once('value', function(logSnapshot) {
            var logs = logSnapshot.val();
            var tableBody = document.querySelector('.table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            // Clear existing rows

            // Iterate over the logs and create a table row for each log entry
            for (var logKey in logs) {
                if (logs.hasOwnProperty(logKey)) {
                    var log = logs[logKey];
                    var row = tableBody.insertRow(-1);

                    // Insert cells and set log details
                    row.insertCell(0).textContent = formatDate(log.date) || 'N/A';
                    row.insertCell(1).textContent = log.device || 'N/A';
                    row.insertCell(2).textContent = log.room || 'N/A';
                    row.insertCell(3).textContent = log.status || 'N/A';
                }
            }
        });
    }

    // Authentication State Observer
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var user = firebase.auth().currentUser;

            // User is signed in, you might want to update the dashboard content here
            viewLogs(user.uid);
        } else {
            // No user is signed in, redirect to login page
            window.location.href = '../index.html';
        }
    });

    // Logout function
    function logout() {
        firebase.auth().signOut().then(function() {
            // Sign-out successful, redirect to login page
            window.location.href = '../../index.html';
        }).catch(function(error) {
            // An error happened
            console.error('Logout Error', error);
        });
    }

    //format date
    function formatDate(isoString) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let date = new Date(isoString);

        let day = date.getDate();
        let monthIndex = date.getMonth();
        let year = date.getFullYear();

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;

        return `${months[monthIndex]} ${day} ${year}, ${hours}:${minutes} ${ampm}`;
    }



});

