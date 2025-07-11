// Golf Launch Monitor Script
let shotCount = 0;
let currentStatus = 'PLACE BALL';
let isAnimating = false;
let maxShotDistance = 150; // Start with 150 yards default, will adjust dynamically
let allShotDistances = []; // Track all shot distances for scaling

// Golf clubs and their typical metrics
const golfClubs = [
    { name: 'DRIVER', ballSpeed: [145, 170], clubSpeed: [95, 115], launchAngle: [8, 16] },
    { name: 'FAIRWAY', ballSpeed: [135, 155], clubSpeed: [85, 105], launchAngle: [12, 18] },
    { name: '7 IRON', ballSpeed: [115, 135], clubSpeed: [75, 95], launchAngle: [16, 22] },
    { name: '8 IRON', ballSpeed: [110, 130], clubSpeed: [70, 90], launchAngle: [18, 24] },
    { name: '9 IRON', ballSpeed: [105, 125], clubSpeed: [65, 85], launchAngle: [20, 26] },
    { name: 'PITCHING', ballSpeed: [95, 115], clubSpeed: [60, 80], launchAngle: [22, 28] },
    { name: 'SAND', ballSpeed: [85, 105], clubSpeed: [55, 75], launchAngle: [24, 30] }
];

// Decimal place configuration for each metric
const metricFormatting = {
    carry: 0,           // 0 decimal places for carry distance
    total: 0,           // 0 decimal places for total distance
    shotType: null,     // Text field - no formatting
    ballSpeed: 1,       // 1 decimal place for ball speed
    launchAngle: 1,     // 1 decimal place for launch angle
    launchDirection: 1, // 1 decimal place for launch direction
    clubSpeed: 1,       // 1 decimal place for club speed
    spinRate: 0,        // 0 decimal places for spin rate (whole RPM)
    spinAxis: 1,        // 1 decimal place for spin axis
    smashFactor: 2,     // 2 decimal places for smash factor (more precision)
    apex: 0,            // 0 decimal places for apex height
    descentAngle: 1     // 1 decimal place for descent angle
};

// Format number based on specific metric requirements
function formatMetricValue(value, metricType) {
    if (metricType === 'shotType' || typeof value === 'string') {
        return value.toString();
    }
    
    const decimalPlaces = metricFormatting[metricType];
    if (decimalPlaces === undefined) {
        // Fallback to 1 decimal place if not configured
        return parseFloat(value.toFixed(1)).toString();
    }
    
    if (decimalPlaces === 0) {
        return Math.round(value).toString();
    } else {
        return parseFloat(value.toFixed(decimalPlaces)).toString();
    }
}

// Legacy formatNumber function - kept for backward compatibility
function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return parseFloat(num.toFixed(1)).toString();
}

// Generate random shot data
function generateShotData() {
    const club = golfClubs[Math.floor(Math.random() * golfClubs.length)];
    
    // More realistic physics relationships
    const clubSpeed = randomBetween(club.clubSpeed[0], club.clubSpeed[1]);
    const launchAngle = randomBetween(club.launchAngle[0], club.launchAngle[1]);
    const launchDirection = randomBetween(-12, 12); // Wider range for more variety
    
    // Ball speed should be realistic for each club type
    const ballSpeed = randomBetween(club.ballSpeed[0], club.ballSpeed[1]);
    
    // Calculate smash factor as ball speed divided by club speed
    const smashFactor = ballSpeed / clubSpeed;
    
    // Spin rate should be inversely related to launch angle for irons
    const baseSpinRate = club.name === 'DRIVER' ? randomBetween(1800, 3200) : 
                        club.name === 'FAIRWAY' ? randomBetween(3000, 4500) :
                        randomBetween(4000, 8000);
    const spinRate = baseSpinRate - (launchAngle - 15) * 100; // Higher launch = less spin
    
    // Spin axis affects ball flight curve
    const spinAxis = randomBetween(-25, 25);
    
    // Calculate carry distance using more realistic physics
    const carry = calculateCarryDistance(ballSpeed, launchAngle, spinRate);
    
    // Apex height calculation
    const apex = calculateApexHeight(ballSpeed, launchAngle);
    
    // Descent angle should be steeper than launch angle
    const descentAngle = -(launchAngle + randomBetween(20, 40));
    
    // Calculate roll distance based on flight params
    const roll = calculateRollDistance(ballSpeed, descentAngle, spinRate);
    
    // Determine shot type based on ball flight
    const shotType = determineShotType(launchDirection, spinAxis);
    
    return {
        shotType: shotType,
        ballSpeed: parseFloat(ballSpeed.toFixed(1)),
        clubSpeed: parseFloat(clubSpeed.toFixed(1)),
        launchAngle: parseFloat(launchAngle.toFixed(1)),
        launchDirection: parseFloat(launchDirection.toFixed(1)),
        spinRate: Math.round(Math.max(500, spinRate)), // Ensure minimum spin
        spinAxis: parseFloat(spinAxis.toFixed(1)),
        smashFactor: parseFloat(smashFactor.toFixed(2)), // More precision for calculated value
        carry: parseFloat(carry.toFixed(1)),
        roll: parseFloat(roll.toFixed(1)),
        total: parseFloat((carry + roll).toFixed(1)),
        apex: parseFloat(apex.toFixed(1)),
        descentAngle: parseFloat(descentAngle.toFixed(1))
    };
}

