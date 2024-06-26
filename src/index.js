import * as THREE from "three";
import * as T from "three-full";
import { SCSRenderer } from "./scs-subtract";
import { State } from "./state";
import { randomRGBColor, createHemiLight, createPointLight } from "./utils";

const width = 400;
const height = 300;

const canvas = document.getElementById("canvas");
canvas.width = width;
canvas.height = height;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  premultipliedAlpha: false,
  alpha: false,
  preserveDrawingBuffer: false,
});

renderer.setClearColor(new THREE.Color().setRGB(1, 1, 1));

const scene = new THREE.Scene();

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 1),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 22, 22),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

sphere.position.set(0, 0, 0.25);

const sphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 22, 22),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

sphere2.position.set(-2, -2, 0.25);

const sphere3 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 22, 22),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

sphere3.position.set(2, 2, 0.25);

const sphere4 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 22, 22),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

sphere4.position.set(2, 2, 4);

const sphere5 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 22, 22),
  new THREE.MeshStandardMaterial({ color: randomRGBColor() })
);

sphere5.position.set(2, -2, -4);

scene.add(cube);
scene.add(sphere);
scene.add(sphere2);
scene.add(sphere3);
scene.add(sphere4);
scene.add(sphere5);
sphere4.visible = false;

scene.add(createHemiLight());
scene.add(createPointLight(-40, 4, -40));
scene.add(createPointLight(60, 4, -40));
scene.add(createPointLight(-60, 4, 40));

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 25);
camera.position.set(10, -2, 8);
const controls = new T.OrbitControls(camera, renderer.domElement); // Attach controls to the camera and renderer
renderer.autoClear = false;

const state = new State(renderer.getContext());

const scsRenderer = new SCSRenderer(state, renderer, null);

let t = 0;
const frame = () => {
  renderer.clear();

  t += 0.025;
  let x = Math.sin(t);
  let y = Math.cos(t);

  sphere2.scale.set(1 + x, 1 + x, 1 + x);
  sphere3.scale.set(1 + x, 1 + x, 1 + x);
  sphere.scale.set(1 + y, 1 + y, 1 + y);

  scsRenderer.renderSubtract(
    scene,
    camera,
    cube,
    [sphere, sphere2, sphere3],
    sphere4
  );

  requestAnimationFrame(frame);
};

frame();
