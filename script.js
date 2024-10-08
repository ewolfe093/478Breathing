// Main doc consts
const timer = document.getElementById('timer');
const instruction = document.getElementById('instruction');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const circle = document.getElementById('circle');
const sidebar = document.getElementById('sidebar');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const breathingTitle = document.getElementById('breathingTitle');

// Settings doc consts
const darkModeToggle = document.getElementById('darkModeToggle');
const notificationInterval = document.getElementById('notificationInterval');
const breathingPatternSelect = document.getElementById('breathingPattern');
const customPatternControls = document.getElementById('customPatternControls');
const inhaleTime = document.getElementById('inhaleTime');
const hold1Time = document.getElementById('hold1Time');
const exhaleTime = document.getElementById('exhaleTime');
const hold2Time = document.getElementById('hold2Time');
const hapticFeedbackToggle = document.getElementById('hapticFeedback');
const soundCuesToggle = document.getElementById('soundCues');

// Donate doc consts
const donateToggle = document.getElementById('donateToggle');
const donateContent = document.getElementById('donateContent');

// Consts
const inhaleSound = new Audio('audio/inhale-voice.wav');
const exhaleSound = new Audio('audio/exhale-voice.wav');
const holdSound = new Audio('audio/hold-voice.wav');
const transitionDelay = 1000;

// Variables
let interval;
let phase = 0;
let time = 0;
let animationFrame;
let notificationTimeout;
let hasPromptedForNotification = false;
let isTransitioning = false;
let phases = [
    { duration: 4, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
    { duration: 7, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
    { duration: 8, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
];

// === FUNCTIONS ===
// Circle
function updateCircle(progress) {
    const currentPhase = phases[phase];
    const maxScale = 1.5;
    const scale = Math.min(
        currentPhase.startScale + (currentPhase.endScale - currentPhase.startScale) * progress,
        maxScale
    );
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

// Interval Timers
function updateTimer() {
    if (time > 0) {
        time--;
        timer.textContent = time;
        vibrateIfEnabled(100);
    } else {
        clearInterval(interval);
        phase = (phase + 1) % phases.length;
        circle.style.transform = `scale(${phases[phase].startScale})`;
        vibrateIfEnabled(300);
        
        setTimeout(() => {
            time = phases[phase].duration;
            instruction.textContent = phases[phase].instruction;
            timer.textContent = time;
            playSound(phases[phase].instruction);
            animateCircle(performance.now(), phases[phase].duration);
            interval = setInterval(updateTimer, 1000);
        }, 500); // 0.5-second pause between phases
    }
}

function startBreathing() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    instruction.textContent = "Prepare to begin...";
    circle.style.transform = 'scale(1)';
    
    setTimeout(() => {
        phase = 0;
        time = phases[0].duration;
        instruction.textContent = phases[0].instruction;
        timer.textContent = time;
        playSound(phases[0].instruction);
        animateCircle(performance.now(), phases[0].duration);
        interval = setInterval(updateTimer, 1000);
        
        stopBtn.disabled = false;
        isTransitioning = false;
    }, 2000); // 2-second delay before starting
}

function stopBreathing() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    clearInterval(interval);
    cancelAnimationFrame(animationFrame);
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    timer.textContent = '0';
    instruction.textContent = 'Click Start to begin';
    circle.style.transform = 'scale(1)';
    
    setTimeout(() => {
        startBtn.disabled = false;
        isTransitioning = false;
    }, transitionDelay);
}

// Settings Functions
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    savePreferences();
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
    if ('Notification' in window && !hasPromptedForNotification) {
        hasPromptedForNotification = true;
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                console.log("Notification permission granted.");
                scheduleNotification();
            } else {
                console.log("Notification permission denied.");
            }
        });
    }
}