// Helper function to generate random number between min and max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// More realistic carry distance calculation
function calculateCarryDistance(ballSpeed, launchAngle, spinRate) {
    // Simplified but more realistic carry calculation
    const launchRad = launchAngle * Math.PI / 180;
    const gravity = 32.2; // ft/s²
    const ballSpeedFtS = ballSpeed * 1.467; // Convert MPH to ft/s
    
    // Time of flight calculation
    const timeOfFlight = (2 * ballSpeedFtS * Math.sin(launchRad)) / gravity;
    
    // Base carry distance
    const baseCarry = ballSpeedFtS * Math.cos(launchRad) * timeOfFlight;
    
    // Spin effect (backspin helps carry, sidespin doesn't affect carry much)
    const spinEffect = Math.max(0.8, 1 + (spinRate - 3000) / 10000);
    
    // Convert to yards and apply spin effect
    const carryYards = (baseCarry / 3) * spinEffect;
    
    return Math.max(50, carryYards); // Minimum realistic carry
}

// More realistic apex height calculation
function calculateApexHeight(ballSpeed, launchAngle) {
    const launchRad = launchAngle * Math.PI / 180;
    const ballSpeedFtS = ballSpeed * 1.467; // Convert MPH to ft/s
    const gravity = 32.2; // ft/s²
    
    // Maximum height calculation
    const maxHeight = Math.pow(ballSpeedFtS * Math.sin(launchRad), 2) / (2 * gravity);
    
    return Math.max(20, maxHeight); // Minimum realistic apex
}

// Calculate roll distance based on ball flight parameters
function calculateRollDistance(ballSpeed, descentAngle, spinRate) {
    // Flatten descent angle (make positive for math)
    const descent = Math.abs(descentAngle);
    
    // Base roll derived from ball speed (higher speed, more roll)
    let baseRoll = (ballSpeed - 60) * 0.4; // 60 mph baseline, 0.4 yards per mph over baseline
    
    // Reduce roll for steep descent angles (>30 deg)
    if (descent > 30) {
        baseRoll *= 0.5;
    } else if (descent > 20) {
        baseRoll *= 0.7;
    }
    
    // Reduce roll for high spin (more backspin means less roll)
    baseRoll -= (spinRate - 3000) / 1000; // subtract 1 yard per 1000 RPM over 3000
    
    // Clamp to reasonable range
    baseRoll = Math.max(0, Math.min(baseRoll, 50));
    
    return baseRoll;
}

// Create dynamic shot trace with frame-by-frame animation
function createShotTrace(shotData) {
    // Hide all old SVG trace elements
    const existingTrace = document.querySelector('.shot-trace-icon');
    if (existingTrace) {
        existingTrace.style.display = 'none';
        existingTrace.style.opacity = '0';
    }
    
    const oldRedBall = document.querySelector('.group-item');
    if (oldRedBall) {
        oldRedBall.style.display = 'none';
        oldRedBall.style.opacity = '0';
    }
    
    const oldIcon = document.querySelector('.group-icon');
    if (oldIcon) {
        oldIcon.style.display = 'none';
        oldIcon.style.opacity = '0';
    }
    
    // Ensure persistent grid exists
    getOrCreateGridCanvas();
    
    // Find or create canvas for shot trace
    let canvas = document.querySelector('.shot-trace-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'shot-trace-canvas';
        canvas.width = 355;
        canvas.height = 550;
        canvas.style.position = 'absolute';
        canvas.style.top = '17px';
        canvas.style.left = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10'; // Above grid
        
        // Add to dispersion chart
        const dispersionChart = document.querySelector('.group-parent9');
        if (dispersionChart) {
            dispersionChart.appendChild(canvas);
        }
    }
    
    // Only clear the shot trace canvas when starting a new shot
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Player position coordinates (center of the player position circle)
    const playerX = 136.31; // Center position - no offset needed since CSS is centered
    const playerY = 474.05; // Center position - no offset needed since CSS is centered
    
    // Determine chart height dynamically (playerY gives distance from top)
    const chartAvailableHeight = playerY; // pixels from top of canvas to player position
    const pixelsPerYard = chartAvailableHeight / maxShotDistance; // dynamic pixels per yard
    
    // Calculate launch direction spread
    const lateralSpreadFactor = 2.5;
    
    // Ball position relative to player position - now accurately scaled
    const ballX = playerX + (shotData.launchDirection * lateralSpreadFactor);
    const ballCarryY = playerY - (shotData.carry * pixelsPerYard);
    const ballTotalY = playerY - (shotData.total * pixelsPerYard);
    
    // Store animation data on canvas for later use
    canvas.animationData = {
        playerX,
        playerY,
        ballX,
        ballCarryY,
        ballTotalY,
        shotData,
        pixelsPerYard,
        lateralSpreadFactor
    };
    
    return canvas;
}

