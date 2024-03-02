// Ensure this code runs after the DOM is fully loaded
var devicekeyGlobal;
var deviceNameGlobal;
// Authentication State Observer
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        fetchRooms(); // User is signed in, fetch rooms
    } else {
        // No user is signed in, redirect to login page
        window.location.href = '../admin-login.html';
    }
});

// Function to fetch rooms and update the table
function fetchRooms() {
    var roomRefs = firebase.database().ref('room');
    roomRefs.once('value', function (snapshot) {
        var rooms = snapshot.val();
        var tableBody = document.querySelector('.table tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        for (var key in rooms) {
            if (rooms.hasOwnProperty(key)) {
                var room = rooms[key];
                var row = tableBody.insertRow(-1);
                row.setAttribute('data-id', key);
                row.setAttribute('data-room', room.RoomName);

                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2); // New cell for delete button

                cell1.textContent = room.RoomName || '';
                cell2.innerHTML = '<button class="btn btn-primary btn-sm btn-edit" data-id="' + key + '" data-room="' + room.RoomName + '">View</button>';
                cell3.innerHTML = '<button class="btn btn-danger btn-sm btn-delete" data-id="' + key + '">Delete</button>';
            }
        }



        // Add event listeners to each 'Edit' button
        document.querySelectorAll('.btn-edit').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                var roomName = this.getAttribute('data-room');

                openModal(id, roomName); // Pass the room ID and name to the openModal function
                devicekeyGlobal = id;
                deviceNameGlobal = roomName;
            });
        });

        // Add event listeners for delete buttons
        var deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var roomId = button.getAttribute('data-id');
                showConfirmationDialog(roomId);
            });
        });

    });
}

function fetchRoomsAndDevices(id, roomName) {
    console.log("ID", id);
    console.log("RoomName", roomName);

    var modalTableBody = document.querySelector('#roomDeviceModal .table tbody');
    modalTableBody.innerHTML = ''; // Clear existing rows

    // Query devices that have the specified RoomId
    var devicesRef = firebase.database().ref('devices').orderByChild('RoomId').equalTo(id);
    devicesRef.once('value')
        .then((deviceSnapshot) => {
            var devices = deviceSnapshot.val();
            if (!devices) {
                throw new Error('No devices found for the room.');
            }
            for (var deviceKey in devices) {
                if (devices.hasOwnProperty(deviceKey)) {
                    var device = devices[deviceKey];
                    var row = modalTableBody.insertRow(-1);

                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3); // New cell for delete button

                    cell1.textContent = roomName; // Use the passed roomName
                    cell2.textContent = device.DevicesName || 'No Device Name';
                    // Set up the toggle switch with event listener for changes
                    cell3.innerHTML = '<label class="switch"><input type="checkbox" class="device-status-toggle" data-device-key="' + deviceKey + '"' + (device.Status === "1" ? ' checked' : '') + '><span class="slider round"></span></label>';
                    cell4.innerHTML = '<button class="btn btn-danger btn-sm btn-delete-device" data-device-key="' + deviceKey + '">Delete</button>';
                }
            }
            // Add change event listener to all toggle switches after they have been created
            var toggleSwitches = modalTableBody.getElementsByClassName('device-status-toggle');
            for (var i = 0; i < toggleSwitches.length; i++) {
                toggleSwitches[i].addEventListener('change', function (e) {
                    var deviceKey = e.target.getAttribute('data-device-key');
                    var newStatus = e.target.checked ? "1" : "0";
                    firebase.database().ref('devices/' + deviceKey).update({ Status: newStatus })
                        .catch((error) => {
                            console.error('Error updating status:', error);
                            alert('Failed to update status: ' + error.message);
                        });
                    console.log("DeviceKey", deviceKey);
                    logDeviceStatusChange(deviceKey, e.target.checked, roomName, device.DevicesName);
                });
            }

            // Add click event listener to all delete buttons after they have been created
            var deleteButtons = modalTableBody.getElementsByClassName('btn-delete-device');
            for (var j = 0; j < deleteButtons.length; j++) {
                deleteButtons[j].addEventListener('click', function (e) {
                    var deviceKey = e.target.getAttribute('data-device-key');
                    showDeviceDeletionConfirmation(deviceKey);
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching devices:', error);
            alert('Error: ' + error.message);
        });
}

function showDeviceDeletionConfirmation(deviceKey) {
    var isConfirmed = confirm("Are you sure you want to delete this device?");
    if (isConfirmed) {
        deleteDevice(deviceKey);
    }
}
function deleteDevice(deviceKey) {
    firebase.database().ref('devices/' + deviceKey).remove()
        .then(function () {
            console.log("Device deleted successfully!");
            fetchRoomsAndDevices(devicekeyGlobal.toString(), deviceNameGlobal);
        })
        .catch(function (error) {
            console.error("Error deleting device: ", error);
            alert('Failed to delete device: ' + error.message);
        });
}


// Function to log device status changes
function logDeviceStatusChange(deviceKey, deviceStatus, roomName, deviceName) {
    var user = firebase.auth().currentUser;
    if (user) {
        var timestamp = new Date().toISOString();

        var logEntry = {
            date: timestamp,
            device: deviceName,
            deviceid: deviceKey,
            room: roomName,
            status: deviceStatus ? "ON" : "OFF"
        };

        var newLogKey = firebase.database().ref('logs').child(user.uid).push().key;

        firebase.database().ref(`logs/${user.uid}/${newLogKey}`).set(logEntry)
            .then(() => {
                console.log('Log entry added.');
            })
            .catch((error) => {
                console.error('Error writing new log entry:', error);
            });
    } else {
        console.error('No user is signed in to log device status change.');
    }
}

// Function to open the modal and fetch room devices
function openModal(roomId, roomName) {
    fetchRoomsAndDevices(roomId, roomName);
    var roomDeviceModal = new bootstrap.Modal(document.getElementById('roomDeviceModal'));
    roomDeviceModal.show();
}

document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
    button.addEventListener('click', function () {
        closeEditModal();
    });
});

