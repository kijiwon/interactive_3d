import { Mesh, BoxGeometry, MeshLambertMaterial, DoubleSide } from "three";

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
    this.y = info.y || this.height / 2; // 모든 mesh는 지면에 닿아있어야함
    this.z = info.z || 0;

    const geometry = new BoxGeometry(this.width, this.height, this.depth);
    const material = new MeshLambertMaterial({
      color: this.color,
      //   side: DoubleSide,
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(this.x, this.y, this.z);
    info.scene.add(this.mesh);
  }
}
