/* =============================================
   CLARITY LOOP — MAIN SCRIPT
   Three.js Neural Networks + All Interactions
   ============================================= */

'use strict';

/* =============================================
   CURSOR
   ============================================= */
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX = -100, mouseY = -100;
let trailX = -100, trailY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

/* =============================================
   NAVBAR SCROLL BEHAVIOR
   ============================================= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

/* ——— Hamburger ——— */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* =============================================
   SCROLL REVEAL
   ============================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-scroll-reveal]').forEach(el => revealObserver.observe(el));

/* =============================================
   TYPEWRITER ANIMATION
   ============================================= */
const queries = [
  'Explain networking simply',
  'Summarize this lecture',
  'Create exam questions',
  'What is the TCP/IP model?',
  'Simplify this paragraph',
  'Generate flashcards'
];

let qIndex = 0, charIndex = 0, deleting = false;
const typewriterEl = document.getElementById('typewriterText');

function typewrite() {
  if (!typewriterEl) return;
  const current = queries[qIndex];
  if (!deleting) {
    typewriterEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typewrite, 1800);
      return;
    }
  } else {
    typewriterEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      qIndex = (qIndex + 1) % queries.length;
    }
  }
  setTimeout(typewrite, deleting ? 45 : 80);
}
setTimeout(typewrite, 2000);

/* =============================================
   THREE.JS — HERO NEURAL NETWORK
   ============================================= */
(function initHeroCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.z = 28;

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const nodeCount = 90;
  const positions = [];
  for (let i = 0; i < nodeCount; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20
    ));
  }

  // Nodes
  const nodeGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
  const dummy = new THREE.Object3D();
  positions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
  });
  nodeMesh.instanceMatrix.needsUpdate = true;
  scene.add(nodeMesh);

  // Connections
  const lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.18 });
  const threshold = 12;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (positions[i].distanceTo(positions[j]) < threshold) {
        const geo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        scene.add(new THREE.Line(geo, lineMat));
      }
    }
  }

  // Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 80;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.12, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Points(pGeo, pMat));

  let t = 0;
  const nodePhases = positions.map(() => Math.random() * Math.PI * 2);

  // Mouse parallax
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  (function animate() {
    requestAnimationFrame(animate);
    t += 0.007;

    positions.forEach((p, i) => {
      const scale = 0.9 + 0.3 * Math.sin(t + nodePhases[i]);
      dummy.position.copy(p);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(i, dummy.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    nodeMat.color.setHSL(0.72 + 0.04 * Math.sin(t * 0.3), 0.9, 0.65);

    camera.position.x += (mx * 3 - camera.position.x) * 0.03;
    camera.position.y += (-my * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();
})();

/* =============================================
   THREE.JS — BRAIN VISUALIZATION
   ============================================= */
(function initBrainCanvas() {
  const canvas = document.getElementById('brainCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 1000);
  camera.position.z = 22;

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Brain-shaped node cluster
  const nodeCount = 140;
  const positions = [];
  for (let i = 0; i < nodeCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 6 + (Math.random() - 0.5) * 3;
    // Flatten into brain shape
    const x = r * Math.sin(phi) * Math.cos(theta) * 1.4;
    const y = r * Math.cos(phi) * 0.85 + Math.sin(theta * 2) * 1.2;
    const z = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions.push(new THREE.Vector3(x, y, z));
  }

  const nodeGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
  const dummy = new THREE.Object3D();
  positions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
  });
  nodeMesh.instanceMatrix.needsUpdate = true;
  scene.add(nodeMesh);

  // Connections
  const connMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.15 });
  const thresh = 5;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (positions[i].distanceTo(positions[j]) < thresh) {
        const g = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        scene.add(new THREE.Line(g, connMat));
      }
    }
  }

  let t = 0;
  const phases = positions.map(() => Math.random() * Math.PI * 2);
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  (function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    const scrollFactor = Math.min(scrollY / window.innerHeight, 1);

    positions.forEach((p, i) => {
      const activation = scrollFactor > 0.3 ? Math.abs(Math.sin(t * 2 + phases[i])) : 0.6;
      dummy.position.copy(p);
      dummy.scale.setScalar(0.7 + 0.6 * activation);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(i, dummy.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;

    const hue = 0.72 + 0.06 * scrollFactor;
    nodeMat.color.setHSL(hue, 0.9, 0.6 + 0.15 * scrollFactor);

    scene.rotation.y = t * 0.1 + scrollFactor * 0.5;
    renderer.render(scene, camera);
  })();
})();

/* =============================================
   THREE.JS — MINI NEURAL (SCENE 2)
   ============================================= */
(function initMiniCanvas() {
  const canvas = document.getElementById('miniNeuralCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const w = canvas.offsetWidth || 400, h = canvas.offsetHeight || 220;
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.z = 12;
  renderer.setSize(w, h, false);

  const nodeGeo = new THREE.SphereGeometry(0.2, 6, 6);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const layers = [3, 5, 5, 3];
  const nodePositions = [];

  layers.forEach((count, li) => {
    for (let n = 0; n < count; n++) {
      const x = (li - 1.5) * 3.5;
      const y = (n - (count - 1) / 2) * 1.8;
      const pos = new THREE.Vector3(x, y, 0);
      nodePositions.push(pos);
      const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
      mesh.position.copy(pos);
      scene.add(mesh);
    }
  });

  // Connect layers
  const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2 });
  let offset = 0;
  for (let li = 0; li < layers.length - 1; li++) {
    const thisLayer = nodePositions.slice(offset, offset + layers[li]);
    const nextLayer = nodePositions.slice(offset + layers[li], offset + layers[li] + layers[li + 1]);
    thisLayer.forEach(a => {
      nextLayer.forEach(b => {
        const g = new THREE.BufferGeometry().setFromPoints([a, b]);
        scene.add(new THREE.Line(g, lineMat));
      });
    });
    offset += layers[li];
  }

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.02;
    scene.rotation.y = Math.sin(t * 0.3) * 0.3;
    renderer.render(scene, camera);
  })();
})();

