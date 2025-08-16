import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Lamp, MeshObject, RoboticVaccum } from "./MeshObject";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KeyController } from "./KeyController";
import { TouchController } from "./TouchController";
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
const touchController = new TouchController();

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
const playerCannonMaterial = new CANNON.Material("player");

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

const playerContactMaterial = new CANNON.ContactMaterial(
  playerCannonMaterial,
  defaultCannonMaterial,
  {
    // 마찰력
    friction: 100,
    // 반발력
    restitution: 0,
  }
);

cannonWorld.defaultContactMaterial = defaultContactMaterial;
cannonWorld.addContactMaterial(playerContactMaterial);

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

const lamp = new Lamp({
  scene,
  loader: gltfLoader,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  cannonShape: new CANNON.Cylinder(0.25, 0.3, 1.8, 32),
  geometry: new THREE.CylinderGeometry(0.25, 0.25, 1.81, 32),
  mass: 10,
  name: "lamp",
  width: 0.5,
  height: 1.8,
  depth: 0.5,
  z: -1.7,
  // y: 3,
  modelSrc: "/models/lamp.glb",
  // 객체 생성 시 실행
  callback: () => {
    const lampLight = new THREE.PointLight("#eac6ab", 0, 50); // 불을 끄려면 0, 키려면 1
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.width = 2048;
    lampLight.shadow.mapSize.height = 2048;
    lampLight.position.y = 0.75;
    lamp.mesh.add(lampLight);
    lamp.light = lampLight; // 속성 추가
  },
});

const roboticVaccum = new RoboticVaccum({
  scene,
  loader: gltfLoader,
  cannonWorld,
  cannonMaterial: defaultCannonMaterial,
  cannonShape: new CANNON.Cylinder(0.25, 0.25, 0.1, 32),
  geometry: new THREE.CylinderGeometry(0.25, 0.25, 0.11, 32),
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
  cannonMaterial: playerCannonMaterial,
  mass: 50,
  z: 1.5,
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

// device 확인
let device;
function setDevice() {
  const htmlElem = document.querySelector("html");

  if ("ontouchstart" in document.documentElement && window.innerWidth < 1300) {
    // mobile
    device = "mobile";
    htmlElem.classList.add("touchevents"); // css 설정
  } else {
    device = "desktop";
    htmlElem.classList.add("no-touchevents"); // css 설정
  }
}

// Event
// resize
function setLayout() {
  setDevice();
  if (device === "mobile") {
    touchController.setPosition();
  }

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", setLayout);

// camera move
document.addEventListener("click", () => {
  if (device === "mobile") return; // 모바일 환경에서는 실행x
  canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    setMode("game");
  } else {
    setMode("website");
  }
});

// Raycasting - 클릭 감지
// 마우스 좌표
const mouse = new THREE.Vector2(); // 기본값 0, 0
const raycaster = new THREE.Raycaster();
function checkIntersects() {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  for (const item of intersects) {
    // console.log(item.object.name); // 광선 맞은 item 확인
    if (item.object.name === "lamp") {
      lamp.togglePower();
      break;
    } else if (item.object.name === "roboticVaccum") {
      roboticVaccum.togglePower();
      break;
    } else if (item.object.name === "desk") {
      break;
    } else if (item.object.name === "magazine") {
      break;
    }
  }
}

canvas.addEventListener("click", (event) => {
  if (device === "mobile") {
    // mobile 버전
    // 화면 중앙을 0으로 두고  -1(좌) 1(상) 1(우) -1(하)로 설정
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY / canvas.clientHeight) * 2 - 1);
    checkIntersects();
  } else {
    // desktop에서는 화면 중앙이 고정된 상태
    mouse.x = 0;
    mouse.y = 0;
    if (document.body.dataset.mode === "game") {
      checkIntersects();
    }
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

// 모바일 이동
function moveMobile() {
  if (!touchController.walkTouch) return;
  const cx = touchController.cx;
  const cy = touchController.cy;
  // cx와 cy 사이의 각도
  const yy = touchController.walkTouch.clientY - cy; // y좌표의 차
  const xx = touchController.walkTouch.clientX - cx; // x좌표의 차
  const angle = Math.atan2(-yy, xx);
  const angle2 = Math.atan2(yy, xx);

  // player 이동
  player.walkMobile(delta, angle);

  touchController.setAngleOfBar(angle2);
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
  // 카메라 회전 속도 조절
  let factor = delta * 50;
  if (device === "mobile") factor = delta * 0.3;

  // rotation
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= movementX * factor;
  euler.x -= movementY * factor;

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
  player.rotationY = euler.y; // 카메라가 회전하면 player도 적용

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

      // mesh가 움직이고 난 후 cannonMesh도 함께 이동
      if (obj.transparentMesh) {
        obj.transparentMesh.position.copy(obj.cannonBody.position); // copy 메소드를 사용해 mesh가 cannonBody의 위치를 복사
        obj.transparentMesh.quaternion.copy(obj.cannonBody.quaternion); // copy 메소드를 사용해 mesh가 cannonBody의 회전을 복사
      }
    }
  }

  // 키보드 이동 적용
  if (player.cannonBody) {
    player.mesh.position.copy(player.cannonBody.position);
    player.x = player.cannonBody.position.x;
    player.y = player.cannonBody.position.y;
    player.z = player.cannonBody.position.z;

    if (device === "mobile") {
      moveMobile();
    } else {
      move();
    }
  }

  moveCamera();
  roboticVaccum.move();

  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
}

setDevice();
setMode("website");
draw();

// touch control
const touchX = [];
const touchY = [];
window.addEventListener("touchstart", (event) => {
  // 컨트롤러 터치 감지 -> 따로 처리
  if (event.target === touchController.elem) return;

  movementX = 0;
  movementY = 0;
  // 처음 터치 좌표
  touchX[0] = event.targetTouches[0].clientX;
  touchX[1] = event.targetTouches[0].clientX;
  touchY[0] = event.targetTouches[0].clientY;
  touchY[1] = event.targetTouches[0].clientY;
});

window.addEventListener("touchmove", (event) => {
  if (event.target === touchController.elem) return;

  movementX = 0;
  if (event.target === touchController.elem) return;
  movementY = 0;

  touchX[0] = touchX[1];
  touchX[1] = event.targetTouches[0].clientX; // 새로운 터치 좌표
  touchY[0] = touchY[1];
  touchY[1] = event.targetTouches[0].clientY;

  // 움직인 거리 계산
  movementX = touchX[1] - touchX[0];
  movementY = touchY[1] - touchY[0];
});

window.addEventListener("touchend", (event) => {
  if (event.target === touchController.elem) return;
  // 초기화
  movementX = 0;
  movementY = 0;
  touchX[0] = touchX[1] = 0;
  touchY[0] = touchY[1] = 0;
});

// 두 손가락 터치 - 기본 동작을 막아 오류 방지
window.addEventListener("gesturestart", (event) => {
  event.preventDefault();
});
window.addEventListener("gesturechange", (event) => {
  event.preventDefault();
});
window.addEventListener("gestureend", (event) => {
  event.preventDefault();
});
