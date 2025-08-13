import { Mesh, BoxGeometry, MeshBasicMaterial, MathUtils } from "three";
import { Vec3, Box, Body, Quaternion } from "cannon-es";

// 화면을 이동하는 player mesh 생성
export class Player {
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

    this.x *= 1;
    this.y *= 1;
    this.z *= 1;

    this.rotationX = info.rotationX || 0;
    this.rotationY = info.rotationY || 0;
    this.rotationZ = info.rotationZ || 0;

    this.mass = info.mass || 0;
    this.cannonWorld = info.cannonWorld;
    this.cannonMaterial = info.cannonMaterial;

    const geometry = new BoxGeometry(this.width, this.height, this.depth);
    const material = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
    info.scene.add(this.mesh);
    this.setCannonBody(); // mesh 생성 후 cannon body 생성
  }

  walk(value, direction) {
    if (direction === "left") {
      // 뒤쪽 방향에 90도 빼면 왼쪽방향
      this.rotationY -= MathUtils.degToRad(90);
    }
    if (direction === "right") {
      // 뒤쪽 방향에 90도 더하면 오른쪽방향
      this.rotationY += MathUtils.degToRad(90);
    }
    // 회전각을 구해 회전 적용 + value를 곱해 속도 조절
    this.x += Math.sin(this.rotationY) * value; // 좌우
    this.z += Math.cos(this.rotationY) * value; // 앞뒤

    if (this.cannonBody) {
      this.cannonBody.position.x = this.x;
      this.cannonBody.position.z = this.z;
    }
  }

  walkMobile(value, radian) {
    const angle = this.rotationY + radian + MathUtils.degToRad(90);
    this.x = Math.sin(angle) * value;
    this.z = Math.cos(angle) * value;

    this.cannonBody.position.x = this.x;
    this.cannonBody.position.z = this.z;
  }

  setCannonBody() {
    this.cannonBody = new Body({
      mass: this.mass, // 물리 객체의 질량. 0이면 정지 상태
      position: new Vec3(this.x, this.y, this.z),
      shape: new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2)), // 중심 위치(x, y, z)에서 각 표면까지의 거리
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