/* =============================================
   THREE.JS — KNOWLEDGE GALAXY
   ============================================= */
(function initGalaxy() {
  const canvas = document.getElementById('galaxyCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const tooltip = document.getElementById('galaxyTooltip');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 2, 0.1, 1000);
  camera.position.z = 30;

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const topics = [
    { name: 'Networking', desc: 'Data communication between devices', x: 0, y: 0, z: 0, color: 0x8b5cf6, size: 0.7 },
    { name: 'DNS', desc: 'Domain name resolution system', x: 4, y: 2, z: 1, color: 0xa78bfa, size: 0.4 },
    { name: 'TCP/IP', desc: 'Core internet protocol suite', x: -4, y: 2, z: -1, color: 0x7c3aed, size: 0.45 },
    { name: 'Routing', desc: 'Path selection in networks', x: 2, y: -3, z: 2, color: 0x9f7aea, size: 0.4 },
    { name: 'Security', desc: 'Protecting networked systems', x: -2, y: -3, z: -2, color: 0x22d3ee, size: 0.5 },
    { name: 'AI / ML', desc: 'Machine learning algorithms', x: 10, y: 1, z: 3, color: 0x06b6d4, size: 0.65 },
    { name: 'Neural Nets', desc: 'Deep learning architectures', x: 13, y: 4, z: 1, color: 0x22d3ee, size: 0.38 },
    { name: 'Python', desc: 'Programming for data science', x: 13, y: -2, z: -1, color: 0x0ea5e9, size: 0.4 },
    { name: 'Mathematics', desc: 'Foundations of computation', x: -10, y: 0, z: -2, color: 0xf59e0b, size: 0.6 },
    { name: 'Calculus', desc: 'Continuous change analysis', x: -13, y: 3, z: 1, color: 0xfbbf24, size: 0.35 },
    { name: 'Linear Algebra', desc: 'Vectors and transformations', x: -13, y: -3, z: -1, color: 0xf59e0b, size: 0.35 },
    { name: 'Cybersecurity', desc: 'Digital threat defense', x: 0, y: -8, z: 3, color: 0xef4444, size: 0.55 },
    { name: 'Encryption', desc: 'Securing data transmission', x: -3, y: -11, z: 1, color: 0xf87171, size: 0.38 },
    { name: 'Firewalls', desc: 'Network access control', x: 3, y: -11, z: -1, color: 0xef4444, size: 0.38 },
  ];

  const meshes = [];

  topics.forEach(topic => {
    const geo = new THREE.SphereGeometry(topic.size, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: topic.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(topic.x, topic.y, topic.z);
    mesh.userData = topic;
    scene.add(mesh);
    meshes.push(mesh);

    // Glow ring
    const ringGeo = new THREE.RingGeometry(topic.size + 0.15, topic.size + 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: topic.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(mesh.position);
    scene.add(ring);
  });

  // Connections between related topics
  const connections = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4],[5,6],[5,7],[8,9],[8,10],[11,12],[11,13],[4,11],[5,8]];
  connections.forEach(([a, b]) => {
    const mat = new THREE.LineBasicMaterial({
      color: topics[a].color,
      transparent: true,
      opacity: 0.12
    });
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(topics[a].x, topics[a].y, topics[a].z),
      new THREE.Vector3(topics[b].x, topics[b].y, topics[b].z)
    ]);
    scene.add(new THREE.Line(geo, mat));
  });

  // Stars background
  const starsGeo = new THREE.BufferGeometry();
  const starsPos = new Float32Array(800 * 3);
  for (let i = 0; i < 800 * 3; i++) starsPos[i] = (Math.random() - 0.5) * 200;
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.08, transparent: true, opacity: 0.3 });
  scene.add(new THREE.Points(starsGeo, starsMat));

  // Raycaster for hover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-10, -10);
  let hoveredMesh = null;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    tooltipMouseX = e.clientX;
    tooltipMouseY = e.clientY;
  });

  let tooltipMouseX = 0, tooltipMouseY = 0;

  // Mouse parallax
  let gMx = 0, gMy = 0;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    gMx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    gMy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    scene.rotation.y = t * 0.15 + gMx * 0.3;
    scene.rotation.x = gMy * 0.15;

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit !== hoveredMesh) {
        if (hoveredMesh) hoveredMesh.scale.setScalar(1);
        hoveredMesh = hit;
        hit.scale.setScalar(1.4);
      }
      const data = hit.userData;
      tooltip.querySelector('.tooltip-title').textContent = data.name;
      tooltip.querySelector('.tooltip-desc').textContent = data.desc;
      tooltip.style.left = (tooltipMouseX + 16) + 'px';
      tooltip.style.top = (tooltipMouseY - 40) + 'px';
      tooltip.classList.add('visible');
    } else {
      if (hoveredMesh) { hoveredMesh.scale.setScalar(1); hoveredMesh = null; }
      tooltip.classList.remove('visible');
    }

    renderer.render(scene, camera);
  })();
})();

