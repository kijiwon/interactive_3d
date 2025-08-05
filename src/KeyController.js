export class KeyController {
  constructor() {
    this.keys = [];
    window.addEventListener("keydown", (event) => {
      this.keys[event.code] = true; // 눌린 키를 배열에 담음 keys.KeyS = true
    });

    window.addEventListener("keyup", (event) => {
      delete this.keys[event.code]; // keys 배열에서 해당 키 삭제
    });
  }
}
