import * as THREE from "three";

export class ScreenPlaneRenderer {
  constructor(renderer, state, target) {
    this.target = target;
    this.renderer = renderer;
    this.state = state;

    this.scene = new THREE.Scene();

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      new THREE.MeshBasicMaterial({ color: "white" })
    );

    this.scene.add(this.plane);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  render(texture) {
    let isTexture = false;
    let oldMaterial = null;
    if (texture instanceof THREE.Texture) {
      isTexture = true;
      this.plane.material.map = texture;
    } else if (texture) {
      oldMaterial = this.plane.material;
      this.plane.material = texture;
    } else {
      isTexture = true;
    }

    const gl = this.renderer.context;

    this.state.push();
    this.state.set({
      cullFace: gl.BACK,
    });

    this.renderer.render(this.scene, this.camera, this.target);

    if (!isTexture) {
      this.plane.material = oldMaterial;
    }

    this.state.pop();
  }
}