// Animate the ball flight frame by frame
function animateBallFlight(canvas) {
    const { playerX, playerY, ballX, ballCarryY, ballTotalY, shotData, pixelsPerYard, lateralSpreadFactor } = canvas.animationData;
    const ctx = canvas.getContext('2d');
    
    // Store original scale for comparison
    const originalMaxDistance = maxShotDistance;
    
    // Create temporary animation canvas
    let animCanvas = document.querySelector('.animation-canvas');
    if (!animCanvas) {
        animCanvas = document.createElement('canvas');
        animCanvas.className = 'animation-canvas';
        animCanvas.width = 355;
        animCanvas.height = 550;
        animCanvas.style.position = 'absolute';
        animCanvas.style.top = '17px';
        animCanvas.style.left = '0px';
        animCanvas.style.width = '100%';
        animCanvas.style.height = '100%';
        animCanvas.style.pointerEvents = 'none';
        animCanvas.style.zIndex = '12'; // Above everything during animation
        
        const dispersionChart = document.querySelector('.group-parent9');
        if (dispersionChart) {
            dispersionChart.appendChild(animCanvas);
        }
    }
    
    const animCtx = animCanvas.getContext('2d');
    
    let startTime = null;
    const flightDuration = 2000; // 2 seconds for flight
    const rollDuration = 800; // 0.8 seconds for roll
    const totalDuration = flightDuration + rollDuration;
    const trailPoints = [];
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const totalProgress = Math.min(elapsed / totalDuration, 1);
        
        // Check if we need dynamic scaling during flight
        const requiredDistance = shotData.total + 25; // Add buffer
        if (requiredDistance > maxShotDistance) {
            // Calculate target scale with smooth interpolation
            const targetScale = Math.ceil(requiredDistance / 50) * 50; // Snap to 50-yard increments
            const scaleProgress = Math.min(totalProgress * 2, 1); // Scale faster than ball progress
            
            // Smooth interpolation to new scale
            maxShotDistance = originalMaxDistance + (targetScale - originalMaxDistance) * scaleProgress;
            
            // Update grid and history in real-time
            updateGridAndHistoryScale();
        }
        
        // Recalculate positions with current scale
        const currentPixelsPerYard = playerY / maxShotDistance;
        const currentBallX = playerX + (shotData.launchDirection * lateralSpreadFactor);
        const currentBallCarryY = playerY - (shotData.carry * currentPixelsPerYard);
        const currentBallTotalY = playerY - (shotData.total * currentPixelsPerYard);
        
        // Clear animation canvas
        animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);
        
        let currentX, currentY, isRolling = false;
        
        if (elapsed <= flightDuration) {
            // Flight phase
            const flightProgress = elapsed / flightDuration;
            currentX = playerX + (currentBallX - playerX) * flightProgress;
            currentY = playerY + (currentBallCarryY - playerY) * flightProgress;
            
            // Add to flight trail
            trailPoints.push({ x: currentX, y: currentY, type: 'flight' });
            
            // Keep trail length reasonable
            if (trailPoints.length > 25) {
                trailPoints.shift();
            }
        } else {
            // Roll phase
            isRolling = true;
            const rollProgress = (elapsed - flightDuration) / rollDuration;
            currentX = currentBallX; // Roll stays on same X line
            currentY = currentBallCarryY + (currentBallTotalY - currentBallCarryY) * rollProgress;
            
            // Add to roll trail
            trailPoints.push({ x: currentX, y: currentY, type: 'roll' });
        }
        
        // Draw the accumulated trail
        if (trailPoints.length > 1) {
            let flightTrail = trailPoints.filter(p => p.type === 'flight');
            let rollTrail = trailPoints.filter(p => p.type === 'roll');
            
            // Draw flight trail (red)
            if (flightTrail.length > 1) {
                animCtx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
                animCtx.lineWidth = 3;
                animCtx.lineCap = 'round';
                animCtx.beginPath();
                animCtx.moveTo(playerX, playerY);
                flightTrail.forEach(point => {
                    animCtx.lineTo(point.x, point.y);
                });
                animCtx.stroke();
            }
            
            // Draw roll trail (yellow)
            if (rollTrail.length > 1) {
                animCtx.strokeStyle = 'rgba(255, 221, 0, 0.8)';
                animCtx.lineWidth = 2;
                animCtx.lineCap = 'round';
                animCtx.beginPath();
                animCtx.moveTo(currentBallX, currentBallCarryY);
                rollTrail.forEach(point => {
                    animCtx.lineTo(point.x, point.y);
                });
                animCtx.stroke();
            }
        }
        
        // Draw carry landing point if we've reached it
        if (elapsed >= flightDuration) {
            animCtx.fillStyle = 'rgba(255, 107, 107, 1)';
            animCtx.beginPath();
            animCtx.arc(currentBallX, currentBallCarryY, 6, 0, 2 * Math.PI);
            animCtx.fill();
            
            animCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            animCtx.lineWidth = 2;
            animCtx.stroke();
        }
        
        // Draw current ball position
        if (isRolling) {
            // Yellow ball during roll
            animCtx.fillStyle = 'rgba(255, 221, 0, 0.9)';
            animCtx.beginPath();
            animCtx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
            animCtx.fill();
            
            // Yellow glow during roll
            animCtx.strokeStyle = 'rgba(255, 221, 0, 0.5)';
            animCtx.lineWidth = 2;
            animCtx.stroke();
        } else {
            // Red ball during flight with size variation
            const heightFactor = 1 - Math.pow((elapsed / flightDuration) - 0.5, 2) * 6;
            const baseSize = 4;
            const apexScaleFactor = shotData.apex / 60;
            const maxScaling = 2.5;
            const ballSize = baseSize + (baseSize * apexScaleFactor * maxScaling * heightFactor);
            
            animCtx.fillStyle = 'rgba(255, 107, 107, 0.9)';
            animCtx.beginPath();
            animCtx.arc(currentX, currentY, Math.max(3, ballSize), 0, 2 * Math.PI);
            animCtx.fill();
            
            // Red glow during flight
            animCtx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
            animCtx.lineWidth = 2 + (apexScaleFactor * heightFactor * 2);
            animCtx.stroke();
            
            // Additional glow ring at apex
            if (heightFactor > 0.8) {
                animCtx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
                animCtx.lineWidth = 1;
                animCtx.beginPath();
                animCtx.arc(currentX, currentY, ballSize + (2 + apexScaleFactor * 2), 0, 2 * Math.PI);
                animCtx.stroke();
            }
        }
        
        // Continue animation or finish
        if (totalProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Update final animation data with current scale
            canvas.animationData.ballX = currentBallX;
            canvas.animationData.ballCarryY = currentBallCarryY;
            canvas.animationData.ballTotalY = currentBallTotalY;
            
            // Animation complete - draw permanent trace on main canvas
            drawPermanentTrace(canvas, shotData);
            
            // Remove animation canvas
            if (animCanvas.parentNode) {
                animCanvas.parentNode.removeChild(animCanvas);
            }
        }
    }
    
    // Start the animation
    requestAnimationFrame(animate);
}

