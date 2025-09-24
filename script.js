document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle (works everywhere) ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('#mobile-menu a, nav a');

  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
      if (!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
    });
  });

  // --- Agentic AI 3D Core ---
  const container = document.getElementById('agentic-core-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  camera.position.z = 18;

  // Postprocessing bloom
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.8, 0.6, 0.9);
  bloomPass.strength = 2.2;
  composer.addPass(bloomPass);

  // Digital wireframe core
  const coreGeometry = new THREE.IcosahedronGeometry(4, 2);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(core);

  // Inner glowing sphere
  const innerCoreGeometry = new THREE.SphereGeometry(2, 64, 64);
  const innerCoreMaterial = new THREE.MeshStandardMaterial({
    emissive: 0x0040ff,
    emissiveIntensity: 1.5,
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.2
  });
  const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
  scene.add(innerCore);

  // Orbiting agent nodes
  const agentNodes = [];
  const nodeGeometry = new THREE.SphereGeometry(0.6, 64, 64);
  for (let i = 0; i < 10; i++) {
    const nodeMaterial = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(`hsl(${Math.random()*360}, 100%, 50%)`),
      emissiveIntensity: 2,
      metalness: 0.7,
      roughness: 0.3
    });
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      Math.cos(i * Math.PI/5) * 10,
      Math.sin(i * Math.PI/5) * 10,
      (Math.random()-0.5) * 6
    );
    scene.add(node);
    agentNodes.push({ mesh: node, angle: i*0.6, material: nodeMaterial });
  }

  // Signal beams
  const beams = [];
  agentNodes.forEach(nodeObj => {
    const points = [core.position.clone(), nodeObj.mesh.position.clone()];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    beams.push({ line, node: nodeObj });
  });

  // Particle trails (photons)
  const trailParticles = [];
  const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  beams.forEach(b => {
    for (let i = 0; i < 6; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      scene.add(particle);
      trailParticles.push({
        mesh: particle,
        progress: Math.random(), // 0 to 1 along beam
        speed: 0.002 + Math.random()*0.004,
        start: core.position.clone(),
        end: b.node.mesh.position,
        node: b.node
      });
    }
  });

  // Lights
  scene.add(new THREE.PointLight(0x00ffff, 3, 100).position.set(10,10,10));
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Animate
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Core pulse
    core.rotation.y += 0.002;
    innerCore.material.emissiveIntensity = 1.5 + Math.sin(t*2)*0.7;

    // Nodes orbit + pulse
    agentNodes.forEach((nodeObj, i) => {
      nodeObj.angle += 0.001 + i*0.0002;
      nodeObj.mesh.position.x = Math.cos(nodeObj.angle) * 10;
      nodeObj.mesh.position.z = Math.sin(nodeObj.angle) * 10;
      nodeObj.material.emissive.setHSL((Math.sin(t + i) * 0.5 + 0.5), 1, 0.5);
    });

    // Update beams
    beams.forEach(b => {
      const positions = new Float32Array([
        core.position.x, core.position.y, core.position.z,
        b.node.mesh.position.x, b.node.mesh.position.y, b.node.mesh.position.z
      ]);
      b.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      b.line.geometry.attributes.position.needsUpdate = true;
    });

    // Animate trail particles (photons)
    trailParticles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.progress = 0;
        // Flash node on "arrival"
        p.node.material.emissiveIntensity = 3;
        setTimeout(()=>{p.node.material.emissiveIntensity = 2;},150);
      }
      p.mesh.position.lerpVectors(p.start, p.end, p.progress);
      p.mesh.material.color.setHSL((t*2 + p.progress) % 1, 1, 0.5);
    });

    composer.render();
  }
  animate();

  // Resize
  window.addEventListener('resize',()=>{
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth,container.clientHeight);
    composer.setSize(container.clientWidth,container.clientHeight);
  });

});
