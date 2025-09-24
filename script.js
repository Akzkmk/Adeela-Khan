document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle (all screens) ---
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

  camera.position.z = 15;

  // Postprocessing for glow
  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 2.0;
  bloomPass.radius = 0.5;
  composer.addPass(bloomPass);

  // Digital Core (Wireframe)
  const coreGeometry = new THREE.IcosahedronGeometry(3, 3);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  scene.add(core);

  // Inner pulsing sphere
  const innerCoreGeometry = new THREE.SphereGeometry(1.2, 64, 64);
  const innerCoreMaterial = new THREE.MeshStandardMaterial({
    emissive: 0x0040ff,
    emissiveIntensity: 1.5,
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.2
  });
  const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
  scene.add(innerCore);

  // Orbiting Agent Nodes
  const agentNodes = [];
  const nodeGeometry = new THREE.SphereGeometry(0.4, 64, 64);

  for (let i = 0; i < 10; i++) {
    const nodeMaterial = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(`hsl(${Math.random()*360}, 100%, 50%)`),
      emissiveIntensity: 2,
      metalness: 0.7,
      roughness: 0.3
    });
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      Math.cos(i * Math.PI/5) * 7,
      Math.sin(i * Math.PI/5) * 7,
      (Math.random()-0.5) * 4
    );
    scene.add(node);
    agentNodes.push({ mesh: node, angle: i * 0.6, material: nodeMaterial });
  }

  // Lines (digital signal beams)
  const lines = [];
  agentNodes.forEach(nodeObj => {
    const points = [core.position.clone(), nodeObj.mesh.position.clone()];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x00ffff) },
        color2: { value: new THREE.Color(0xff00ff) }
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vPos;
        void main() {
          float t = abs(sin(time + vPos.x*0.1));
          vec3 color = mix(color1, color2, t);
          gl_FragColor = vec4(color, 0.8);
        }
      `
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push({ line, node: nodeObj });
  });

  // Lights
  const pointLight = new THREE.PointLight(0x00ffff, 3, 100);
  pointLight.position.set(10,10,10);
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  // Animate
  let clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Core rotations
    core.rotation.x += 0.001;
    core.rotation.y += 0.002;
    innerCore.material.emissiveIntensity = 1.5 + Math.sin(t*2)*0.5;

    // Orbit nodes
    agentNodes.forEach((nodeObj, i) => {
      nodeObj.angle += 0.002 + i*0.0003;
      nodeObj.mesh.position.x = Math.cos(nodeObj.angle) * 7;
      nodeObj.mesh.position.z = Math.sin(nodeObj.angle) * 7;
      nodeObj.material.emissive.setHSL((Math.sin(t + i) * 0.5 + 0.5), 1, 0.5); // gradient pulse
    });

    // Update lines (dynamic movement)
    lines.forEach(l => {
      l.line.material.uniforms.time.value = t*3;
      const positions = new Float32Array([
        core.position.x, core.position.y, core.position.z,
        l.node.mesh.position.x, l.node.mesh.position.y, l.node.mesh.position.z
      ]);
      l.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
