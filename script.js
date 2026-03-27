// script.js - Full interactivity for Digital Focus Arena

let currentSection = 0;
let timerInterval = null;
let timerSeconds = 25 * 60;
let isRunning = false;
let distractionCount = 0;
let currentTheme = 0; // 0=space, 1=neon, 2=void

const themes = [
    { bg: '#050505', accent: '#00b4ff', name: 'SPACE' },
    { bg: '#0a0a0a', accent: '#00f0ff', name: 'NEON' },
    { bg: '#04040a', accent: '#c724ff', name: 'VOID' }
];

const sections = document.querySelectorAll('.section');

// Tailwind script initialization
function initTailwind() {
    return {
        config(userConfig = {}) {
            return {
                configUser: userConfig,
                theme: {
                    extend: {},
                },
            }
        },
        theme: {
            extend: {},
        },
    }
}

// Navigation
function navigateTo(sectionIndex) {
    sections.forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${sectionIndex}`).classList.remove('hidden');
    currentSection = sectionIndex;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === sectionIndex);
    });
    
    if (sectionIndex === 2) renderCharts();
}

// Timer logic
function updateTimerDisplay() {
    const min = Math.floor(timerSeconds / 60);
    const sec = timerSeconds % 60;
    const display = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    
    const mainDisplay = document.getElementById('main-timer-display');
    if (mainDisplay) mainDisplay.textContent = display;
    
    // Floating
    const floatMin = document.getElementById('float-min');
    const floatSec = document.getElementById('float-sec');
    if (floatMin && floatSec) {
        floatMin.textContent = min.toString().padStart(2, '0');
        floatSec.textContent = sec.toString().padStart(2, '0');
    }
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        document.getElementById('timer-btn').innerHTML = '▶️';
    } else {
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                updateTimerDisplay();
                
                // Simulate AI adaptive behavior
                if (timerSeconds % 37 === 0 && Math.random() > 0.6) {
                    distractionCount++;
                    document.getElementById('distraction-count').textContent = distractionCount;
                    document.getElementById('live-focus-score').textContent = Math.max(70, 94 - distractionCount * 3);
                }
            } else {
                clearInterval(timerInterval);
                endSession();
            }
        }, 1000);
        document.getElementById('timer-btn').innerHTML = '⏸️';
    }
    isRunning = !isRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerSeconds = 25 * 60;
    distractionCount = 0;
    updateTimerDisplay();
    document.getElementById('timer-btn').innerHTML = '▶️';
    document.getElementById('distraction-count').textContent = '0';
    document.getElementById('live-focus-score').textContent = '94';
}

function updateTimerMode() {
    const mode = parseInt(document.getElementById('focus-mode').value);
    if (mode === 0) timerSeconds = 42 * 60;           // Adaptive example
    else if (mode === 1) timerSeconds = 25 * 60;
    else if (mode === 2) timerSeconds = 52 * 60;
    else timerSeconds = 90 * 60;
    resetTimer();
}

function simulateDistraction() {
    distractionCount++;
    document.getElementById('distraction-count').textContent = distractionCount;
    const scoreEl = document.getElementById('live-focus-score');
    scoreEl.textContent = Math.max(60, parseInt(scoreEl.textContent) - 8);
}

// Session end
function endSession() {
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('floating-timer').classList.add('hidden');
    
    // Show beautiful summary
    const modal = document.getElementById('summary-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    document.getElementById('modal-score').textContent = Math.max(70, 94 - distractionCount * 4);
    document.getElementById('modal-time').textContent = `${Math.floor((1500 - timerSeconds) / 60)}h ${((1500 - timerSeconds) % 60)}m`;
    
    // Fake interruption graph
    const ctx = document.getElementById('interrupt-graph');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0', '10', '20', '30', '40', '50', '60'],
                datasets: [{
                    label: 'Focus %',
                    data: [98, 94, 81, 92, 77, 89, 94],
                    borderColor: '#00b4ff',
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { min: 60, max: 100 } } }
        });
    }
    
    // Suggestions
    const suggestionsHTML = `
        <li class="flex gap-3"><span class="text-cyan-400">→</span> Try 42-minute sessions. Your peak is between 38–45 mins</li>
        <li class="flex gap-3"><span class="text-cyan-400">→</span> Distractions peaked at minute 27 — schedule micro-break there</li>
        <li class="flex gap-3"><span class="text-cyan-400">→</span> +240 Arena XP earned. You’re climbing the leaderboard!</li>
    `;
    document.getElementById('modal-suggestions').innerHTML = suggestionsHTML;
}

function hideSummary() {
    const modal = document.getElementById('summary-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    timerSeconds = 25 * 60;
}

// Start instant session from anywhere
function startInstantSession() {
    navigateTo(1);
    timerSeconds = 42 * 60; // AI adaptive default
    updateTimerDisplay();
    setTimeout(() => {
        toggleTimer();
        document.getElementById('floating-timer').classList.remove('hidden');
    }, 600);
}

function toggleWidgetTimer() {
    startInstantSession();
}

// AI Coach
const coachMessages = [
    "You lose focus after 25 mins. Try Pomodoro with a 7-minute rain break.",
    "Burnout detected around 3 PM yesterday. Schedule lighter tasks then.",
    "Your best deep work window is 9:40–11:20 AM. Block that slot tomorrow.",
    "Amazing consistency! Reward yourself with a 15-minute gaming break after 3 sessions."
];

function getNewNudge() {
    const el = document.getElementById('ai-nudge');
    el.style.opacity = 0;
    setTimeout(() => {
        el.textContent = coachMessages[Math.floor(Math.random() * coachMessages.length)];
        el.style.transitionDuration = '400ms';
        el.style.opacity = 1;
    }, 200);
}

function askAICoach() {
    const responseDiv = document.getElementById('coach-response');
    responseDiv.innerHTML = `<span class="text-purple-400">COACH:</span> Based on your last 14 sessions, I recommend switching to 38-minute adaptive blocks. Your focus drops sharply after the 29-minute mark. Want me to auto-adjust your timer for tomorrow?`;
}

function quickCoachQuery(type) {
    const responseDiv = document.getElementById('coach-response');
    if (type === 'burnout') responseDiv.innerHTML = `Burnout pattern detected at 4 PM daily. Your cortisol (simulated) spikes. Try a 10-minute walk + hydration break.`;
    else if (type === 'ideal-duration') responseDiv.innerHTML = `Ideal session length for you right now: <span class="font-mono text-blue-400">41 minutes</span>. That’s your personal flow zone.`;
    else if (type === 'motivation') responseDiv.innerHTML = `You’ve already beaten yesterday’s record. One more session and you unlock the “Void Slayer” title. Keep going, legend.`;
    else if (type === 'pomodoro') responseDiv.innerHTML = `Classic Pomodoro is too short for your brain. You enter deep flow at minute 22. Let’s make it 38/8 instead.`;
}

// Multiplayer fake leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = `
        <tr class="border-b border-white/10"><td class="py-4">1</td><td class="py-4 flex items-center gap-2"><span class="text-yellow-400">👑</span> @focusninja</td><td class="py-4 text-right font-semibold text-blue-400">98</td><td class="py-4 text-right">1h 12m</td></tr>
        <tr class="border-b border-white/10"><td class="py-4">2</td><td class="py-4">Jyotirmoy</td><td class="py-4 text-right font-semibold text-blue-400">94</td><td class="py-4 text-right">58m</td></tr>
        <tr class="border-b border-white/10"><td class="py-4">3</td><td class="py-4">@codegod42</td><td class="py-4 text-right font-semibold text-blue-400">91</td><td class="py-4 text-right">49m</td></tr>
        <tr><td class="py-4">4</td><td class="py-4">@zenstudier</td><td class="py-4 text-right font-semibold text-blue-400">87</td><td class="py-4 text-right">41m</td></tr>
    `;
}

function joinPublicRoom(id) {
    alert(`✅ Joined room #${id + 1} — You are now competing LIVE with 12 other warriors. Your name is on the leaderboard!`);
    navigateTo(3);
    renderLeaderboard();
}

