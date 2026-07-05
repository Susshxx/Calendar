function updatecalender() {
    const now = new Date();
    const date = now.getDate();
    const year = now.getFullYear();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[now.getMonth()];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday","Friday","Saturday"];
    const day = dayNames[now.getDay()];
    
    // Get hours and minutes for time display
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    

    document.getElementById('day').innerText = day;
    document.getElementById('time').innerText = `${hours}:${minutes}`;
    document.getElementById('date').innerText = `${date} ${month} ${year}`;
    
    // Check if it's the top of the hour (minutes === 00)
    if (minutes === '00') {
        playHourlyBeep();
    }
}

// Function to play a gentle beep sound with blinking pattern for 5 seconds
function playHourlyBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create a gentle blinking beep pattern: beep for 0.3s, pause for 0.3s, repeat
    const beepDuration = 0.05;
    const pauseDuration = 0.1; 
    const totalDuration = 5; 
    const cycleTime = beepDuration + pauseDuration;
    const numberOfBeeps = Math.floor(totalDuration / cycleTime);
    
    for (let i = 0; i < numberOfBeeps; i++) {
        const startTime = now + (i * cycleTime);
        
        // Create oscillator for each beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound - gentler frequency and volume
        oscillator.frequency.value = 600;
        oscillator.type = 'sine'; 
        
        // Gentle fade in and fade out for each beep
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05); // Gentle fade in (lower volume)
        gainNode.gain.setValueAtTime(0.15, startTime + beepDuration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration); // Fade out
        
        // Start and stop this beep
        oscillator.start(startTime);
        oscillator.stop(startTime + beepDuration);
    }
}

updatecalender();
// Update every minute
setInterval(updatecalender, 60000);

const { ipcRenderer } = require('electron');

const closeBtn = document.getElementById('close');

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        ipcRenderer.send('close-app');
    });
}

// Custom cursor with smooth following effect
const cursor = document.getElementById('custom-cursor');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
const delay = 0.15; // Adjust this for more/less delay

// Start hidden
if (cursor) {
    cursor.style.opacity = '0';
}

// Receive mouse position from main process (bypasses -webkit-app-region: drag suppression)
ipcRenderer.on('mouse-position', (event, { x, y, inside }) => {
    if (!cursor) return;
    if (inside) {
        mouseX = x;
        mouseY = y;
        cursor.style.opacity = '1';
    } else {
        cursor.style.opacity = '0';
    }
});

// Smooth animation loop for cursor following
function animateCursor() {
    cursorX += (mouseX - cursorX) * delay;
    cursorY += (mouseY - cursorY) * delay;

    if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    }

    requestAnimationFrame(animateCursor);
}

animateCursor();
