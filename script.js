<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic Orchestrator</title>
  <style>
    html,body {
      margin:0; height:100%;
      background:#000; color:#fff;
      overflow-x:hidden; font-family:sans-serif;
    }
    nav {
      position:fixed; top:0; left:0; width:100%;
      display:flex; justify-content:space-between; align-items:center;
      background:rgba(0,0,0,0.7); padding:10px 20px;
      z-index:1000;
    }
    nav a { color:#0ff; text-decoration:none; margin:0 10px; font-weight:bold; }
    #mobile-menu-button { display:none; cursor:pointer; }
    #mobile-menu { display:none; flex-direction:column; position:absolute; top:50px; left:0; width:100%; background:#000; }
    #mobile-menu a { padding:15px; border-bottom:1px solid #222; }
    .hidden { display:none; }
    @media(max-width:768px){
      #mobile-menu-button{display:block;}
      nav>div{display:none;}
      #mobile-menu{display:flex;}
    }
    section { height:100vh; display:flex; justify-content:center; align-items:center; text-align:center; }
    canvas#bg-streaks { position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; }
    #agentic-core-container {
      position:fixed; top:0; left:0; width:100%; height:100%;
      z-index:1; pointer-events:none;
    }
  </style>
</head>
<body>
  <nav>
    <div>
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#timeline">Timeline</a>
    </div>
    <div id="mobile-menu-button">☰</div>
    <div id="mobile-menu" class="hidden">
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#timeline">Timeline</a>
    </div>
  </nav>

  <canvas id="bg-streaks"></canvas>
  <div id="agentic-core-container"></div>

  <section id="home"><h1>Main Screen</h1></section>
  <section id="features"><h2>Features</h2></section>
  <section id="timeline"><h2>Timeline</h2></section>

  <!-- Three.js -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/examples/js/postprocessing/EffectComposer.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/examples/js/postprocessing/RenderPass.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/examples/js/postprocessing/UnrealBloomPass.js"></script>

  <script>
  document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu ---
    const mobileMenuButton=document.getElementById('mobile-menu-button');
    const mobileMenu=document.getElementById('mobile-menu');
    const navLinks=document.querySelectorAll('#mobile-menu a, nav a');
    mobileMenuButton.addEventListener('click',()=>mobileMenu.classList.toggle('hidden'));
    navLinks.forEach(l=>l.addEventListener('click',()=>mobileMenu.classList.add('hidden')));
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',function(e){
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({behavior:'smooth'});
      });
    });

    // --- Background Streaks ---
    const bgCanvas=document.getElementById('bg-streaks');
    const ctx=bgCanvas.getContext('2d');
    function resizeBg(){ bgCanvas.width=window.innerWidth; bgCanvas.height=window.innerHeight; }
    resizeBg(); window.addEventListener('resize',resizeBg);

    class Streak {
      constructor(){ this.reset(); }
      reset(){
        this.x=Math.random()*bgCanvas.width;
        this.y=Math.random()*bgCanvas.height;
        this.len=50+Math.random()*150;
        this.speed=2+Math.random()*3;
        this.hue=180+Math.random()*120;
      }
      draw(){
        const grad=ctx.createLinearGradient(this.x,this.y,this.x-this.len,this.y);
        grad.addColorStop(0,`hsla(${this.hue},100%,60%,1)`);
        grad.addColorStop(1,`hsla(${this.hue},100%,60%,0)`);
        ctx.strokeStyle=grad;
        ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x-this.len,this.y);
        ctx.stroke();
      }
      update(){
        this.x+=this.speed;
        if(this.x-this.len>bgCanvas.width) this.reset();
        this.draw();
      }
    }
    const streaks=Array.from({length:100},()=>new Streak());
    (function animateStreaks(){
      ctx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
      streaks.forEach(s=>s.update());
      requestAnimationFrame(animateStreaks);
    })();

    // --- Three.js Agentic Core ---
    const container=document.getElementById('agentic-core-container');
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.z=30;

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const composer=new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene,camera));
    const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),1.5,0.6,0.9);
    composer.addPass(bloom);

    // Core
    const coreGeo=new THREE.IcosahedronGeometry(6,3);
    const coreMat=new THREE.MeshStandardMaterial({
      color:0x00ffff,
      emissive:0x0099ff,
      emissiveIntensity:1.5,
      metalness:0.9,
      roughness:0.2
    });
    const core=new THREE.Mesh(coreGeo,coreMat);
    scene.add(core);

    // Nodes
    const nodes=[]; const beams=[]; const photons=[];
    const nodeCount=8; const orbitRadius=15;
    const nodeGeo=new THREE.SphereGeometry(1,32,32);

    for(let i=0;i<nodeCount;i++){
      const mat=new THREE.MeshStandardMaterial({
        emissive:0x00ccff,
        emissiveIntensity:1.5,
        metalness:0.8
      });
      const mesh=new THREE.Mesh(nodeGeo,mat);
      mesh.position.set(Math.cos(i*2*Math.PI/nodeCount)*orbitRadius,0,Math.sin(i*2*Math.PI/nodeCount)*orbitRadius);
      scene.add(mesh);
      nodes.push({mesh,mat,flash:0});

      // Beam
      const points=[core.position.clone(),mesh.position.clone()];
      const beamGeo=new THREE.BufferGeometry().setFromPoints(points);
      const beamMat=new THREE.LineBasicMaterial({color:0x00ffff,transparent:true,opacity:0.4});
      const beam=new THREE.Line(beamGeo,beamMat);
      scene.add(beam);
      beams.push({line:beam,mesh});

      // Photon (signal)
      const photon=new THREE.Mesh(new THREE.SphereGeometry(0.2,16,16),
        new THREE.MeshBasicMaterial({color:0x00ffff}));
      scene.add(photon);
      photons.push({photon,progress:Math.random()});
    }

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040,2));
    const point=new THREE.PointLight(0x00ffff,3,100);
    point.position.set(20,20,20);
    scene.add(point);

    // Animate
    function animate(){
      requestAnimationFrame(animate);
      core.rotation.y+=0.003;
      core.rotation.x+=0.001;

      // Update nodes orbit
      nodes.forEach((n,i)=>{
        const angle=Date.now()*0.0005+i;
        n.mesh.position.set(Math.cos(angle)*orbitRadius,Math.sin(angle*0.5)*3,Math.sin(angle)*orbitRadius);

        // flash fade
        if(n.flash>0){ n.flash-=0.02; n.mat.emissive.setHSL(0.55,1,0.5+n.flash*0.5); }
        else{ n.mat.emissive.set(0x00ccff); }
      });

      // Update beams + photons
      beams.forEach((b,i)=>{
        const positions=b.line.geometry.attributes.position.array;
        positions[3]=nodes[i].mesh.position.x;
        positions[4]=nodes[i].mesh.position.y;
        positions[5]=nodes[i].mesh.position.z;
        b.line.geometry.attributes.position.needsUpdate=true;

        // photon travel
        const p=photons[i];
        p.progress+=0.01;
        if(p.progress>=1){
          p.progress=0;
          nodes[i].flash=1; // trigger flash
        }
        p.photon.position.lerpVectors(core.position,nodes[i].mesh.position,p.progress);
      });

      composer.render();
    }
    animate();

    window.addEventListener('resize',()=>{
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
      composer.setSize(window.innerWidth,window.innerHeight);
    });
  });
  </script>
</body>
</html>
