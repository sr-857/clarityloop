/* ============================================================
   CLARITY LOOP — script.js
   Production-ready · No runtime errors · Full feature set
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     WAIT FOR THREE.JS + DOM
  ────────────────────────────────────────────────────────── */
  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function waitForThree(fn, attempts) {
    attempts = attempts || 0;
    if (typeof THREE !== 'undefined') {
      fn();
    } else if (attempts < 50) {
      setTimeout(function () { waitForThree(fn, attempts + 1); }, 100);
    }
  }

  /* ──────────────────────────────────────────────────────────
     1. CURSOR
  ────────────────────────────────────────────────────────── */
  function initCursor() {
    var dot  = document.getElementById('cl-cursor');
    var ring = document.getElementById('cl-cursor-ring');
    if (!dot || !ring) return;

    var mx = -200, my = -200, rx = -200, ry = -200;
    var bigTargets = 'a, button, [role="button"], label, .chip';

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
    });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(bigTargets)) {
        dot.style.width    = '18px';
        dot.style.height   = '18px';
        dot.style.background = 'var(--accent-lt)';
        ring.style.width  = '48px';
        ring.style.height = '48px';
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(bigTargets)) {
        dot.style.width    = '10px';
        dot.style.height   = '10px';
        dot.style.background = 'var(--accent)';
        ring.style.width  = '34px';
        ring.style.height = '34px';
      }
    });

    (function trail() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(trail);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     2. NAVBAR SCROLL + HAMBURGER
  ────────────────────────────────────────────────────────── */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var burger  = document.getElementById('hamburger');
    var pill    = document.getElementById('navPill');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) navbar.classList.add('nav-scrolled');
      else                      navbar.classList.remove('nav-scrolled');
    }, { passive: true });

    if (burger && pill) {
      burger.addEventListener('click', function () {
        var open = pill.classList.toggle('nav-open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      pill.querySelectorAll('.nav-link').forEach(function (l) {
        l.addEventListener('click', function () {
          pill.classList.remove('nav-open');
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     3. SCROLL REVEAL
  ────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    var els = document.querySelectorAll('[data-sr]');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('sr-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.1 + 's';
      io.observe(el);
    });
  }

  /* ──────────────────────────────────────────────────────────
     4. TYPEWRITER
  ────────────────────────────────────────────────────────── */
  function initTypewriter() {
    var el = document.getElementById('typewriter-el');
    if (!el) return;

    var queries = [
      'Explain networking simply',
      'Summarize this lecture',
      'Create exam questions',
      'What is the TCP/IP model?',
      'Simplify this concept',
      'Generate flashcards'
    ];

    var qi = 0, ci = 0, del = false;

    function tick() {
      var cur = queries[qi];
      if (!del) {
        el.textContent = cur.slice(0, ++ci);
        if (ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
      } else {
        el.textContent = cur.slice(0, --ci);
        if (ci === 0) { del = false; qi = (qi + 1) % queries.length; }
      }
      setTimeout(tick, del ? 44 : 78);
    }

    setTimeout(tick, 2200);
  }

  /* ──────────────────────────────────────────────────────────
     HELPER — build a Three.js renderer bound to a canvas
     Returns { renderer, scene, camera } or null on failure
  ────────────────────────────────────────────────────────── */
  function buildRenderer(canvasId, fov) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    var scene  = new THREE.Scene();
    var aspect = canvas.clientWidth / (canvas.clientHeight || 1);
    var camera = new THREE.PerspectiveCamera(fov || 60, aspect, 0.1, 1000);

    function resize() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight || 400;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    return { renderer: renderer, scene: scene, camera: camera, canvas: canvas, resize: resize };
  }

  /* ──────────────────────────────────────────────────────────
     5. THREE.JS — HERO NEURAL NETWORK
  ────────────────────────────────────────────────────────── */
  function initHeroCanvas() {
    var r = buildRenderer('canvas-hero', 60);
    if (!r) return;
    r.camera.position.z = 28;

    var COUNT = 80;
    var positions = [];
    for (var i = 0; i < COUNT; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 38,
        (Math.random() - 0.5) * 18
      ));
    }

    // Instanced nodes
    var nodeGeo = new THREE.SphereGeometry(0.2, 7, 7);
    var nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    var nodes   = new THREE.InstancedMesh(nodeGeo, nodeMat, COUNT);
    var dummy   = new THREE.Object3D();
    positions.forEach(function (p, i) {
      dummy.position.copy(p);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
    r.scene.add(nodes);

    // Connections
    var lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.16 });
    var thresh  = 13;
    for (var a = 0; a < COUNT; a++) {
      for (var b = a + 1; b < COUNT; b++) {
        if (positions[a].distanceTo(positions[b]) < thresh) {
          var g = new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]);
          r.scene.add(new THREE.Line(g, lineMat));
        }
      }
    }

    // Particles
    var pCount = 180;
    var pPos   = new Float32Array(pCount * 3);
    for (var k = 0; k < pCount * 3; k++) pPos[k] = (Math.random() - 0.5) * 90;
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.12, transparent: true, opacity: 0.38 });
    r.scene.add(new THREE.Points(pGeo, pMat));

    var phases = positions.map(function () { return Math.random() * Math.PI * 2; });
    var t = 0, tmx = 0, tmy = 0;

    document.addEventListener('mousemove', function (e) {
      tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    (function loop() {
      requestAnimationFrame(loop);
      t += 0.006;

      positions.forEach(function (p, i) {
        var s = 0.85 + 0.35 * Math.sin(t + phases[i]);
        dummy.position.copy(p);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        nodes.setMatrixAt(i, dummy.matrix);
      });
      nodes.instanceMatrix.needsUpdate = true;
      nodeMat.color.setHSL(0.72 + 0.04 * Math.sin(t * 0.25), 0.9, 0.64);

      r.camera.position.x += (tmx * 3.5 - r.camera.position.x) * 0.025;
      r.camera.position.y += (-tmy * 2.2 - r.camera.position.y) * 0.025;
      r.camera.lookAt(0, 0, 0);

      r.renderer.render(r.scene, r.camera);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     6. MINI NEURAL CANVAS (process step 2)
  ────────────────────────────────────────────────────────── */
  function initMiniCanvas() {
    var canvas = document.getElementById('canvas-mini');
    if (!canvas || typeof THREE === 'undefined') return;

    var W = canvas.offsetWidth  || 200;
    var H = canvas.offsetHeight || 80;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 10;

    var layers = [3, 5, 5, 3];
    var all    = [];
    var xOffset = 0;
    var totalW  = (layers.length - 1) * 3;

    layers.forEach(function (count, li) {
      for (var n = 0; n < count; n++) {
        var x   = li * 3 - totalW / 2;
        var y   = (n - (count - 1) / 2) * 1.5;
        var pos = new THREE.Vector3(x, y, 0);
        all.push(pos);
        var m = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 7, 7),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        m.position.copy(pos);
        scene.add(m);
      }
    });

    // Connect adjacent layers
    var offset = 0;
    layers.forEach(function (count, li) {
      if (li === layers.length - 1) return;
      var thisLayer = all.slice(offset, offset + count);
      var nextLayer = all.slice(offset + count, offset + count + layers[li + 1]);
      var lm = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.18 });
      thisLayer.forEach(function (a) {
        nextLayer.forEach(function (b) {
          scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), lm));
        });
      });
      offset += count;
    });

    var t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += 0.018;
      scene.rotation.y = Math.sin(t * 0.35) * 0.4;
      renderer.render(scene, camera);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     7. THREE.JS — KNOWLEDGE GALAXY
  ────────────────────────────────────────────────────────── */
  function initGalaxy() {
    var r = buildRenderer('canvas-galaxy', 55);
    if (!r) return;
    r.camera.position.z = 32;

    var tooltip = document.getElementById('galaxy-tooltip');

    var topics = [
      { name: 'Networking',     desc: 'Data communication between devices',    x:  0,   y:  0,   z:  0,  color: 0x8b5cf6, sz: 0.75 },
      { name: 'DNS',            desc: 'Domain name resolution system',          x:  4.5, y:  2.5, z:  1,  color: 0xa78bfa, sz: 0.45 },
      { name: 'TCP/IP',         desc: 'Core internet protocol suite',           x: -4.5, y:  2.5, z: -1,  color: 0x7c3aed, sz: 0.48 },
      { name: 'Routing',        desc: 'Path selection in networks',             x:  2.5, y: -3.5, z:  2,  color: 0x9f7aea, sz: 0.43 },
      { name: 'Security',       desc: 'Protecting networked systems',           x: -2.5, y: -3.5, z: -2,  color: 0x22d3ee, sz: 0.52 },
      { name: 'AI / ML',        desc: 'Machine learning algorithms',            x: 11,   y:  0.5, z:  3,  color: 0x06b6d4, sz: 0.68 },
      { name: 'Neural Nets',    desc: 'Deep learning architectures',            x: 14,   y:  4,   z:  1,  color: 0x22d3ee, sz: 0.40 },
      { name: 'Python',         desc: 'Programming for data science',           x: 14,   y: -2,   z: -1,  color: 0x0ea5e9, sz: 0.42 },
      { name: 'Mathematics',    desc: 'Foundations of computation',             x:-11,   y:  0,   z: -2,  color: 0xf59e0b, sz: 0.63 },
      { name: 'Calculus',       desc: 'Continuous change and derivatives',      x:-14,   y:  3.5, z:  1,  color: 0xfbbf24, sz: 0.38 },
      { name: 'Linear Algebra', desc: 'Vectors, matrices, transformations',     x:-14,   y: -3.5, z: -1,  color: 0xf59e0b, sz: 0.38 },
      { name: 'Cybersecurity',  desc: 'Digital threat defence',                 x:  0,   y: -9,   z:  3,  color: 0xef4444, sz: 0.58 },
      { name: 'Encryption',     desc: 'Securing data transmission',             x: -3,   y:-12,   z:  1,  color: 0xf87171, sz: 0.40 },
      { name: 'Firewalls',      desc: 'Network access control systems',         x:  3,   y:-12,   z: -1,  color: 0xef4444, sz: 0.40 }
    ];

    var meshes = [];

    topics.forEach(function (t) {
      var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(t.sz, 16, 16),
        new THREE.MeshBasicMaterial({ color: t.color })
      );
      mesh.position.set(t.x, t.y, t.z);
      mesh.userData = t;
      r.scene.add(mesh);
      meshes.push(mesh);
    });

    // Connections
    var edges = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4],[5,6],[5,7],[8,9],[8,10],[11,12],[11,13],[4,11],[5,8]];
    edges.forEach(function (e) {
      var a = topics[e[0]], b = topics[e[1]];
      var lm = new THREE.LineBasicMaterial({ color: a.color, transparent: true, opacity: 0.13 });
      r.scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3(b.x, b.y, b.z)
        ]), lm
      ));
    });

    // Starfield
    var sCount = 700;
    var sPos   = new Float32Array(sCount * 3);
    for (var i = 0; i < sCount * 3; i++) sPos[i] = (Math.random() - 0.5) * 220;
    var sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    r.scene.add(new THREE.Points(sGeo,
      new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.09, transparent: true, opacity: 0.28 })));

    // Raycaster
    var raycaster = new THREE.Raycaster();
    var mouse     = new THREE.Vector2(-10, -10);
    var hovered   = null;
    var ttX = 0, ttY = 0;
    var gMx = 0, gMy = 0;

    r.canvas.addEventListener('mousemove', function (e) {
      var rect = r.canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ttX = e.clientX;
      ttY = e.clientY;
      gMx = mouse.x;
      gMy = -mouse.y;
    });

    r.canvas.addEventListener('mouseleave', function () {
      mouse.set(-10, -10);
      if (tooltip) { tooltip.classList.remove('tt-visible'); tooltip.setAttribute('aria-hidden', 'true'); }
      if (hovered) { hovered.scale.setScalar(1); hovered = null; }
    });

    var t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += 0.004;

      r.scene.rotation.y = t * 0.12 + gMx * 0.28;
      r.scene.rotation.x = gMy * 0.14;

      // Raycasting
      raycaster.setFromCamera(mouse, r.camera);
      var hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        var hit = hits[0].object;
        if (hit !== hovered) {
          if (hovered) hovered.scale.setScalar(1);
          hovered = hit;
          hovered.scale.setScalar(1.5);
        }
        if (tooltip) {
          tooltip.querySelector('.gt-name').textContent = hit.userData.name;
          tooltip.querySelector('.gt-desc').textContent = hit.userData.desc;
          tooltip.style.left = (ttX + 16) + 'px';
          tooltip.style.top  = (ttY - 48) + 'px';
          tooltip.classList.add('tt-visible');
          tooltip.removeAttribute('aria-hidden');
        }
      } else {
        if (hovered) { hovered.scale.setScalar(1); hovered = null; }
        if (tooltip) { tooltip.classList.remove('tt-visible'); tooltip.setAttribute('aria-hidden', 'true'); }
      }

      r.renderer.render(r.scene, r.camera);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     8. THREE.JS — VISION BACKGROUND
  ────────────────────────────────────────────────────────── */
  function initVisionCanvas() {
    var r = buildRenderer('canvas-vision', 60);
    if (!r) return;
    r.camera.position.z = 22;

    var COUNT = 45;
    var pos   = [];
    for (var i = 0; i < COUNT; i++) {
      pos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 12
      ));
    }

    var nodeGeo = new THREE.SphereGeometry(0.14, 6, 6);
    var nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 });
    var nodes   = new THREE.InstancedMesh(nodeGeo, nodeMat, COUNT);
    var dummy   = new THREE.Object3D();
    pos.forEach(function (p, i) {
      dummy.position.copy(p);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
    r.scene.add(nodes);

    var lm = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.07 });
    for (var a = 0; a < COUNT; a++) {
      for (var b = a + 1; b < COUNT; b++) {
        if (pos[a].distanceTo(pos[b]) < 15) {
          r.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pos[a], pos[b]]), lm));
        }
      }
    }

    var phases = pos.map(function () { return Math.random() * Math.PI * 2; });
    var t = 0;

    (function loop() {
      requestAnimationFrame(loop);
      t += 0.005;
      r.scene.rotation.z = t * 0.015;
      pos.forEach(function (p, i) {
        var s = 0.75 + 0.45 * Math.abs(Math.sin(t + phases[i]));
        dummy.position.copy(p);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        nodes.setMatrixAt(i, dummy.matrix);
      });
      nodes.instanceMatrix.needsUpdate = true;
      r.renderer.render(r.scene, r.camera);
    })();
  }

  /* ──────────────────────────────────────────────────────────
     9. PARALLAX ON HERO CONTENT
  ────────────────────────────────────────────────────────── */
  function initParallax() {
    var content = document.querySelector('.hero-content');
    if (!content) return;
    var chips   = document.querySelectorAll('.chip');

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      content.style.transform = 'translateY(' + y * 0.28 + 'px)';
      content.style.opacity   = Math.max(0, 1 - y / 700).toFixed(3);
      chips.forEach(function (c, i) {
        var dir = i % 2 === 0 ? 1 : -1;
        c.style.transform = 'translateY(' + y * 0.10 * dir + 'px)';
      });
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     10. WORKSPACE CHAT SIMULATION
  ────────────────────────────────────────────────────────── */
  function initChat() {
    var input    = document.getElementById('chat-input');
    var sendBtn  = document.getElementById('chat-send');
    var messages = document.getElementById('chat-messages');
    if (!input || !sendBtn || !messages) return;

    var responses = [
      "DNS stands for Domain Name System — think of it as a phonebook for the internet. You type a name, it returns a number (IP address).",
      "The TCP/IP model has 4 layers: Application, Transport, Internet, and Network Access. Each layer has a specific job in communication.",
      "Encryption converts readable data into scrambled text using mathematical algorithms. Only the correct key can decode it back.",
      "A firewall monitors and controls incoming and outgoing network traffic based on predefined security rules.",
      "Great question! Subnetting divides a large network into smaller, more manageable sub-networks to improve performance and security.",
      "I've processed your question. Let me break this down into the simplest possible terms for you..."
    ];
    var ri = 0;

    function appendMsg(text, isUser) {
      var div = document.createElement('div');
      div.className = 'chat-msg ' + (isUser ? 'msg-user' : 'msg-ai');

      if (!isUser) {
        var ava = document.createElement('div');
        ava.className = 'msg-ava';
        ava.setAttribute('aria-hidden', 'true');
        ava.textContent = '◎';
        div.appendChild(ava);
      }

      var bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;
      div.appendChild(bubble);

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      var div = document.createElement('div');
      div.className = 'chat-msg msg-ai';
      div.id = 'typing-indicator';

      var ava = document.createElement('div');
      ava.className = 'msg-ava';
      ava.setAttribute('aria-hidden', 'true');
      ava.textContent = '◎';
      div.appendChild(ava);

      var bubble = document.createElement('div');
      bubble.className = 'msg-bubble typing';
      bubble.setAttribute('aria-label', 'AI is typing');
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('span');
        dot.className = 'typing-dot';
        dot.setAttribute('aria-hidden', 'true');
        bubble.appendChild(dot);
      }
      div.appendChild(bubble);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      var t = document.getElementById('typing-indicator');
      if (t) t.remove();
    }

    function send() {
      var text = input.value.trim();
      if (!text) return;
      appendMsg(text, true);
      input.value = '';
      sendBtn.disabled = true;

      showTyping();
      setTimeout(function () {
        removeTyping();
        appendMsg(responses[ri % responses.length], false);
        ri++;
        sendBtn.disabled = false;
        input.focus();
      }, 1600 + Math.random() * 600);
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    // Copy button
    var copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var bodyEl = document.querySelector('.explain-body');
        if (!bodyEl) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(bodyEl.innerText).then(function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800);
          });
        } else {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800);
        }
      });
    }
  }

  /* ──────────────────────────────────────────────────────────
     11. UPLOAD ZONE
  ────────────────────────────────────────────────────────── */
  function initUpload() {
    var zone = document.getElementById('upload-zone');
    if (!zone) return;

    function over(e) { e.preventDefault(); zone.classList.add('drag-over'); }
    function out()   { zone.classList.remove('drag-over'); }
    function drop(e) {
      e.preventDefault();
      zone.classList.remove('drag-over');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) {
        var icon = zone.querySelector('.uz-icon');
        var p    = zone.querySelector('p');
        if (icon) icon.textContent = '✓';
        if (p)    p.innerHTML = '<span style="color:var(--accent-lt);font-weight:600">' +
                                escapeHtml(files[0].name) + '</span> ready to analyse';
      }
    }

    zone.addEventListener('dragenter', over);
    zone.addEventListener('dragover',  over);
    zone.addEventListener('dragleave', out);
    zone.addEventListener('drop',      drop);
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zone.click(); }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ──────────────────────────────────────────────────────────
     12. CARD GLOW FOLLOW
  ────────────────────────────────────────────────────────── */
  function initCardGlow() {
    var cards = document.querySelectorAll('.glass-card, .impact-card, .service-item');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width)  * 100;
        var y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.background =
          'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(139,92,246,.07), var(--glass-bg) 55%)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.background = '';
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     13. BOOKING MODAL
  ────────────────────────────────────────────────────────── */
  function initModal() {
    var backdrop = document.getElementById('modal-backdrop');
    var dialog   = document.getElementById('modal-dialog');
    var closeBtn = document.getElementById('modal-close');
    if (!backdrop || !dialog) return;

    // All open triggers
    document.querySelectorAll('.js-open-modal').forEach(function (el) {
      el.addEventListener('click', openModal);
    });
    // Chip with role=button
    document.querySelectorAll('[role="button"].js-open-modal, .chip-tr').forEach(function (el) {
      el.addEventListener('click', openModal);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
      });
    });

    if (closeBtn)  closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
    });

    function openModal() {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      showPane(1);
      resetModal();
    }

    function closeModal() {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      dialog.classList.remove('open');
      dialog.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // ── Step state ──
    var selectedService = null;
    var selectedDate    = null;
    var selectedTime    = null;

    // ── Pane switching ──
    function showPane(n) {
      ['1','2','3','confirm'].forEach(function (id) {
        var p = document.getElementById('modal-pane-' + id);
        if (p) p.classList.add('hidden');
      });
      var active = document.getElementById('modal-pane-' + n);
      if (active) active.classList.remove('hidden');
      updateStepBar(n);
    }

    function updateStepBar(step) {
      var steps = document.querySelectorAll('.msb-step');
      var lines = document.querySelectorAll('.msb-line');
      var stepNum = parseInt(step) || 0;

      steps.forEach(function (s) {
        var n = parseInt(s.dataset.step);
        s.classList.remove('active', 'done');
        if (n < stepNum)      s.classList.add('done');
        else if (n === stepNum) s.classList.add('active');
      });
      lines.forEach(function (l, i) {
        l.classList.toggle('active', i + 1 < stepNum);
      });
    }

    // ── Step 1: Services ──
    var s1Next = document.getElementById('btn-step1-next');
    document.querySelectorAll('.service-item').forEach(function (item) {
      item.addEventListener('click', function () {
        document.querySelectorAll('.service-item').forEach(function (i) { i.classList.remove('selected'); });
        item.classList.add('selected');
        selectedService = item.dataset.value;
        if (s1Next) { s1Next.disabled = false; }
      });
    });
    if (s1Next) {
      s1Next.addEventListener('click', function () {
        if (!selectedService) return;
        showPane(2);
        buildCalendar();
      });
    }

    // ── Step 2: Calendar ──
    var s2Next = document.getElementById('btn-step2-next');
    var s2Back = document.getElementById('btn-step2-back');
    if (s2Back) s2Back.addEventListener('click', function () { showPane(1); });

    function buildCalendar() {
      var wrap = document.getElementById('calendar-wrap');
      if (!wrap) return;

      var now   = new Date();
      var year  = now.getFullYear();
      var month = now.getMonth();
      var today = now.getDate();

      var MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
      var DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      var first  = new Date(year, month, 1).getDay();
      var total  = new Date(year, month + 1, 0).getDate();

      var html = '<div class="cal-header"><span>' + MONTHS[month] + ' ' + year + '</span></div>';
      html += '<div class="cal-grid">';
      DAYS.forEach(function (d) { html += '<div class="cal-dayname">' + d + '</div>'; });
      for (var sp = 0; sp < first; sp++) html += '<div></div>';
      for (var day = 1; day <= total; day++) {
        var past    = day < today;
        var isToday = day === today;
        var cls     = 'cal-day' + (past ? ' disabled' : '') + (isToday ? ' today' : '');
        html += '<div class="' + cls + '" data-day="' + day + '">' + day + '</div>';
      }
      html += '</div>';
      wrap.innerHTML = html;

      wrap.querySelectorAll('.cal-day:not(.disabled)').forEach(function (el) {
        el.addEventListener('click', function () {
          wrap.querySelectorAll('.cal-day').forEach(function (d) { d.classList.remove('selected'); });
          el.classList.add('selected');
          selectedDate = parseInt(el.dataset.day);
          if (s2Next) s2Next.disabled = false;
        });
      });
    }

    if (s2Next) {
      s2Next.addEventListener('click', function () {
        if (!selectedDate) return;
        var now   = new Date();
        var SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var SHORT_DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var d = new Date(now.getFullYear(), now.getMonth(), selectedDate);
        var lbl = document.getElementById('step3-date-label');
        if (lbl) lbl.textContent = SHORT_DAYS[d.getDay()] + ', ' + SHORT_MONTHS[now.getMonth()] + ' ' + selectedDate;
        showPane(3);
      });
    }

    // ── Step 3: Time ──
    var s3Confirm = document.getElementById('btn-step3-confirm');
    var s3Back    = document.getElementById('btn-step3-back');
    if (s3Back) s3Back.addEventListener('click', function () { showPane(2); });

    document.querySelectorAll('.time-slot').forEach(function (slot) {
      slot.addEventListener('click', function () {
        document.querySelectorAll('.time-slot').forEach(function (s) { s.classList.remove('selected'); });
        slot.classList.add('selected');
        selectedTime = slot.querySelector('input') ? slot.querySelector('input').value : slot.textContent.trim();
        if (s3Confirm) s3Confirm.disabled = false;
      });
    });

    if (s3Confirm) {
      s3Confirm.addEventListener('click', function () {
        if (!selectedTime) return;
        var names = { study: 'AI Study Session', concept: 'Concept Explanation', exam: 'Exam Preparation' };
        var now   = new Date();
        var SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var dateStr = SHORT_MONTHS[now.getMonth()] + ' ' + selectedDate + ', ' + now.getFullYear();

        var det = document.getElementById('confirm-details');
        if (det) {
          det.innerHTML =
            '<dt>Service</dt><dd>' + (names[selectedService] || selectedService) + '</dd>' +
            '<dt>Date</dt><dd>'    + dateStr   + '</dd>' +
            '<dt>Time</dt><dd>'    + selectedTime + '</dd>';
        }
        showPane('confirm');
        updateStepBar(4);
      });
    }

    var doneBtn = document.getElementById('btn-done');
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    function resetModal() {
      selectedService = null;
      selectedDate    = null;
      selectedTime    = null;
      document.querySelectorAll('.service-item').forEach(function (i) { i.classList.remove('selected'); });
      document.querySelectorAll('.time-slot').forEach(function (s) { s.classList.remove('selected'); });
      if (s1Next)    s1Next.disabled    = true;
      if (s2Next)    s2Next.disabled    = true;
      if (s3Confirm) s3Confirm.disabled = true;
    }
  }

  /* ──────────────────────────────────────────────────────────
     14. SIDEBAR NAV (workspace)
  ────────────────────────────────────────────────────────── */
  function initSidebar() {
    document.querySelectorAll('.wss-item').forEach(function (item) {
      item.addEventListener('click', function () {
        document.querySelectorAll('.wss-item').forEach(function (i) {
          i.classList.remove('active');
          i.removeAttribute('aria-current');
        });
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  onReady(function () {
    initCursor();
    initNavbar();
    initScrollReveal();
    initTypewriter();
    initParallax();
    initChat();
    initUpload();
    initCardGlow();
    initModal();
    initSidebar();

    // Three.js init waits for THREE to load from CDN
    waitForThree(function () {
      initHeroCanvas();
      initMiniCanvas();
      initGalaxy();
      initVisionCanvas();
    });

    console.log('%c◎ Clarity Loop', 'font-size:18px;color:#8b5cf6;font-weight:bold;');
    console.log('%cCinematic AI Learning Platform — loaded ✓', 'color:#a78bfa;');
  });

})();