function updateBreathingPattern(pattern) {
    let title;
    const maxDuration = 5; // Maximum duration for full scale
    const maxScale = 1.5; // Maximum scale factor

    switch(pattern) {
        case '4-7-8':
            title = '4-7-8 Breathing';
            phases = [
                { duration: 4, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: 7, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: 8, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
            ];
            break;
        case '4-4-4-4':
            title = '4-4-4-4 Breathing';
            phases = [
                { duration: 4, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: 4, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: 4, instruction: 'Exhale...', startScale: 1.5, endScale: 1 },
                { duration: 4, instruction: 'Hold...', startScale: 1, endScale: 1 }
            ];
            break;
        case '5-5-5':
            title = '5-5-5 Breathing';
            phases = [
                { duration: 5, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: 5, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: 5, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
            ];
            break;
        case '2-4-6':
            title = '2-4-6 Breathing';
            phases = [
                { duration: 2, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: 4, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: 6, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
            ];
            break;
        case '7-4-8':
            title = '7-4-8 Breathing';
            phases = [
                { duration: 7, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: 4, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: 8, instruction: 'Exhale...', startScale: 1.5, endScale: 1 }
            ];
            break;
        case 'custom':
            title = 'Custom Breathing';
            phases = [
                { duration: parseInt(inhaleTime.value) || 4, instruction: 'Inhale...', startScale: 1, endScale: 1.5 },
                { duration: parseInt(hold1Time.value) || 0, instruction: 'Hold...', startScale: 1.5, endScale: 1.5 },
                { duration: parseInt(exhaleTime.value) || 4, instruction: 'Exhale...', startScale: 1.5, endScale: 1 },
                { duration: parseInt(hold2Time.value) || 0, instruction: 'Hold...', startScale: 1, endScale: 1 }
            ];
            // Remove phases with 0 duration
            phases = phases.filter(phase => phase.duration > 0);
            break;
    }
    
    // Update the title
    breathingTitle.textContent = title;

    // Reset the exercise if it's currently running
    if (interval) {
        stopBreathing();
    }
    // Update the UI to reflect the new pattern
    instruction.textContent = 'Click Start to begin';
    timer.textContent = '0';
    circle.style.transform = 'scale(1)';

    savePreferences();
}

function vibrateIfEnabled(duration) {
    if (hapticFeedbackToggle.checked && 'vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function playSound(instruction) {
    if (soundCuesToggle.checked) {
        if (instruction.includes('Inhale')) {
            inhaleSound.play();
        } else if (instruction.includes('Hold')) {
            holdSound.play();
        } else if (instruction.includes('Exhale')) {
            exhaleSound.play();
        }
    }
}

// === SAVE/LOAD ===
function savePreferences() {
    localStorage.setItem('darkMode', darkModeToggle.checked);
    localStorage.setItem('notificationInterval', notificationInterval.value);
    localStorage.setItem('breathingPattern', breathingPatternSelect.value);
    localStorage.setItem('hapticFeedback', hapticFeedbackToggle.checked);
    localStorage.setItem('soundCues', soundCuesToggle.checked);
    
    // For custom pattern
    if (breathingPatternSelect.value === 'custom') {
        localStorage.setItem('customInhale', inhaleTime.value);
        localStorage.setItem('customHold1', hold1Time.value);
        localStorage.setItem('customExhale', exhaleTime.value);
        localStorage.setItem('customHold2', hold2Time.value);
    }
	console.log("Preferences Saved!!");
}

function loadPreferences() {
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
    }
    
    hapticFeedbackToggle.checked = localStorage.getItem('hapticFeedback') === 'true';
    soundCuesToggle.checked = localStorage.getItem('soundCues') === 'true';
    notificationInterval.value = localStorage.getItem('notificationInterval') || '1';
    
    const savedPattern = localStorage.getItem('breathingPattern') || '4-7-8';
    breathingPatternSelect.value = savedPattern;
    if (savedPattern === 'custom') {
        customPatternControls.style.display = 'flex';
        inhaleTime.value = localStorage.getItem('customInhale') || '4';
        hold1Time.value = localStorage.getItem('customHold1') || '0';
        exhaleTime.value = localStorage.getItem('customExhale') || '4';
        hold2Time.value = localStorage.getItem('customHold2') || '0';
    } else {
        customPatternControls.style.display = 'none';
    }
    updateBreathingPattern(savedPattern);
}

// === EVENT LISTENERS ===
// Start/Stop Button
startBtn.addEventListener('click', startBreathing);
stopBtn.addEventListener('click', stopBreathing);

// Settings 
openBtn.addEventListener('click', toggleSidebar);
closeBtn.addEventListener('click', toggleSidebar);

darkModeToggle.addEventListener('change', toggleDarkMode);

notificationInterval.addEventListener('change', () => {
    if (Notification.permission !== "granted") {
        requestNotificationPermission();
    } else {
        scheduleNotification();
    }
    savePreferences();
});

hapticFeedbackToggle.addEventListener('change', savePreferences);
soundCuesToggle.addEventListener('change', savePreferences);

breathingPatternSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customPatternControls.style.display = 'flex';
    } else {
        customPatternControls.style.display = 'none';
    }
    updateBreathingPattern(this.value);
});

[inhaleTime, hold1Time, exhaleTime, hold2Time].forEach(input => {
    input.addEventListener('change', () => {
        updateBreathingPattern('custom');
    });
});

donateToggle.addEventListener('click', () => {
    donateToggle.classList.toggle('expanded');
    donateContent.classList.toggle('expanded');
    donateContent.style.display = donateContent.classList.contains('expanded') ? 'block' : 'none';
});

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    scheduleNotification();
    
    if (Notification.permission !== "granted") {
        requestNotificationPermission();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/478Breathing/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}