import { TWEEN } from "https://unpkg.com/three@0.125.2/examples/jsm/libs/tween.module.min.js";

const lambdaURL = "https://klowln2vbpv2qlzkyirioteeeu0fucxh.lambda-url.us-east-1.on.aws/";
const THREE = window.THREE;
const SimplexNoiseCtor = window.SimplexNoise;

let scene;
let camera;
let renderer;
let particles;
let animationMixer;
let rotationGroup;
let textTween;
let boxTween;
let clock;
let revealLights = [];
let starGlowGroup;
let starPointLight;

const maxRange = 1000;
const minRange = maxRange / 2;
const textureSize = 64;
const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
const particleNum = isMobileViewport ? 2600 : 5200;

const state = {
    assetsReady: false,
    hasRevealed: false,
    revealLabel: "HO HO HO",
    requesterName: "Santa",
};

const refs = {};
const noise = new SimplexNoiseCtor();

function setStatus(message, status = "loading") {
    refs.statusText.textContent = message;
    refs.statusText.dataset.state = status;
}

function setGreeting(message) {
    refs.greetingText.textContent = message;
}

function setRevealEnabled(enabled) {
    refs.revealButton.disabled = !enabled;
}

async function callAwsLambdaFunction(data) {
    const response = await fetch(lambdaURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.text();
}

function safeJsonParse(value) {
    if (value == null) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        console.error("Failed to parse response JSON", error);
        return null;
    }
}

function drawRadialGradation(ctx, canvasRadius, canvasW, canvasH) {
    ctx.save();
    const gradient = ctx.createRadialGradient(
        canvasRadius,
        canvasRadius,
        0,
        canvasRadius,
        canvasRadius,
        canvasRadius
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
}

function getTexture() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = textureSize;
    canvas.height = textureSize;
    drawRadialGradation(ctx, textureSize / 2, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
}

function createGlowTexture(innerColor, outerColor) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 256;
    const center = size / 2;

    canvas.width = size;
    canvas.height = size;

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.4, outerColor);
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function onResize() {
    if (!renderer || !camera) {
        return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function render(timeStamp) {
    if (particles) {
        const posArr = particles.geometry.vertices;
        const velArr = particles.geometry.velocities;

        posArr.forEach((vertex, index) => {
            const velocity = velArr[index];
            const velX = Math.sin(timeStamp * 0.001 * velocity.x) * 0.1;
            const velZ = Math.cos(timeStamp * 0.0015 * velocity.z) * 0.1;

            vertex.x += velX;
            vertex.y += velocity.y;
            vertex.z += velZ;

            if (vertex.y < -minRange) {
                vertex.y = minRange;
            }
        });

        particles.geometry.verticesNeedUpdate = true;
    }

    if (starGlowGroup) {
        const pulse = 0.94 + Math.sin(timeStamp * 0.0032) * 0.06;
        starGlowGroup.scale.set(pulse, pulse * 1.03, pulse);

        starGlowGroup.children.forEach((child, index) => {
            if (child.material && typeof child.material.opacity === "number") {
                child.material.opacity = 0.12 + ((Math.sin(timeStamp * 0.0022 + index * 0.8) + 1) * 0.05);
            }
        });
    }

    renderer.render(scene, camera);
    TWEEN.update();

    if (animationMixer) {
        animationMixer.update(clock.getDelta());
    } else {
        clock.getDelta();
    }

    requestAnimationFrame(render);
}

function setupText(message) {
    const loader = new THREE.FontLoader();
    const normalizedMessage = String(message || "HO HO HO").toUpperCase();

    loader.load(
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/helvetiker_regular.typeface.json",
        (font) => {
            const geometry = new THREE.TextGeometry(normalizedMessage, {
                font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 3,
                bevelSegments: 5,
            });

            const frontMaterial = new THREE.MeshPhongMaterial({
                color: 0xff4b5c,
                emissive: 0x6e0714,
                emissiveIntensity: 0.18,
                shininess: 42,
                specular: 0x5a0a14,
            });
            const sideMaterial = new THREE.MeshPhongMaterial({
                color: 0x8f0f1f,
                emissive: 0x2c0209,
                emissiveIntensity: 0.08,
                shininess: 16,
                specular: 0x2b0309,
            });

            geometry.center();

            const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
            mesh.position.set(-5, 23, 80);
            mesh.scale.set(0.001, 0.0001, 0.0001);
            rotationGroup.add(mesh);

            textTween = new TWEEN.Tween(mesh.scale)
                .to({ x: 0.07, y: 0.07, z: 0.07 }, 800)
                .easing(TWEEN.Easing.Quintic.Out);
        },
        undefined,
        (error) => {
            console.error("Failed to load font", error);
            setStatus("The reveal loaded, but the final text animation is unavailable.", "error");
        }
    );
}

function createScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000036, 0, minRange * 3);
    clock = new THREE.Clock();

    rotationGroup = new THREE.Group();
    scene.add(rotationGroup);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-5, 40, 200);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setClearColor(new THREE.Color(0x000036), 0);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 1.72;
    renderer.shadowMap.enabled = true;
    refs.webglOutput.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xa9c8ff, 1.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xa9d8ff, 0x16345c, 1.55);
    hemiLight.position.set(0, 180, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff0da, 3.8);
    keyLight.position.set(85, 135, 145);
    keyLight.target.position.set(-5, 18, 20);
    keyLight.castShadow = true;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const fillLight = new THREE.DirectionalLight(0x8cd3ff, 2.7);
    fillLight.position.set(-120, 70, 115);
    fillLight.target.position.set(-10, 0, 10);
    scene.add(fillLight);
    scene.add(fillLight.target);

    const rimLight = new THREE.DirectionalLight(0x6aa8ff, 2.2);
    rimLight.position.set(0, 90, -140);
    rimLight.target.position.set(-5, 10, 40);
    scene.add(rimLight);
    scene.add(rimLight.target);

    starPointLight = new THREE.PointLight(0xffd77a, 2.8, 220, 2);
    starPointLight.position.set(-5, 82, 30);
    scene.add(starPointLight);

    const giftGlow = new THREE.PointLight(0xff6b6b, 1.5, 170, 2);
    giftGlow.position.set(-5, -12, 62);
    scene.add(giftGlow);

    revealLights = [ambientLight, hemiLight, keyLight, fillLight, rimLight, starPointLight, giftGlow];
    createStarShine();

    onResize();
    window.addEventListener("resize", onResize);
}