/* =============================================
   THREE.JS — VISION CANVAS (BACKGROUND)
   ============================================= */
(function initVisionCanvas() {
  const canvas = document.getElementById('visionCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 500);
  camera.position.z = 20;

  function resize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Abstract neural patterns
  const nodeCount = 50;
  const positions = [];
  for (let i = 0; i < nodeCount; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 10
    ));
  }

  const nodeGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
  const dummy = new THREE.Object3D();
  positions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
  });
  nodeMesh.instanceMatrix.needsUpdate = true;
  scene.add(nodeMesh);

  const lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.08 });
  const thresh = 14;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (positions[i].distanceTo(positions[j]) < thresh) {
        const g = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        scene.add(new THREE.Line(g, lineMat));
      }
    }
  }

  let t = 0;
  const phases = positions.map(() => Math.random() * Math.PI * 2);

  (function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    scene.rotation.z = t * 0.02;
    positions.forEach((p, i) => {
      const s = 0.8 + 0.4 * Math.abs(Math.sin(t + phases[i]));
      dummy.position.copy(p);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(i, dummy.matrix);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  })();
})();

/* =============================================
   CINEMATIC SCROLL SCENES
   ============================================= */
(function initCinematic() {
  const section = document.querySelector('.cinematic-section');
  if (!section) return;

  const scenes = [
    document.getElementById('scene1'),
    document.getElementById('scene2'),
    document.getElementById('scene3'),
    document.getElementById('scene4')
  ].filter(Boolean);

  const progressItems = document.querySelectorAll('.progress-item');

  function activateScene(index) {
    scenes.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    progressItems.forEach((p, i) => {
      p.classList.toggle('active', i === index);
    });
  }

  // Mobile: just show all scenes stacked
  if (window.innerWidth <= 600) {
    scenes.forEach(s => s.classList.add('active'));
    return;
  }

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sectionTop = -rect.top;
    const sectionHeight = section.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, sectionTop / sectionHeight));

    const sceneIndex = Math.min(Math.floor(progress * scenes.length), scenes.length - 1);
    activateScene(sceneIndex);
  }, { passive: true });

  // Click progress dots
  progressItems.forEach((p, i) => {
    p.addEventListener('click', () => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const targetScroll = sectionTop + (i / scenes.length) * sectionHeight;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });
})();

