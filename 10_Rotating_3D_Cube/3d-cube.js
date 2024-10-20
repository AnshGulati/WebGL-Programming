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

// Vertex data for a cube (x, y, z)
const vertexdata = [
    // Front face
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,

    // Back face
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,

    // Left face
    -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,

    // Right face
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,

    // Bottom face
    -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1,

    // Top face
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
];

// Indices to create cube faces (each face has 2 triangles)
const indices = [
    0, 1, 2, 0, 2, 3,     // Front face
    4, 5, 6, 4, 6, 7,     // Back face
    8, 9, 10, 8, 10, 11,  // Left face
    12, 13, 14, 12, 14, 15,  // Right face
    16, 17, 18, 16, 18, 19,  // Bottom face
    20, 21, 22, 20, 22, 23   // Top face
];

// Color data for each vertex (R, G, B)
const colors = [
    // Front face colors (R, G, B)
    5, 3, 7, 5, 3, 7, 5, 3, 7, 5, 3, 7,

    // Back face colors
    1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3,

    // Left face colors
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    // Right face colors
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    // Bottom face colors
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,

    // Top face colors
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
];

// Load Vertex Data into Buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexdata), gl.STATIC_DRAW);

// Load Color Data into Buffer
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Load Index Data into Buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Create and compile vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    attribute vec3 position; // Vertex position
    attribute vec3 color; // Vertex color
    varying vec3 vColor; // Varying color passed to fragment shader

    uniform mat4 Pmatrix; // Projection matrix
    uniform mat4 Vmatrix; // View matrix
    uniform mat4 Mmatrix; // Model matrix

    void main() {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
        vColor = color;
    }
`);
gl.compileShader(vertexShader);

// Create and compile fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor; // Color passed from vertex shader

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

// Set up uniforms for matrices (Projection, View, and Model)
const Pmatrix = gl.getUniformLocation(program, 'Pmatrix');
const Vmatrix = gl.getUniformLocation(program, 'Vmatrix');
const Mmatrix = gl.getUniformLocation(program, 'Mmatrix');

// Enable vertex position attribute
const positionLocation = gl.getAttribLocation(program, 'position');
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// Enable vertex color attribute
const colorLocation = gl.getAttribLocation(program, 'color');
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorLocation);

// Use the Program
gl.useProgram(program);

// Function to create the projection matrix
function get_projection(angle, a, zMin, zMax) {
    const ang = Math.tan((angle * 0.5) * Math.PI / 180); // Convert to radians
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

// Initialize projection, model, and view matrices
const proj_matrix = get_projection(40, canvas.width / canvas.height, 1, 100);
const mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// Translating z
view_matrix[14] = view_matrix[14] - 6; // Zoom

// Rotation Functions
function rotateZ(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
}

function rotateX(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

// Animation
let time_old = 0;
const animate = function (time) {
    const dt = time - time_old;

    rotateZ(mov_matrix, dt * 0.005);
    rotateY(mov_matrix, dt * 0.002);
    rotateX(mov_matrix, dt * 0.003);
    time_old = time;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);

    // Draw the Cube
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}
animate(0);