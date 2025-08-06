import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshObject } from "./MeshObject";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KeyController } from "./KeyController";
import * as CANNON from "cannon-es";
import { Player } from "./Player";

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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
// const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const keyController = new KeyController();

// light
const ambientLight = new THREE.AmbientLight("white", 1);

const pointLight = new THREE.PointLight("white", 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.y = 10;

scene.add(ambientLight, pointLight);

// cannon(physics)
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0); // 중력 설정(지구의 중력 가속도는 -9.8)

const defaultCannonMaterial = new CANNON.Material("default");
// Material 끼리 접촉했을 때
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultCannonMaterial,
  defaultCannonMaterial,
  {
    // 마찰력
    friction: 1,
    // 반발력
    restitution: 0.2,
  }
);
cannonWorld.defaultContactMaterial = defaultContactMaterial;

const cannonObjects = [];

// mesh
const ground = new MeshObject({
  scene,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  name: "ground",
  width: 50,
  height: 0.1,
  depth: 50,
  color: "#092e66",
  y: -0.05,
  differenceY: "0",
});

const floor = new MeshObject({
  scene,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  name: "floor",
  width: 5,
  height: 0.4,
  depth: 5,
  differenceY: "0",
});

const wall1 = new MeshObject({
  scene,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  name: "wall1",
  width: 5,
  height: 3,
  depth: 0.2,
  z: -2.4,
});

const wall2 = new MeshObject({
  scene,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  name: "wall2",
  width: 0.2,
  height: 3,
  depth: 4.8,
  x: 2.4,
  z: 0.1,
});

// GLTF model
const desk = new MeshObject({
  scene,
  cannonWorld,
  loader: gltfLoader,
  cannonMaterial: defaultCannonMaterial,
  mass: 20,
  name: "desk",
  width: 1.8,
  height: 0.8,
  depth: 0.75,
  x: 1.2,
  z: -1.9,
  modelSrc: "/models/desk.glb",
});

const lamp = new MeshObject({
  scene,
  loader: gltfLoader,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  mass: 10,
  name: "lamp",
  width: 0.5,
  height: 1.8,
  depth: 0.5,
  z: -1.7,
  y: 10,
  modelSrc: "/models/lamp.glb",
});

const roboticVaccum = new MeshObject({
  scene,
  loader: gltfLoader,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  mass: 10,
  name: "roboticVaccum",
  width: 0.5,
  height: 0.1,
  depth: 0.5,
  x: -1,
  modelSrc: "/models/vaccum.glb",
});

const magazine = new MeshObject({
  scene,
  loader: textureLoader,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  mass: 0.5,
  name: "magazine",
  width: 0.2,
  height: 0.02,
  depth: 0.29,
  x: 0.7,
  y: 1.32,
  rotationX: THREE.MathUtils.degToRad(52),
  z: -2.2,
  mapSrc: "/models/magazine.jpg",
});

const player = new Player({
  scene,
  loader: textureLoader,
  cannonWorld,
  mass: 50,
  y: 10,
});

// cannon에 영향을 받는 mesh 객체
cannonObjects.push(
  ground,
  floor,
  wall1,
  wall2,
  desk,
  lamp,
  roboticVaccum,
  magazine
);

// Event
// resize
function setLayout() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", setLayout);

// camera move
document.addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    setMode("game");
  } else {
    setMode("website");
  }
});

// key move
function move() {
  if (keyController.keys["KeyW"] || keyController.keys["ArrowUp"]) {
    // forward
    player.walk(-0.05, "forward");
  }
  if (keyController.keys["KeyS"] || keyController.keys["ArrowDown"]) {
    // backward
    player.walk(0.05, "backward");
  }
  if (keyController.keys["KeyA"] || keyController.keys["ArrowLeft"]) {
    // left
    player.walk(0.05, "left");
  }
  if (keyController.keys["KeyD"] || keyController.keys["ArrowRight"]) {
    // right
    player.walk(0.05, "right");
  }
}

let movementX = 0;
let movementY = 0;

function updateMovementValue(event) {
  movementX = event.movementX * delta;
  movementY = event.movementY * delta;
}

const euler = new THREE.Euler(0, 0, 0, "YXZ");
// 최소 최대 각
const minPolarAngle = 0;
const maxPolarAngle = Math.PI;

function moveCamera() {
  // rotation
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= movementX;
  euler.x -= movementY;

  euler.x = Math.max(
    Math.PI / 2 - maxPolarAngle,
    Math.min(Math.PI / 2 - minPolarAngle, euler.x)
  );

  // movement 값 줄이기
  movementX -= movementX * 0.2;
  movementY -= movementY * 0.2;

  // 0.1보다 작아지면 멈추기
  if (Math.abs(movementX) < 0.1) movementX = 0;
  if (Math.abs(movementY) < 0.1) movementY = 0;

  camera.quaternion.setFromEuler(euler);
  player.rotationY = euler.y; // 카메라가 회전하면 play도 적용

  // position
  camera.position.x = player.x;
  camera.position.y = player.y + 1;
  camera.position.z = player.z;
}

function setMode(mode) {
  document.body.dataset.mode = mode;

  // mouse move
  if (mode === "game") {
    document.addEventListener("mousemove", updateMovementValue);
  } else if (mode === "website") {
    document.removeEventListener("mousemove", updateMovementValue);
  }
}

// draw
// 기기마다 함수 실행 간격 맞추기 - clock 사용
const clock = new THREE.Clock();
let delta;

function draw() {
  delta = clock.getDelta();

  // 물리 시뮬레이션 업데이트 간격
  let cannonStepTime = 1 / 60;
  if (delta < 0.01) cannonStepTime = 1 / 120;
  cannonWorld.step(cannonStepTime, delta, 3); // 세 번째 인자는 움직임에 차이가 생길 경우 보정을 시도하는 횟수(보통 3으로 설정)

  // 물리 시뮬레이션 적용
  for (const obj of cannonObjects) {
    if (obj.cannonBody) {
      obj.mesh.position.copy(obj.cannonBody.position); // copy 메소드를 사용해 mesh가 cannonBody의 위치를 복사
      obj.mesh.quaternion.copy(obj.cannonBody.quaternion); // copy 메소드를 사용해 mesh가 cannonBody의 회전을 복사
    }
  }

  // 키보드 이동 적용
  if (player.cannonBody) {
    player.mesh.position.copy(player.cannonBody.position);
    player.x = player.cannonBody.position.x;
    player.y = player.cannonBody.position.y;
    player.z = player.cannonBody.position.z;
    move();
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
  moveCamera();
}
draw();