function closeEditModal() {
    const editUserModalElement = document.getElementById('roomDeviceModal');
    const roomDeviceModal = bootstrap.Modal.getInstance(editUserModalElement); // Get existing modal instance
    if (roomDeviceModal) {
        roomDeviceModal.hide();
    }
    console.log('Modal closed');
}
// Authentication State Observer
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        fetchRooms(); // User is signed in, fetch users

    } else {
        // No user is signed in, redirect to login page
        window.location.href = '../index.html';
    }
});




//add room
function addRoom() {
    const add = new bootstrap.Modal(document.getElementById('AddRoomModal'));
    add.show();
}
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
    button.addEventListener('click', function () {
        closeAddRoomModal();
    });
});

function closeAddRoomModal() {
    const addRoomModalElement = document.getElementById('AddRoomModal');
    const addRoomModal = bootstrap.Modal.getInstance(addRoomModalElement); // Get existing modal instance

    if (addRoomModal) {
        addRoomModal.hide();
    }
    console.log('addRoomModal closed');
}


//add room to Firebase
document.addEventListener('DOMContentLoaded', function () {
    // Para sa signup form
    var signupForm = document.getElementById('addRoom');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            addRoomToFirebase();
        });
    }

    function addRoomToFirebase() {
        var roomName = document.getElementById('roomName').value;
        var roomRef = firebase.database().ref('room').push();
        roomRef.set({
            RoomName: roomName,
        }).then(function () {
            console.log('Room added successfully!');
            alert('Room added successfully!');
            fetchRooms();
            closeAddRoomModal();
        }).catch(function (error) {
            console.error('Error adding room: ', error);
            alert('Error adding room: ' + error.message);
        });
    }

});


//ADD DEVICES Modal

function addDevices() {
    const addDevices = new bootstrap.Modal(document.getElementById('AddDeviceModal'));
    closeEditModal();
    console.log("DeviceKey", devicekeyGlobal)
    addDevices.show();
}

//close
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
    button.addEventListener('click', function () {
        closeAddDevices();
    });
});
function closeAddDevices() {
    const addDeviceModalElement = document.getElementById('AddDeviceModal');
    const addDeviceModal = bootstrap.Modal.getInstance(addDeviceModalElement); // Get existing modal instance

    if (addDeviceModal) {
        addDeviceModal.hide();
    }


    console.log('AddDeviceModal closed');
}


//add device to firebase
document.addEventListener('DOMContentLoaded', function () {
    // Para sa signup form
    const form = document.getElementById('addDevices');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            addDeviceToFirebase();
        });
    }

    function addDeviceToFirebase() {
        var deviceName = document.getElementById('deviceName').value;
        var devicesRef = firebase.database().ref('devices').push();
        devicesRef.set({
            DevicesName: deviceName,
            RoomId: devicekeyGlobal.toString(),
            Status: 0,
        }).then(function () {
            console.log('Device added successfully!');
            alert('Device added successfully!');
            fetchRoomsAndDevices(devicekeyGlobal.toString(), deviceNameGlobal);
            closeAddDevices();
            var roomDeviceModal = new bootstrap.Modal(document.getElementById('roomDeviceModal'));
            roomDeviceModal.show();

        }).catch(function (error) {
            console.error('Error adding room: ', error);
            alert('Error adding devices: ' + error.message);
        });
    }

    // Create a new user object


});

function showConfirmationDialog(roomId) {
    var isConfirmed = confirm("Are you sure you want to delete this room?");
    if (isConfirmed) {
        deleteRoom(roomId);
    }
}

function deleteRoom(roomId) {
    var roomRef = firebase.database().ref('room').child(roomId);
    roomRef.remove()
        .then(function() {
            console.log("Room deleted successfully!");
            fetchRooms(); // Refresh the room list after deletion
        })
        .catch(function(error) {
            console.error("Error deleting room: ", error);
        });
}
