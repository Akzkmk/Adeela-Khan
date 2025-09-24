// script.js - 2049 Futuristic Digital Agentic Core
document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('#mobile-menu a, .header nav a');
  mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  navLinks.forEach(l => l.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelector(this.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});
    });
  });

  // --- Background Streaks ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  function resizeCanvas(){ bgCanvas.width=window.innerWidth; bgCanvas.height=window.innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);

  class Streak {
    constructor(ctx){ this.ctx=ctx; this.reset(); }
    reset(){ this.x=Math.random()*bgCanvas.width; this.y=Math.random()*bgCanvas.height; this.len=50+Math.random()*120; this.speed=0.3+Math.random()*0.5; this.hue=180+Math.random()*120; }
    draw(){ const g=this.ctx.createLinearGradient(this.x,this.y,this.x-this.len,this.y); g.addColorStop(0,`hsla(${this.hue},100%,70%,1)`); g.addColorStop(1,`hsla(${this.hue},100%,70%,0)`); this.ctx.strokeStyle=g; this.ctx.beginPath(); this.ctx.moveTo(this.x,this.y); this.ctx.lineTo(this.x-this.len,this.y); this.ctx.stroke(); }
    update(){ this.x+=this.speed; if(this.x-this.len>bgCanvas.width) this.reset(); this.draw(); }
  }
  const streaks=Array.from({length:60},()=>new Streak(bgCtx));
  (function animateStreaks(){ bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height); streaks.forEach(s=>s.update()); requestAnimationFrame(animateStreaks); })();

  // --- Three.js Futuristic Agentic Core ---
  const container = document.getElementById('agentic-core-container');
  if(container && THREE){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Core group ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Core layers: semi-transparent, wireframe, emissive
    const layers = [];
    const createLayer = (size, hue, opacity, wire=false)=>{
      const geo = new THREE.IcosahedronGeometry(size,1);
      let mat;
      if(wire){
        mat = new THREE.MeshBasicMaterial({color:new THREE.Color(`hsl(${hue},100%,70%)`),wireframe:true,opacity,transparent:true});
      } else {
        mat = new THREE.MeshStandardMaterial({color:new THREE.Color(`hsl(${hue},80%,60%)`),emissive:new THREE.Color(`hsl(${hue},80%,40%)`),emissiveIntensity:0.6,metalness:0.4,roughness:0.1,transparent:true,opacity});
      }
      const mesh = new THREE.Mesh(geo, mat);
      coreGroup.add(mesh);
      layers.push({mesh,mat,baseOpacity:opacity});
      return mesh;
    }

    createLayer(6,180,0.2,false);
    createLayer(4,200,0.3,true);
    createLayer(2.5,220,0.5,false);

    // Orbiting nodes
    const nodes = [], photons = [];
    const nodeCount = 10, orbitRadius = 15;
    const nodeGeo = new THREE.SphereGeometry(0.35,16,16);
    for(let i=0;i<nodeCount;i++){
      const mat = new THREE.MeshStandardMaterial({emissive:0x00ffff,emissiveIntensity:0.5,metalness:0.3,roughness:0.1});
      const mesh = new THREE.Mesh(nodeGeo, mat);
      scene.add(mesh);
      nodes.push({mesh,angle:Math.random()*Math.PI*2,baseIntensity:0.5});
      // photon
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.15,12,12), new THREE.MeshBasicMaterial({color:0x00ffff}));
      scene.add(p);
      photons.push({photon:p,progress:Math.random()});
    }

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040,1.2));
    const pointLight = new THREE.PointLight(0x00ffff,1.8,100);
    pointLight.position.set(20,20,20);
    scene.add(pointLight);

    // --- Holographic scan lines overlay ---
    const scanMaterial = new THREE.LineBasicMaterial({color:0x00ffff,transparent:true,opacity:0.05});
    const scanLines = [];
    for(let i=0;i<30;i++){
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10,i-15,0), new THREE.Vector3(10,i-15,0)]);
      const line = new THREE.Line(geometry, scanMaterial);
      coreGroup.add(line);
      scanLines.push({line,yOffset:i*0.5});
    }

    // Animate
    let pulse = 0;
    function animate(){
      requestAnimationFrame(animate);

      // Core rotation
      coreGroup.rotation.y += 0.0008;
      coreGroup.rotation.x += 0.0004;

      // Pulse layers
      pulse += 0.005;
      layers.forEach(l=>{
        l.mat.emissiveIntensity = 0.5 + 0.2*Math.sin(pulse*2);
      });

      // Orbit nodes & photon pulses
      nodes.forEach((n,i)=>{
        n.angle += 0.0008;
        n.mesh.position.set(Math.cos(n.angle)*orbitRadius, Math.sin(n.angle*0.5)*3, Math.sin(n.angle)*orbitRadius);

        // node pulse if photon is near
        const p = photons[i];
        p.progress += 0.003;
        if(p.progress>1){ p.progress=0; }
        const dist = p.photon.position.distanceTo(n.mesh.position);
        n.mesh.material.emissiveIntensity = n.baseIntensity + (dist<1?0.5:0);
        p.photon.position.lerpVectors(coreGroup.position, n.mesh.position, p.progress);
      });

      // Scan lines animation
      scanLines.forEach(s=>{
        s.line.position.y += 0.01;
        if(s.line.position.y>15) s.line.position.y=-15;
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
