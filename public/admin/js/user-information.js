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

        for (var key in users) {
            if (users.hasOwnProperty(key)) {
                var user = users[key];
                var row = tableBody.insertRow(-1);
                row.setAttribute('data-user-id', key);

                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);

                // Add some text to the new cells:
                cell1.textContent = user.idNum || '';
                cell2.textContent = user.firstName || '';
                cell3.textContent = user.lastName || '';
                cell4.textContent = user.phone || '';
                cell5.textContent = user.email || '';
                cell6.textContent = user.position || '';
                cell7.innerHTML = '<button class="btn btn-primary btn-sm btn-edit" data-user-id="' + user.id + '">Edit</button>';
                // Use an IIFE to capture the current value of key
                (function(key) {
                    var user = users[key];
                    var statusButton = document.createElement('button');
                    statusButton.className = 'btn btn-sm';
                    statusButton.setAttribute('data-user-id', key);

                    // Determine button appearance and function based on status
                    switch (user.status) { // Note: use user.status here, not status
                        case 'ok':
                            statusButton.classList.add('btn-danger');
                            statusButton.textContent = 'Block';
                            break;
                        case 'pending':
                            row.style.backgroundColor = 'yellow'; // You may need to capture the row as well
                            statusButton.classList.add('btn-primary');
                            statusButton.textContent = 'Accept';
                            break;
                        case 'blocked':
                            row.style.backgroundColor = 'gray'; // Same here for the row
                            statusButton.classList.add('btn-success');
                            statusButton.textContent = 'Unblock';
                            break;
                        default:
                            // Handle default case if necessary
                            statusButton.classList.add('btn-secondary');
                            statusButton.textContent = 'Unknown';
                            break;
                    }

                    // Assign the click handler using the captured key
                    statusButton.onclick = function() {
                        var userStatus = determineStatus(user.status); // This now uses the captured user object
                        showConfirmStatusChangeModal(key, userStatus);
                    };

                    var cell8 = row.insertCell(7);
                    cell8.appendChild(statusButton);
                })(key); // Pass the current value of key into the IIFE
            }

        }

        // Add event listeners to each 'Edit' button
        document.querySelectorAll('.btn-edit').forEach(function (button) {
            button.addEventListener('click', function () {
                var userId = this.getAttribute('data-user-id'); // Retrieve the userId from the data attribute
                openEditModal(userId); // Pass the userId to the openEditModal function
            });
        });

    });
    }
function showConfirmStatusChangeModal(userId, newStatus) {
    console.log('Showing confirm status change modal for user ID:', userId);
    // Set action for the confirm button
    var confirmBtn = document.getElementById('confirm-change-status');
    confirmBtn.onclick = function() { updateUserStatus(userId, newStatus); };

    // Get the modal element
    var confirmModal = new bootstrap.Modal(document.getElementById('confirmStatusChangeModal'));

    // Show the modal
    confirmModal.show();
}

// Helper function to determine the new status
function determineStatus(currentStatus) {
    switch(currentStatus) {
        case 'ok':
            return 'blocked';
        case 'pending':
            return 'ok';
        case 'blocked':
            return 'ok';
        default:
            return 'pending'; // default case if needed
    }
}


// Function to update user status in Firebase
function updateUserStatus(userId, newStatus) {
    var userRef = usersRef.child(userId);
    userRef.update({ status: newStatus }, function(error) {
        if (error) {
            // Handle the error case
            alert('Status could not be updated', error);

        } else {
            // Success case
            fetchUsers(); // Re-fetch users to update the UI
            closeEditModal(); // Close the modal
        }
    });
}

// Opens the edit user modal and stores the current email
function openEditModal(userId) {
    console.log('Opening modal for user ID:', userId);
    // Query to find user by id or idNum
    usersRef.orderByChild('id').equalTo(userId).once('value', function (snapshot) {
        if (snapshot.exists()) {
            // Get user data
            var userData = snapshot.val()[Object.keys(snapshot.val())[0]];

            // Populate the form with user data
            document.getElementById('user-first-name').value = userData.firstName || '';
            document.getElementById('user-last-name').value = userData.lastName || '';
            document.getElementById('user-phone').value = userData.phone || '';
            document.getElementById('user-position').value = userData.position || '';

            // Show the modal
            var editUserModalElement = document.getElementById('editUserModal');
            var editUserModal = new bootstrap.Modal(editUserModalElement);
            editUserModal.show();

            // Store the key of the user node in a data attribute for later use
            editUserModalElement.setAttribute('data-user-key', Object.keys(snapshot.val())[0]);
        } else {
            console.error('User not found.');
            alert('User not found.');
        }
    }).catch(error => {
        console.error('Error fetching user data:', error);
        alert('An error occurred while fetching the user data.');
    });
}


// Function to close the edit user modal
function closeEditModal() {
    const editUserModalElement = document.getElementById('editUserModal');
    const confirmationModal = document.getElementById('confirmStatusChangeModal');

    const confirmationModalInstance = bootstrap.Modal.getInstance(confirmationModal); // Get existing modal instance
    if (confirmationModalInstance) {
        confirmationModalInstance.hide();
    }

    const editUserModal = bootstrap.Modal.getInstance(editUserModalElement); // Get existing modal instance
    if (editUserModal) {
        editUserModal.hide();
    }
    console.log('Modal closed');
}


// When the 'Change Details' button is clicked in the modal
document.getElementById('change-details').addEventListener('click', function () {
    const editUserModalElement = document.getElementById('editUserModal');
    const currentEmail = editUserModalElement.dataset.currentEmail;
    // Retrieve new details from the form
    var newFirstName = document.getElementById('user-first-name').value;
    var newLastName = document.getElementById('user-last-name').value;
    var newPhone = document.getElementById('user-phone').value;
    var newPosition = document.getElementById('user-position').value;


    // Update user email in Firebase Realtime Database
    var userRef = database.ref('user/' + editUserModalElement.dataset.userKey);
    console.log('Updating user details...');
    console.log('ref:', userRef);
    userRef.update({
        firstName: newFirstName,
        lastName: newLastName,
        phone: newPhone,
        position: newPosition,
    }).then(function () {
        fetchUsers();
        console.log('User details updated successfully!');
        alert('User details updated successfully!');

    }).catch(function (error) {
        console.error('Error updating user details:', error);
        alert('An error occurred while updating the user details.');

    });


    closeEditModal();

});

// Event listeners for closing the modal
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
    button.addEventListener('click', function () {
        closeEditModal();
    });
});

// Event listeners for closing the modal



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


