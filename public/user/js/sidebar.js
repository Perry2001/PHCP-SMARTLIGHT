document.addEventListener('DOMContentLoaded', function() {
    // Function to create sidebar links
    function createSidebarLink(href, text, isActive) {
        var link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        link.className = isActive ? 'active' : '';
        return link;
    }

    // Function to determine if a link is active based on the current URL
    function isActiveLink(linkHref) {
        // You can adjust this to match your URL structure, for example:
        var currentPage = window.location.pathname.split('/').pop();
        var linkPage = linkHref.split('/').pop();
        return currentPage === linkPage;
    }

    // Function to create the sidebar
    function createSidebar(links) {
        var sidebar = document.createElement('div');
        sidebar.className = 'sidebar';

        // Add the logo
        var logo = document.createElement('img');
        logo.src = '../logo.png';
        logo.className = 'm-2';
        logo.alt = 'Dashboard Logo';
        logo.style.width = '100px';
        sidebar.appendChild(logo);

        // Add the links
        links.forEach(function(link) {
            var isActive = isActiveLink(link.href);
            sidebar.appendChild(createSidebarLink(link.href, link.text, isActive));
        });

        // Add logout link
        var logoutLink = createSidebarLink('javascript:logout();', 'Logout');
        sidebar.appendChild(logoutLink);

        return sidebar;
    }

    // Example usage
    var links = [
        { href: './homepage.html', text: 'Homepage' },
        { href: './logs.html', text: 'Logs' },
        { href: './howitworks.html', text: 'How It Works' }
    ];

    var sidebarContainer = document.getElementById('sidebar-container');
    var sidebar = createSidebar(links);
    sidebarContainer.appendChild(sidebar);



});
function toggleSidebar() {
    var sidebars = document.getElementById('sidebar-container');

    // Check if the sidebar is currently active by testing the 'active' class
    if (sidebars.classList.contains('active')) {
        // If active, move it off-screen
        sidebars.classList.remove('active');
        // console.log('Hiding sidebar'); // Diagnostic log
    } else {
        // If not active, move it on-screen
        sidebars.classList.add('active');
        // console.log('Showing sidebar'); // Diagnostic log
    }
}


// Event listener to hide the sidebar if clicked outside of it
document.addEventListener('click', function(event) {
    var sidebar = document.getElementById('sidebar-container');
    var clickedElement = event.target;

    var clickInsideSidebar = sidebar.contains(clickedElement);
    var hamburger = document.querySelector('.hamburger');

    if (!clickInsideSidebar && sidebar.classList.contains('active') && clickedElement !== hamburger) {
        sidebar.classList.remove('active');
    }
});

// Detect a swipe gesture
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches ||             // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    // Detect left swipe
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // Left swipe
            var sidebar = document.getElementById('sidebar-container');
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    }
    // Reset values
    xDown = null;
    yDown = null;
};


// Logout function
function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location.href = '../index.html'; // Redirect to login page or home page after logout
    }).catch(function(error) {
        // An error happened.
        console.error('Logout Error', error);
        alert('Error during logout: ' + error.message);
    });
}

