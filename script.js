const timer = document.getElementById('timer');
const instruction = document.getElementById('instruction');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const circle = document.getElementById('circle');
const sidebar = document.getElementById('sidebar');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const notificationInterval = document.getElementById('notificationInterval');
const donateToggle = document.getElementById('donateToggle');
const donateContent = document.getElementById('donateContent');

let interval;
let phase = 0;
let time = 0;
let animationFrame;
let notificationTimeout;

const phases = [
    { duration: 4, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
    { duration: 7, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
    { duration: 8, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
];

function updateCircle(progress) {
    const currentPhase = phases[phase];
    const scale = currentPhase.startScale + (currentPhase.endScale - currentPhase.startScale) * progress;
    circle.style.transform = `scale(${scale})`;
}

function animateCircle(startTime, duration) {
    const now = performance.now();
    const progress = Math.min((now - startTime) / (duration * 1000), 1);
    updateCircle(progress);

    if (progress < 1) {
        animationFrame = requestAnimationFrame(() => animateCircle(startTime, duration));
    }
}

function updateTimer() {
    if (time > 0) {
        time--;
        timer.textContent = time;
    } else {
        clearInterval(interval);
        phase = (phase + 1) % 3;
        instruction.textContent = "Wait...";
        circle.style.transform = `scale(${phases[phase].startScale})`;
        
        setTimeout(() => {
            time = phases[phase].duration;
            instruction.textContent = phases[phase].instruction;
            timer.textContent = time;
            animateCircle(performance.now(), phases[phase].duration);
            interval = setInterval(updateTimer, 1000);
        }, 1000); // 1-second pause between phases
    }
}

function startBreathing() {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    phase = 0;
    instruction.textContent = "Get Ready...";
    circle.style.transform = 'scale(1)';
    
    setTimeout(() => {
        time = phases[0].duration;
        instruction.textContent = phases[0].instruction;
        timer.textContent = time;
        animateCircle(performance.now(), phases[0].duration);
        interval = setInterval(updateTimer, 1000);
    }, 3000); // 3-second delay before starting
}

function stopBreathing() {
    clearInterval(interval);
    cancelAnimationFrame(animationFrame);
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    timer.textContent = '0';
    instruction.textContent = 'Click Start to begin';
    circle.style.transform = 'scale(1)';
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeToggle.checked);
}

function scheduleNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            new Notification('Breathing Reminder', {
                body: 'Time to check in with your breathing!',
                icon: '/api/placeholder/64/64'
            });
            scheduleNotification();
        }, notificationInterval.value * 3600000);
    }
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

startBtn.addEventListener('click', startBreathing);
stopBtn.addEventListener('click', stopBreathing);
openBtn.addEventListener('click', toggleSidebar);
closeBtn.addEventListener('click', toggleSidebar);

darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
darkModeToggle.addEventListener('change', toggleDarkMode);

notificationInterval.value = localStorage.getItem('notificationInterval') || 1;
notificationInterval.addEventListener('change', () => {
    localStorage.setItem('notificationInterval', notificationInterval.value);
    scheduleNotification();
});

donateToggle.addEventListener('click', () => {
    donateToggle.classList.toggle('expanded');
    donateContent.classList.toggle('expanded');
    donateContent.style.display = donateContent.classList.contains('expanded') ? 'block' : 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    scheduleNotification();
    requestNotificationPermission();
});