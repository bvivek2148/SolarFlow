// Planet data with local high-quality textures
const planetData = [
    {
        name: 'Mercury',
        radius: 1.2,
        distance: 8,
        color: 0x8C7853,
        orbitSpeed: 4.1,
        rotationSpeed: 0.01,
        textureUrl: 'textures/mercury.jpg',
        fallbackColor: 0x8C7853,
        description: 'Closest planet to the Sun'
    },
    {
        name: 'Venus',
        radius: 1.8,
        distance: 12,
        color: 0xFFC649,
        orbitSpeed: 1.6,
        rotationSpeed: -0.008, // More negative for clear anticlockwise rotation
        textureUrl: 'textures/venus.jpg',
        fallbackColor: 0xFFC649,
        description: 'Hottest planet in our solar system - rotates backwards!'
    },
    {
        name: 'Earth',
        radius: 2.0,
        distance: 16,
        color: 0x6B93D6,
        orbitSpeed: 1,
        rotationSpeed: 0.02,
        textureUrl: 'textures/earth.jpg',
        fallbackColor: 0x6B93D6,
        description: 'Our home planet'
    },
    {
        name: 'Mars',
        radius: 1.5,
        distance: 20,
        color: 0xCD5C5C,
        orbitSpeed: 0.5,
        rotationSpeed: 0.018,
        textureUrl: 'textures/mars.jpg',
        fallbackColor: 0xCD5C5C,
        description: 'The Red Planet'
    },
    {
        name: 'Jupiter',
        radius: 4.0,
        distance: 28,
        color: 0xD8CA9D,
        orbitSpeed: 0.08,
        rotationSpeed: 0.04,
        textureUrl: 'textures/jupiter.jpg',
        fallbackColor: 0xD8CA9D,
        description: 'Largest planet in our solar system'
    },
    {
        name: 'Saturn',
        radius: 3.5,
        distance: 36,
        color: 0xFAD5A5,
        orbitSpeed: 0.03,
        rotationSpeed: 0.038,
        textureUrl: 'textures/saturn.jpg',
        fallbackColor: 0xFAD5A5,
        description: 'Famous for its beautiful rings'
    },
    {
        name: 'Uranus',
        radius: 2.8,
        distance: 44,
        color: 0x4FD0E7,
        orbitSpeed: 0.01,
        rotationSpeed: -0.035, // More negative for clear anticlockwise rotation
        textureUrl: 'textures/uranus.jpg',
        fallbackColor: 0x4FD0E7,
        description: 'Ice giant tilted on its side - rotates backwards!',
        tilt: Math.PI / 2 // 90 degrees tilt - rotates on its side
    },
    {
        name: 'Neptune',
        radius: 2.7,
        distance: 52,
        color: 0x4B70DD,
        orbitSpeed: 0.006,
        rotationSpeed: 0.032,
        textureUrl: 'textures/neptune.jpg',
        fallbackColor: 0x4B70DD,
        description: 'Windiest planet in our solar system'
    }
];

