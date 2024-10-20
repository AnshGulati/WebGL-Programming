main()

function main() {
    const canvas = document.querySelector("canvas") // Get the Canvas Elt.
    const gl = canvas.getContext("webgl") // To use WebGL API

    // Error Handling
    if (!gl) {
        throw new Error("Webgl is not supported in your browser")
    }

    // Vertex Data (Define Geometry)
    const vertexData = [
        -0.4, 0.2, 0.0,
        0.4, 0.2, 0.0,
        0.0, 0.6, 0.0,

        0.0, -0.6, 0.0,
        0.4, 0.2, 0.0,
        -0.4, 0.2, 0.0,
    ]

    // Vertex Color (Define Colors)
    const vertexColors = [
        0.0, 0.0, 1.0, 1.0, // blue
        0.0, 1.0, 1.0, 1.0, // cyan
        1.0, 1.0, 1.0, 1.0,  // white

        0.0, 1.0, 1.0, 1.0, // cyan
        1.0, 1.0, 1.0, 1.0,  // white
        0.0, 0.0, 1.0, 1.0 // blue
    ]

    // Indices (Define the order in which the vertices should be connected)
    const indices = [
        0, 1, 2,  // First triangle (top)
        3, 4, 5   // Second triangle (bottom)
    ]

    // Store data in ELement Buffer Object
    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    // Store data in Array Buffer Object
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    // Store Vertex Color Data into Array Buffer Object
    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW)

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `

        attribute vec3 position; // position of vertex in space
        attribute vec4 vColor; // RGBA color of the vertex
        varying vec4 fColor; // For passing the color to fragment shader

        void main()
        {
            gl_Position = vec4(position, 1.0);
            fColor = vColor; // Pass the vertex color to the fragment shader
        }
    `)

    gl.compileShader(vertexShader)

    // Create & Compile Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, `

        precision mediump float; // Set the precision for floating-point numbers (Used for Graphical Calculations)
        varying vec4 fColor; // Color passed from the vertex shader

        void main()
        {
            gl_FragColor = fColor; // Sets the Pixel Color
        }
    `)

    gl.compileShader(fragmentShader)

    // Create Program & attach Shaders to it
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Enable Vertex Attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // Call (again), to determine which specific buffer to use
    const coords = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(coords)
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0)

    // Enable Vertex Color Attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer) // Call (again), to determine which specific buffer to use
    const colorData = gl.getAttribLocation(program, `vColor`)
    gl.enableVertexAttribArray(colorData)
    gl.vertexAttribPointer(colorData, 4, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    gl.clearColor(0.0, 0.0, 0.0, 1.0) // Sets Background Color
    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the buffer bit

    gl.viewport(0, 0, canvas.width, canvas.height) // Matches the width, height of canvas

    // Renders using the order defined by the index buffer whereas drawArrays does not consider indices
    // gl.UNSIGNED_SHORT is used instead of gl.UNSIGNED_INT because of Optimisation purposes
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0) // Renders the whole mesh
}