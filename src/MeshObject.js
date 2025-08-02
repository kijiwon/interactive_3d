import { Mesh, BoxGeometry, MeshLambertMaterial } from "three";
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
    this.rotationX = info.rotationX || 0;
    this.rotationY = info.rotationY || 0;
    this.rotationZ = info.rotationZ || 0;

    this.mass = info.mass || 0;
    this.cannonWorld = info.cannonWorld;
    this.cannonMaterial = info.cannonMaterial;

    if (info.modelSrc) {
      // GLTF model
      info.loader.load(
        info.modelSrc,
        (glb) => {
          this.mesh = glb.scene;

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
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
        info.scene.add(this.mesh);
      });
    } else {
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      const material = new MeshLambertMaterial({
        color: this.color,
      });

      this.mesh = new Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
      info.scene.add(this.mesh);
    }
  }

  setCannonBody() {
    this.cannonBody = new Body({
      mass: this.mass, // 물리 객체의 질량. 0이면 정지 상태
      position: new Vec3(this.x, this.y, this.z),
      shape: new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2)), // 중심 위치(x, y, z)에서 각 표면까지의 거리
      material: this.cannonMaterial,
    });

    this.cannonWorld.addBody(this.cannonBody);
  }
}
