main()

function main() {
    const canvas = document.querySelector("canvas") // Get Canvas Elt.
    const gl = canvas.getContext("webgl") // To use WebGL API

    // Error Handling
    if (!gl) {
        throw new Error("WebGL not supported")
    }

    const vertexData = [
        0.5, -0.8, 0.0, // Vertex-1
        -0.5, -0.8, 0.0, // Vertex-2
        0.0, 0.9, 0.0 // Vertex-3
    ]

    // Vertex Color (Define Colors)
    const vertexColors = [
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
    ]

    // Create a buffer object, where data will be stored.
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

        attribute vec3 position; // Holds the vertex Positions
        attribute vec4 vColor; // RGBA color of the vertex
        varying vec4 fColor; // For passing the color to fragment shader

        void main()
        {
            gl_Position = vec4(position,1.0);
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

    // Create Program
    const program = gl.createProgram()

    // Attach Shaders to Program
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Sets the Canvas Color to Black
    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the Buffer bit

    // canvas.width = window.innerWidth; // Increase Canvas Width
    // canvas.height = window.innerHeight; // Increase Canvas Height
    gl.viewport(0, 0, canvas.width, canvas.height) // Match the width & height of Canvas

    gl.drawArrays(gl.TRIANGLES, 0, 3) // Renders the Geometry
}