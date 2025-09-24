// script.js - Futuristic 2049 Agentic Core + streaks + menu
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
    reset(){ this.x=Math.random()*bgCanvas.width; this.y=Math.random()*bgCanvas.height; this.len=50+Math.random()*120; this.speed=0.5+Math.random(); this.hue=180+Math.random()*120; }
    draw(){ const g=this.ctx.createLinearGradient(this.x,this.y,this.x-this.len,this.y); g.addColorStop(0,`hsla(${this.hue},100%,70%,1)`); g.addColorStop(1,`hsla(${this.hue},100%,70%,0)`); this.ctx.strokeStyle=g; this.ctx.beginPath(); this.ctx.moveTo(this.x,this.y); this.ctx.lineTo(this.x-this.len,this.y); this.ctx.stroke(); }
    update(){ this.x+=this.speed; if(this.x-this.len>bgCanvas.width) this.reset(); this.draw(); }
  }
  const streaks=Array.from({length:80},()=>new Streak(bgCtx));
  (function animateStreaks(){ bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height); streaks.forEach(s=>s.update()); requestAnimationFrame(animateStreaks); })();

  // --- Three.js Futuristic Core ---
  const container = document.getElementById('agentic-core-container');
  if(container && THREE){
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.z=35;

    const renderer=new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Core: layered digital geometry ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const createCoreLayer=(size,hue,opacity,wire=false)=>{
      const geo = new THREE.IcosahedronGeometry(size,1);
      let mat;
      if(wire){
        mat=new THREE.MeshBasicMaterial({color:new THREE.Color(`hsl(${hue},100%,70%)`),wireframe:true,opacity,transparent:true});
      } else {
        mat=new THREE.MeshStandardMaterial({color:new THREE.Color(`hsl(${hue},80%,60%)`),emissive:new THREE.Color(`hsl(${hue},80%,40%)`),emissiveIntensity:0.7,metalness:0.5,roughness:0.1,transparent:true,opacity});
      }
      const mesh=new THREE.Mesh(geo,mat);
      coreGroup.add(mesh);
      return mesh;
    }

    const layers=[
      createCoreLayer(6,180,0.2,false),
      createCoreLayer(4,200,0.4,true),
      createCoreLayer(2,220,0.7,false)
    ];

    // Nodes orbiting
    const nodes=[], photons=[];
    const nodeCount=10, orbitRadius=15;
    const nodeGeo=new THREE.SphereGeometry(0.4,16,16);
    for(let i=0;i<nodeCount;i++){
      const mat=new THREE.MeshStandardMaterial({emissive:0x00ffff,emissiveIntensity:0.8,metalness:0.5,roughness:0.1});
      const mesh=new THREE.Mesh(nodeGeo,mat);
      scene.add(mesh);
      nodes.push({mesh,angle:Math.random()*Math.PI*2});
      // photon
      const p=new THREE.Mesh(new THREE.SphereGeometry(0.15,12,12),new THREE.MeshBasicMaterial({color:0x00ffff}));
      scene.add(p);
      photons.push({photon:p,progress:Math.random()});
    }

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040,1.5));
    const pointLight=new THREE.PointLight(0x00ffff,2,100);
    pointLight.position.set(20,20,20);
    scene.add(pointLight);

    // Animate
    function animate(){
      requestAnimationFrame(animate);
      coreGroup.rotation.y+=0.001;
      coreGroup.rotation.x+=0.0005;

      // Orbit nodes slowly
      nodes.forEach((n,i)=>{
        n.angle+=0.001;
        n.mesh.position.set(Math.cos(n.angle)*orbitRadius,Math.sin(n.angle*0.5)*3,Math.sin(n.angle)*orbitRadius);
      });

      // Photons along node beams
      photons.forEach((p,i)=>{
        p.progress+=0.003;
        if(p.progress>1) p.progress=0;
        p.photon.position.lerpVectors(coreGroup.position,nodes[i].mesh.position,p.progress);
      });

      renderer.render(scene,camera);
    }
    animate();

    window.addEventListener('resize',()=>{
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    });
  }
});
