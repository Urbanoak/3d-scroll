// LENIS Scroll + ScrollTrigger
const lenis = new Lenis({
  smoothTouch: true, // Enable smooth scrolling on touch devices
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// THREE.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
scene.add(hemiLight);

// Initial Render Loop (stopped after model loads)
let basicAnimateId;
function basicAnimate() {
  renderer.render(scene, camera);
  basicAnimateId = requestAnimationFrame(basicAnimate);
}
basicAnimate();

// Load GLTF Model
let model;
const loader = new THREE.GLTFLoader();
loader.load("black_chair.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.color.set("#FFFFF0");
      node.material.metalness = 0.4;
      node.material.roughness = 1;
      node.material.envMapIntensity = 2;
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  updateCameraPosition(); // Adjust camera for initial load

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  cancelAnimationFrame(basicAnimateId);
  animate();
});

// Initial Scale Animation
function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
}

// Scroll Tracking
let currentScroll = 0;
let totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
const floatAmplitude = 0.2;
const floatSpeed = 1.5;
let lastScroll = 0;
let autoRotate = true;

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
  if (Math.abs(e.scroll - lastScroll) > 5) {
    autoRotate = false;
    setTimeout(() => (autoRotate = true), 2000);
  }
  lastScroll = e.scroll;
});

// Mouse and Touch Drag Controls
let isDragging = false;
let previousX = 0;
let previousY = 0;
let rotationY = 0;
let rotationX = 0;

// Mouse Events
document.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (event) => {
  if (!isDragging || !model) return;

  let deltaX = (event.clientX - previousX) * 0.005;
  let deltaY = (event.clientY - previousY) * 0.005;

  rotationY += deltaX;
  rotationX += deltaY;

  model.rotation.y = rotationY;
  model.rotation.x = rotationX;

  previousX = event.clientX;
  previousY = event.clientY;
});

// Touch Events for Mobile
document.addEventListener("touchstart", (event) => {
  isDragging = true;
  previousX = event.touches[0].clientX;
  previousY = event.touches[0].clientY;
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

document.addEventListener("touchmove", (event) => {
  if (!isDragging || !model) return;

  let deltaX = (event.touches[0].clientX - previousX) * 0.003; // Reduced sensitivity for touch
  let deltaY = (event.touches[0].clientY - previousY) * 0.003;

  rotationY += deltaX;
  rotationX += deltaY;

  model.rotation.y = rotationY;
  model.rotation.x = rotationX;

  previousX = event.touches[0].clientX;
  previousY = event.touches[0].clientY;
});

// Main Animate Loop
function animate() {
  if (model) {
    const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
    model.position.y = floatOffset;

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    if (!isDragging) {
      model.rotation.x = scrollProgress * Math.PI * 4 + 0.5;
      if (autoRotate) {
        model.rotation.y += 0.003;
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Outro Text Animation
const splitText = new SplitType(".outro-copy h2", {
  types: "lines",
  lineClass: "line",
});

splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top center",
  onEnter: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 70,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});

// Color Theme Switching
document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.style.backgroundColor = btn.getAttribute('data-bg');

  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const bgColor = btn.getAttribute('data-bg');
    const textColor = btn.getAttribute('data-color');

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;

    document.querySelectorAll('h1, h2, p, a').forEach(el => {
      el.style.color = textColor;
    });

    updateModelColor(textColor);
  });
});

// Function to update model color
function updateModelColor(color) {
  if (!model) return;
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.color.setStyle(color);
    }
  });
}

// Responsive Camera Adjustment
function updateCameraPosition() {
  if (!model) return;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Adjust camera distance based on screen size
  const isMobile = window.innerWidth < 768;
  const fov = isMobile ? 85 : 75; // Wider FOV for mobile
  camera.fov = fov;
  camera.position.set(0, isMobile ? 1.5 : 1, maxDim * (isMobile ? 1.5 : 1.75));
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

// Debounced Resize Handler
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight; // Recalculate scroll height
    updateCameraPosition(); // Adjust camera for new screen size
  }, 100); // Debounce delay
}

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize); // Handle mobile orientation changes

// Initial camera setup
updateCameraPosition();
