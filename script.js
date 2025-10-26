// --- CONFIGURATION ---
// 1. WhatsApp Number (Proprietor's number for receiving reflections)
const WHATSAPP_NUMBER = "2347076560169"; // Your number, adjusted for URL format (no '+')

// 2. Google Form Configuration (IMPORTANT: REPLACE THESE WITH YOUR FORM DETAILS)
// **INSTRUCTIONS:** Go to your Google Form, inspect the 'Network' tab when submitting a test entry, 
// and find the actual 'form action' URL and the names of the input fields.

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfyZ-IoI5bEDTuDTPwPgdEv-fenxCPJX-ZheVWBHASYFEIk7Q/formResponse"; 
// ^^^ REPLACE THIS WITH THE ACTUAL `formResponse` URL ^^^
const FORM_FIELD_DURATION = "entry.123456789"; // Replace with the actual name for Prayer Duration (e.g., entry.123456789)
const FORM_FIELD_REFLECTION = "entry.987654321"; // Replace with the actual name for Reflection Text (e.g., entry.987654321)

// --- CACHED DOM ELEMENTS ---
const landingPage = document.getElementById('landing-page');
const prayerPage = document.getElementById('prayer-page');
const startPrayerBtn = document.getElementById('start-prayer-btn');
const beginTimerBtn = document.getElementById('begin-timer-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');
const prayerDurationInput = document.getElementById('prayer-duration');
const timerDisplay = document.getElementById('timer-display');
const reflectionTextarea = document.getElementById('reflection-text');
const sendReflectionBtn = document.getElementById('send-reflection-btn');
const copyInviteBtn = document.getElementById('copy-invite-btn');

// --- TIMER VARIABLES ---
let timerInterval;
let durationInSeconds;
let isPaused = false;
let hasCompleted = false;

// --- UTILITY FUNCTIONS ---
function switchPage(activePageId) {
    if (activePageId === 'landing-page') {
        landingPage.classList.add('active');
        prayerPage.classList.remove('active');
    } else {
        landingPage.classList.remove('active');
        prayerPage.classList.add('active');
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// --- TIMER LOGIC ---

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(durationInSeconds);
    if (durationInSeconds <= 0 && !hasCompleted) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "TIME'S UP! WRITE YOUR VISION.";
        reflectionTextarea.disabled = false;
        sendReflectionBtn.disabled = false;
        pauseTimerBtn.style.display = 'none';
        hasCompleted = true;
    }
    if (!isPaused && durationInSeconds > 0) {
        durationInSeconds--;
    }
}

function startTimer() {
    let duration = parseInt(prayerDurationInput.value);
    if (isNaN(duration) || duration < 15) {
        alert("Please set a minimum prayer duration of 15 minutes.");
        return;
    }

    durationInSeconds = duration * 60;
    hasCompleted = false;
    isPaused = false;
    
    // UI updates
    prayerDurationInput.disabled = true;
    beginTimerBtn.style.display = 'none';
    pauseTimerBtn.style.display = 'inline-block';
    resetTimerBtn.style.display = 'inline-block';
    timerDisplay.style.color = 'var(--ark-gold)';

    // Start interval
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay(); // Call immediately to show starting time
}

function togglePause() {
    isPaused = !isPaused;
    pauseTimerBtn.textContent = isPaused ? 'Resume' : 'Pause';
    timerDisplay.style.color = isPaused ? '#999' : 'var(--ark-gold)';
}

function resetTimer() {
    clearInterval(timerInterval);
    durationInSeconds = 0;
    isPaused = false;
    hasCompleted = false;
    timerDisplay.textContent = "00:00";
    
    // UI updates
    prayerDurationInput.disabled = false;
    beginTimerBtn.style.display = 'inline-block';
    pauseTimerBtn.style.display = 'none';
    resetTimerBtn.style.display = 'none';
    reflectionTextarea.disabled = true;
    sendReflectionBtn.disabled = true;
    reflectionTextarea.value = '';
    timerDisplay.style.color = 'var(--ark-gold)';
}

// --- AUTOMATION LOGIC (Data & WhatsApp) ---

// 1. Send statistical data to Google Form (Async, non-blocking)
function sendStats(duration, reflection) {
    if (!duration) return; // Only send stats if timer was set
    
    const formData = new FormData();
    formData.append(FORM_FIELD_DURATION, duration);
    formData.append(FORM_FIELD_REFLECTION, reflection.substring(0, 150)); // Send only a snippet for brevity

    // Use fetch API to send data in the background (CORS might require adjustment, but this is the simplest method)
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for cross-domain form submission without server
        body: new URLSearchParams(formData).toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(() => console.log('Stats sent to Google Form (background)'))
    .catch(error => console.error('Error sending stats:', error));
}

// 2. Open WhatsApp link for submission
function sendReflection() {
    const reflection = reflectionTextarea.value.trim();
    if (reflection.length < 20) {
        alert("Please write a more detailed reflection on your vision and execution plan.");
        return;
    }

    // Capture the time set (in minutes)
    const timeSet = prayerDurationInput.value;

    // A. Send Stats (fires in the background)
    sendStats(timeSet, reflection);

    // B. Prepare and open WhatsApp link
    const prefilledMessage = encodeURIComponent(
        `[#PrayerCloud Reflection | ${timeSet} Min]\n\n` +
        `VISION & EXECUTION:\n"${reflection}"\n\n` +
        `--- \n` +
        `*Sent via The Ark Network Prayer Cloud.* Please share this in the main WhatsApp Group.`
    );
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${prefilledMessage}`;
    
    window.open(whatsappUrl, '_blank');

    // Reset the prayer page after sending
    resetTimer();
    switchPage('landing-page');
}

// --- INITIALIZATION & EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial page state
    switchPage('landing-page');
    timerDisplay.textContent = "00:00";
    
    // 2. Copy Invite Link functionality
    const inviteLink = window.location.href; 
    copyInviteBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            copyInviteBtn.textContent = 'Link Copied!';
            setTimeout(() => {
                copyInviteBtn.textContent = 'Copy Invite Link';
            }, 1500);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Could not copy link. Please manually copy the URL in your address bar.');
        });
    });

    // 3. Event Listeners for Page Navigation & Timer
    startPrayerBtn.addEventListener('click', () => switchPage('prayer-page'));
    beginTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', togglePause);
    resetTimerBtn.addEventListener('click', resetTimer);
    sendReflectionBtn.addEventListener('click', sendReflection);
});
  
