document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // --- Smooth Scrolling ---
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

  for(let i=0;i<120;i++){
    particles.push(new Particle(
      Math.random()*bgCanvas.width,
      Math.random()*bgCanvas.height,
      Math.random()*1.5,
      `rgba(127,255,255,${Math.random()})`,
      {x:(Math.random()-0.5)*0.2, y:(Math.random()-0.5)*0.2}
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

  camera.position.z = 5;

  // Futuristic digital agentic core
  const geometry = new THREE.IcosahedronGeometry(2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x0040ff,
    emissiveIntensity:0.5,
    wireframe: false
  });
  const core = new THREE.Mesh(geometry, material);
  scene.add(core);

  const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
  pointLight1.position.set(5,5,5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
  pointLight2.position.set(-5,-5,5);
  scene.add(pointLight2);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

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

  function animateCore(){
    requestAnimationFrame(animateCore);
    if(!isDragging){
      core.rotation.x += 0.001;
      core.rotation.y += 0.002;
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