// Blocker simulation
let blockedSites = ['youtube.com', 'instagram.com', 'twitter.com', 'reddit.com'];

function renderBlockedList() {
    const container = document.getElementById('blocked-list');
    container.innerHTML = blockedSites.map(site => `
        <div class="flex justify-between items-center bg-white/5 px-6 py-4 rounded-3xl">
            <span class="font-medium">${site}</span>
            <button onclick="removeBlock('${site}')" class="text-red-400 text-xs px-4 py-1 border border-red-400/50 rounded-3xl">UNBLOCK</button>
        </div>
    `).join('');
}

function toggleBlocker() {
    const message = document.getElementById('blocker-message');
    if (document.getElementById('blocker-toggle').checked) {
        message.classList.remove('hidden');
        setTimeout(() => message.classList.add('hidden'), 2800);
    }
}

function addFakeBlock() {
    const fakeSites = ['tiktok.com', 'linkedin.com', 'discord.com'];
    blockedSites.push(fakeSites[Math.floor(Math.random() * fakeSites.length)]);
    renderBlockedList();
}

function removeBlock(site) {
    blockedSites = blockedSites.filter(s => s !== site);
    renderBlockedList();
}

// Charts for analytics
function renderCharts() {
    // Distraction chart
    const distCtx = document.getElementById('distractionChart');
    if (distCtx) {
        new Chart(distCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Distractions',
                    data: [4, 2, 7, 1, 3],
                    backgroundColor: '#ff3b5c'
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { stepSize: 1 } } } }
        });
    }
    
    // Weekly chart
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
        new Chart(weeklyCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Focus hours',
                    data: [3.8, 4.2, 2.9, 5.1, 4.7, 6.3, 3.4],
                    borderColor: '#00b4ff',
                    tension: 0.3,
                    borderWidth: 4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } } }
            }
        });
    }
}

