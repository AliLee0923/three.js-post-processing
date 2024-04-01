import * as THREE from "three";

export const randomRGBColor = () =>
  new THREE.Color().setRGB(Math.random(), Math.random(), Math.random());

export const drawMeshDirect = (renderer, m, camera, material) => {
  if (!m.visible) {
    return;
  }

  if (m instanceof THREE.Scene) {
    m.children.forEach((obj) => {
      if (obj instanceof THREE.Scene || obj instanceof THREE.Mesh) {
        drawMeshDirect(renderer, obj, camera, material);
      }
    });
  } else {
    renderer.renderBufferDirect(
      camera,
      null,
      m.geometry,
      material || m.material,
      m,
      null
    );
  }
};

export const createRenderTarget = (
  width,
  height,
  depth = true,
  stencil = true
) => {
  const target = new THREE.WebGLRenderTarget(width, height, {
    stencilBuffer: stencil,
  });
  target.texture.format = THREE.RGBAFormat;
  target.texture.type = THREE.FloatType;
  target.texture.minFilter = THREE.NearestFilter;
  target.texture.magFilter = THREE.NearestFilter;
  target.texture.generateMipmaps = false;
  target.stencilBuffer = stencil;
  target.depthBuffer = depth;
  if (depth) {
    target.depthTexture = new THREE.DepthTexture(
      width,
      height,
      undefined,
      undefined,
      undefined,
      undefined,
      THREE.NearestFilter,
      THREE.NearestFilter,
      undefined,
      THREE.DepthStencilFormat
    );
  }

  return target;
};

export const createHemiLight = () => {
  return new THREE.HemisphereLight(
    new THREE.Color().setRGB(5, 5, 5),
    new THREE.Color().setRGB(0.6, 0.6, 0.6),
    1
  );
};

export const createPointLight = (x, y, z) => {
  const light = new THREE.PointLight(new THREE.Color().setRGB(1, 1, 1), 0.3);
  light.position.set(x, y, z);

  return light;
};