// Function to create planets
function createPlanets(scene, textureLoader) {
    const planets = [];
    const orbits = [];
    
    // Create orbit lines
    planetData.forEach(planet => {
        // Create orbit line
        const orbitGeometry = new THREE.RingGeometry(planet.distance, planet.distance + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        orbits.push(orbit);
        
        // Create planet with ultra-high quality geometry for realistic 3D appearance
        const geometry = new THREE.SphereGeometry(planet.radius, 128, 128);

        // Create realistic 3D planet material with advanced properties
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,  // White base to let texture show true colors
            shininess: planet.name === 'Venus' ? 200 : planet.name === 'Earth' ? 100 : 30,
            specular: planet.name === 'Earth' ? 0x222222 :
                     planet.name === 'Venus' ? 0x444444 : 0x111111,
            transparent: false,
            side: THREE.FrontSide
        });

        // Load high-quality texture and create realistic 3D effects
        textureLoader.load(
            planet.textureUrl,
            function(texture) {
                // Success callback - Create realistic 3D planet
                texture.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;

                // Apply main texture
                material.map = texture;

                // Create procedural normal map for 3D surface detail
                createNormalMap(texture, material, planet);

                // Create bump map for surface elevation
                createBumpMap(texture, material, planet);

                // Add planet-specific material properties
                enhancePlanetMaterial(material, planet);

                material.needsUpdate = true;
                console.log(`✓ Created realistic 3D model for ${planet.name}`);
            },
            function(progress) {
                // Progress callback
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Loading ${planet.name}: ${percent}%`);
                }
            },
            function(error) {
                // Error callback - create enhanced 3D fallback
                console.log(`⚠ Creating realistic 3D fallback for ${planet.name}`);
                createRealistic3DFallback(material, planet, textureLoader);
            }
        );
        
        const planetMesh = new THREE.Mesh(geometry, material);

        // Enable shadows for realistic 3D appearance
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;

        // Apply planet-specific tilts (Uranus rotates on its side)
        if (planet.tilt) {
            planetMesh.rotation.z = planet.tilt;
            console.log(`Applied ${planet.tilt * 180 / Math.PI}° tilt to ${planet.name}`);
        }

        // Create a container for the planet to manage its orbit
        const planetContainer = new THREE.Object3D();
        planetContainer.add(planetMesh);

        // Add Saturn's realistic rings
        if (planet.name === 'Saturn') {
            // Create multiple ring layers for realism
            const ringLayers = [
                { inner: planet.radius * 1.2, outer: planet.radius * 1.6, color: 0xC4A484, opacity: 0.9 },
                { inner: planet.radius * 1.7, outer: planet.radius * 2.0, color: 0xB8A080, opacity: 0.7 },
                { inner: planet.radius * 2.1, outer: planet.radius * 2.3, color: 0xA89070, opacity: 0.6 }
            ];

            ringLayers.forEach((layer, index) => {
                const ringGeometry = new THREE.RingGeometry(layer.inner, layer.outer, 128);
                const ringMaterial = new THREE.MeshPhongMaterial({
                    color: layer.color,
                    transparent: true,
                    opacity: layer.opacity,
                    side: THREE.DoubleSide,
                    shininess: 30,
                    specular: 0x222222
                });

                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2; // Rotate to be horizontal
                rings.castShadow = true;
                rings.receiveShadow = true;
                planetMesh.add(rings);
            });

            console.log('Added realistic multi-layer rings to Saturn');
        }

        // Add realistic atmospheric glow effect
        if (planet.name === 'Earth' || planet.name === 'Venus' || planet.name === 'Mars') {
            const glowGeometry = new THREE.SphereGeometry(planet.radius * 1.03, 64, 64);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: planet.name === 'Earth' ? 0x4A90E2 :
                       planet.name === 'Venus' ? 0xFFC649 : 0xCD5C5C,
                transparent: true,
                opacity: planet.name === 'Venus' ? 0.2 : 0.08,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            planetMesh.add(glow);
        }

        // Add subtle rim lighting for all planets
        const rimGeometry = new THREE.SphereGeometry(planet.radius * 1.01, 32, 32);
        const rimMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        planetMesh.add(rim);

        // Position the planet at its orbital distance
        planetMesh.position.x = planet.distance;
        
        // Add to scene
        scene.add(planetContainer);
        
        // Store planet data for animation
        planets.push({
            mesh: planetMesh,
            container: planetContainer,
            data: planet,
            currentSpeed: planet.orbitSpeed,
            angle: Math.random() * Math.PI * 2 // Random starting position
        });

        // Debug log to verify planet creation
        console.log(`Created ${planet.name}: radius=${planet.radius}, distance=${planet.distance}`);
    });
    
    return { planets, orbits };
}

// Function to create normal map for 3D surface detail
function createNormalMap(baseTexture, material, planet) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    // Create planet-specific normal map patterns
    if (planet.name === 'Earth') {
        // Earth: Ocean and continent height variations
        createEarthNormalMap(context);
    } else if (planet.name === 'Mars') {
        // Mars: Canyon and crater patterns
        createMarsNormalMap(context);
    } else if (planet.name === 'Mercury') {
        // Mercury: Heavy crater patterns
        createMercuryNormalMap(context);
    } else if (planet.name === 'Venus') {
        // Venus: Smooth with atmospheric patterns
        createVenusNormalMap(context);
    } else {
        // Generic rocky/gas giant pattern
        createGenericNormalMap(context, planet);
    }

    const normalTexture = new THREE.CanvasTexture(canvas);
    normalTexture.wrapS = THREE.ClampToEdgeWrapping;
    normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    material.normalMap = normalTexture;
    material.normalScale = new THREE.Vector2(0.8, 0.8);
}

// Function to create bump map for surface elevation
function createBumpMap(baseTexture, material, planet) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // Create elevation patterns based on planet type
    const intensity = planet.name === 'Venus' ? 0.3 :
                     planet.name === 'Earth' ? 0.5 :
                     planet.name === 'Mars' ? 0.8 : 0.6;

    // Generate noise pattern for surface elevation
    const imageData = context.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * intensity * 255;
        data[i] = noise;     // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = 255;   // Alpha
    }

    context.putImageData(imageData, 0, 0);

    const bumpTexture = new THREE.CanvasTexture(canvas);
    material.bumpMap = bumpTexture;
    material.bumpScale = planet.name === 'Venus' ? 0.02 :
                        planet.name === 'Earth' ? 0.05 : 0.08;
}

// Enhanced material properties for realistic planets
function enhancePlanetMaterial(material, planet) {
    if (planet.name === 'Earth') {
        // Earth: Reflective oceans, varied surface
        material.shininess = 100;
        material.specular = new THREE.Color(0x222222);
        material.emissive = new THREE.Color(0x001122);
        material.emissiveIntensity = 0.02;
    } else if (planet.name === 'Venus') {
        // Venus: Highly reflective atmosphere
        material.shininess = 200;
        material.specular = new THREE.Color(0x444444);
        material.emissive = new THREE.Color(0x221100);
        material.emissiveIntensity = 0.05;
    } else if (planet.name === 'Mars') {
        // Mars: Dusty, matte surface
        material.shininess = 20;
        material.specular = new THREE.Color(0x110000);
        material.emissive = new THREE.Color(0x220000);
        material.emissiveIntensity = 0.01;
    } else if (planet.name === 'Jupiter' || planet.name === 'Saturn') {
        // Gas giants: Atmospheric glow
        material.shininess = 80;
        material.specular = new THREE.Color(0x222211);
        material.emissive = new THREE.Color(planet.fallbackColor).multiplyScalar(0.1);
        material.emissiveIntensity = 0.03;
    } else {
        // Other planets: Rocky appearance
        material.shininess = 30;
        material.specular = new THREE.Color(0x111111);
        material.emissive = new THREE.Color(planet.fallbackColor).multiplyScalar(0.05);
        material.emissiveIntensity = 0.01;
    }
}

// Create Earth-specific normal map
function createEarthNormalMap(context) {
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#8080ff');    // Ocean (blue normal)
    gradient.addColorStop(0.3, '#80ff80');  // Shallow water (green normal)
    gradient.addColorStop(0.6, '#ff8080');  // Land (red normal)
    gradient.addColorStop(1, '#8080c0');    // Mountains (purple normal)

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    // Add continent-like patterns
    for (let i = 0; i < 20; i++) {
        context.fillStyle = `rgba(${128 + Math.random() * 127}, 80, 80, 0.3)`;
        context.beginPath();
        context.arc(Math.random() * 512, Math.random() * 512, Math.random() * 50 + 20, 0, Math.PI * 2);
        context.fill();
    }
}

// Create Mars-specific normal map
function createMarsNormalMap(context) {
    context.fillStyle = '#ff8080';
    context.fillRect(0, 0, 512, 512);

    // Add canyon patterns
    for (let i = 0; i < 15; i++) {
        context.strokeStyle = `rgba(${100 + Math.random() * 50}, 40, 40, 0.6)`;
        context.lineWidth = Math.random() * 10 + 2;
        context.beginPath();
        context.moveTo(Math.random() * 512, Math.random() * 512);
        context.lineTo(Math.random() * 512, Math.random() * 512);
        context.stroke();
    }

    // Add crater patterns
    for (let i = 0; i < 30; i++) {
        context.fillStyle = `rgba(${80 + Math.random() * 40}, 60, 60, 0.4)`;
        context.beginPath();
        context.arc(Math.random() * 512, Math.random() * 512, Math.random() * 15 + 5, 0, Math.PI * 2);
        context.fill();
    }
}

// Create Mercury-specific normal map
function createMercuryNormalMap(context) {
    context.fillStyle = '#808080';
    context.fillRect(0, 0, 512, 512);

    // Heavy crater patterns for Mercury
    for (let i = 0; i < 50; i++) {
        const size = Math.random() * 20 + 3;
        context.fillStyle = `rgba(${60 + Math.random() * 40}, ${60 + Math.random() * 40}, ${60 + Math.random() * 40}, 0.5)`;
        context.beginPath();
        context.arc(Math.random() * 512, Math.random() * 512, size, 0, Math.PI * 2);
        context.fill();

        // Crater rim
        context.strokeStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.3)`;
        context.lineWidth = 2;
        context.stroke();
    }
}

// Create Venus-specific normal map
function createVenusNormalMap(context) {
    context.fillStyle = '#ffff80';
    context.fillRect(0, 0, 512, 512);

    // Smooth atmospheric patterns
    for (let i = 0; i < 10; i++) {
        const gradient = context.createRadialGradient(
            Math.random() * 512, Math.random() * 512, 0,
            Math.random() * 512, Math.random() * 512, Math.random() * 100 + 50
        );
        gradient.addColorStop(0, `rgba(255, 255, 120, 0.2)`);
        gradient.addColorStop(1, `rgba(255, 200, 80, 0.1)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
    }
}

// Create generic normal map for other planets
function createGenericNormalMap(context, planet) {
    const baseColor = planet.fallbackColor;
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;

    context.fillStyle = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
    context.fillRect(0, 0, 512, 512);

    // Add surface variation
    for (let i = 0; i < 25; i++) {
        context.fillStyle = `rgba(${r + Math.random() * 50}, ${g + Math.random() * 50}, ${b + Math.random() * 50}, 0.3)`;
        context.beginPath();
        context.arc(Math.random() * 512, Math.random() * 512, Math.random() * 30 + 10, 0, Math.PI * 2);
        context.fill();
    }
}

// Create realistic 3D fallback when texture fails to load
function createRealistic3DFallback(material, planet, textureLoader) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    // Create planet-specific realistic texture
    if (planet.name === 'Earth') {
        createRealisticEarthTexture(context);
    } else if (planet.name === 'Mars') {
        createRealisticMarsTexture(context);
    } else if (planet.name === 'Venus') {
        createRealisticVenusTexture(context);
    } else if (planet.name === 'Jupiter') {
        createRealisticJupiterTexture(context);
    } else {
        createRealisticGenericTexture(context, planet);
    }

    const fallbackTexture = new THREE.CanvasTexture(canvas);
    material.map = fallbackTexture;

    // Create normal and bump maps for the fallback
    createNormalMap(fallbackTexture, material, planet);
    createBumpMap(fallbackTexture, material, planet);
    enhancePlanetMaterial(material, planet);

    material.needsUpdate = true;
}

// Create realistic Earth texture
function createRealisticEarthTexture(context) {
    // Ocean base
    const oceanGradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
    oceanGradient.addColorStop(0, '#4A90E2');
    oceanGradient.addColorStop(0.7, '#2E5BBA');
    oceanGradient.addColorStop(1, '#1E3A8A');
    context.fillStyle = oceanGradient;
    context.fillRect(0, 0, 1024, 1024);

    // Add continents
    for (let i = 0; i < 8; i++) {
        context.fillStyle = i % 2 === 0 ? '#7ED321' : '#8B4513';
        context.beginPath();
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const size = Math.random() * 150 + 100;
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    // Add clouds
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        context.beginPath();
        context.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 50 + 20, 0, Math.PI * 2);
        context.fill();
    }
}

// Create realistic Mars texture
function createRealisticMarsTexture(context) {
    // Red base
    const gradient = context.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#CD5C5C');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);

    // Add polar ice caps
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.beginPath();
    context.arc(512, 100, 80, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(512, 924, 60, 0, Math.PI * 2);
    context.fill();

    // Add surface features
    for (let i = 0; i < 30; i++) {
        context.fillStyle = `rgba(${139 + Math.random() * 50}, ${69 + Math.random() * 30}, ${19 + Math.random() * 20}, 0.6)`;
        context.beginPath();
        context.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 40 + 10, 0, Math.PI * 2);
        context.fill();
    }
}

// Create realistic Venus texture
function createRealisticVenusTexture(context) {
    // Thick atmosphere base
    const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, '#FFC649');
    gradient.addColorStop(0.5, '#FFB347');
    gradient.addColorStop(1, '#FF8C00');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);

    // Add atmospheric swirls
    for (let i = 0; i < 15; i++) {
        context.strokeStyle = `rgba(255, ${200 + Math.random() * 55}, ${100 + Math.random() * 50}, 0.4)`;
        context.lineWidth = Math.random() * 20 + 5;
        context.beginPath();
        const startX = Math.random() * 1024;
        const startY = Math.random() * 1024;
        context.moveTo(startX, startY);
        context.quadraticCurveTo(
            startX + Math.random() * 200 - 100,
            startY + Math.random() * 200 - 100,
            startX + Math.random() * 400 - 200,
            startY + Math.random() * 400 - 200
        );
        context.stroke();
    }
}

// Create realistic Jupiter texture
function createRealisticJupiterTexture(context) {
    // Gas giant bands
    for (let y = 0; y < 1024; y += 40) {
        const hue = Math.random() * 60 + 20; // Orange to brown hues
        context.fillStyle = `hsl(${hue}, 70%, ${40 + Math.random() * 30}%)`;
        context.fillRect(0, y, 1024, 40);
    }

    // Add the Great Red Spot
    context.fillStyle = '#CC4125';
    context.beginPath();
    context.ellipse(700, 400, 80, 50, 0, 0, Math.PI * 2);
    context.fill();

    // Add atmospheric turbulence
    for (let i = 0; i < 20; i++) {
        context.fillStyle = `rgba(${200 + Math.random() * 55}, ${150 + Math.random() * 50}, ${100 + Math.random() * 50}, 0.3)`;
        context.beginPath();
        context.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 30 + 10, 0, Math.PI * 2);
        context.fill();
    }
}

// Create realistic generic texture
function createRealisticGenericTexture(context, planet) {
    const baseColor = planet.fallbackColor;
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;

    // Create varied surface
    const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`);
    gradient.addColorStop(0.5, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);

    // Add surface features
    for (let i = 0; i < 25; i++) {
        context.fillStyle = `rgba(${r + Math.random() * 60 - 30}, ${g + Math.random() * 60 - 30}, ${b + Math.random() * 60 - 30}, 0.5)`;
        context.beginPath();
        context.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 50 + 20, 0, Math.PI * 2);
        context.fill();
    }
}

// Function to create the sun
function createSun(scene, textureLoader) {
    const sunGeometry = new THREE.SphereGeometry(4.5, 64, 64); // Higher quality sphere

    // Create realistic sun material with enhanced properties
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xFDB813,  // More realistic sun color
        emissive: 0xFDB813,
        emissiveIntensity: 0.8
    });

    // Load your local high-quality sun texture
    textureLoader.load(
        'textures/sun.jpg',
        function(texture) {
            // Success callback - enhance texture properties
            texture.anisotropy = 16;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            sunMaterial.map = texture;
            sunMaterial.needsUpdate = true;
            console.log('✓ Loaded high-quality local sun texture');
        },
        function(progress) {
            // Progress callback
            if (progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`Loading Sun texture: ${percent}%`);
            }
        },
        function(error) {
            console.log('⚠ Creating fallback sun texture with enhanced realism');
            // Create a more realistic procedural sun texture
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const context = canvas.getContext('2d');

            // Create realistic sun gradient with multiple layers
            const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
            gradient.addColorStop(0, '#ffffff');    // White hot center
            gradient.addColorStop(0.1, '#ffff88');  // Bright yellow
            gradient.addColorStop(0.3, '#ffaa00');  // Orange
            gradient.addColorStop(0.6, '#ff6600');  // Deep orange
            gradient.addColorStop(0.8, '#cc3300');  // Red
            gradient.addColorStop(1, '#990000');    // Dark red edge

            context.fillStyle = gradient;
            context.fillRect(0, 0, 1024, 1024);

            // Add solar flare texture
            const imageData = context.getImageData(0, 0, 1024, 1024);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 40;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
            }
            context.putImageData(imageData, 0, 0);

            const fallbackTexture = new THREE.CanvasTexture(canvas);
            sunMaterial.map = fallbackTexture;
            sunMaterial.needsUpdate = true;
        }
    );

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = false; // Sun doesn't cast shadows, it creates light
    sun.receiveShadow = false;
    scene.add(sun);

    // Enhanced sun lighting - multiple lights for better planet illumination
    const sunLight1 = new THREE.PointLight(0xFDB813, 1.5, 200);
    sunLight1.position.set(0, 0, 0);
    scene.add(sunLight1);

    const sunLight2 = new THREE.PointLight(0xFFFFFF, 0.8, 300);
    sunLight2.position.set(0, 0, 0);
    scene.add(sunLight2);

    // Enhanced glow effect with multiple layers
    const sunGlowGeometry1 = new THREE.SphereGeometry(5.2, 32, 32);
    const sunGlowMaterial1 = new THREE.MeshBasicMaterial({
        color: 0xFDB813,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const sunGlow1 = new THREE.Mesh(sunGlowGeometry1, sunGlowMaterial1);
    scene.add(sunGlow1);

    const sunGlowGeometry2 = new THREE.SphereGeometry(6.0, 32, 32);
    const sunGlowMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xFF8C00,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const sunGlow2 = new THREE.Mesh(sunGlowGeometry2, sunGlowMaterial2);
    scene.add(sunGlow2);

    return { sun, sunLight1, sunLight2, sunGlow1, sunGlow2 };
}

// Function to create enhanced stars background
function createStars(scene) {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    const starsColors = [];

    // Create varied stars with different colors and sizes
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);

        // Add some color variation to stars
        const starType = Math.random();
        if (starType < 0.7) {
            // White stars (most common)
            starsColors.push(1, 1, 1);
        } else if (starType < 0.85) {
            // Blue-white stars
            starsColors.push(0.8, 0.9, 1);
        } else if (starType < 0.95) {
            // Yellow stars
            starsColors.push(1, 1, 0.8);
        } else {
            // Red stars
            starsColors.push(1, 0.8, 0.7);
        }
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    console.log('Created enhanced starfield with 15,000 stars');
    return stars;
}