import { createRenderTarget, drawMeshDirect } from "./utils";
import { alphaIDMaterial, alphaFilterMaterial } from "./alpha-material";
import { ScreenPlaneRenderer } from "./screen-plane-renderer";
import * as THREE from "three";

export class SCSRenderer {
  constructor(state, renderer, renderTarget) {
    this.state = state;
    this.renderer = renderer;
    this.renderTarget = renderTarget;

    const size = new THREE.Vector2();
    const { width, height } = renderer.getSize(size);

    this.fb1 = createRenderTarget(width, height);
    this.fb2 = createRenderTarget(width, height);
    this.dummyTarget = createRenderTarget(width, height);

    this.planeRenderer = new ScreenPlaneRenderer(renderer, state, renderTarget);
  }

  renderSubtract(scene, camera, primitive, sequence, other) {
    this.state.push();

    const gl = this.renderer.getContext();

    const render = () => {
      this.renderer.setRenderTarget(this.fb2);
      this.renderer.clear();

      this.renderer.setRenderTarget(this.fb1);
      this.renderer.clear();

      this.state.set({
        colorMask: [true, true, true, true],
        depthTest: true,
        depthMask: true,
        depthFunc: gl.ALWAYS,
        stencilTest: false,
        faceCulling: true,
        cullFace: gl.BACK,
      });

      drawMeshDirect(this.renderer, primitive, camera, alphaIDMaterial(1));

      let stencilRef = 0;
      let id = 1;

      for (let i = 0; i < sequence.length; i++) {
        stencilRef++;
        id++;

        this.state.set({
          colorMask: [false, false, false, false],
          depthTest: true,
          depthMask: false,
          depthFunc: gl.LESS,
          stencilTest: true,
          stencilMask: ~0,
          stencilFunc: [gl.ALWAYS, stencilRef, ~0],
          stencilOp: [gl.KEEP, gl.KEEP, gl.REPLACE],
          faceCulling: true,
          cullFace: gl.BACK,
        });

        const p = sequence[i];
        drawMeshDirect(this.renderer, p, camera);

        this.state.set({
          colorMask: [true, true, true, true],
          faceCulling: true,
          cullFace: gl.FRONT,
          depthMask: true,
          depthFunc: gl.GREATER,
          stencilFunc: [gl.EQUAL, stencilRef, ~0],
          stencilOp: [gl.ZERO, gl.ZERO, gl.ZERO],
        });
        drawMeshDirect(this.renderer, p, camera, alphaIDMaterial(id));
      }

      this.state.set({
        colorMask: [true, true, true, true],
        depthMask: false,
        stencilTest: false,
        cullFace: gl.FRONT,
        depthFunc: gl.LESS,
      });

      drawMeshDirect(this.renderer, primitive, camera, alphaIDMaterial(0));

      other.visible = true;
      id++;

      this.state.set({
        colorMask: [true, true, true, true],
        depthTest: true,
        depthMask: false,
        depthFunc: gl.LESS,
        stencilTest: false,
        stencilMask: 0,
        stencilFunc: [gl.ALWAYS, stencilRef, ~0],
        stencilOp: [gl.KEEP, gl.KEEP, gl.REPLACE],
        faceCulling: true,
        cullFace: gl.BACK,
      });

      primitive.visible = false;
      sequence.forEach((s) => (s.visible = false));

      drawMeshDirect(this.renderer, scene, camera, alphaIDMaterial(id));

      primitive.visible = true;
      sequence.forEach((s) => (s.visible = true));
      other.visible = false;

      this.renderer.setRenderTarget(this.fb2);

      // Draw front of X where alphaID = 1
      this.state.set({
        colorMask: [true, true, true, true],
        faceCulling: true,
        cullFace: gl.BACK,
        depthMask: false,
        depthFunc: gl.LESS,
        depthTest: false,
        stencilTest: false,
      });

      drawMeshDirect(this.renderer, primitive, camera);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.renderer.setRenderTarget(this.renderTarget);
      this.planeRenderer.render(
        alphaFilterMaterial(1, this.fb1.texture, this.fb2.texture)
      );

      gl.disable(gl.BLEND);
    };

    const render2 = (i) => () => {
      let id = i + 2;
      const p = sequence[i];

      this.renderer.setRenderTarget(this.fb2);

      this.state.set({
        cullFace: gl.FRONT,
        depthMask: true,
        depthFunc: gl.LESS,
        depthTest: false,
        stencilTest: false,
      });

      drawMeshDirect(this.renderer, p, camera);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.renderer.setRenderTarget(this.renderTarget);
      this.planeRenderer.render(
        alphaFilterMaterial(id, this.fb1.texture, this.fb2.texture)
      );

      gl.disable(gl.BLEND);
    };

    other.visible = true;

    scene.onAfterRender = render;
    this.renderer.setRenderTarget(this.dummyTarget);
    this.renderer.render(scene, camera);
    other.visible = false;
    scene.onAfterRender = null;

    for (let i = 0; i < sequence.length; i++) {
      scene.onAfterRender = render2(i);
      this.renderer.setRenderTarget(this.dummyTarget);
      this.renderer.render(scene, camera);
    }

    const render3 = () => {
      this.renderer.setRenderTarget(this.fb2);
      this.renderer.clear();

      this.state.set({
        cullFace: gl.BACK,
        depthMask: true,
        depthFunc: gl.LESS,
        depthTest: true,
        stencilTest: false,
      });

      primitive.visible = false;
      sequence.forEach((s) => (s.visible = false));

      drawMeshDirect(this.renderer, scene, camera);

      primitive.visible = true;
      sequence.forEach((s) => (s.visible = true));
      other.visible = false;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this.renderer.setRenderTarget(this.renderTarget);
      this.planeRenderer.render(
        alphaFilterMaterial(
          sequence.length + 2,
          this.fb1.texture,
          this.fb2.texture,
          true
        )
      );

      gl.disable(gl.BLEND);
    };

    scene.onAfterRender = render3;
    other.visible = true;
    this.renderer.setRenderTarget(this.dummyTarget);
    this.renderer.render(scene, camera);

    this.state.pop();
  }
}