// Control video replay display
function showVideoReplay() {
    const video = document.querySelector('.video-replay-player');
    const image = document.querySelector('.video-replay-image');
    
    if (video && image) {
        video.style.display = 'block';
        image.style.display = 'none';
        video.currentTime = 0; // Reset to start
        video.play();
    }
}

function showImageReplay() {
    const video = document.querySelector('.video-replay-player');
    const image = document.querySelector('.video-replay-image');
    
    if (video && image) {
        video.style.display = 'none';
        image.style.display = 'block';
        video.pause();
    }
}

// Get shot color based on shot type
function getShotColor(shotType) {
    if (shotType === 'STRAIGHT') {
        return '#4a9eff'; // Blue for good shots
    } else if (shotType === 'FADE' || shotType === 'DRAW') {
        return '#66bb6a'; // Green for controlled shots
    } else if (shotType === 'SLICE' || shotType === 'HOOK') {
        return '#ff7043'; // Orange for wayward shots
    } else {
        return '#666666'; // Default grey
    }
}

// Update metrics display with loading animation
function updateMetrics(shotData) {
    const metrics = [
        { selector: '.metric-tile .i', value: formatMetricValue(shotData.carry, 'carry') },
        { selector: '.group-parent .i', value: formatMetricValue(shotData.total, 'total') },
        { selector: '.group-container .i', value: shotData.shotType },
        { selector: '.group-div .i', value: formatMetricValue(shotData.ballSpeed, 'ballSpeed') },
        { selector: '.group-parent1 .i', value: formatMetricValue(shotData.launchAngle, 'launchAngle') },
        { selector: '.group-parent2 .i', value: formatMetricValue(shotData.launchDirection, 'launchDirection') },
        { selector: '.group-parent3 .i', value: formatMetricValue(shotData.clubSpeed, 'clubSpeed') },
        { selector: '.group-parent4 .i', value: formatMetricValue(shotData.spinRate, 'spinRate') },
        { selector: '.group-parent5 .i', value: formatMetricValue(shotData.spinAxis, 'spinAxis') },
        { selector: '.group-parent6 .i', value: formatMetricValue(shotData.smashFactor, 'smashFactor') },
        { selector: '.group-parent7 .i', value: formatMetricValue(shotData.apex, 'apex') },
        { selector: '.group-parent8 .i', value: formatMetricValue(shotData.descentAngle, 'descentAngle') }
    ];
    
    // Get all metric tiles
    const metricTiles = [
        document.querySelector('.metric-tile'),
        document.querySelector('.group-parent'),
        document.querySelector('.group-container'),
        document.querySelector('.group-div'),
        document.querySelector('.group-parent1'),
        document.querySelector('.group-parent2'),
        document.querySelector('.group-parent3'),
        document.querySelector('.group-parent4'),
        document.querySelector('.group-parent5'),
        document.querySelector('.group-parent6'),
        document.querySelector('.group-parent7'),
        document.querySelector('.group-parent8')
    ];
    
    // Show loading animation on all tiles simultaneously
    metricTiles.forEach(tile => {
        if (tile) {
            tile.classList.add('loading');
        }
    });
    
    // After 1 second, update all values simultaneously
    setTimeout(() => {
        metrics.forEach((metric, index) => {
            const element = document.querySelector(metric.selector);
            const tile = metricTiles[index];
            
            if (element && tile) {
                // Remove loading class and add updating class
                tile.classList.remove('loading');
                tile.classList.add('updating');
                
                // Update the value
                element.textContent = metric.value;
                
                // Remove updating class after brief highlight
                setTimeout(() => {
                    tile.classList.remove('updating');
                }, 300);
            }
        });
        
        // Update shot type dot color
        const shotTypeDot = document.querySelector('.shot-type-dot');
        if (shotTypeDot) {
            shotTypeDot.style.backgroundColor = getShotColor(shotData.shotType);
        }
    }, 1000); // 1 second loading time
}

// Animate shot trace
function animateShot(shotData) {
    // Remove any references to the red circle - we don't need it anymore
    
    // Create shot trace canvas and start animation
    const canvas = createShotTrace(shotData);
    canvas.style.opacity = '1';
    
    // Start the ball flight animation
    setTimeout(() => {
        animateBallFlight(canvas);
    }, 500);
    
    // Add this shot to history after animation completes (2000ms flight + 800ms roll)
    setTimeout(() => {
        addShotToHistory(shotData);
    }, 3300);
}

