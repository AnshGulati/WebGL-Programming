// Creating a Canvas and initializing WebGL context
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl", { antialias: true });

canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
gl.viewport(0, 0, canvas.width, canvas.height);

// Error Handling
if (!gl) {
    throw new Error("WebGL not supported");
}

// Vertex data for a pyramid
const vertexdata = [
    // Apex
    0.0, 0.5, 0.0,   // Top (Apex)
    // Base
    -0.5, -0.5, 0.5, // Bottom front left
    0.5, -0.5, 0.5,  // Bottom front right
    0.5, -0.5, -0.5, // Bottom back right
    -0.5, -0.5, -0.5 // Bottom back left
];

// Load Vertex Data into Buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexdata), gl.STATIC_DRAW);

// Indices for drawing the pyramid with triangles
const indices = [
    // Sides
    0, 1, 2, // Front triangle
    0, 2, 3, // Right triangle
    0, 3, 4, // Back triangle
    0, 4, 1, // Left triangle
    // Base
    1, 2, 3, // Base front-right triangle
    1, 3, 4  // Base back-left triangle
];

// Load Index Data into Buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Color data for each vertex
const colors = [
    // Apex color
    0.36, 0.20, 0.09,

    // Base colors
    0.62, 0.32, 0.17,
    0.44, 0.26, 0.08,
    0.62, 0.32, 0.17,
    0.55, 0.27, 0.07
];


// Load Color Data into Buffer
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Create and Compile vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    attribute vec3 position; // Vertex position
    attribute vec3 color; // Vertex color
    varying vec3 vColor; // Varying color passed to fragment shader

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        vColor = color;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
`);
gl.compileShader(vertexShader);

// Create and Compile Fragment Shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`);
gl.compileShader(fragmentShader);

// Create shader program and attach shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Bind the position buffer and enable vertex attributes
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// Bind the color buffer and enable color attributes
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

// Utility function to create perspective matrix
function createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ];
}

// Utility function to create a translation matrix
function createTranslationMatrix(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}

// Utility function to create a rotation matrix around Y-axis
function createRotationYMatrix(angle) {
    return [
        Math.cos(angle), 0, Math.sin(angle), 0,
        0, 1, 0, 0,
        -Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1
    ];
}

// Get uniform locations
const modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");
const viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix");
const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");

// Set the view and projection matrices
const viewMatrix = createTranslationMatrix(0, 0, -2); // Move the camera back a bit
const projectionMatrix = createPerspectiveMatrix(Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

gl.uniformMatrix4fv(viewMatrixLocation, false, new Float32Array(viewMatrix));
gl.uniformMatrix4fv(projectionMatrixLocation, false, new Float32Array(projectionMatrix));

// Animate the rotation of the pyramid
let angle = 0;

function animate() {
    angle += 0.01;

    // Create the model matrix for rotation
    const modelMatrix = createRotationYMatrix(angle);
    gl.uniformMatrix4fv(modelMatrixLocation, false, new Float32Array(modelMatrix));

    // Clear the canvas and draw the pyramid
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing for 3D rendering

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(animate);
}

animate();