// Theme switcher
function changeTheme(n) {
    currentTheme = n;
    document.documentElement.style.setProperty('--tw-ring-color', themes[n].accent);
    document.body.style.backgroundColor = themes[n].bg;
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => card.style.borderColor = `rgba(0, 180, 255, 0.2)`);
    document.getElementById('nav-level').style.color = themes[n].accent;
}

function toggleTheme() {
    currentTheme = (currentTheme + 1) % 3;
    changeTheme(currentTheme);
}

// Fullscreen lock simulation
function toggleFullscreenLock() {
    const lockText = document.getElementById('lock-text');
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
            lockText.textContent = 'LOCKED — everything hidden';
            setTimeout(() => {
                if (document.exitFullscreen) document.exitFullscreen();
                lockText.textContent = 'LOCK MODE';
            }, 8000);
        });
    } else {
        alert('🔒 Fullscreen Lock Mode activated (simulated). All distractions hidden for the next session.');
    }
}

// Sync planner with timer
function syncWithSession() {
    alert('✅ All 3 daily goals synced to your next Adaptive Timer session. Timer will automatically break after each goal milestone.');
    navigateTo(1);
}

// Fake streak & level in nav
function updateNavStats() {
    document.getElementById('nav-streak').textContent = Math.floor(Math.random() * 8) + 12;
    document.getElementById('nav-level').innerHTML = `LVL ${Math.floor(Math.random() * 8) + 22} <span class="text-xs">ARENA KNIGHT</span>`;
    document.getElementById('sidebar-score').textContent = Math.floor(Math.random() * 12) + 88;
}

// Boot the entire app
window.onload = function () {
    initTailwind();
    updateTimerDisplay();
    renderBlockedList();
    renderLeaderboard();
    updateNavStats();
    setInterval(updateNavStats, 45000);
    
    console.log('%c🚀 Digital Focus Arena fully loaded — black + electric blue edition ready!', 'color:#00b4ff; font-family:monospace');
};