// Add shot to authentic shot history
function addShotToHistory(shotData) {
    // Track this shot's total distance for scaling (where ball actually ends up)
    allShotDistances.push(shotData.total);
    
    // Update the dispersion scale if needed
    updateDispersionScale();
    
    // Player position coordinates
    const playerX = 136.31; // Center position - no offset needed since CSS is centered
    const playerY = 474.05; // Center position - no offset needed since CSS is centered
    
    // Use current scale
    const chartAvailableHeight = playerY; // dynamic
    const pixelsPerYard = chartAvailableHeight / maxShotDistance;
    const lateralSpreadFactor = 2.5;
    
    // Final ball position calculations for history
    const finalX = playerX + (shotData.launchDirection * lateralSpreadFactor) + (Math.random() - 0.5) * 2;
    const finalY = playerY - (shotData.total * pixelsPerYard) + (Math.random() - 0.5) * 2;
    
    // Find or create shot history canvas
    let historyCanvas = document.querySelector('.shot-history-canvas');
    if (!historyCanvas) {
        historyCanvas = document.createElement('canvas');
        historyCanvas.className = 'shot-history-canvas';
        historyCanvas.width = 355;
        historyCanvas.height = 550;
        historyCanvas.style.position = 'absolute';
        historyCanvas.style.top = '17px';
        historyCanvas.style.left = '0px';
        historyCanvas.style.width = '100%';
        historyCanvas.style.height = '100%';
        historyCanvas.style.pointerEvents = 'none';
        historyCanvas.style.zIndex = '5'; // Below the shot trace
        
        // Add to dispersion chart
        const dispersionChart = document.querySelector('.group-parent9');
        if (dispersionChart) {
            dispersionChart.appendChild(historyCanvas);
        }
        
        // Initialize shot history array
        historyCanvas.shotHistory = [];
    }
    
    const ctx = historyCanvas.getContext('2d');
    
    // Determine shot quality for color variation
    let shotColor = '#666666'; // Default grey
    if (shotData.shotType === 'STRAIGHT') {
        shotColor = '#4a9eff'; // Blue for good shots
    } else if (shotData.shotType === 'FADE' || shotData.shotType === 'DRAW') {
        shotColor = '#66bb6a'; // Green for controlled shots
    } else {
        shotColor = '#ff7043'; // Orange for wayward shots
    }
    
    // Add current shot to history
    historyCanvas.shotHistory.push({ 
        x: finalX, 
        y: finalY, 
        fade: 1.0,
        color: shotColor,
        carry: shotData.carry,
        total: shotData.total, // Store total distance for positioning
        launchDirection: shotData.launchDirection, // Store for rescaling
        roll: shotData.roll // Store roll property
    });
    
    // Limit history to last 15 shots for better visual clarity
    if (historyCanvas.shotHistory.length > 15) {
        historyCanvas.shotHistory.shift();
    }
    
    // Update fade values for aging effect
    historyCanvas.shotHistory.forEach((shot, index) => {
        const age = historyCanvas.shotHistory.length - index;
        shot.fade = Math.max(0.15, 1.0 - (age * 0.06));
    });
    
    // Redraw all shot history
    ctx.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    
    historyCanvas.shotHistory.forEach((shot, index) => {
        // Vary size slightly based on total distance (final ball position)
        const dotSize = 2.5 + (shot.total / 200) * 1.5;
        
        // Convert hex color to rgba with fade
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        // Draw shot dot with fading effect and color coding
        ctx.fillStyle = hexToRgba(shot.color, shot.fade);
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add subtle border for most recent shots
        if (index >= historyCanvas.shotHistory.length - 3) {
            ctx.strokeStyle = hexToRgba('#ffffff', shot.fade * 0.6);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

// Fire new shot
function fireShot() {
    if (isAnimating) return;
    
    if (currentStatus !== 'READY') {
        alert('Please place ball first!');
        return;
    }
    
    isAnimating = true;
    shotCount++;
    
    // Clear previous shot's permanent trace immediately (keep historical dots)
    const permanentCanvas = document.querySelector('.permanent-trace-canvas');
    if (permanentCanvas) {
        const ctx = permanentCanvas.getContext('2d');
        ctx.clearRect(0, 0, permanentCanvas.width, permanentCanvas.height);
    }
    
    // Update shot counter
    document.getElementById('shotCount').textContent = shotCount;
    document.getElementById('chartShotCount').textContent = shotCount;
    
    // Update status
    updateStatus('SHOT FIRED');
    
    // Generate and display shot data
    const shotData = generateShotData();
    console.log('Shot Data:', shotData);
    
    // Animate shot
    animateShot(shotData);
    
    // Show video replay after shot
    setTimeout(() => {
        showVideoReplay();
    }, 1000);
    
    // Update metrics with delay
    setTimeout(() => {
        updateMetrics(shotData);
    }, 500);
    
    // Reset status after animation (2000ms flight + 800ms roll + 500ms buffer)
    setTimeout(() => {
        updateStatus('PLACE BALL');
        isAnimating = false;
    }, 3800);
}

// Place ball
function placeBall() {
    if (isAnimating) return;
    
    updateStatus('READY');
    
    // Show camera image for ball placement
    showImageReplay();
    
    // Clear the current shot trace canvas (for new shot animation)
    // Do NOT clear the permanent trace canvas - that should persist until next shot
    const canvas = document.querySelector('.shot-trace-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Remove any lingering animation canvas
    const animCanvas = document.querySelector('.animation-canvas');
    if (animCanvas && animCanvas.parentNode) {
        animCanvas.parentNode.removeChild(animCanvas);
    }
    
    console.log('Ball placed, ready to fire');
}

// Reset screen
function resetScreen() {
    if (isAnimating) return;
    
    shotCount = 0;
    document.getElementById('shotCount').textContent = shotCount;
    document.getElementById('chartShotCount').textContent = shotCount;
    
    // Clear shot trace canvas
    const canvas = document.querySelector('.shot-trace-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Clear permanent trace canvas
    const permanentCanvas = document.querySelector('.permanent-trace-canvas');
    if (permanentCanvas) {
        const ctx = permanentCanvas.getContext('2d');
        ctx.clearRect(0, 0, permanentCanvas.width, permanentCanvas.height);
    }
    
    // Clear shot history canvas
    const historyCanvas = document.querySelector('.shot-history-canvas');
    if (historyCanvas) {
        historyCanvas.shotHistory = [];
        historyCanvas.getContext('2d').clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    }
    
    // Reset status
    updateStatus('PLACE BALL');
    
    // Reset metrics to default
    const defaultMetrics = {
        shotType: 'STRAIGHT',
        ballSpeed: 125.6,
        clubSpeed: 89.3,
        launchAngle: 16.8,
        launchDirection: 0.3,
        spinRate: 5420,
        spinAxis: -2.1,
        smashFactor: 1.4,
        carry: 155.8,
        total: 168.4,
        apex: 78.5,
        descentAngle: -42.3
    };
    
    updateMetrics(defaultMetrics);
    
    // Reset shot type dot color to default
    const shotTypeDot = document.querySelector('.shot-type-dot');
    if (shotTypeDot) {
        shotTypeDot.style.backgroundColor = getShotColor('STRAIGHT');
    }
    
    // Reset shot position (this will also show the image)
    placeBall();
    
    // Reset dispersion scale to default
    maxShotDistance = 150;
    allShotDistances = [];
    updateDistanceMarkers();
    
    console.log('Screen reset');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeScreen);

// Initialize the screen
function initializeScreen() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Set initial status
    updateStatus(currentStatus);
    
    // Create and draw persistent grid
    getOrCreateGridCanvas();
    
    // Initialize distance markers
    updateDistanceMarkers();
    
    // Set initial shot type dot color
    const shotTypeDot = document.querySelector('.shot-type-dot');
    if (shotTypeDot) {
        shotTypeDot.style.backgroundColor = getShotColor('STRAIGHT');
    }
    
    // Show camera image initially
    showImageReplay();
    
    // Hide any default shot trace elements
    const existingTrace = document.querySelector('.shot-trace-icon');
    if (existingTrace) {
        existingTrace.style.display = 'none';
    }
    
    const oldRedBall = document.querySelector('.group-item');
    if (oldRedBall) {
        oldRedBall.style.display = 'none';
    }
    
    const oldIcon = document.querySelector('.group-icon');
    if (oldIcon) {
        oldIcon.style.display = 'none';
    }
    
    console.log('Golf Launch Monitor initialized');
}

// Update the clock display
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    document.querySelector('.clock').textContent = timeString;
}

// Update the status indicator
function updateStatus(status) {
    const statusText = document.querySelector('.status-text');
    const statusBar = document.querySelector('.status-bar');
    const statusTextDisplay = document.querySelector('.status-text-display');
    const statusIndicatorSmall = document.querySelector('.status-indicator-small');
    
    currentStatus = status;
    
    // Update text in control panel
    if (statusText) {
        statusText.textContent = status;
    }
    
    // Update main status text display
    if (statusTextDisplay) {
        statusTextDisplay.textContent = status;
        
        // Add breathing animation only for PLACE BALL status
        if (status === 'PLACE BALL') {
            statusTextDisplay.classList.add('breathing');
        } else {
            statusTextDisplay.classList.remove('breathing');
        }
    }
    
    // Change colors based on status
    if (status === 'PLACE BALL') {
        if (statusBar) {
            statusBar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
            statusBar.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.6)';
        }
        if (statusIndicatorSmall) {
            statusIndicatorSmall.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
            statusIndicatorSmall.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.3)';
        }
    } else if (status === 'READY') {
        if (statusBar) {
            statusBar.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #6dd5cd 100%)';
            statusBar.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.6)';
        }
        if (statusIndicatorSmall) {
            statusIndicatorSmall.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #6dd5cd 100%)';
            statusIndicatorSmall.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.3)';
        }
    } else if (status === 'SHOT FIRED') {
        if (statusBar) {
            statusBar.style.background = 'linear-gradient(135deg, #45b7aa 0%, #5cc4bb 100%)';
            statusBar.style.boxShadow = '0 0 15px rgba(69, 183, 170, 0.6)';
        }
        if (statusIndicatorSmall) {
            statusIndicatorSmall.style.background = 'linear-gradient(135deg, #45b7aa 0%, #5cc4bb 100%)';
            statusIndicatorSmall.style.boxShadow = '0 0 10px rgba(69, 183, 170, 0.3)';
        }
    }
}

