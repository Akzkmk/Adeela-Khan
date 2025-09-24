document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu (Unchanged) ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('#mobile-menu a, .header nav a');

  mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  navLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Background Streaks ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');

  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Streak {
    constructor(ctx) {
      this.ctx = ctx;
      this.reset();
    }

    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = Math.random() * bgCanvas.height;
      this.len = 50 + Math.random() * 120;
      this.speed = 0.3 + Math.random() * 0.5;
      this.hue = 180 + Math.random() * 120;
      this.opacity = 0;
      this.fadeSpeed = 0.01 + Math.random() * 0.02;
      this.isFadingIn = true;
    }

    draw() {
      const alpha = this.isFadingIn ? this.opacity : 1 - this.opacity;
      const gradient = this.ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y);
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${alpha})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 100%, 70%, 0)`);
      this.ctx.strokeStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x - this.len, this.y);
      this.ctx.stroke();
    }

    update() {
      if(this.isFadingIn) {
        this.opacity += this.fadeSpeed;
        if(this.opacity >= 1) this.isFadingIn = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if(this.opacity <= 0) this.reset();
      }
      this.x += this.speed;
      this.draw();
    }
  }

  const streaks = Array.from({ length: 60 }, () => new Streak(bgCtx));

  function animateStreaks() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    streaks.forEach(s => s.update());
    requestAnimationFrame(animateStreaks);
  }
  animateStreaks();

  // --- Three.js Futuristic Agentic Core ---
  const container = document.getElementById('agentic-core-container');
  if(container && typeof THREE !== 'undefined') {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const layers = [];
    const createLayer = (size, hue, opacity, wire=false) => {
      const geo = new THREE.IcosahedronGeometry(size, 1);
      let mat;
      if(wire) {
        mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(`hsl(${hue},100%,70%)`), wireframe: true, transparent: true, opacity });
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${hue},80%,60%)`),
          emissive: new THREE.Color(`hsl(${hue},80%,40%)`),
          emissiveIntensity: 0.6,
          metalness: 0.4,
          roughness: 0.1,
          transparent: true,
          opacity
        });
      }
      const mesh = new THREE.Mesh(geo, mat);
      coreGroup.add(mesh);
      layers.push({ mesh, mat, baseOpacity: opacity });
      return mesh;
    };

    createLayer(6, 180, 0.2, false);
    createLayer(4, 200, 0.3, true);
    createLayer(2.5, 220, 0.5, false);

    const nodes = [];
    const nodeCount = 10;
    const orbitRadius = 15;
    const nodeGeo = new THREE.SphereGeometry(0.35, 16, 16);

    for(let i=0;i<nodeCount;i++){
      const mat = new THREE.MeshStandardMaterial({ emissive: 0x00ffff, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.1 });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      scene.add(mesh);
      nodes.push({ mesh, angle: Math.random() * Math.PI * 2, baseIntensity: 0.5 });
    }

    // Particle system for "data packets"
    const particleCount = 100;
    const particles = new THREE.Group();
    scene.add(particles);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);

    class Particle {
      constructor() {
        this.mesh = new THREE.Mesh(particleGeometry, particleMaterial);
        particles.add(this.mesh);
        this.reset();
      }
      reset() {
        this.mesh.position.copy(coreGroup.position);
        this.targetNode = nodes[Math.floor(Math.random() * nodes.length)].mesh;
        this.progress = 0;
        this.speed = 0.005 + Math.random() * 0.005;
      }
      update() {
        if(this.progress < 1) {
          this.mesh.position.lerp(this.targetNode.position, this.speed);
          this.progress += this.speed;
        } else {
          this.reset();
        }
      }
    }

    const particlePool = Array.from({ length: particleCount }, () => new Particle());

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 1.2));
    const pointLight = new THREE.PointLight(0x00ffff, 1.8, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    // Scan lines
    const scanMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.05 });
    const scanLines = [];
    for(let i=0;i<30;i++){
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, i - 15, 0),
        new THREE.Vector3(10, i - 15, 0)
      ]);
      const line = new THREE.Line(geometry, scanMaterial);
      coreGroup.add(line);
      scanLines.push({ line });
    }

    // Animate
    let pulse = 0;
    function animate() {
      requestAnimationFrame(animate);

      coreGroup.rotation.y += 0.0008;
      coreGroup.rotation.x += 0.0004;

      pulse += 0.005;
      layers.forEach(l => l.mat.emissiveIntensity = 0.5 + 0.2 * Math.sin(pulse * 2));

      nodes.forEach(n => {
        n.angle += 0.0008;
        n.mesh.position.set(
          Math.cos(n.angle) * orbitRadius,
          Math.sin(n.angle * 0.5) * 3,
          Math.sin(n.angle) * orbitRadius
        );

        const nearestDistance = particlePool.reduce((min, p) => Math.min(min, p.mesh.position.distanceTo(n.mesh.position)), Infinity);
        n.mesh.material.emissiveIntensity = n.baseIntensity + (nearestDistance < 2 ? 0.8 : 0);
      });

      particlePool.forEach(p => p.update());

      scanLines.forEach(s => {
        s.line.position.y += 0.01;
        if(s.line.position.y > 15) s.line.position.y = -15;
      });

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

});
