/* Clarity Loop — cinematic landing prototype (Vanilla JS + Three.js) */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  /* ---------- Year ---------- */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Smooth scroll + nav behavior ---------- */
  document.documentElement.style.scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const nav = $("[data-nav]");
  const setNavScrolled = () => {
    if (!nav) return;
    nav.classList.toggle("isScrolled", window.scrollY > 6);
  };

  const markNavReady = () => {
    if (!nav) return;
    requestAnimationFrame(() => nav.classList.add("isReady"));
  };

  window.addEventListener("scroll", setNavScrolled, { passive: true });
  setNavScrolled();
  markNavReady();

  /* ---------- Mobile menu ---------- */
  const burger = $("[data-burger]");
  const mobile = $("[data-mobile]");
  const mobileLinks = $$("[data-mobile-link]");

  function setMobileOpen(isOpen) {
    if (!burger || !mobile) return;
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobile.hidden = !isOpen;
    mobile.classList.toggle("isOpen", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMobileOpen(!isOpen);
    });

    mobile.addEventListener("click", (e) => {
      const panel = $(".mobile__panel", mobile);
      if (!panel) return;
      if (!panel.contains(e.target)) setMobileOpen(false);
    });

    mobileLinks.forEach((a) => a.addEventListener("click", () => setMobileOpen(false)));
  }

  /* ---------- Reveal-on-scroll + staggered load ---------- */
  const revealEls = $$("[data-reveal]");

  const revealNow = (el) => {
    const delay = Number(el.getAttribute("data-delay") || "0");
    if (prefersReducedMotion || delay <= 0) {
      el.classList.add("isVisible");
      return;
    }
    el.style.transitionDelay = `${delay}ms`;
    el.classList.add("isVisible");
  };

  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("isVisible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const ent of entries) {
            if (!ent.isIntersecting) continue;
            revealNow(ent.target);
            io.unobserve(ent.target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Glow cursor interaction for cards ---------- */
  const glowCards = $$(".card, .priceCard");
  const setCardGlow = (el, ev) => {
    const r = el.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };
  glowCards.forEach((c) => {
    c.addEventListener("pointermove", (e) => setCardGlow(c, e));
  });

  /* ---------- Typewriter placeholder (search chip) ---------- */
  const typewriterInput = $("[data-typewriter]");
  const queries = [
    "Explain DNS simply",
    "Summarize networking lecture",
    "Create quiz from notes",
    "Why is routing hard?",
    "Teach me TCP vs UDP",
  ];

  function runTypewriter(input) {
    if (!input) return;
    let qIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let hold = 0;
    let raf = 0;

    const tick = () => {
      const text = queries[qIndex] || "";
      if (document.activeElement === input) {
        input.placeholder = "Type to search…";
        raf = window.setTimeout(tick, 120);
        return;
      }

      if (hold > 0) {
        hold -= 1;
        raf = window.setTimeout(tick, 120);
        return;
      }

      if (!deleting) {
        charIndex += 1;
        input.placeholder = text.slice(0, charIndex);
        if (charIndex >= text.length) {
          deleting = true;
          hold = 8; // pause on full string
        }
        raf = window.setTimeout(tick, 42);
      } else {
        charIndex -= 1;
        input.placeholder = text.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          qIndex = (qIndex + 1) % queries.length;
          hold = 2;
        }
        raf = window.setTimeout(tick, 28);
      }
    };

    tick();
    return () => window.clearTimeout(raf);
  }

  if (typewriterInput) runTypewriter(typewriterInput);

  /* ---------- Booking modal (3-step) ---------- */
  const modal = $("[data-modal]");
  const modalOpeners = $$("[data-open-booking]");
  const modalClosers = $$("[data-modal-close]");
  const stepDots = $$("[data-step-dot]");

  const flows = {
    step1: $("[data-step='1']"),
    step2: $("[data-step='2']"),
    step3: $("[data-step='3']"),
    step4: $("[data-step='4']"),
  };

  const nextBtn = $("[data-next]");
  const backBtn = $("[data-back]");

  const serviceOptions = $$("[data-service]");
  const dateInput = $("[data-date]");
  const dateLabel = $("[data-date-label]");
  const slotBtns = $$("[data-time]");

  const confirmLine = $("[data-confirm-line]");

  const state = {
    isOpen: false,
    step: 1,
    service: "",
    date: "",
    time: "",
  };

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(`${iso}T00:00:00`);
    return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(d);
  }

  function setStep(step) {
    state.step = step;
    const visible = (n) => step === n;
    if (flows.step1) flows.step1.hidden = !visible(1);
    if (flows.step2) flows.step2.hidden = !visible(2);
    if (flows.step3) flows.step3.hidden = !visible(3);
    if (flows.step4) flows.step4.hidden = !visible(4);

    stepDots.forEach((d) => d.classList.toggle("isActive", Number(d.getAttribute("data-step-dot")) === Math.min(step, 3)));

    if (backBtn) backBtn.style.visibility = step === 1 || step === 4 ? "hidden" : "visible";
    if (nextBtn) nextBtn.style.visibility = step === 4 ? "hidden" : "visible";
    if (nextBtn) nextBtn.textContent = step === 3 ? "Confirm" : "Next";

    // Simple gating
    if (!nextBtn) return;
    if (step === 1) nextBtn.disabled = !state.service;
    if (step === 2) nextBtn.disabled = !state.date;
    if (step === 3) nextBtn.disabled = !state.time;
  }

  function openModal() {
    if (!modal) return;
    state.isOpen = true;
    modal.classList.add("isOpen");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setStep(1);
    setTimeout(() => {
      const first = $(".opt", modal);
      if (first) first.focus?.();
    }, 50);
  }

  function closeModal() {
    if (!modal) return;
    state.isOpen = false;
    modal.classList.remove("isOpen");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function resetModalState() {
    state.step = 1;
    state.service = "";
    state.date = "";
    state.time = "";
    serviceOptions.forEach((b) => b.classList.remove("isSelected"));
    slotBtns.forEach((b) => b.classList.remove("isSelected"));
    if (dateInput) dateInput.value = "";
    if (dateLabel) dateLabel.textContent = "—";
    if (confirmLine) confirmLine.textContent = "—";
  }

  modalOpeners.forEach((b) =>
    b.addEventListener("click", () => {
      resetModalState();
      openModal();
    })
  );
  modalClosers.forEach((b) => b.addEventListener("click", () => closeModal()));

  document.addEventListener("keydown", (e) => {
    if (!state.isOpen) return;
    if (e.key === "Escape") closeModal();
  });

  if (serviceOptions.length) {
    serviceOptions.forEach((btn) => {
      btn.addEventListener("click", () => {
        serviceOptions.forEach((b) => b.classList.remove("isSelected"));
        btn.classList.add("isSelected");
        state.service = btn.getAttribute("data-service") || "";
        if (nextBtn) nextBtn.disabled = !state.service;
      });
    });
  }

  if (dateInput) {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    dateInput.min = min;
    dateInput.addEventListener("change", () => {
      state.date = dateInput.value || "";
      if (dateLabel) dateLabel.textContent = state.date ? formatDate(state.date) : "—";
      if (nextBtn) nextBtn.disabled = !state.date;
    });
  }

  if (slotBtns.length) {
    slotBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        slotBtns.forEach((b) => b.classList.remove("isSelected"));
        btn.classList.add("isSelected");
        state.time = btn.getAttribute("data-time") || "";
        if (nextBtn) nextBtn.disabled = !state.time;
      });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.step === 1 && state.service) setStep(2);
      else if (state.step === 2 && state.date) setStep(3);
      else if (state.step === 3 && state.time) {
        const line = `${state.service} • ${formatDate(state.date)} • ${state.time}`;
        if (confirmLine) confirmLine.textContent = line;
        setStep(4);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (state.step === 2) setStep(1);
      else if (state.step === 3) setStep(2);
    });
  }

  /* ---------- “Try prototype” buttons: quick micro-interaction ---------- */
  const protoOpeners = $$("[data-open-prototype]");
  protoOpeners.forEach((b) =>
    b.addEventListener("click", () => {
      const input = $(".chat__input");
      if (input) {
        input.value = "Explain DNS simply with an analogy.";
        input.focus?.();
      }
      const el = $("#workspace");
      if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    })
  );

  /* ---------- Three.js utilities ---------- */
  const hasThree = typeof window.THREE !== "undefined";

  function safePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    return Math.min(2, Math.max(1, dpr));
  }

  function resizeRenderer(renderer, camera, _canvas, w, h) {
    renderer.setSize(w, h, false);
    if (camera && camera.isPerspectiveCamera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if (camera && camera.isOrthographicCamera) camera.updateProjectionMatrix();
  }

  /* ---------- Hero neural overlay (Three.js) ---------- */
  function initHeroNeural() {
    const canvas = $("[data-hero-gl]");
    if (!canvas || !hasThree) return;
    if (prefersReducedMotion) {
      canvas.style.opacity = "0.35";
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(safePixelRatio());
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const group = new THREE.Group();
    scene.add(group);

    const nodeCount = Math.max(40, Math.min(110, Math.floor(window.innerWidth / 14)));
    const nodes = [];
    const velocities = [];

    const bounds = new THREE.Vector3(8.2, 4.8, 3.8);
    const colorAccent = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#8b5cf6");

    // Nodes (points)
    const pos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() * 2 - 1) * bounds.x;
      const y = (Math.random() * 2 - 1) * bounds.y;
      const z = (Math.random() * 2 - 1) * bounds.z;
      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      nodes.push(new THREE.Vector3(x, y, z));
      velocities.push(
        new THREE.Vector3((Math.random() * 2 - 1) * 0.010, (Math.random() * 2 - 1) * 0.010, (Math.random() * 2 - 1) * 0.006)
      );
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pointsMat = new THREE.PointsMaterial({
      size: 0.055,
      color: colorAccent,
      opacity: 0.85,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    // Connections (lines)
    const maxConnections = nodeCount * 3;
    const linePos = new Float32Array(maxConnections * 2 * 3);
    const lineAlpha = new Float32Array(maxConnections * 2);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("alpha", new THREE.BufferAttribute(lineAlpha, 1));

    const lineMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: colorAccent },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main(){
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying float vAlpha;
        void main(){
          float pulse = 0.55 + 0.45*sin(uTime*1.3 + gl_FragCoord.x*0.01);
          gl_FragColor = vec4(uColor, vAlpha * pulse);
        }
      `,
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Subtle fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.07);

    function layoutConnections() {
      let ptr = 0;
      let aptr = 0;
      const threshold = 2.3;
      for (let i = 0; i < nodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          const d = nodes[i].distanceTo(nodes[j]);
          if (d > threshold) continue;
          const a = 1 - d / threshold;
          // write two vertices
          linePos[ptr++] = nodes[i].x;
          linePos[ptr++] = nodes[i].y;
          linePos[ptr++] = nodes[i].z;
          linePos[ptr++] = nodes[j].x;
          linePos[ptr++] = nodes[j].y;
          linePos[ptr++] = nodes[j].z;
          // alpha for each vertex
          lineAlpha[aptr++] = a * 0.22;
          lineAlpha[aptr++] = a * 0.22;
          connections++;
          if (connections > 4) break;
          if (aptr >= lineAlpha.length - 2) break;
        }
        if (aptr >= lineAlpha.length - 2) break;
      }
      // zero remaining to avoid stray segments
      for (let k = ptr; k < linePos.length; k++) linePos[k] = 0;
      for (let k = aptr; k < lineAlpha.length; k++) lineAlpha[k] = 0;
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.alpha.needsUpdate = true;
    }

    const heroEl = $(".hero");
    const ro = new ResizeObserver(() => {
      const r = heroEl?.getBoundingClientRect?.();
      const w = Math.max(1, Math.floor(r?.width || window.innerWidth));
      const h = Math.max(1, Math.floor(r?.height || window.innerHeight));
      resizeRenderer(renderer, camera, canvas, w, h);
    });
    if (heroEl) ro.observe(heroEl);

    // parallax
    const mouse = { x: 0, y: 0 };
    window.addEventListener(
      "pointermove",
      (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    let t0 = performance.now();
    let driftY = 0;
    function animate(t) {
      const dt = Math.min(0.03, (t - t0) / 1000);
      t0 = t;
      lineMat.uniforms.uTime.value = t / 1000;

      // Move nodes
      for (let i = 0; i < nodes.length; i++) {
        const v = velocities[i];
        nodes[i].addScaledVector(v, prefersReducedMotion ? 0.4 : 1);
        // bounce
        if (nodes[i].x < -bounds.x || nodes[i].x > bounds.x) v.x *= -1;
        if (nodes[i].y < -bounds.y || nodes[i].y > bounds.y) v.y *= -1;
        if (nodes[i].z < -bounds.z || nodes[i].z > bounds.z) v.z *= -1;
        // write back
        pos[i * 3 + 0] = nodes[i].x;
        pos[i * 3 + 1] = nodes[i].y;
        pos[i * 3 + 2] = nodes[i].z;
      }
      pointsGeo.attributes.position.needsUpdate = true;

      // Pulse size gently
      pointsMat.size = 0.05 + Math.sin(t / 1200) * 0.008;

      layoutConnections();

      // slow drift
      driftY += dt * 0.10;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.y * 0.08, 0.04);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, driftY + mouse.x * 0.10, 0.04);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    layoutConnections();
    requestAnimationFrame(animate);
  }

  /* ---------- Knowledge Galaxy (Three.js, interactive) ---------- */
  function initGalaxy() {
    const canvas = $("[data-galaxy-gl]");
    if (!canvas || !hasThree) return;

    const tooltip = $("[data-tooltip]");
    const titleEl = $("[data-topic-title]");
    const summaryEl = $("[data-topic-summary]");

    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(safePixelRatio());
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.set(0, 0.8, 9.5);

    const accent = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#8b5cf6");
    const cyan = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--accent2").trim() || "#22d3ee");

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.55);
    key.position.set(2, 3, 5);
    scene.add(key);

    // Star field
    const starCount = prefersReducedMotion ? 800 : 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 35 * Math.pow(Math.random(), 0.42);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Cluster nodes (topics)
    const topics = [
      { name: "Networking", color: accent, summary: "A system of rules and routes that moves data reliably across networks." },
      { name: "DNS", color: cyan, summary: "The internet’s address book: domain names → IP addresses, cached for speed." },
      { name: "Protocols", color: accent, summary: "Agreements for communication: TCP/UDP, HTTP, TLS — behavior, reliability, meaning." },
      { name: "Security", color: cyan, summary: "How systems preserve confidentiality, integrity, and availability under real threats." },
      { name: "Routing", color: accent, summary: "How packets find paths across networks — trade-offs across speed, cost, and stability." },
      { name: "AI", color: cyan, summary: "Models that compress patterns into predictions — then turn them into helpful explanations." },
      { name: "Math", color: accent, summary: "The language of structure: probability, linear algebra, calculus — clarity for complex systems." },
      { name: "Programming", color: cyan, summary: "Turning ideas into systems: composability, correctness, and performance." },
    ];

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeMeshes = [];
    const baseGeo = new THREE.SphereGeometry(0.12, 18, 18);

    topics.forEach((t, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: t.color,
        emissive: t.color.clone().multiplyScalar(0.6),
        emissiveIntensity: 0.65,
        metalness: 0.2,
        roughness: 0.35,
        transparent: true,
        opacity: 0.98,
      });
      const m = new THREE.Mesh(baseGeo, mat);

      const ringR = 2.8 + (i % 2) * 0.6;
      const ang = (i / topics.length) * Math.PI * 2;
      m.position.set(Math.cos(ang) * ringR, (Math.sin(ang * 1.6) * 0.5) + (i % 3 === 0 ? 0.4 : -0.1), Math.sin(ang) * ringR);
      m.userData = { ...t, index: i };
      nodeGroup.add(m);
      nodeMeshes.push(m);
    });

    // Animated connections (lines)
    const connPairs = [
      ["Networking", "DNS"],
      ["Networking", "Routing"],
      ["Networking", "Protocols"],
      ["Security", "Protocols"],
      ["AI", "Math"],
      ["AI", "Programming"],
      ["Security", "Networking"],
      ["DNS", "Security"],
    ];

    const nameToMesh = new Map(nodeMeshes.map((m) => [m.userData.name, m]));
    const connGeo = new THREE.BufferGeometry();
    const connPos = new Float32Array(connPairs.length * 2 * 3);
    connGeo.setAttribute("position", new THREE.BufferAttribute(connPos, 3));
    const connMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uA: { value: accent }, uB: { value: cyan }, uTime: { value: 0 } },
      vertexShader: `
        varying float vT;
        void main(){
          vT = position.x * 0.05 + position.z * 0.05;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uA;
        uniform vec3 uB;
        uniform float uTime;
        varying float vT;
        void main(){
          float flow = 0.45 + 0.55*sin(uTime*1.6 + vT*3.0);
          vec3 c = mix(uA, uB, flow);
          gl_FragColor = vec4(c, 0.22 * flow);
        }
      `,
    });
    const conn = new THREE.LineSegments(connGeo, connMat);
    scene.add(conn);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(999, 999);
    let hovered = null;
    let selected = nameToMesh.get("Networking") || null;

    function setSelected(mesh) {
      selected = mesh;
      if (!mesh) return;
      if (titleEl) titleEl.textContent = mesh.userData.name;
      if (summaryEl) summaryEl.textContent = mesh.userData.summary;
    }
    setSelected(selected);

    const parallax = { x: 0, y: 0 };
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      pointer.x = x * 2 - 1;
      pointer.y = -(y * 2 - 1);
      parallax.x = (x - 0.5) * 2;
      parallax.y = (y - 0.5) * 2;
      if (tooltip && !tooltip.hidden) {
        tooltip.style.left = `${Math.min(r.width - 16, Math.max(16, (e.clientX - r.left) + 14))}px`;
        tooltip.style.top = `${Math.min(r.height - 16, Math.max(16, (e.clientY - r.top) + 14))}px`;
      }
    }

    function onLeave() {
      pointer.x = 999;
      pointer.y = 999;
      hovered = null;
      if (tooltip) tooltip.hidden = true;
    }

    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave, { passive: true });
    canvas.addEventListener("click", () => {
      if (hovered) setSelected(hovered);
    });

    const ro = new ResizeObserver(() => {
      const r = container?.getBoundingClientRect?.();
      const w = Math.max(1, Math.floor(r?.width || canvas.clientWidth || 640));
      const h = Math.max(1, Math.floor(r?.height || canvas.clientHeight || 520));
      resizeRenderer(renderer, camera, canvas, w, h);
    });
    if (container) ro.observe(container);

    function updateConnections() {
      let ptr = 0;
      connPairs.forEach(([a, b]) => {
        const ma = nameToMesh.get(a);
        const mb = nameToMesh.get(b);
        if (!ma || !mb) return;
        connPos[ptr++] = ma.position.x;
        connPos[ptr++] = ma.position.y;
        connPos[ptr++] = ma.position.z;
        connPos[ptr++] = mb.position.x;
        connPos[ptr++] = mb.position.y;
        connPos[ptr++] = mb.position.z;
      });
      connGeo.attributes.position.needsUpdate = true;
    }
    updateConnections();

    let lastT = performance.now();
    function animate(t) {
      const dt = Math.min(0.03, (t - lastT) / 1000);
      lastT = t;
      connMat.uniforms.uTime.value = t / 1000;

      stars.rotation.y += dt * 0.015;
      nodeGroup.rotation.y += dt * 0.08;
      nodeGroup.rotation.x = THREE.MathUtils.lerp(nodeGroup.rotation.x, parallax.y * 0.08, 0.05);
      nodeGroup.rotation.z = THREE.MathUtils.lerp(nodeGroup.rotation.z, -parallax.x * 0.05, 0.05);

      // Gentle breathing / pulse
      nodeMeshes.forEach((m, i) => {
        const s = 1 + Math.sin(t / 900 + i * 0.7) * (prefersReducedMotion ? 0.012 : 0.03);
        m.scale.setScalar(s);
        const isSel = selected && selected.userData.name === m.userData.name;
        m.material.emissiveIntensity = THREE.MathUtils.lerp(m.material.emissiveIntensity, isSel ? 1.0 : 0.6, 0.08);
      });

      // Hover detection
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes, false);
      hovered = hits[0]?.object || null;

      if (tooltip) {
        if (hovered) {
          tooltip.hidden = false;
          tooltip.textContent = `${hovered.userData.name} — ${hovered.userData.summary}`;
        } else {
          tooltip.hidden = true;
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  initHeroNeural();
  initGalaxy();
})();
