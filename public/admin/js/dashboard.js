// Ensure this code runs after the DOM is fully loaded
var devicekeyGlobal;
var deviceNameGlobal;
    // Authentication State Observer
    firebase.auth().onAuthStateChanged(function(user) {
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
        roomRefs.once('value', function(snapshot) {
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

                    cell1.textContent = room.RoomName || '';
                    cell2.innerHTML = '<button class="btn btn-primary btn-sm btn-edit" data-id="' + key + '" data-room="' + room.RoomName + '">View</button>';
                }
            }

            // Add event listeners to each 'Edit' button
            document.querySelectorAll('.btn-edit').forEach(function(button) {
                button.addEventListener('click', function() {
                    var id = this.getAttribute('data-id');
                    var roomName = this.getAttribute('data-room');

                    openModal(id, roomName); // Pass the room ID and name to the openModal function
                    devicekeyGlobal = id;
                    deviceNameGlobal = roomName;
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

                        cell1.textContent = roomName; // Use the passed roomName
                        cell2.textContent = device.DevicesName || 'No Device Name';
                        // Set up the toggle switch with event listener for changes
                        cell3.innerHTML = '<label class="switch"><input type="checkbox" class="device-status-toggle" data-device-key="' + deviceKey + '"' + (device.Status === "1" ? ' checked' : '') + '><span class="slider round"></span></label>';
                    }
                }
                // Add change event listener to all toggle switches after they have been created
                var toggleSwitches = modalTableBody.getElementsByClassName('device-status-toggle');
                for (var i = 0; i < toggleSwitches.length; i++) {
                    toggleSwitches[i].addEventListener('change', function(e) {
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
            })
            .catch((error) => {
                console.error('Error fetching devices:', error);
                alert('Error: ' + error.message);
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
    firebase.auth().onAuthStateChanged(function(user) {
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
document.addEventListener('DOMContentLoaded', function() {
    // Para sa signup form
    var signupForm = document.getElementById('addRoom');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            addRoomToFirebase();
        });
    }

    function addRoomToFirebase() {
        var roomName = document.getElementById('roomName').value;
        var roomRef = firebase.database().ref('room').push();
        roomRef.set({
            RoomName: roomName,
        }).then(function() {
            console.log('Room added successfully!');
            alert('Room added successfully!');
            fetchRooms();
            closeAddRoomModal();
        }).catch(function(error) {
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
document.addEventListener('DOMContentLoaded', function() {
    // Para sa signup form
    const form = document.getElementById('addDevices');
    if (form) {
        form.addEventListener('submit', function(e) {
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
        }).then(function() {
            console.log('Device added successfully!');
            alert('Device added successfully!');
            fetchRoomsAndDevices(devicekeyGlobal.toString(), deviceNameGlobal);
            closeAddDevices();
            var roomDeviceModal = new bootstrap.Modal(document.getElementById('roomDeviceModal'));
            roomDeviceModal.show();

        }).catch(function(error) {
            console.error('Error adding room: ', error);
            alert('Error adding devices: ' + error.message);
        });
    }

    // Create a new user object


});