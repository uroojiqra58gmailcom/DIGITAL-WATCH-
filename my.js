// Digital Watch Pro - Interactive Features
class DigitalWatch {
    constructor() {
        this.currentScreen = 0;
        this.screens = ['digitalTime', 'analogDigital', 'neonTime', 'stopwatch', 'timer', 'weather'];
        this.isStopwatchRunning = false;
        this.isTimerRunning = false;
        this.stopwatchTime = 0;
        this.timerTime = 300; // 5 minutes default
        this.timerOriginalTime = 300;
        this.soundEnabled = true;
        this.currentTheme = 'blue';

        this.stopwatchInterval = null;
        this.timerInterval = null;
        this.timeInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startClock();
        this.createParticles();
        this.create3DShapes();
        this.updateBattery();
        this.setupTouchGestures();
        this.loadSettings();

        // Start with a nice entrance animation
        setTimeout(() => {
            document.querySelector('.watch-frame').style.animation = 'watchGlow 3s ease-in-out infinite alternate, watch3D 6s ease-in-out infinite';
        }, 500);
    }

    setupEventListeners() {
        // Navigation dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.switchScreen(index);
                this.addTouchFeedback(dot);
            });
        });

        // Control buttons
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.toggleThemeSelector();
            this.playSound('click');
        });

        document.getElementById('soundBtn').addEventListener('click', () => {
            this.toggleSound();
            this.playSound('click');
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
            this.playSound('click');
        });

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.changeTheme(theme);
                this.playSound('theme');
            });
        });

        // Stopwatch controls
        document.getElementById('swStartStop').addEventListener('click', () => {
            this.toggleStopwatch();
            this.playSound('beep');
        });

        document.getElementById('swReset').addEventListener('click', () => {
            this.resetStopwatch();
            this.playSound('reset');
        });

        // Timer controls
        document.getElementById('timerStartStop').addEventListener('click', () => {
            this.toggleTimer();
            this.playSound('beep');
        });

        document.getElementById('timerMinus').addEventListener('click', () => {
            this.adjustTimer(-60);
            this.playSound('tick');
        });

        document.getElementById('timerPlus').addEventListener('click', () => {
            this.adjustTimer(60);
            this.playSound('tick');
        });
    }

    setupTouchGestures() {
        const mainDisplay = document.querySelector('.main-display');
        let startX = 0;
        let startY = 0;
        let isSwipe = false;

        mainDisplay.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = false;
        });

        mainDisplay.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const deltaX = Math.abs(e.touches[0].clientX - startX);
            const deltaY = Math.abs(e.touches[0].clientY - startY);

            if (deltaX > 30 || deltaY > 30) {
                isSwipe = true;
            }
        });

        mainDisplay.addEventListener('touchend', (e) => {
            if (!isSwipe) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    this.previousScreen();
                } else if (deltaX < -50) {
                    this.nextScreen();
                }
            }
        });

        // Mouse events for desktop
        let isMouseDown = false;

        mainDisplay.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isMouseDown = true;
            isSwipe = false;
        });

        mainDisplay.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);

            if (deltaX > 30 || deltaY > 30) {
                isSwipe = true;
            }
        });

        mainDisplay.addEventListener('mouseup', (e) => {
            if (!isMouseDown || !isSwipe) {
                isMouseDown = false;
                return;
            }

            const endX = e.clientX;
            const deltaX = endX - startX;

            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousScreen();
                } else {
                    this.nextScreen();
                }
            }

            isMouseDown = false;
        });
    }

    startClock() {
        this.updateTime();
        this.timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;

        // Digital time display
        document.querySelector('.hours').textContent = displayHours.toString().padStart(2, '0');
        document.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
        document.querySelector('.ampm').textContent = ampm;

        // Date display
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

        document.querySelector('.day').textContent = days[now.getDay()];
        document.querySelector('.date').textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

        // Analog digital display
        document.querySelector('.time-small').textContent =
            `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update analog hands
        this.updateAnalogHands(hours, minutes, seconds);

        // Neon display
        const neonDigits = document.querySelectorAll('.neon-digit');
        const timeString = `${displayHours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
        neonDigits.forEach((digit, index) => {
            digit.textContent = timeString[index];
        });

        document.querySelector('.neon-text').textContent =
            `${days[now.getDay()].substring(0, 3).toUpperCase()} ${months[now.getMonth()].substring(0, 3).toUpperCase()} ${now.getDate().toString().padStart(2, '0')}`;
    }

    updateAnalogHands(hours, minutes, seconds) {
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');

        if (hourHand && minuteHand && secondHand) {
            const hourDegree = (hours % 12) * 30 + (minutes * 0.5);
            const minuteDegree = minutes * 6;
            const secondDegree = seconds * 6;

            hourHand.style.transform = `rotate(${hourDegree}deg)`;
            minuteHand.style.transform = `rotate(${minuteDegree}deg)`;
            secondHand.style.transform = `rotate(${secondDegree}deg)`;

            // Add smooth transition for second hand
            if (seconds === 0) {
                secondHand.style.transition = 'none';
                setTimeout(() => {
                    secondHand.style.transition = 'transform 0.1s ease-out';
                }, 50);
            }
        }
    }

    switchScreen(index) {
        if (index === this.currentScreen) return;

        const currentDisplay = document.getElementById(this.screens[this.currentScreen]);
        const newDisplay = document.getElementById(this.screens[index]);
        const currentDot = document.querySelectorAll('.dot')[this.currentScreen];
        const newDot = document.querySelectorAll('.dot')[index];

        // Animate out current screen
        currentDisplay.style.transform = index > this.currentScreen ? 'translateX(-100%)' : 'translateX(100%)';
        currentDisplay.style.opacity = '0';

        setTimeout(() => {
            currentDisplay.classList.remove('active');
            newDisplay.classList.add('active');
            newDisplay.style.transform = index > this.currentScreen ? 'translateX(100%)' : 'translateX(-100%)';
            newDisplay.style.opacity = '0';

            setTimeout(() => {
                newDisplay.style.transform = 'translateX(0)';
                newDisplay.style.opacity = '1';
            }, 50);
        }, 250);

        // Update navigation dots
        currentDot.classList.remove('active');
        newDot.classList.add('active');

        this.currentScreen = index;
        this.playSound('swipe');
    }

    nextScreen() {
        const nextIndex = (this.currentScreen + 1) % this.screens.length;
        this.switchScreen(nextIndex);
    }

    previousScreen() {
        const prevIndex = (this.currentScreen - 1 + this.screens.length) % this.screens.length;
        this.switchScreen(prevIndex);
    }

    toggleStopwatch() {
        if (this.isStopwatchRunning) {
            clearInterval(this.stopwatchInterval);
            document.getElementById('swStartStop').textContent = 'START';
            document.getElementById('swStartStop').classList.remove('running');
        } else {
            this.stopwatchInterval = setInterval(() => {
                this.stopwatchTime += 10;
                this.updateStopwatchDisplay();
            }, 10);
            document.getElementById('swStartStop').textContent = 'STOP';
            document.getElementById('swStartStop').classList.add('running');
        }
        this.isStopwatchRunning = !this.isStopwatchRunning;
    }

    resetStopwatch() {
        clearInterval(this.stopwatchInterval);
        this.stopwatchTime = 0;
        this.isStopwatchRunning = false;
        document.getElementById('swStartStop').textContent = 'START';
        document.getElementById('swStartStop').classList.remove('running');
        this.updateStopwatchDisplay();
    }

    updateStopwatchDisplay() {
        const minutes = Math.floor(this.stopwatchTime / 60000);
        const seconds = Math.floor((this.stopwatchTime % 60000) / 1000);
        const milliseconds = Math.floor((this.stopwatchTime % 1000) / 10);

        document.querySelector('.sw-minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('.sw-seconds').textContent = seconds.toString().padStart(2, '0');
        document.querySelector('.sw-milliseconds').textContent = milliseconds.toString().padStart(2, '0');
    }

    toggleTimer() {
        if (this.isTimerRunning) {
            clearInterval(this.timerInterval);
            document.getElementById('timerStartStop').textContent = 'START';
        } else {
            if (this.timerTime <= 0) {
                this.timerTime = this.timerOriginalTime;
            }
            this.timerInterval = setInterval(() => {
                this.timerTime -= 1;
                this.updateTimerDisplay();

                if (this.timerTime <= 0) {
                    this.timerComplete();
                }
            }, 1000);
            document.getElementById('timerStartStop').textContent = 'STOP';
        }
        this.isTimerRunning = !this.isTimerRunning;
    }

    adjustTimer(seconds) {
        if (this.isTimerRunning) return;

        this.timerTime = Math.max(0, this.timerTime + seconds);
        this.timerOriginalTime = this.timerTime;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerTime / 60);
        const seconds = this.timerTime % 60;

        document.querySelector('.timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('.timer-seconds').textContent = seconds.toString().padStart(2, '0');

        // Update progress bar
        const progress = ((this.timerOriginalTime - this.timerTime) / this.timerOriginalTime) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
    }

    timerComplete() {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        document.getElementById('timerStartStop').textContent = 'START';
        this.playSound('alarm');

        // Flash the timer
        const timerContainer = document.querySelector('.timer-container');
        timerContainer.style.animation = 'flash 0.5s ease-in-out 6';

        setTimeout(() => {
            timerContainer.style.animation = '';
        }, 3000);
    }

    toggleThemeSelector() {
        const selector = document.getElementById('themeSelector');
        selector.classList.toggle('active');
    }

    changeTheme(theme) {
        document.documentElement.className = `theme-${theme}`;
        this.currentTheme = theme;
        this.saveSettings();

        // Hide theme selector
        document.getElementById('themeSelector').classList.remove('active');

        // Update particles color
        this.updateParticlesColor();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        const icon = soundBtn.querySelector('i');

        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            document.body.classList.remove('sound-disabled');
            document.body.classList.add('sound-enabled');
        } else {
            icon.className = 'fas fa-volume-mute';
            document.body.classList.remove('sound-enabled');
            document.body.classList.add('sound-disabled');
        }

        this.saveSettings();
    }

    showSettings() {
        // Create a simple settings modal
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <h3>Settings</h3>
                <div class="setting-item">
                    <label>24-Hour Format</label>
                    <input type="checkbox" id="format24">
                </div>
                <div class="setting-item">
                    <label>Show Seconds</label>
                    <input type="checkbox" id="showSeconds" checked>
                </div>
                <div class="setting-item">
                    <label>Auto Theme</label>
                    <input type="checkbox" id="autoTheme">
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.querySelector('.settings-content').style.cssText = `
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            padding: 30px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--text-color);
            text-align: center;
        `;

        document.body.appendChild(modal);
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        try {
            // Create audio context for sound effects
            const AudioContext = window.AudioContext || window['webkitAudioContext'];
            if (!AudioContext) return;

            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            let frequency = 800;
            let duration = 0.1;

            switch (type) {
                case 'click':
                    frequency = 1000;
                    duration = 0.05;
                    break;
                case 'beep':
                    frequency = 1200;
                    duration = 0.1;
                    break;
                case 'swipe':
                    frequency = 600;
                    duration = 0.08;
                    break;
                case 'theme':
                    frequency = 1500;
                    duration = 0.15;
                    break;
                case 'alarm':
                    frequency = 800;
                    duration = 0.5;
                    break;
                case 'tick':
                    frequency = 400;
                    duration = 0.03;
                    break;
                case 'reset':
                    frequency = 300;
                    duration = 0.2;
                    break;
            }

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio not supported or blocked');
        }
    }

    addTouchFeedback(element) {
        element.classList.add('touch-feedback');
        setTimeout(() => {
            element.classList.remove('touch-feedback');
        }, 600);
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createParticle(particlesContainer);
            }, i * 300);
        }

        // Continue creating particles
        setInterval(() => {
            this.createParticle(particlesContainer);
        }, 2000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const startX = Math.random() * 100;
        const animationDuration = 6 + Math.random() * 4;
        const size = 2 + Math.random() * 3;

        particle.style.left = `${startX}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, animationDuration * 1000 + 2000);
    }

    updateParticlesColor() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.background = 'var(--accent-color)';
            particle.style.boxShadow = '0 0 6px var(--accent-color)';
        });
    }

    create3DShapes() {
        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'floating-shapes';
        shapesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -3;
            overflow: hidden;
        `;

        document.body.appendChild(shapesContainer);

        // Create different 3D shapes
        const shapes = ['circle', 'triangle', 'square', 'diamond'];
        const colors = [
            'rgba(102, 126, 234, 0.6)',
            'rgba(118, 75, 162, 0.6)',
            'rgba(240, 147, 251, 0.6)',
            'rgba(245, 87, 108, 0.6)',
            'rgba(79, 172, 254, 0.6)',
            'rgba(0, 242, 254, 0.6)'
        ];

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFloatingShape(shapesContainer, shapes, colors);
            }, i * 2000);
        }

        // Continue creating shapes
        setInterval(() => {
            this.createFloatingShape(shapesContainer, shapes, colors);
        }, 8000);
    }

    createFloatingShape(container, shapes, colors) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 20 + Math.random() * 40;
        const startX = Math.random() * 100;
        const animationDuration = 15 + Math.random() * 10;

        shape.className = `floating-shape ${shapeType}`;
        shape.style.cssText = `
            position: absolute;
            left: ${startX}%;
            bottom: -50px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shapeType === 'circle' ? '50%' : shapeType === 'diamond' ? '0' : '10px'};
            transform: ${shapeType === 'diamond' ? 'rotate(45deg)' : 'rotate(0deg)'};
            animation: float3DShape ${animationDuration}s linear infinite;
            box-shadow: 0 0 20px ${color};
            backdrop-filter: blur(2px);
        `;

        // Add triangle shape
        if (shapeType === 'triangle') {
            shape.style.background = 'transparent';
            shape.style.borderLeft = `${size/2}px solid transparent`;
            shape.style.borderRight = `${size/2}px solid transparent`;
            shape.style.borderBottom = `${size}px solid ${color}`;
            shape.style.width = '0';
            shape.style.height = '0';
        }

        container.appendChild(shape);

        setTimeout(() => {
            if (shape.parentNode) {
                shape.parentNode.removeChild(shape);
            }
        }, animationDuration * 1000 + 2000);
    }

    updateBattery() {
        const batteryLevel = document.querySelector('.battery-level');
        const batteryIcon = document.querySelector('.battery i');

        // Simulate battery drain
        let level = 78;

        setInterval(() => {
            level = Math.max(10, level - Math.random() * 0.1);
            batteryLevel.textContent = `${Math.floor(level)}%`;

            if (level < 20) {
                batteryIcon.className = 'fas fa-battery-empty';
                batteryIcon.style.color = '#f44336';
            } else if (level < 50) {
                batteryIcon.className = 'fas fa-battery-half';
                batteryIcon.style.color = '#ff9800';
            } else {
                batteryIcon.className = 'fas fa-battery-three-quarters';
                batteryIcon.style.color = 'var(--accent-color)';
            }
        }, 30000);
    }

    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            soundEnabled: this.soundEnabled,
            currentScreen: this.currentScreen
        };
        localStorage.setItem('digitalWatchSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('digitalWatchSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentTheme = settings.theme || 'blue';
            this.soundEnabled = settings.soundEnabled !== false;

            this.changeTheme(this.currentTheme);

            if (!this.soundEnabled) {
                this.toggleSound();
            }
        }

        // Initialize weather simulation
        this.updateWeather();
        setInterval(() => {
            this.updateWeather();
        }, 300000); // Update every 5 minutes
    }

    updateWeather() {
        const weatherConditions = [
            { icon: 'fas fa-sun', temp: '24°C', condition: 'Sunny', color: '#FFD700' },
            { icon: 'fas fa-cloud-sun', temp: '22°C', condition: 'Partly Cloudy', color: '#87CEEB' },
            { icon: 'fas fa-cloud-rain', temp: '18°C', condition: 'Rainy', color: '#4682B4' },
            { icon: 'fas fa-cloud', temp: '20°C', condition: 'Cloudy', color: '#708090' },
            { icon: 'fas fa-snowflake', temp: '2°C', condition: 'Snow', color: '#B0E0E6' }
        ];

        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        const weatherIcon = document.querySelector('.weather-icon i');
        const weatherTemp = document.querySelector('.weather-temp');
        const weatherCondition = document.querySelector('.weather-condition');

        if (weatherIcon && weatherTemp && weatherCondition) {
            weatherIcon.className = randomWeather.icon;
            weatherIcon.style.color = randomWeather.color;
            weatherTemp.textContent = randomWeather.temp;
            weatherCondition.textContent = randomWeather.condition;
        }
    }
}

// Initialize the watch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitalWatch();
});

// Add some CSS animations for flash effect
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { background: var(--glass-bg); }
        50% { background: var(--accent-color); }
    }

    .settings-modal {
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 15px 0;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }

    .setting-item input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color);
    }

    .settings-content button {
        margin-top: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 15px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .settings-content button:hover {
        background: var(--secondary-color);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);