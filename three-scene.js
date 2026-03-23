// Configura a cena, camera e renderizador
const container = document.getElementById('cubeCanvasWrapper');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Criando o cubo de vidro/gelo brilhante
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

// Material principal (vidro esverdeado)
const material = new THREE.MeshPhysicalMaterial({
    color: 0x54d27c,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
    transmission: 0.9, 
    ior: 1.5,
    reflectivity: 1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Material interno para dar aquele "brilho" volumetrico (Wireframe ou cubo interno)
const innerGeometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x54d27c,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
cube.add(innerCube);

// Luzes
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x54d27c, 2, 10);
pointLight1.position.set(2, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x2ba55c, 1.5, 10);
pointLight2.position.set(-2, -2, -2);
scene.add(pointLight2);

// Efeito flutuante e rotação
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotacionando lentamente
    cube.rotation.x += 0.003;
    cube.rotation.y += 0.005;

    innerCube.rotation.x -= 0.001;
    innerCube.rotation.y -= 0.002;

    // Efeito de bob (flutuação)
    cube.position.y = Math.sin(time * 1.5) * 0.1;

    renderer.render(scene, camera);
}

// Lidar com resize do container
window.addEventListener('resize', () => {
    if(!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
