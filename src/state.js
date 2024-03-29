const GL = WebGLRenderingContext;

const defaultGLState = {
  stencilTest: false,
  depthTest: true,
  faceCulling: true,
  cullFace: GL.BACK,
  stencilOp: [GL.KEEP, GL.KEEP, GL.KEEP],
  stencilMask: 0x00,
  stencilFunc: [GL.ALWAYS, 0x00, 0x00],
  depthFunc: GL.LESS,
  depthMask: true,
  colorMask: [true, true, true, true],
};

Object.freeze(defaultGLState);

const isPropEqual = (state, pname, value) => {
  const defaultValue = defaultGLState[pname];
  const oldValue = state[pname];

  if (defaultValue === undefined) {
    throw new Error(`Invalid state prop ${pname}`);
  }

  if (oldValue === undefined || value === undefined) {
    throw new Error(`Invalid state prop ${pname}`);
  }

  if (oldValue === value) {
    return true;
  }

  if (
    Array.isArray(defaultValue) &&
    Array.isArray(value) &&
    Array.isArray(oldValue)
  ) {
    return oldValue.every((v, i) => v === value[i]);
  }

  return false;
};

const setStateProp = (state, pname, value) => {
  const defaultValue = defaultGLState[pname];
  if (defaultValue === undefined) {
    return state;
  }

  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(value)) {
      return state;
    }

    return {
      ...state,
      [pname]: [...value],
    };
  }

  return {
    ...state,
    [pname]: value,
  };
};

const glPropSetters = {
  stencilTest: (gl, value) =>
    value ? gl.enable(gl.STENCIL_TEST) : gl.disable(gl.STENCIL_TEST),

  depthTest: (gl, value) =>
    value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST),

  faceCulling: (gl, value) =>
    value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE),

  cullFace: (gl, value) => gl.cullFace(value),
  stencilOp: (gl, value) => gl.stencilOp(value[0], value[1], value[2]),
  stencilMask: (gl, value) => gl.stencilMask(value),
  stencilFunc: (gl, value) => gl.stencilFunc(value[0], value[1], value[2]),
  depthFunc: (gl, value) => gl.depthFunc(value),
  depthMask: (gl, value) => gl.depthMask(value),
  colorMask: (gl, value) =>
    gl.colorMask(value[0], value[1], value[2], value[3]),
};

const setProp = (gl, state, pname, value) => {
  if (isPropEqual(state, pname, value)) {
    return state;
  }

  const newState = setStateProp(state, pname, value);
  glPropSetters[pname](gl, value);

  return newState;
};

const glApplyState = (gl, state) => {
  Object.keys(defaultGLState).forEach((pname) => {
    const value = state[pname] || defaultGLState[pname];
    glPropSetters[pname](gl, value);
  });
};

export class State {
  constructor(gl) {
    this.gl = gl;
    this.state = defaultGLState;
    this.stack = [];

    glApplyState(gl, this.state);
  }

  apply() {
    glApplyState(this.gl, this.state);
  }

  set(props) {
    let newState = this.state;
    Object.keys(props).forEach((pname) => {
      const value = props[pname];
      newState = setProp(this.gl, newState, pname, value);
    });

    this.state = newState;
  }

  setProp(pname, value) {
    this.set({ [pname]: value });
  }

  push() {
    this.stack.push({ ...this.state });
  }

  pop() {
    const state = this.stack.pop();
    if (state) {
      this.set(state);
    }
  }

  reset() {
    this.set(defaultGLState);
  }
}
