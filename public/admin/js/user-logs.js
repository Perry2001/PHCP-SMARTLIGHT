// Initialize Firebase
const database = firebase.database();


// Reference to the "user" node in the database
var usersRef = database.ref('user');


// Function to fetch users and update the table
function fetchUsers() {
    usersRef.once('value', function (snapshot) {
        var users = snapshot.val();
        var tableBody = document.querySelector('.table tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        var id = ""

        for (var key in users) {
            if (users.hasOwnProperty(key)) {
                var user = users[key];
                var row = tableBody.insertRow(-1); // Insert a new row at the end of the table

                // Insert new cells (<td> elements) at the 1st to 6th position of the "new" <tr> element:
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);
                id = user.id;
                // Add some text to the new cells:
                cell1.textContent = user.idNum || '';
                cell2.textContent = user.firstName || '';
                cell3.textContent = user.lastName || '';
                cell4.textContent = user.phone || '';
                cell5.textContent = user.email || '';
                cell6.textContent = user.position || '';
                cell7.innerHTML = '<button class="btn btn-primary btn-sm btn-view-logs" data-user-id="' + user.id + '">View Logs</button>';
            }
        }

        // Add event listeners to each 'Edit' button
        document.querySelectorAll('.btn-view-logs').forEach(function (button) {
            button.addEventListener('click', function () {
                var userId = this.getAttribute('data-user-id');
                openEditModal(userId); // Pass the user's ID to the openEditModal function
            });
        });

    });
}

// Opens the edit user modal and fetches the logs for the given user ID
function openEditModal(userId) {
    const editUserModalElement = document.getElementById('editUserModal');
    const editUserModal = bootstrap.Modal.getInstance(editUserModalElement) || new bootstrap.Modal(editUserModalElement);
    editUserModal.show();

    // Fetch logs for the user from the logs/{userId} node in the database
    var logsRef = database.ref('logs/' + userId);
    logsRef.once('value', function (logSnapshot) {
        var logs = logSnapshot.val();
        var modalTableBody = editUserModalElement.querySelector('.table tbody');
        modalTableBody.innerHTML = ''; // Clear existing rows

        // Iterate over the logs and create a table row for each log entry
        for (var logKey in logs) {
            if (logs.hasOwnProperty(logKey)) {
                var log = logs[logKey];
                var logRow = modalTableBody.insertRow(-1);

                // Insert cells and set log details
                logRow.insertCell(0).textContent = log.date || 'N/A';
                logRow.insertCell(1).textContent = log.device || 'N/A';
                logRow.insertCell(2).textContent = log.room || 'N/A';
                logRow.insertCell(3).textContent = log.status || 'N/A';
            }
        }
    });
}


// Function to close the edit user modal
function closeEditModal() {
    const editUserModalElement = document.getElementById('editUserModal');
    const editUserModal = bootstrap.Modal.getInstance(editUserModalElement); // Get existing modal instance
    if (editUserModal) {
        editUserModal.hide();
    }
    console.log('Modal closed');
}


// Event listeners for closing the modal
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
    button.addEventListener('click', function () {
        closeEditModal();
    });
});

// Event listeners for closing the moda


// Authentication State Observer
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in, you might want to update the dashboard content here
        fetchUsers(); // User is signed in, fetch users

    } else {
        // No user is signed in, redirect to login page
        window.location.href = '../index.html';
    }
});

// Logout function