function enhanceModelMaterials(root) {
    root.traverse((child) => {
        if (!child.isMesh || !child.material) {
            return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
            material.needsUpdate = true;

            if ("roughness" in material && typeof material.roughness === "number") {
                material.roughness = Math.max(0.28, material.roughness * 0.78);
            }

            if ("metalness" in material && typeof material.metalness === "number") {
                material.metalness = Math.min(1, material.metalness * 1.08);
            }

            if ("envMapIntensity" in material && typeof material.envMapIntensity === "number") {
                material.envMapIntensity = Math.max(1.35, material.envMapIntensity * 1.6);
            }

            if ("emissiveIntensity" in material && typeof material.emissiveIntensity === "number") {
                material.emissiveIntensity = Math.max(0.14, material.emissiveIntensity);
            }
        });
    });
}

function createStarShine() {
    const haloTexture = createGlowTexture("rgba(255,244,201,0.95)", "rgba(255,191,71,0.25)");
    const beamTexture = createGlowTexture("rgba(255,232,164,0.52)", "rgba(255,181,67,0.02)");

    starGlowGroup = new THREE.Group();
    starGlowGroup.position.set(-5, 82, 30);

    const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: haloTexture,
            color: 0xffefc0,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.28,
        })
    );
    halo.scale.set(14, 14, 1);
    starGlowGroup.add(halo);

    const beamBase = {
        map: beamTexture,
        color: 0xffe2a6,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        opacity: 0.16,
    };

    const verticalBeam = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(5.2, 26),
        new THREE.MeshBasicMaterial(beamBase)
    );
    verticalBeam.position.y = -12;
    starGlowGroup.add(verticalBeam);

    const diagonalBeamA = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(4.2, 19),
        new THREE.MeshBasicMaterial(beamBase)
    );
    diagonalBeamA.position.y = -7;
    diagonalBeamA.rotation.z = Math.PI / 4;
    starGlowGroup.add(diagonalBeamA);

    const diagonalBeamB = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(4.2, 19),
        new THREE.MeshBasicMaterial(beamBase)
    );
    diagonalBeamB.position.y = -7;
    diagonalBeamB.rotation.z = -Math.PI / 4;
    starGlowGroup.add(diagonalBeamB);

    rotationGroup.add(starGlowGroup);
}

