function main() {
    const canvas = document.querySelector("canvas"); // Get the Canvas Element
    const gl = canvas.getContext("webgl"); // To use WebGL API

    // Error Handling
    if (!gl) {
        throw new Error("WebGL not supported");
    }

    const numVertices = 36; // Number of vertices for the cube (6 faces * 2 triangles * 3 vertices = 36)

    let points = []; // Array to hold the vertex positions
    let colors = []; // Array to hold the vertex colors

    // Define the vertices of the cube
    const vertexData = [
        -0.5, 0.5, 0.5, // Front Top Left
        -0.5, -0.5, 0.5, // Front Bottom Left
        0.5, -0.5, 0.5, // Front Bottom Right
        0.5, 0.5, 0.5, // Front Top Right

        -0.5, 0.5, -0.5, // Bottom Top Left
        -0.5, -0.5, -0.5, // Bottom Bottom Left
        0.5, -0.5, -0.5, // Bottom Bottom Right
        0.5, 0.5, -0.5 // Bottom Top Right
    ];

    // Define the vertex colors
    const vertexColors = [
        0.0, 0.0, 0.0, 1.0, // Black 
        1.0, 0.0, 0.0, 1.0, // Red 
        1.0, 1.0, 0.0, 1.0, // Yellow 
        0.0, 1.0, 0.0, 1.0, // Green 
        0.0, 0.0, 1.0, 1.0, // Blue 
        1.0, 0.0, 1.0, 1.0, // Magenta 
        0.0, 1.0, 1.0, 1.0, // Cyan 
        1.0, 1.0, 1.0, 1.0  // White 
    ];

    // Generate the points and colors for the cube
    colorCube(); // Fills 'points' and 'colors' arrays

    // Create and bind buffer for vertex positions
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    // Create and bind buffer for vertex colors
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        attribute vec4 position; // Position of vertex in space
        attribute vec4 vColor; // RGBA color of the vertex
        varying vec4 fColor; // Passes color data to the fragment shader
        uniform float time; // Global variable to pass current time from JS to Shader

        void main() {

            // range: -1 to 1 -> -0.5 to 0.5 -> 0.5 to 1.5
            float scale = 1.0 + 0.5 * sin(time); // vary sinusoidally between 0.5 and 1.5 over time

            // Apply scale to x,y,z components of all the vertices
            gl_Position = vec4(position.xyz * scale, 1.0); // Sets the position of the vertex
            fColor = vColor; // Pass the color to the fragment shader
        }
    `);
    gl.compileShader(vertexShader);

    // Create & Compile Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float; // Set precision for floating-point numbers (used for graphical calculations)
        varying vec4 fColor; // Color passed from the vertex shader

        void main() {
            gl_FragColor = fColor; // Set the pixel color
        }
    `);
    gl.compileShader(fragmentShader);

    // Create Program & attach Shaders to it
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Gets the location of the time uniform 
    const timeLoc = gl.getUniformLocation(program, `time`);

    // Enable Vertex Position Attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const coords = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coords);

    // Enable Vertex Color Attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    const colorAttrib = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(colorAttrib);
    gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, false, 0, 0);

    // Use the shader program
    gl.useProgram(program);

    // Set Clear Color (Background Color)
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Sets the clear color (black background)
    gl.enable(gl.DEPTH_TEST); // Enable depth testing to handle overlapping in 3D

    // Animation
    let time = 0; // elapsed time
    const dt = 0.04; // Speed of the animation

    // Render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color and depth buffer before each render
        time += dt;
        gl.uniform1f(timeLoc, time); // Updates the time uniform in the shader with the current time value
        gl.viewport(0, 0, canvas.width, canvas.height); // Set the viewport to match the canvas size
        gl.drawArrays(gl.TRIANGLES, 0, numVertices); // Draw the cube as triangles
        requestAnimationFrame(render); // Continuously calls 'render' to keep drawing (useful for animations or interactivity)
    }

    // Start rendering the cube
    render();

    // Function to generate the colored cube by specifying faces
    function colorCube() {
        quad(0, 3, 2, 1) // Front Face
        quad(4, 7, 3, 0) // Top Face
        quad(4, 0, 1, 5) // Left Face
        quad(7, 3, 2, 6) // Right Face
        quad(5, 6, 2, 1) // Bottom Face
        quad(4, 7, 6, 5) // Back Face
    }

    // Function to create a quad by connecting four vertices
    function quad(a, b, c, d) {
        const indices = [a, b, c, a, c, d]; // Define two triangles that form a quad
        for (let i = 0; i < indices.length; ++i) {
            // Push the vertex position and color data for each triangle vertex
            points.push(vertexData[3 * indices[i]], vertexData[3 * indices[i] + 1], vertexData[3 * indices[i] + 2]);
            colors.push(vertexColors[4 * indices[i]], vertexColors[4 * indices[i] + 1], vertexColors[4 * indices[i] + 2], vertexColors[4 * indices[i] + 3]);
        }
    }
}

main()