/* =============================================
   AI WORKSPACE — CHAT SIMULATION
   ============================================= */
(function initWorkspaceChat() {
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const messages = document.getElementById('chatMessages');
  const typingMsg = document.getElementById('typingMsg');

  const responses = [
    "DNS stands for Domain Name System. Think of it as a phonebook — you look up a name (like google.com) and get a number (IP address) back.",
    "Great question! The TCP/IP model has 4 layers: Application, Transport, Internet, and Network Access. Each handles a different part of communication.",
    "Encryption transforms readable data into coded text using mathematical algorithms. Only someone with the correct key can decode it.",
    "A firewall monitors and controls network traffic based on security rules — like a security guard at a building entrance.",
    "I've analyzed your question. Let me break this down into the simplest possible explanation..."
  ];

  let rIndex = 0;

  function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `chat-msg ${isUser ? 'user-msg' : 'ai-msg'}`;
    if (!isUser) {
      div.innerHTML = `<div class="msg-avatar">◎</div><div class="msg-bubble">${text}</div>`;
    } else {
      div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    }
    messages.insertBefore(div, typingMsg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, true);
    input.value = '';

    typingMsg.style.display = 'flex';
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typingMsg.style.display = 'none';
      addMessage(responses[rIndex % responses.length], false);
      rIndex++;
    }, 1800);
  }

  if (send) send.addEventListener('click', sendMessage);
  if (input) input.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
})();

/* =============================================
   BOOKING MODAL SYSTEM
   ============================================= */