// Determine shot type based on launch direction and spin axis
function determineShotType(launchDirection, spinAxis) {
    // Combine launch direction and spin axis to determine ball flight
    const totalCurve = launchDirection + (spinAxis * 0.3);
    
    if (Math.abs(totalCurve) < 2) {
        return 'STRAIGHT';
    } else if (totalCurve > 2) {
        if (totalCurve > 6) {
            return 'SLICE';
        } else {
            return 'FADE';
        }
    } else {
        if (totalCurve < -6) {
            return 'HOOK';
        } else {
            return 'DRAW';
        }
    }
} 

// Update dispersion chart scale based on shot distances
function updateDispersionScale() {
    if (allShotDistances.length === 0) return;
    
    // Find maximum distance with some buffer
    const maxDistance = Math.max(...allShotDistances);
    
    // Round up to next sensible increment (50 yard increments)
    const buffer = 25; // yards buffer above max shot
    const roundedMax = Math.ceil((maxDistance + buffer) / 50) * 50;
    
    // Ensure minimum scale of 100 yards
    maxShotDistance = Math.max(100, roundedMax);
    
    // Update the distance markers in the HTML
    updateDistanceMarkers();
}

// Update the distance markers on the dispersion chart
function updateDistanceMarkers() {
    // No longer updating HTML elements - just trigger grid redraw
    redrawShotHistory();
}

