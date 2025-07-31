import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// renderer
const canvas = document.querySelector("#three-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1); // 기기에 따라 화면비 설정
// 그림자 효과
renderer.shadowMap.enabled = true;

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("orange");

// camera
const camera = new THREE.PerspectiveCamera(
  60, // 시야각
  window.innerWidth / window.innerHeight, // 가로세로비
  0.1, // 가장 가까운 거리
  1000 // 가장 먼 거리
);
camera.position.set(-3, 3, 7);
scene.add(camera);

// controls
const controls = new OrbitControls(camera, renderer.domElement);

// light
const ambientLight = new THREE.AmbientLight("white", 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 3);
directionalLight.position.set(-3, 5, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// mesh
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshLambertMaterial({
  color: "firebrick",
  side: THREE.DoubleSide,
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
boxMesh.castShadow = true;
boxMesh.position.y = 1;

scene.add(boxMesh);

const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshLambertMaterial({
  color: "#092e66",
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = THREE.MathUtils.degToRad(-90);
groundMesh.receiveShadow = true;

scene.add(groundMesh);

camera.lookAt(boxMesh.position);

// draw
// 기기마다 함수 실행 간격 맞추기 - clock 사용
const clock = new THREE.Clock();
function draw() {
  //   boxMesh.position.y += 0.01;
  const delta = clock.getDelta();
  boxMesh.position.y += delta;
  if (boxMesh.position.y > 5) {
    boxMesh.position.y = 0;
  }
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
}
draw();

// resize
function setLayout() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", setLayout);
