// Click event for elements with class 'trigger'
document.querySelectorAll('a.trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
        document.querySelectorAll('.wrapper, nav').forEach(function (element) {
            element.classList.toggle('active');
        });
        this.classList.toggle('active');
        event.preventDefault();
    });
});

// Click event for elements with class 'wrapper'
document.querySelector('.wrapper').addEventListener('click', function () {
    document.querySelectorAll('.wrapper, nav, a.trigger').forEach(function (element) {
        element.classList.remove('active');
    });
});

// Check viewport width and set initial state
function checkWidth() {
    if (window.innerWidth > 768) {
        // For web view, make the navigation always active
        document.querySelectorAll('.wrapper, nav').forEach(function (element) {
            element.classList.add('active');
        });

        // Disable click event for trigger in web view
        document.querySelectorAll('a.trigger').forEach(function (trigger) {
            trigger.removeEventListener('click', triggerClick);
        });
    } else {
        // For mobile view, enable click event for trigger
        document.querySelectorAll('a.trigger').forEach(function (trigger) {
            trigger.addEventListener('click', triggerClick);
        });
    }
}

// Function to handle trigger click
function triggerClick(event) {
    document.querySelectorAll('.wrapper, nav').forEach(function (element) {
        element.classList.toggle('active');
    });
    this.classList.toggle('active');
    event.preventDefault();
}

// Initial check on page load
checkWidth();

// Listen for window resize
window.addEventListener('resize', function () {
    checkWidth();
});
