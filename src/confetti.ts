interface Particle {
  x: number;
  y: number;
  vx: number; // Velocity in x direction
  vy: number; // Velocity in y direction
  color: number[]; // RGBA
  shape: number;
  active: boolean;
}

// Vertex Shader
const vertexShaderSrc = `
attribute vec2 coordinates;
attribute vec4 a_color; // New attribute for color
varying vec4 vColor;
attribute float aShape;
varying float vShape;

void main(void) {
  gl_Position = vec4(coordinates, 0.0, 1.0);
  vColor = a_color;

  gl_PointSize = 8.0;
  vShape = aShape;
}`;

// Fragment Shader
const fragmentShaderSrc = `
precision mediump float;
varying vec4 vColor;
varying float vShape;

void main(void) {
  vec2 coord = gl_PointCoord - vec2(0.5, 0.5); // Translate to center

  if (vShape < 0.5) {
    // square
  } else if (vShape < 1.5) {
    // circle
    if (length(coord) > 0.5) {
      discard;
    }
  } else {
    // triangle
    if (coord.x + coord.y > 0.5 || coord.x - coord.y < -0.5 || coord.y - coord.x < -0.5) {
      discard;
    }
  }

  gl_FragColor = vColor;
}`;

// Compile Shader
function compileShader(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  source: string,
  type: number
) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("no shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error();
    gl.deleteShader(shader);
    throw new Error("Error compiling shader");
  }

  return shader;
}

const initialise = () => {
  const canvas = document.createElement("canvas");

  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "999";
  canvas.style.pointerEvents = "none";

  document.body.appendChild(canvas);

  window.addEventListener("resize", () => {
    resizeCanvas();
  });

  const setZIndex = (zIndex: number) => {
    canvas.style.zIndex = `${zIndex}`;
  };

  let gl: WebGL2RenderingContext | WebGLRenderingContext | null =
    canvas.getContext("webgl2");

  if (!gl) {
    gl = canvas.getContext("webgl");
  }

  if (!gl) {
    throw new Error("WebGL not supported");
  }

  function resizeCanvas() {
    if (!gl) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Vertex
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  const vertexShader = compileShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(
    gl,
    fragmentShaderSrc,
    gl.FRAGMENT_SHADER
  );

  // Link shaders into a program
  const shaderProgram = gl.createProgram();

  if (!shaderProgram) {
    throw new Error("No shader program");
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error("Error linking shader program");
  }

  // Particles

  let particles: Particle[] = [];

  const generateConfettiParticles = (xStart: number, numParticles: number) => {
    for (let i = 0; i < numParticles; i++) {
      const x = xStart;
      const y = Math.random() * 0.2 - 1.0;
      const vx =
        Math.random() *
        0.02 *
        (xStart ? -xStart : Math.random() < 0.5 ? 1 : -1);
      const vy = Math.random() * 0.08 - 0.01; // Random upward velocity in y

      const color = [Math.random(), Math.random(), Math.random(), 0.5]; // RGBA

      const shape = Math.floor(Math.random() * 3);

      particles.push({ x, y, vx, vy, color, shape, active: true });
    }
  };

  // Enable vertex coordinates attribute
  const coord = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.enableVertexAttribArray(coord);
  gl.useProgram(shaderProgram);
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

  // Buffers
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const shapeBuffer = gl.createBuffer();

  function animate() {
    if (!gl || !shaderProgram) return;

    // Update position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array(particles.flatMap((p) => [p.x, p.y]));
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

    // Update colour buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const color = new Float32Array(particles.flatMap((p) => p.color));
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.DYNAMIC_DRAW);
    const colorAttribLocation = gl.getAttribLocation(shaderProgram, "a_color");
    gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Shapes
    // 0 for square, 1 for circle, and 2 for triangle
    const shapeTypes = new Float32Array(particles.map((p) => p.shape));

    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shapeTypes, gl.STATIC_DRAW);

    const shapeAttribLocation = gl.getAttribLocation(shaderProgram, "aShape");
    gl.enableVertexAttribArray(shapeAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.vertexAttribPointer(shapeAttribLocation, 1, gl.FLOAT, false, 0, 0);

    // Draw particles as points
    gl.drawArrays(gl.POINTS, 0, particles.length);

    for (const particle of particles) {
      if (
        particle.x < -1 ||
        particle.x > 1 ||
        particle.y < -1 ||
        particle.y > 1
      ) {
        particle.active = false;
        continue;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Air resistance
      particle.vx *= 0.99;
      if (particle.vy < 0) {
        particle.vy *= 0.98;
      }

      // Apply gravity
      particle.vy -= 0.001;
    }

    // Filter out inactive particles
    particles = particles.filter((p) => p.active);

    requestAnimationFrame(animate);
  }

  let animationStarted = false;

  const startAnimation = () => {
    if (!animationStarted) {
      resizeCanvas();
      animate();
      animationStarted = true;
    }
  };

  // Function to start confetti
  const blastConfetti = (intensity = 20, options?: Options) => {
    if (options) {
      if (options.zIndex) {
        setZIndex(options.zIndex);
      }
    }

    if (!animationStarted) {
      startAnimation();
    }

    const cannonSpawns = options?.cannonSpawns || [-1, 1];

    cannonSpawns.forEach((x) => {
      generateConfettiParticles(x, 25 * intensity);
    });
  };

  startAnimation();

  return {
    animationStarted,
    _blastConfetti: blastConfetti,
    _startAnimation: startAnimation,
  };
};

type Options = {
  zIndex?: number;
  cannonSpawns?: number[];
};

let blastConfetti = (intensity?: number, options?: Options): void => {};

try {
  const { _blastConfetti } = initialise();
  blastConfetti = _blastConfetti;
} catch (err) {
  console.error("Error initialising confetti: " + err);
}

export default blastConfetti;