function alignStarEffectsToObject(root) {
    if (!root) {
        return;
    }

    root.updateMatrixWorld(true);
    let topMeshBounds = null;
    let topMeshScore = -Infinity;

    root.traverse((child) => {
        if (!child.isMesh) {
            return;
        }

        const meshBounds = new THREE.Box3().setFromObject(child);
        const meshSize = meshBounds.getSize(new THREE.Vector3());
        const meshCenter = meshBounds.getCenter(new THREE.Vector3());
        const score = meshBounds.max.y * 1000 - (meshSize.x + meshSize.y + meshSize.z);

        if (score > topMeshScore) {
            topMeshScore = score;
            topMeshBounds = {
                bounds: meshBounds,
                size: meshSize,
                center: meshCenter,
            };
        }
    });

    const fallbackBounds = new THREE.Box3().setFromObject(root);
    const target = topMeshBounds || {
        bounds: fallbackBounds,
        size: fallbackBounds.getSize(new THREE.Vector3()),
        center: fallbackBounds.getCenter(new THREE.Vector3()),
    };

    const anchor = new THREE.Vector3(
        target.center.x,
        target.bounds.min.y + target.size.y * 0.56,
        target.center.z
    );

    if (starGlowGroup) {
        starGlowGroup.position.copy(anchor);
    }

    if (starPointLight) {
        starPointLight.position.copy(anchor);
    }
}

function createSnowParticles() {
    const pointGeometry = new THREE.Geometry();

    for (let index = 0; index < particleNum; index += 1) {
        const particle = new THREE.Vector3(
            Math.floor(Math.random() * maxRange - minRange),
            Math.floor(Math.random() * maxRange - minRange),
            Math.floor(Math.random() * maxRange - minRange)
        );
        pointGeometry.vertices.push(particle);
    }

    const pointMaterial = new THREE.PointsMaterial({
        size: 4,
        color: 0xffffff,
        map: getTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        fog: true,
        depthWrite: false,
    });

    const velocities = [];
    for (let index = 0; index < particleNum; index += 1) {
        velocities.push(
            new THREE.Vector3(
                Math.floor(Math.random() * 6 - 3) * 0.1,
                Math.floor(Math.random() * 10 + 3) * -0.05,
                Math.floor(Math.random() * 6 - 3) * 0.1
            )
        );
    }

    particles = new THREE.Points(pointGeometry, pointMaterial);
    particles.geometry.velocities = velocities;
    rotationGroup.add(particles);
}

function loadModel(loader, url, onLoad) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (data) => {
                onLoad(data);
                resolve(data);
            },
            undefined,
            (error) => reject(error)
        );
    });
}

async function loadModelWithFallback(loader, urls, onLoad) {
    let lastError = null;

    for (const url of urls) {
        try {
            return await loadModel(loader, url, onLoad);
        } catch (error) {
            lastError = error;
            console.warn(`Failed to load model: ${url}`, error);
        }
    }

    throw lastError || new Error("Model loading failed.");
}

