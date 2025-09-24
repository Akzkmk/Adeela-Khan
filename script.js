// Wait until DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('#mobile-menu a, .header nav a');

  mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  navLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Background Streaks ---
  const bgCanvas = document.getElementById('bg-canvas');
  const linesCanvas = document.getElementById('lines-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  const linesCtx = linesCanvas.getContext('2d');

  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    linesCanvas.width = window.innerWidth;
    linesCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Streak {
    constructor(ctx, width, height) {
      this.ctx = ctx;
      this.width = width;
      this.height = height;
      this.reset();
    }
    reset() {
      this.x = Math.random() * this.width;
      this.y = Math.random() * this.height;
      this.len = 50 + Math.random() * 150;
      this.speed = 2 + Math.random() * 3;
      this.hue = 180 + Math.random() * 120;
    }
    draw() {
      const grad = this.ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y);
      grad.addColorStop(0, `hsla(${this.hue},100%,60%,1)`);
      grad.addColorStop(1, `hsla(${this.hue},100%,60%,0)`);
      this.ctx.strokeStyle = grad;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x - this.len, this.y);
      this.ctx.stroke();
    }
    update() {
      this.x += this.speed;
      if(this.x - this.len > this.width) this.reset();
      this.draw();
    }
  }

  const streaks = Array.from({ length: 100 }, () => new Streak(bgCtx, window.innerWidth, window.innerHeight));
  (function animateStreaks() {
    bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
    streaks.forEach(s => s.update());
    requestAnimationFrame(animateStreaks);
  })();

  // --- Three.js Agentic Core ---
  const container = document.getElementById('agentic-core-container');
  if(container && THREE){

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Core
    const coreGeo = new THREE.IcosahedronGeometry(6, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0099ff,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.2
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Nodes
    const nodes = [], beams = [], photons = [];
    const nodeCount = 8, orbitRadius = 15;
    const nodeGeo = new THREE.SphereGeometry(1,32,32);

    for(let i=0;i<nodeCount;i++){
      const mat = new THREE.MeshStandardMaterial({
        emissive:0x00ccff,
        emissiveIntensity:1.5,
        metalness:0.8
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set(Math.cos(i*2*Math.PI/nodeCount)*orbitRadius,0,Math.sin(i*2*Math.PI/nodeCount)*orbitRadius);
      scene.add(mesh);
      nodes.push({mesh,mat,flash:0});

      // Beam
      const points = [core.position.clone(), mesh.position.clone()];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const beamMat = new THREE.LineBasicMaterial({color:0x00ffff,transparent:true,opacity:0.4});
      const beam = new THREE.Line(beamGeo, beamMat);
      scene.add(beam);
      beams.push({line:beam,mesh});

      // Photon
      const photon = new THREE.Mesh(new THREE.SphereGeometry(0.2,16,16),
        new THREE.MeshBasicMaterial({color:0x00ffff}));
      scene.add(photon);
      photons.push({photon,progress:Math.random()});
    }

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040,2));
    const point = new THREE.PointLight(0x00ffff,3,100);
    point.position.set(20,20,20);
    scene.add(point);

    // Animate
    function animate(){
      requestAnimationFrame(animate);
      core.rotation.y += 0.003;
      core.rotation.x += 0.001;

      nodes.forEach((n,i)=>{
        const angle = Date.now()*0.0005 + i;
        n.mesh.position.set(Math.cos(angle)*orbitRadius, Math.sin(angle*0.5)*3, Math.sin(angle)*orbitRadius);
        if(n.flash>0){ n.flash-=0.02; n.mat.emissive.setHSL(0.55,1,0.5+n.flash*0.5); } 
        else { n.mat.emissive.set(0x00ccff); }
      });

      beams.forEach((b,i)=>{
        const positions = b.line.geometry.attributes.position.array;
        positions[3]=nodes[i].mesh.position.x;
        positions[4]=nodes[i].mesh.position.y;
        positions[5]=nodes[i].mesh.position.z;
        b.line.geometry.attributes.position.needsUpdate = true;

        const p=photons[i];
        p.progress+=0.01;
        if(p.progress>=1){ p.progress=0; nodes[i].flash=1; }
        p.photon.position.lerpVectors(core.position, nodes[i].mesh.position, p.progress);
      });

      renderer.render(scene,camera);
    }
    animate();

    window.addEventListener('resize',()=>{
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    });

  }
});
