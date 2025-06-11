// Main application script
let scene, camera, renderer, controls;
let planets, sun, stars, raycaster, mouse;

// Animation state
const animationState = {
    isPaused: false
};

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Initialize raycaster and mouse vector
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.set(0, 30, 80); // Better view to see all planets
    camera.lookAt(0, 0, 0);
    
    // Create renderer with enhanced settings for realistic 3D
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add orbit controls for camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create stars background
    stars = createStars(scene);
    
    // Create sun
    const sunObjects = createSun(scene, textureLoader);
    sun = sunObjects.sun;
    
    // Create planets
    const planetObjects = createPlanets(scene, textureLoader);
    planets = planetObjects.planets;
    
    // Enhanced lighting setup for realistic 3D planets
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);  // Reduced ambient for more dramatic shadows
    scene.add(ambientLight);

    // Primary directional light from the sun
    const sunDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunDirectionalLight.position.set(0, 0, 0);
    sunDirectionalLight.castShadow = true;
    sunDirectionalLight.shadow.mapSize.width = 2048;
    sunDirectionalLight.shadow.mapSize.height = 2048;
    scene.add(sunDirectionalLight);

    // Secondary fill light for subtle illumination
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.2);
    fillLight.position.set(-100, 50, 100);
    scene.add(fillLight);

    // Rim light for planet edge definition
    const rimLight = new THREE.DirectionalLight(0xffffaa, 0.3);
    rimLight.position.set(50, 100, -50);
    scene.add(rimLight);

    // Hemisphere light for subtle environmental lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
    scene.add(hemisphereLight);
    
    // Create speed controls
    createSpeedControls(planets, animationState, camera);

    // Debug: Log planet count and positions
    console.log(`Total planets created: ${planets.length}`);
    planets.forEach((planet, index) => {
        const rotationDirection = planet.data.rotationSpeed < 0 ? ' (RETROGRADE ↺)' : ' (NORMAL ↻)';
        const tiltInfo = planet.data.tilt ? ` - TILTED ${(planet.data.tilt * 180 / Math.PI).toFixed(0)}°` : '';
        console.log(`Planet ${index + 1}: ${planet.data.name} at distance ${planet.data.distance}${rotationDirection}${tiltInfo}`);
    });

    // Special notification for unique rotations
    console.log('🌟 REALISTIC PLANETARY ROTATIONS:');
    console.log('♀️ Venus: Rotates ANTICLOCKWISE (retrograde rotation)');
    console.log('♅ Uranus: Rotates ANTICLOCKWISE + tilted 90° on its side!');

    // Add window resize handler
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove, false);

    // Start animation loop
    animate();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse move
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Skip updates if animation is paused
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Get all planet meshes
    const planetMeshes = planets.map(p => p.mesh);

    // Check for intersections
    const intersects = raycaster.intersectObjects(planetMeshes);

    const tooltip = document.getElementById('tooltip');

    if (intersects.length > 0) {
        const intersectedPlanet = planets.find(p => p.mesh === intersects[0].object);
        if (intersectedPlanet) {
            tooltip.style.display = 'block';
            tooltip.textContent = intersectedPlanet.data.name;
            // Position tooltip
            const screenPosition = intersectedPlanet.mesh.position.clone().project(camera);
            tooltip.style.left = `${(screenPosition.x + 1) / 2 * window.innerWidth + 15}px`;
            tooltip.style.top = `${(-screenPosition.y + 1) / 2 * window.innerHeight + 15}px`;
        }
    } else {
        tooltip.style.display = 'none';
    }

    if (!animationState.isPaused) {
        // Rotate sun with slight wobble for more realism
        sun.rotation.y += 0.005;
        sun.rotation.x += 0.001;

        // Update planet positions and rotations
        planets.forEach(planet => {
            // Update planet orbit position by rotating the container
            planet.angle += planet.currentSpeed * 0.005;
            planet.container.rotation.y = planet.angle;

            // Rotate planet on its axis (negative values = retrograde rotation)
            planet.mesh.rotation.y += planet.data.rotationSpeed;

            // Add planet-specific realistic movements
            if (planet.data.name === 'Earth') {
                // Earth's slight axial wobble (23.5° tilt effect)
                planet.mesh.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
            } else if (planet.data.name === 'Venus') {
                // Venus rotates very slowly backwards (retrograde)
                // The negative rotationSpeed already handles the direction
            } else if (planet.data.name === 'Uranus') {
                // Uranus rotates on its side and backwards (retrograde + 90° tilt)
                // The tilt is already applied, negative rotationSpeed handles direction
            }
        });
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize the application when the page loads
window.addEventListener('load', init);

// Set up modern zoom controls
const zoomSlider = document.getElementById('zoom-slider');
const zoomPresets = document.querySelectorAll('.zoom-preset');
const zoomIndicators = document.querySelectorAll('.zoom-indicator');
const zoomValueDisplay = document.getElementById('zoom-value');

// Function to update camera position based on zoom value with smooth animation
function updateCameraZoom(zoomValue, animate = false) {
    const basePosition = new THREE.Vector3(0, 30, 80);
    const scaleFactor = zoomValue / 80; // 80 is our default value
    const targetPosition = basePosition.multiplyScalar(scaleFactor);

    if (animate) {
        // Smooth camera animation
        const startPosition = camera.position.clone();
        const animationDuration = 500; // milliseconds
        const startTime = Date.now();

        function animateCamera() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // Easing function for smooth animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            camera.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        }

        animateCamera();
    } else {
        camera.position.copy(targetPosition);
        camera.lookAt(0, 0, 0);
    }

    // Update zoom percentage display
    const percentage = Math.round((80 / zoomValue) * 100);
    zoomValueDisplay.textContent = `${percentage}%`;

    // Update zoom indicators
    zoomIndicators.forEach(indicator => indicator.classList.remove('active'));
    if (zoomValue <= 50) {
        document.querySelector('[data-zoom="close"]').classList.add('active');
    } else if (zoomValue <= 120) {
        document.querySelector('[data-zoom="medium"]').classList.add('active');
    } else {
        document.querySelector('[data-zoom="far"]').classList.add('active');
    }

    // Update active preset button
    zoomPresets.forEach(btn => btn.classList.remove('active'));
    const activePreset = document.querySelector(`[data-zoom="${zoomValue}"]`);
    if (activePreset) {
        activePreset.classList.add('active');
    }
}

// Zoom slider event listener
zoomSlider.addEventListener('input', function() {
    updateCameraZoom(parseInt(this.value));
});

// Zoom preset buttons event listeners
zoomPresets.forEach(button => {
    button.addEventListener('click', function() {
        const zoomValue = parseInt(this.dataset.zoom);
        zoomSlider.value = zoomValue;
        updateCameraZoom(zoomValue, true); // Enable animation for preset clicks

        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Initialize with default zoom
updateCameraZoom(80);

// Add this at the end of the init function
// Set up view controls
const realViewCheckbox = document.getElementById('real-view');
const showPathCheckbox = document.getElementById('show-path');
const simulationSpeedSlider = document.getElementById('simulation-speed');
const closeControlsButton = document.getElementById('close-controls');

realViewCheckbox.addEventListener('change', function() {
    // Toggle between realistic and simplified view
    planets.forEach(planet => {
        if (this.checked) {
            // Enable normal maps, etc. for realistic view
            if (planet.mesh.material.normalMap) {
                planet.mesh.material.normalScale.set(1.0, 1.0);
            }
        } else {
            // Disable normal maps for simplified view
            if (planet.mesh.material.normalMap) {
                planet.mesh.material.normalScale.set(0, 0);
            }
        }
    });
});

showPathCheckbox.addEventListener('change', function() {
    // Toggle orbit path visibility
    planetObjects.orbits.forEach(orbit => {
        orbit.visible = this.checked;
    });
});

simulationSpeedSlider.addEventListener('input', function() {
    // Adjust global simulation speed
    const speedFactor = parseFloat(this.value);
    planets.forEach(planet => {
        planet.currentSpeed = planet.data.orbitSpeed * speedFactor;
    });
});

closeControlsButton.addEventListener('click', function() {
    document.querySelector('.view-controls').style.display = 'none';
});