(function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');

  // Triggers
  const triggers = ['openModal', 'openModalChip', 'openModalHero', 'openModalVision'];
  triggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openModal);
  });

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showStep(1);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Reset state
    setTimeout(resetModal, 400);
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function showStep(n) {
    ['step1','step2','step3','stepConfirm'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById('step' + n).classList.remove('hidden');
  }

  // ——— Step 1: Service Selection ———
  let selectedService = null;
  const step1Next = document.getElementById('step1Next');

  document.querySelectorAll('.service-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedService = opt.dataset.service;
      step1Next.disabled = false;
      step1Next.style.opacity = '1';
    });
  });

  step1Next.addEventListener('click', () => {
    if (!selectedService) return;
    showStep(2);
    buildCalendar();
  });

  // ——— Step 2: Calendar ———
  let selectedDate = null;
  const step2Next = document.getElementById('step2Next');

  function buildCalendar() {
    const cal = document.getElementById('calendar');
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    cal.innerHTML = `
      <div class="calendar-header">
        <span>${monthNames[month]} ${year}</span>
      </div>
      <div class="calendar-grid">
        ${dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
        ${Array(firstDay).fill('<div></div>').join('')}
        ${Array.from({length: daysInMonth}, (_, i) => {
          const day = i + 1;
          const isPast = day < now.getDate();
          const isToday = day === now.getDate();
          const classes = ['cal-day', isPast ? 'disabled' : '', isToday ? 'today' : ''].join(' ').trim();
          return `<div class="${classes}" data-day="${day}">${day}</div>`;
        }).join('')}
      </div>`;

    cal.querySelectorAll('.cal-day:not(.disabled)').forEach(d => {
      d.addEventListener('click', () => {
        cal.querySelectorAll('.cal-day').forEach(x => x.classList.remove('selected'));
        d.classList.add('selected');
        selectedDate = parseInt(d.dataset.day);
        step2Next.disabled = false;
        step2Next.style.opacity = '1';
      });
    });
  }

  document.getElementById('step2Back').addEventListener('click', () => showStep(1));
  step2Next.addEventListener('click', () => {
    if (!selectedDate) return;
    const now = new Date();
    document.getElementById('selectedDateLabel').textContent =
      `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(now.getFullYear(), now.getMonth(), selectedDate).getDay()]}, ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]} ${selectedDate}`;
    showStep(3);
  });

  // ——— Step 3: Time Slots ———
  let selectedTime = null;
  const step3Confirm = document.getElementById('step3Confirm');

  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.dataset.time;
      step3Confirm.disabled = false;
      step3Confirm.style.opacity = '1';
    });
  });

  document.getElementById('step3Back').addEventListener('click', () => showStep(2));

  step3Confirm.addEventListener('click', () => {
    if (!selectedTime) return;

    const serviceNames = { study: 'AI Study Session', concept: 'Concept Explanation', exam: 'Exam Preparation' };
    const now = new Date();
    const dateStr = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]} ${selectedDate}, ${now.getFullYear()}`;

    document.getElementById('confirmDetails').innerHTML = `
      <span><span>Service</span><strong>${serviceNames[selectedService]}</strong></span>
      <span><span>Date</span><strong>${dateStr}</strong></span>
      <span><span>Time</span><strong>${selectedTime}</strong></span>
    `;

    document.getElementById('stepConfirm').classList.remove('hidden');
    ['step1','step2','step3'].forEach(id => document.getElementById(id).classList.add('hidden'));
  });

  document.getElementById('modalDone').addEventListener('click', closeModal);

  function resetModal() {
    selectedService = null;
    selectedDate = null;
    selectedTime = null;

    step1Next.disabled = true;
    step2Next.disabled = true;
    step3Confirm.disabled = true;

    document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  }
})();

/* =============================================
   GLOW HOVER EFFECTS
   ============================================= */
document.querySelectorAll('.glass-card, .impact-card, .service-option').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.06), rgba(20,20,20,0.55) 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* =============================================
   UPLOAD ZONE DRAG FEEDBACK
   ============================================= */
(function initUpload() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  ['dragenter', 'dragover'].forEach(e => {
    zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.style.borderColor = 'rgba(139,92,246,0.6)';
      zone.style.background = 'rgba(139,92,246,0.08)';
    });
  });

  ['dragleave', 'drop'].forEach(e => {
    zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.style.borderColor = '';
      zone.style.background = '';
    });
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const icon = zone.querySelector('.upload-icon');
      const text = zone.querySelector('p');
      if (icon) icon.textContent = '✓';
      if (text) text.innerHTML = `<span style="color:#8b5cf6;font-weight:600">${files[0].name}</span> ready to analyze`;
    }
  });
})();

/* =============================================
   PARALLAX ON HERO TEXT
   ============================================= */
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.3;
    heroContent.style.transform = `translateY(${rate}px)`;
    heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
  }, { passive: true });
})();

/* =============================================
   ANIMATED GRADIENT BORDER (ACCENT CARDS)
   ============================================= */
(function initGradientBorders() {
  let angle = 0;
  const cards = document.querySelectorAll('.impact-card.featured');

  (function animate() {
    requestAnimationFrame(animate);
    angle = (angle + 0.5) % 360;
    cards.forEach(card => {
      card.style.borderImage = `linear-gradient(${angle}deg, rgba(139,92,246,0.6), rgba(34,211,238,0.3), rgba(139,92,246,0.6)) 1`;
    });
  })();
})();

/* =============================================
   SMOOTH SECTION TRANSITIONS ON NAV CLICK
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =============================================
   INTERSECTION OBSERVER FOR CANVAS LAZY INIT
   ============================================= */
// Observe canvas sections and trigger a resize/render when visible
const canvasObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      window.dispatchEvent(new Event('resize'));
    }
  });
}, { threshold: 0.1 });

['galaxyCanvas', 'brainCanvas', 'visionCanvas'].forEach(id => {
  const el = document.getElementById(id);
  if (el) canvasObserver.observe(el);
});

/* =============================================
   INIT COMPLETE
   ============================================= */
console.log('%c◎ Clarity Loop', 'font-size:20px;color:#8b5cf6;font-weight:bold;');
console.log('%cCinematic AI Learning Platform', 'color:#a78bfa;');
