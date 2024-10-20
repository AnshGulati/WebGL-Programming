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
    // let normals = [];

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

    // const nBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        attribute vec4 position; // Position of vertex in space
        attribute vec3 vNormal;
        attribute vec4 vColor; // RGBA color of the vertex
        varying vec4 fColor; // Passes color data to the fragment shader
        uniform vec4 AmbientProduct, DiffuseProduct, SpecularProduct;
        uniform mat4 ModelView;
        uniform mat4 Projection;
        uniform vec4 LightPosition;
        uniform float Shininess;


        void main() {

            // Transform vertex position into eye coordinates
            vec3 pos = (ModelView * position).xyz;
            vec3 L = normalize(LightPosition.xyz - pos);
            vec3 E = normalize(-pos);
            vec3 H = normalize(L + E);

            // Transform vertex normal into eye coordinates
            vec3 N = normalize(ModelView * vec4(vNormal, 0.0)).xyz;

            // Compute terms in the illumination equation
            vec4 ambient = AmbientProduct;
            float Kd = max( dot(L, N), 0.0 );
            vec4 diffuse = Kd*DiffuseProduct;
            float Ks = pow( max(dot(N, H), 0.0), Shininess );
            vec4 specular = Ks * SpecularProduct;
            if( dot(L, N) < 0.0 )
            {
                specular = vec4(0.0, 0.0, 0.0,1.0);
            }
            gl_Position = Projection * ModelView * position;
            fColor = ambient + diffuse + specular + vColor;
            fColor.a = 1.0;
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

    // Use the shader program
    gl.useProgram(program);

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

    // const normalLocation = gl.getAttribLocation(program, "vNormal");
    // gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    // gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(normalLocation);

    // Set up lighting uniforms
    const ambientProduct = gl.getUniformLocation(program, "AmbientProduct");
    const diffuseProduct = gl.getUniformLocation(program, "DiffuseProduct");
    const specularProduct = gl.getUniformLocation(program, "SpecularProduct");
    const lightPosition = gl.getUniformLocation(program, "LightPosition");
    const shininess = gl.getUniformLocation(program, "Shininess");

    gl.uniform4fv(ambientProduct, [0.2, 0.2, 0.2, 1.0]);
    gl.uniform4fv(diffuseProduct, [0.8, 0.8, 0.8, 1.0]);
    gl.uniform4fv(specularProduct, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(lightPosition, [1.0, 1.0, 1.0, 0.0]);
    gl.uniform1f(shininess, 100.0);

    // Set up projection and model view matrices
    const projectionMatrix = gl.getUniformLocation(program, "Projection");
    const modelViewMatrix = gl.getUniformLocation(program, "ModelView");

    const aspect = canvas.width / canvas.height;
    const projMat = mat4.create();
    mat4.perspective(projMat, Math.PI / 4, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionMatrix, false, projMat);

    const modelViewMat = mat4.create();
    mat4.lookAt(modelViewMat, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(modelViewMatrix, false, modelViewMat);

    // Set Clear Color (Background Color)
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Sets the clear color (black background)
    gl.enable(gl.DEPTH_TEST); // Enable depth testing to handle overlapping in 3D

    // Render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color and depth buffer before each render
        gl.viewport(0, 0, canvas.width, canvas.height); // Set the viewport to match the canvas size
        mat4.rotateY(modelViewMat, modelViewMat, 0.01);
        gl.uniformMatrix4fv(modelViewMatrix, false, modelViewMat);
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
        // const t1 = subtract(vertexData.slice(3, 6), vertexData.slice(0, 3));
        // const t2 = subtract(vertexData.slice(6, 9), vertexData.slice(3, 6));
        // const normal = normalize(cross(t1, t2));

        for (let i = 0; i < indices.length; ++i) {
            // Push the vertex position and color data for each triangle vertex
            points.push(vertexData[3 * indices[i]], vertexData[3 * indices[i] + 1], vertexData[3 * indices[i] + 2]);
            colors.push(vertexColors[4 * indices[i]], vertexColors[4 * indices[i] + 1], vertexColors[4 * indices[i] + 2], vertexColors[4 * indices[i] + 3]);
            // normals.push(normal[0], normal[1], normal[2]);
        }
    }

    function subtract(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    function cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]];
    }

    function normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }
}

main();