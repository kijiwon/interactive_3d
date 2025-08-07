import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  MeshBasicMaterial,
} from "three";
import { Vec3, Box, Body, Quaternion } from "cannon-es";

// MeshObject 생성 클래스
export class MeshObject {
  // class의 인스턴스 객체가 생성될 때마다 실행(초기화 역활)
  constructor(info) {
    this.name = info.name;
    this.width = info.width || 1;
    this.height = info.height || 1;
    this.depth = info.depth || 1;
    this.color = info.color || "white";
    this.x = info.x || 0;
    this.differenceY = info.differenceY || 0.4; // floor의 높이만큼 올림
    this.y = info.y || this.height / 2 + this.differenceY; // 모든 mesh는 지면에 닿아있어야함
    this.z = info.z || 0;
    // x, y, z에 1을 곱해 문자열로 출력되는 오류 막기
    this.x *= 1;
    this.y *= 1;
    this.z *= 1;

    this.rotationX = info.rotationX || 0;
    this.rotationY = info.rotationY || 0;
    this.rotationZ = info.rotationZ || 0;

    // mesh에 따라 shape 생성
    (this.cannonShape =
      info.cannonShape ||
      new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2))), // 중심 위치(x, y, z)에서 각 표면까지의 거리;
      (this.mass = info.mass || 0);
    this.cannonWorld = info.cannonWorld;
    this.cannonMaterial = info.cannonMaterial;

    if (info.modelSrc) {
      // GLTF model
      info.loader.load(
        info.modelSrc,
        (glb) => {
          this.mesh = glb.scene;
          this.mesh.name = this.name;
          // glb model의 속성을 설정하기 위해 traverse로 모든 자식 객체에 접근
          this.mesh.traverse((child) => {
            if (child.isMesh) {
              // mesh 객체에 그림자 속성 적용
              child.castShadow = true;
            }
          });
          this.mesh.position.set(this.x, this.y, this.z);
          this.mesh.rotation.set(
            this.rotationX,
            this.rotationY,
            this.rotationZ
          );
          info.scene.add(this.mesh);
          // raycaster 인식 용 mesh 변환
          const geometry =
            info.geometry ||
            new BoxGeometry(this.width, this.height, this.depth);
          this.transparentMesh = new Mesh(
            geometry,
            new MeshBasicMaterial({
              color: "green",
              transparent: true,
              opacity: 0,
            })
          );
          this.transparentMesh.name = this.name;
          this.transparentMesh.position.set(this.x, this.y, this.z);
          info.scene.add(this.transparentMesh);

          this.setCannonBody(); // mesh 생성 후 cannon body 생성
          if (info.callback) info.callback();
        },
        (xhr) => {
          console.log("loading...");
        },
        (error) => {
          console.log("error!!");
        }
      );
    } else if (info.mapSrc) {
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      info.loader.load(info.mapSrc, (texture) => {
        const material = new MeshLambertMaterial({
          map: texture,
        });
        this.mesh = new Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
        info.scene.add(this.mesh);
        this.setCannonBody(); // mesh 생성 후 cannon body 생성
      });
    } else {
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      const material = new MeshLambertMaterial({
        color: this.color,
      });

      this.mesh = new Mesh(geometry, material);
      this.mesh.name = this.name;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
      info.scene.add(this.mesh);
      this.setCannonBody(); // mesh 생성 후 cannon body 생성
    }
  }

  setCannonBody() {
    this.cannonBody = new Body({
      mass: this.mass, // 물리 객체의 질량. 0이면 정지 상태
      position: new Vec3(this.x, this.y, this.z),
      shape: this.cannonShape,
      material: this.cannonMaterial,
    });

    // 회전 설정
    // rotation: x
    const quatX = new Quaternion();
    const axisX = new Vec3(1, 0, 0); // x축 기준
    quatX.setFromAxisAngle(axisX, this.rotationX);

    // rotation: y
    const quatY = new Quaternion();
    const axisY = new Vec3(0, 1, 0); // y축 기준
    quatY.setFromAxisAngle(axisY, this.rotationY);

    // rotation: z
    const quatZ = new Quaternion();
    const axisZ = new Vec3(0, 0, 1); // z축 기준
    quatZ.setFromAxisAngle(axisZ, this.rotationZ);

    // quaternion 객체 결합
    const combinedQuat = quatX.mult(quatY).mult(quatZ);
    this.cannonBody.quaternion = combinedQuat;

    this.cannonWorld.addBody(this.cannonBody);
  }
}

// Lamp
export class Lamp extends MeshObject {
  constructor(info) {
    super(info);
  }

  togglePower() {
    if (this.light.intensity === 0) {
      // 불 켜기
      this.light.intensity = 7;
    } else {
      // 불 끄기
      this.light.intensity = 0;
    }
  }
}

export class RoboticVaccum extends MeshObject {
  constructor(info) {
    super(info);
    this.powerOn = false;
    this.r = 0; //  이동 반경
    this.angle = 0;
    this.originX = this.x; // 초기 위치
    this.originZ = this.z; // 초기 위치
  }

  togglePower() {
    this.powerOn = !this.powerOn;
  }

  move() {
    if (this.powerOn) {
      this.cannonBody.position.x = this.originX + Math.cos(this.angle) * this.r; // 초기 위치 x에서 원운동
      this.cannonBody.position.z = this.originZ + Math.sin(this.angle) * this.r; // 초기 위치 z에서 원운동
      this.angle += 0.005; // 각도 증가량을 조절해 속도 제어
      this.r = Math.sin(this.angle * 2); // 이동 반경은 계속 변화
    }
  }
}
