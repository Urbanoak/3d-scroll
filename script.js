// LENIS Scroll + ScrollTrigger
const lenis = new Lenis();
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
renderer.setPixelRatio(window.devicePixelRatio);
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

// Initial Render
function basicAnimate() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimate);
}
basicAnimate();

// Load GLTF Model
let model;
const loader = new THREE.GLTFLoader();
loader.load("/models/black_chair.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.color.set("#05172F");
      node.material.metalness = 0.3;
      node.material.roughness = 0.8;
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
  camera.position.z = maxDim * 1.75;

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  cancelAnimationFrame(basicAnimate);
  animate();
});

// Scroll tracking
let currentScroll = 0;
const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
const floatAmplitude = 0.2;
const floatSpeed = 1.5;

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

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

// Mouse Control
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationY = 0;
let rotationX = 0;

document.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (event) => {
  if (!isDragging || !model) return;

  let deltaX = (event.clientX - previousMouseX) * 0.005;
  let deltaY = (event.clientY - previousMouseY) * 0.005;

  rotationY += deltaX;
  rotationX += deltaY;

  model.rotation.y = rotationY;
  model.rotation.x = rotationX;

  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
});

// Animate Function
function animate() {
  if (model) {
    const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
    model.position.y = floatOffset;

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    if (!isDragging) {
      model.rotation.x = scrollProgress * Math.PI * 4 + 0.5;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Outro text animation
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

// 🎨 Color Palette Logic
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
  });
});
