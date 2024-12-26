let allTriangles = []; // Store all triangles' vertices and colors

function main() {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        throw new Error("WebGL not supported");
    }

    // Get color inputs
    const rValue = parseFloat(document.getElementById("rInput").value) / 255 || 0;
    const gValue = parseFloat(document.getElementById("gInput").value) / 255 || 0;
    const bValue = parseFloat(document.getElementById("bInput").value) / 255 || 0;

    // Get vertex inputs
    const x1 = parseFloat(document.getElementById("X1").value) || -0.5;
    const y1 = parseFloat(document.getElementById("Y1").value) || -0.5;
    const x2 = parseFloat(document.getElementById("X2").value) || 0.5;
    const y2 = parseFloat(document.getElementById("Y2").value) || -0.5;
    const x3 = parseFloat(document.getElementById("X3").value) || 0.0;
    const y3 = parseFloat(document.getElementById("Y3").value) || 0.5;

    // To display multiple triangles, we have to store previous triangles
    allTriangles.push(
        x1, y1, 0.0, rValue, gValue, bValue,
        x2, y2, 0.0, rValue, gValue, bValue,
        x3, y3, 0.0, rValue, gValue, bValue
    );

    // Draw all triangles
    drawTriangles(gl);
}

function drawTriangles(gl) {
    // Bind buffer and load all vertex data
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allTriangles), gl.STATIC_DRAW);

    // Compile vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        attribute vec3 position; // Vertex positions
        attribute vec3 vColor;    // Vertex colors
        varying vec3 fColor;     // Pass color to fragment shader
        void main() {
            gl_Position = vec4(position, 1.0);
            fColor = vColor;
        }
    `);
    gl.compileShader(vertexShader);

    // Compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;
        varying vec3 fColor; // Color from vertex shader
        void main() {
            gl_FragColor = vec4(fColor, 1.0); // Set the pixel color
        }
    `);
    gl.compileShader(fragmentShader);

    // Create and link program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Set up attributes
    const positionLOC = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLOC);
    gl.vertexAttribPointer(positionLOC, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    const colorLOC = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(colorLOC);
    gl.vertexAttribPointer(colorLOC, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    // Clear canvas and set the background
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use program and draw all triangles
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, allTriangles.length / 6);
}

function resetCanvas() {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");

    // Clear all triangles data
    allTriangles = [];

    // Clear the WebGL buffer
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Reset input fields
    const inputs = document.querySelectorAll("input[type='text'], input[type='range']");
    inputs.forEach(input => input.value = "");

    // Optionally redraw (nothing will appear since allTriangles is empty)
    drawTriangles(gl);
}

// Initial call to clear the canvas
resetCanvas();