// Redraw shot history when scale changes
function redrawShotHistory() {
    const historyCanvas = document.querySelector('.shot-history-canvas');
    if (!historyCanvas || !historyCanvas.shotHistory) return;
    
    const ctx = historyCanvas.getContext('2d');
    ctx.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    
    // Update the persistent grid canvas with current scale
    const gridCanvas = getOrCreateGridCanvas();
    const gridCtx = gridCanvas.getContext('2d');
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    drawDispersionGrid(gridCanvas, maxShotDistance);
    
    // Player position coordinates
    const playerX = 136.31; // Center position - no offset needed since CSS is centered
    const playerY = 474.05; // Center position - no offset needed since CSS is centered
    
    // Use current scale
    const chartAvailableHeight = playerY; // dynamic
    const pixelsPerYard = chartAvailableHeight / maxShotDistance;
    const lateralSpreadFactor = 2.5;
    
    historyCanvas.shotHistory.forEach((shot, index) => {
        // Recalculate position with new scale using TOTAL distance (carry + roll)
        const shotX = playerX + (shot.launchDirection * lateralSpreadFactor);
        const shotY = playerY - (shot.total * pixelsPerYard);
        
        // Update stored position
        shot.x = shotX;
        shot.y = shotY;
        
        // Vary size slightly based on total distance (final ball position)
        const dotSize = 2.5 + (shot.total / 200) * 1.5;
        
        // Convert hex color to rgba with fade
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        // Draw shot dot with fading effect and color coding
        ctx.fillStyle = hexToRgba(shot.color, shot.fade);
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add subtle border for most recent shots
        if (index >= historyCanvas.shotHistory.length - 3) {
            ctx.strokeStyle = hexToRgba('#ffffff', shot.fade * 0.6);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
} 

// Draw distance markers and grid on canvas with consistent coordinates
function drawDispersionGrid(canvas, maxDistance) {
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Player position (0 YDS line)
    const playerX = 136.31;
    const playerY = 474.05;
    
    // Calculate scale
    const pixelsPerYard = playerY / maxDistance;
    
    // Clear any existing grid
    ctx.save();
    
    // Grid styling configuration - adjust these values to change appearance
    const arcLineOpacity = 0.2; // Increase for more visible arc lines (0.1 to 0.4)
    const arcLineWidth = 1.5; // Increase for thicker arc lines (1 to 3)
    const centerLineOpacity = 0.25; // Increase for more visible center line (0.1 to 0.5)
    const centerLineWidth = 1; // Increase for thicker center line (1 to 3)
    const labelOpacity = 0.9; // Label visibility (0.6 to 1.0)
    
    // Draw curved distance arcs at 50-yard intervals
    const increment = 50; // Fixed 50-yard increments
    const numLines = Math.floor(maxDistance / increment);
    
    for (let i = 1; i <= numLines; i++) { // Start from 1 to skip 0 yards
        const distance = i * increment;
        const radiusInPixels = distance * pixelsPerYard;
        
        // Skip arcs that would extend too far above the canvas
        if (playerY - radiusInPixels < -20) continue;
        
        // Draw distance arc centered on player position
        ctx.strokeStyle = `rgba(255, 255, 255, ${arcLineOpacity})`;
        ctx.lineWidth = arcLineWidth;
        ctx.beginPath();
        
        // Draw a 30-degree wedge centered on the vertical centerline
        // Center angle: 270° (straight up) = 3π/2 radians
        // Wedge: ±15° from center = ±π/12 radians
        const centerAngle = 3 * Math.PI / 2; // 270° (straight up)
        const wedgeHalfAngle = Math.PI / 12; // 15° (half of 30°)
        
        const startAngle = centerAngle - wedgeHalfAngle; // 255°
        const endAngle = centerAngle + wedgeHalfAngle;   // 285°
        
        // Draw the arc wedge
        ctx.arc(playerX, playerY, radiusInPixels, startAngle, endAngle, false);
        ctx.stroke();
        
        // Draw distance label - improved positioning to prevent cropping
        const labelX = canvasWidth - 45;
        const idealLabelY = playerY - radiusInPixels + 3;
        
        // Constrain label Y position to stay within visible bounds with padding
        const minLabelY = 12; // Minimum distance from top edge
        const maxLabelY = canvasHeight - 5; // Maximum distance from bottom edge
        const labelY = Math.max(minLabelY, Math.min(idealLabelY, maxLabelY));
        
        // Always draw labels - they're now constrained to visible area
        ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity})`;
        ctx.font = '10px Barlow';
        ctx.textAlign = 'left';
        ctx.fillText(`${distance} YDS`, labelX, labelY);
    }
    
    // Draw center line (0 degrees launch direction)
    ctx.strokeStyle = `rgba(255, 255, 255, ${centerLineOpacity})`;
    ctx.lineWidth = centerLineWidth;
    ctx.beginPath();
    ctx.moveTo(playerX, 0);
    ctx.lineTo(playerX, playerY);
    ctx.stroke();
    
    ctx.restore();
} 

// Create or get persistent background grid canvas
function getOrCreateGridCanvas() {
    let gridCanvas = document.querySelector('.dispersion-grid-canvas');
    if (!gridCanvas) {
        gridCanvas = document.createElement('canvas');
        gridCanvas.className = 'dispersion-grid-canvas';
        gridCanvas.width = 355;
        gridCanvas.height = 550;
        gridCanvas.style.position = 'absolute';
        gridCanvas.style.top = '17px';
        gridCanvas.style.left = '0px';
        gridCanvas.style.width = '100%';
        gridCanvas.style.height = '100%';
        gridCanvas.style.pointerEvents = 'none';
        gridCanvas.style.zIndex = '1'; // Bottom layer
        
        // Add to dispersion chart
        const dispersionChart = document.querySelector('.group-parent9');
        if (dispersionChart) {
            dispersionChart.appendChild(gridCanvas);
        }
        
        // Draw initial grid
        drawDispersionGrid(gridCanvas, maxShotDistance);
    }
    return gridCanvas;
} 

// Create or get persistent permanent trace canvas
function getOrCreatePermanentTraceCanvas() {
    let permanentCanvas = document.querySelector('.permanent-trace-canvas');
    if (!permanentCanvas) {
        permanentCanvas = document.createElement('canvas');
        permanentCanvas.className = 'permanent-trace-canvas';
        permanentCanvas.width = 355;
        permanentCanvas.height = 550;
        permanentCanvas.style.position = 'absolute';
        permanentCanvas.style.top = '17px';
        permanentCanvas.style.left = '0px';
        permanentCanvas.style.width = '100%';
        permanentCanvas.style.height = '100%';
        permanentCanvas.style.pointerEvents = 'none';
        permanentCanvas.style.zIndex = '8'; // Above history, below shot trace
        
        // Add to dispersion chart
        const dispersionChart = document.querySelector('.group-parent9');
        if (dispersionChart) {
            dispersionChart.appendChild(permanentCanvas);
        }
    }
    return permanentCanvas;
}

// Draw permanent trace after animation completes
function drawPermanentTrace(canvas, shotData) {
    const { playerX, playerY, ballX, ballCarryY, ballTotalY } = canvas.animationData;
    
    // Clear the previous permanent trace and draw new one
    const permanentCanvas = getOrCreatePermanentTraceCanvas();
    const ctx = permanentCanvas.getContext('2d');
    
    // Clear previous permanent trace
    ctx.clearRect(0, 0, permanentCanvas.width, permanentCanvas.height);
    
    // Draw the permanent flight trace (red line from player to carry point)
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(ballX, ballCarryY);
    ctx.stroke();
    
    // Draw carry landing point (red dot)
    ctx.fillStyle = 'rgba(255, 107, 107, 1)';
    ctx.beginPath();
    ctx.arc(ballX, ballCarryY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw roll trace if there's significant roll (yellow line from carry to final)
    if (shotData.roll > 0.5) {
        ctx.strokeStyle = 'rgba(255, 221, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ballX, ballCarryY);
        ctx.lineTo(ballX, ballTotalY);
        ctx.stroke();
        
        // Draw final resting position (yellow dot)
        ctx.fillStyle = 'rgba(255, 221, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(ballX, ballTotalY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add subtle border to final position
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
} 

// Update grid and shot history scaling in real-time during animation
function updateGridAndHistoryScale() {
    // Update persistent grid with new scale
    const gridCanvas = getOrCreateGridCanvas();
    const gridCtx = gridCanvas.getContext('2d');
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    drawDispersionGrid(gridCanvas, maxShotDistance);
    
    // Update shot history positions with new scale
    const historyCanvas = document.querySelector('.shot-history-canvas');
    if (historyCanvas && historyCanvas.shotHistory) {
        const ctx = historyCanvas.getContext('2d');
        ctx.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
        
        // Player position coordinates
        const playerX = 136.31;
        const playerY = 474.05;
        
        // Use current scale
        const chartAvailableHeight = playerY;
        const pixelsPerYard = chartAvailableHeight / maxShotDistance;
        const lateralSpreadFactor = 2.5;
        
        historyCanvas.shotHistory.forEach((shot, index) => {
            // Recalculate position with new scale using TOTAL distance (carry + roll)
            const shotX = playerX + (shot.launchDirection * lateralSpreadFactor);
            const shotY = playerY - (shot.total * pixelsPerYard);
            
            // Update stored position
            shot.x = shotX;
            shot.y = shotY;
            
            // Vary size slightly based on total distance (final ball position)
            const dotSize = 2.5 + (shot.total / 200) * 1.5;
            
            // Convert hex color to rgba with fade
            const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            // Draw shot dot with fading effect and color coding
            ctx.fillStyle = hexToRgba(shot.color, shot.fade);
            ctx.beginPath();
            ctx.arc(shot.x, shot.y, dotSize, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add subtle border for most recent shots
            if (index >= historyCanvas.shotHistory.length - 3) {
                ctx.strokeStyle = hexToRgba('#ffffff', shot.fade * 0.6);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }
} 

// Update monitor scaling based on viewport size
function updateScale() {
    const monitorWrapper = document.getElementById('monitor-wrapper');
    const monitor = document.querySelector('.x9');
    const controlPanel = document.querySelector('.control-panel');
    if (!monitorWrapper || !monitor) return;
    
    const originalWidth = 1280;
    const originalHeight = 720;
    const panelWidth = controlPanel ? controlPanel.offsetWidth : 0;
    const horizontalMargin = 40; // 20px left + 20px right margin
    const verticalMargin = 40; // 20px top + 20px bottom margin
    
    const availableWidth = window.innerWidth - panelWidth - horizontalMargin;
    const availableHeight = window.innerHeight - verticalMargin;
    const scale = Math.max(0.1, Math.min(availableWidth / originalWidth, availableHeight / originalHeight));
    
    monitor.style.transformOrigin = 'top left';
    monitor.style.transform = `scale(${scale})`;
    monitorWrapper.style.width = `${originalWidth * scale}px`;
    monitorWrapper.style.height = `${originalHeight * scale}px`;
}

// Attach resize listener
window.addEventListener('resize', updateScale);

// Call on initial load
updateScale(); 