async function loadSceneAssets() {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = true;

    const hasDracoSupport =
        typeof THREE.DRACOLoader === "function" &&
        typeof loader.setDRACOLoader === "function";
    let useDracoAssets = false;

    if (hasDracoSupport) {
        try {
            const dracoLoader = new THREE.DRACOLoader();
            const decoderPath = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

            if (typeof dracoLoader.setDecoderPath === "function") {
                dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
                loader.setDRACOLoader(dracoLoader);
                useDracoAssets = true;
            } else if (typeof THREE.DRACOLoader.setDecoderPath === "function") {
                THREE.DRACOLoader.setDecoderPath(decoderPath);
                if (typeof THREE.DRACOLoader.setDecoderConfig === "function") {
                    THREE.DRACOLoader.setDecoderConfig({ type: "wasm" });
                }
                loader.setDRACOLoader(dracoLoader);
                useDracoAssets = true;
            } else if ("decoderPath" in THREE.DRACOLoader) {
                THREE.DRACOLoader.decoderPath = decoderPath;
                loader.setDRACOLoader(dracoLoader);
                useDracoAssets = true;
            } else {
                console.warn("DRACOLoader is present but uses an unknown setup API; falling back to standard GLB files.");
            }
        } catch (error) {
            console.warn("Failed to initialize DRACO decoder; falling back to standard GLB files.", error);
        }
    }

    const loadAndPlayAudio = (url, volume) => {
        audioLoader.load(url, (buffer) => {
            sound.setBuffer(buffer);
            sound.setVolume(volume);
            sound.play();
        });
    };

    const snowglobeSources = useDracoAssets
        ? ["animated_snowglobe.final.glb", "animated_snowglobe.glb"]
        : ["animated_snowglobe.glb"];
    const giftSources = useDracoAssets
        ? ["gift.final.glb", "gift.glb"]
        : ["gift.glb"];

    await Promise.all([
        loadModelWithFallback(loader, snowglobeSources, (data) => {
            const object = data.scene;
            object.scale.set(2, 2, 2);
            object.rotation.set(0, 60, 0);
            enhanceModelMaterials(object);
            rotationGroup.add(object);
            alignStarEffectsToObject(object);
        }),
        loadModelWithFallback(loader, giftSources, (data) => {
            const object = data.scene;
            object.scale.set(3, 3, 3);
            object.position.set(-5, -15, 56);
            object.rotation.set(0.3, 0, 0);
            enhanceModelMaterials(object);
            rotationGroup.add(object);

            animationMixer = new THREE.AnimationMixer(object);

            if (data.animations && data.animations[0]) {
                const action = animationMixer.clipAction(data.animations[0]);
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;

                boxTween = new TWEEN.Tween(object.scale)
                    .to({ x: 10, y: 10, z: 10 }, 1000)
                    .easing(TWEEN.Easing.Quintic.Out)
                    .onComplete(() => {
                        action.play();
                        loadAndPlayAudio("audios/Hohoho.mp3", 0.8);
                    });
            }
        }),
    ]);

    const numspins = 10;
    const startRotation = 0;
    const endRotation = numspins * 360 * (Math.PI / 180);
    const duration = 7100;

    const rotationTween = new TWEEN.Tween(rotationGroup.rotation)
        .to({ x: 0, y: endRotation, z: 0 }, duration)
        .easing(TWEEN.Easing.Quintic.InOut);

    refs.revealButton.addEventListener("click", () => {
        if (state.hasRevealed || !state.assetsReady) {
            return;
        }

        state.hasRevealed = true;
        refs.revealButton.classList.add("is-hidden");
        setStatus("Opening the gift...", "ready");

        rotationTween.stop();
        rotationTween.start();
        loadAndPlayAudio("audios/Reveal.mp3", 0.5);

        window.setTimeout(() => {
            if (boxTween) {
                boxTween.stop();
                boxTween.start();
            }
        }, 5500);

        window.setTimeout(() => {
            if (textTween) {
                textTween.stop();
                textTween.start();
            }
            setStatus("Your Secret Santa reveal is complete.", "ready");
        }, 7100);
    });
}

async function loadAssignment() {
    const searchParams = new URLSearchParams(window.location.search);
    const inviteId = searchParams.get("id");

    if (!inviteId) {
        setGreeting("Merry Christmas");
        setupText(state.revealLabel);
        setStatus("Invite link missing. You can still enjoy the festive reveal.", "error");
        return;
    }

    try {
        const rawResponse = await callAwsLambdaFunction({
            operation: "map_giftee",
            name: inviteId,
        });

        const response = safeJsonParse(rawResponse);
        const gifteeName = response?.giftee?.name || response?.name || "HO HO HO";
        const requesterName = response?.requester?.name || "Santa";

        state.revealLabel = gifteeName;
        state.requesterName = requesterName;

        setGreeting(`Merry Christmas ${requesterName} ❄`);
        setupText(gifteeName);
        setStatus("Your gift is ready. Tap the button when you are.", "ready");
    } catch (error) {
        console.error("Failed to resolve invite", error);
        setupText(state.revealLabel);
        setStatus("We couldn't load your invite details, but the reveal scene is still ready.", "error");
    }
}

async function init() {
    refs.webglOutput = document.getElementById("WebGL-output");
    refs.greetingText = document.getElementById("greeting_text");
    refs.statusText = document.getElementById("status_text");
    refs.revealButton = document.getElementById("reveal_btn");

    if (!THREE || !SimplexNoiseCtor) {
        setStatus("The 3D scene did not load correctly. Please refresh the page.", "error");
        return;
    }

    createScene();
    createSnowParticles();
    const assignmentPromise = loadAssignment();

    try {
        await loadSceneAssets();
        state.assetsReady = true;
        setRevealEnabled(true);
        requestAnimationFrame(render);
    } catch (error) {
        console.error("Failed to load 3D assets", error);
        setStatus("Some 3D assets failed to load. Please refresh and try again.", "error");
    }

    await assignmentPromise;
}

window.addEventListener("DOMContentLoaded", () => {
    init();
});
