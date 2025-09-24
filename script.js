document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('#mobile-menu a, nav a');

  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Close menu after clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });

  // --- Smooth Scrolling (works everywhere) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
      if (!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
    });
  });

  // --- Background Particles Animation ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor(x, y, r, color, v) {
      this.x = x; this.y = y; this.r = r; this.color = color; this.v = v;
    }
    draw() {
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
      bgCtx.fillStyle = this.color;
      bgCtx.fill();
    }
    update() {
      this.x += this.v.x;
      this.y += this.v.y;
      if(this.x < 0 || this.x > bgCanvas.width) this.x = Math.random()*bgCanvas.width;
      if(this.y < 0 || this.y > bgCanvas.height) this.y = Math.random()*bgCanvas.height;
      this.draw();
    }
  }

  particles = [];
  for(let i=0;i<50;i++){
    particles.push(new Particle(
      Math.random()*bgCanvas.width,
      Math.random()*bgCanvas.height,
      Math.random()*1.5,
      `rgba(0,255,255,${Math.random()*0.4})`,
      {x:(Math.random()-0.5)*0.25, y:(Math.random()-0.5)*0.25}
    ));
  }

  function animateParticles() {
    requestAnimationFrame(animateParticles);
    bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
    particles.forEach(p => p.update());
  }
  animateParticles();

  // --- Timeline Scroll Animation ---
  const timelineItems = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  timelineItems.forEach(item => observer.observe(item));

  // --- Agentic AI 3D Core ---
  const container = document.getElementById('agentic-core-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  camera.position.z = 9;

  // Core (bigger, high res)
  const geometry = new THREE.IcosahedronGeometry(3, 4);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    metalness: 0.8,
    roughness: 0.15,
    emissive: 0x0077ff,
    emissiveIntensity: 0.8,
    wireframe: false
  });
  const core = new THREE.Mesh(geometry, material);
  scene.add(core);

  // Orbiting Agent Nodes
  const agentNodes = [];
  const nodeGeometry = new THREE.SphereGeometry(0.3, 32, 32);

  for (let i = 0; i < 8; i++) {
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xaa00ff,
      emissiveIntensity: 1
    });
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      Math.cos(i * Math.PI / 4) * 5,
      Math.sin(i * Math.PI / 4) * 5,
      0
    );
    scene.add(node);
    agentNodes.push({ mesh: node, angle: i * Math.PI / 4, material: nodeMaterial });
  }

  // Lines from core to nodes
  const lines = [];
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6
  });

  agentNodes.forEach(nodeObj => {
    const points = [core.position.clone(), nodeObj.mesh.position.clone()];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial.clone());
    scene.add(line);
    lines.push({ line, node: nodeObj });
  });

  // Lights
  scene.add(new THREE.PointLight(0x00ffff, 2, 100).position.set(5,5,5));
  scene.add(new THREE.PointLight(0xff00ff, 2, 100).position.set(-5,-5,5));
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Drag Interaction
  let isDragging = false;
  let previousMousePosition = {x:0,y:0};

  container.addEventListener('mousedown',()=>{isDragging=true;});
  container.addEventListener('mouseup',()=>{isDragging=false;});
  container.addEventListener('mouseleave',()=>{isDragging=false;});
  container.addEventListener('mousemove',(e)=>{
    if(!isDragging) return;
    const deltaMove = {x: e.offsetX-previousMousePosition.x, y:e.offsetY-previousMousePosition.y};
    core.rotation.y += deltaMove.x*0.005;
    core.rotation.x += deltaMove.y*0.005;
    previousMousePosition = {x:e.offsetX, y:e.offsetY};
  });

  // Animation Loop
  let signalTimer = 0;
  function animateCore(){
    requestAnimationFrame(animateCore);

    if(!isDragging){
      core.rotation.x += 0.0015;
      core.rotation.y += 0.002;
    }

    // Orbit nodes
    agentNodes.forEach((nodeObj, i) => {
      nodeObj.angle += 0.002 + i*0.0002;
      nodeObj.mesh.position.x = Math.cos(nodeObj.angle) * 5;
      nodeObj.mesh.position.z = Math.sin(nodeObj.angle) * 5;
    });

    // Update lines
    lines.forEach(l => {
      const positions = new Float32Array([
        core.position.x, core.position.y, core.position.z,
        l.node.mesh.position.x, l.node.mesh.position.y, l.node.mesh.position.z
      ]);
      l.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    });

    // Simulate "signals" pulsing between core <-> nodes
    signalTimer++;
    if(signalTimer % 200 === 0){
      const randomNode = agentNodes[Math.floor(Math.random()*agentNodes.length)];
      randomNode.material.color.setHex(0x00ffff); // temporarily change color
      randomNode.material.emissive.setHex(0x00ffff);
      setTimeout(()=>{
        randomNode.material.color.setHex(0xff00ff);
        randomNode.material.emissive.setHex(0xaa00ff);
      }, 600);
    }

    renderer.render(scene,camera);
  }
  animateCore();

  window.addEventListener('resize',()=>{
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth,container.clientHeight);
  });

});
