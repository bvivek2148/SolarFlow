// Function to create speed controls for each planet
function createSpeedControls(planets, animationState, cameraRef) {
    const controlsContainer = document.getElementById('planet-controls');
    controlsContainer.innerHTML = ''; // Clear any existing controls
    
    planets.forEach((planet, index) => {
        const planetControl = document.createElement('div');
        planetControl.className = 'planet-control';
        
        // Set background color based on planet
        planetControl.style.borderLeftColor = `rgb(
            ${Math.floor((planet.data.color >> 16) & 255)},
            ${Math.floor((planet.data.color >> 8) & 255)},
            ${Math.floor(planet.data.color & 255)}
        )`;
        
        // Create planet name heading
        const planetName = document.createElement('h3');
        planetName.textContent = planet.data.name;
        planetControl.appendChild(planetName);
        
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        // Create slider for speed control
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '5';
        slider.step = '0.1';
        slider.value = planet.currentSpeed;
        
        // Create speed value display
        const speedValue = document.createElement('span');
        speedValue.textContent = planet.currentSpeed.toFixed(1);
        
        // Add event listener to update speed
        slider.addEventListener('input', function() {
            const newSpeed = parseFloat(this.value);
            planet.currentSpeed = newSpeed;
            speedValue.textContent = newSpeed.toFixed(1);
            
            // Visual feedback
            const percentage = (newSpeed / 5) * 100;
            this.style.background = `linear-gradient(to right, 
                rgba(255, 255, 255, 0.7) 0%, 
                rgba(255, 255, 255, 0.7) ${percentage}%, 
                rgba(255, 255, 255, 0.2) ${percentage}%, 
                rgba(255, 255, 255, 0.2) 100%)`;
        });
        
        // Set initial gradient
        const initialPercentage = (planet.currentSpeed / 5) * 100;
        slider.style.background = `linear-gradient(to right, 
            rgba(255, 255, 255, 0.7) 0%, 
            rgba(255, 255, 255, 0.7) ${initialPercentage}%, 
            rgba(255, 255, 255, 0.2) ${initialPercentage}%, 
            rgba(255, 255, 255, 0.2) 100%)`;
        
        // Append elements to container
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(speedValue);
        planetControl.appendChild(sliderContainer);
        
        // Add to main controls container
        controlsContainer.appendChild(planetControl);
    });
    
    // Set up pause/resume button
    const pauseBtn = document.getElementById('pause-btn');
    let isPaused = false;
    
    pauseBtn.addEventListener('click', function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? 'Resume' : 'Pause';
        animationState.isPaused = isPaused;
    });
    
    // Set up reset button
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', function() {
        planets.forEach((planet, index) => {
            planet.currentSpeed = planet.data.orbitSpeed;
            const slider = document.querySelectorAll('.planet-control input[type="range"]')[index];
            const speedValue = document.querySelectorAll('.planet-control span')[index];
            slider.value = planet.data.orbitSpeed;
            speedValue.textContent = planet.data.orbitSpeed.toFixed(1);
        });
    });

    // Set up focus planets button
    const focusPlanetsBtn = document.getElementById('focus-planets-btn');
    let currentFocusIndex = 0;
    focusPlanetsBtn.addEventListener('click', function() {
        if (planets.length > 0) {
            const planet = planets[currentFocusIndex];
            const planetPosition = planet.mesh.getWorldPosition(new THREE.Vector3());

            // Move camera to focus on the planet
            const distance = 15; // Distance from planet
            const newCameraPosition = planetPosition.clone();
            newCameraPosition.z += distance;
            newCameraPosition.y += 5;

            // Animate camera movement (simple version)
            cameraRef.position.copy(newCameraPosition);
            cameraRef.lookAt(planetPosition);

            // Show which planet we're focusing on
            console.log(`Focusing on ${planet.data.name}`);

            // Cycle to next planet
            currentFocusIndex = (currentFocusIndex + 1) % planets.length;
        }
    });
}

// Set up theme switcher
    const themeSwitch = document.getElementById('checkbox');
    themeSwitch.addEventListener('change', function() {
        document.body.classList.toggle('light-mode');
    });
