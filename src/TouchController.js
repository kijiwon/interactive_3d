export class TouchController {
  constructor() {
    this.elem = document.querySelector(".mobile-controller");
    this.bar = this.elem.querySelector(".mobile-controller-bar");
    console.log(this.bar);
    this.setPosition();
    this.elem.addEventListener("touchstart", (event) => {
      this.walkTouch = event.targetTouches[0];
      // walkTouch가 true면 touchController를 터치
    });

    this.elem.addEventListener("touchmove", (event) => {
      this.walkTouch = event.targetTouches[0];
      // walkTouch가 true면 touchController를 터치
    });

    this.elem.addEventListener("touchend", (event) => {
      this.walkTouch = null; // 초기화
    });
  }

  setPosition() {
    // elem의 위치와 크기
    this.boundingRect = this.elem.getBoundingClientRect();
    this.width = this.boundingRect.width;
    this.height = this.boundingRect.height;
    this.x = this.boundingRect.x;
    this.y = this.boundingRect.y;
    this.z = this.boundingRect.z;
    // 컨트롤러 중심 위치
    this.cx = this.x + this.width / 2;
    this.cy = this.y + this.height / 2;
  }

  // bar 각도 조절
  setAngleOfBar(radian) {
    this.bar.style.transform = `rotate(${(radian * 180) / Math.PI + 90}deg)`;
  }
}
