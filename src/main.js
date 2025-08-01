import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshObject } from "./MeshObject";

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
scene.background = new THREE.Color("white");

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
const ambientLight = new THREE.AmbientLight("white", 1);
const pointLight = new THREE.PointLight("white", 100, 100);
pointLight.castShadow = true;
pointLight.position.y = 10;

scene.add(ambientLight, pointLight);

// mesh
const ground = new MeshObject({
  scene,
  name: "ground",
  width: 50,
  height: 0.1,
  depth: 50,
  color: "#092e66",
  y: -0.05,
});

const floor = new MeshObject({
  scene,
  name: "floor",
  width: 5,
  height: 0.4,
  depth: 5,
});

const wall1 = new MeshObject({
  scene,
  name: "wall1",
  width: 5,
  height: 3,
  depth: 0.2,
  z: -2.4,
});

const wall2 = new MeshObject({
  scene,
  name: "wall2",
  width: 0.2,
  height: 3,
  depth: 4.8,
  x: 2.4,
  z: 0.1,
});

// draw
// 기기마다 함수 실행 간격 맞추기 - clock 사용
const clock = new THREE.Clock();
function draw() {
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
