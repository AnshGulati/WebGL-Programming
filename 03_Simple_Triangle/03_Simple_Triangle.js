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

    // Create a buffer object, where data will be stored.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `

        attribute vec3 position; // Holds the vertex Positions

        void main()
        {
            gl_Position = vec4(position,1.0);
        }

    `)

    gl.compileShader(vertexShader)

    // Create & Compile Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, `

        void main()
        {
            gl_FragColor = vec4(0.8, 0.3, 0.9, 1.0); // Sets Pixel Color
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
    const coords = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(coords)
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Sets the Canvas Color to Black
    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the Buffer bit

    // canvas.width = window.innerWidth; // Increase Canvas Width
    // canvas.height = window.innerHeight; // Increase Canvas Height
    gl.viewport(0, 0, canvas.width, canvas.height) // Match the width & height of Canvas

    gl.drawArrays(gl.TRIANGLES, 0, 3) // Renders the Geometry
}