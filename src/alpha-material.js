import * as THREE from "three";
import { randomRGBColor } from "./utils";

export const alphaIDMaterial = (id, color = randomRGBColor().toArray()) => {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform int uId;

    void main() {
      float a = float(uId) / 255.0;
      gl_FragColor = vec4(uColor.rgb, a);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uId: { value: id },
      uColor: { value: new THREE.Color(...color) },
    },
  });
};

export const alphaFilterMaterial = (
  id,
  alphaIdTexture,
  colorTexture,
  drawOnZero = false,
  color = randomRGBColor().toArray()
) => {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform int uId;
    uniform sampler2D tAlphaId;
    uniform sampler2D tColorTexture;
    uniform int uDrawOnZero;

    void main() {
      float a = texture2D(tAlphaId, vUv).a;
      vec3 color = texture2D(tColorTexture, vUv).rgb;
      int alphaId = int(a * 255.0);

      if (alphaId == 0) {
        if (uDrawOnZero != 0) {
          gl_FragColor = vec4(color, 1.0);
        } else {
          discard;
        }
      } else if (alphaId != uId) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      } else {
        gl_FragColor = vec4(color, 1.0);
      }
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uId: { value: id },
      tAlphaId: { value: alphaIdTexture },
      tColorTexture: { value: colorTexture },
      uColor: { value: new THREE.Color(...color) },
      uDrawOnZero: { value: drawOnZero ? 1 : 0 },
    },
  });
};
