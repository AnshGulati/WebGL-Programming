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
        -0.45, -0.45, 0.0,
        0.45, -0.45, 0.0,
        0.0, 0.9, 0.0,

        -0.45, 0.45, 0.0,
        0.45, 0.45, 0.0,
        0.0, -0.9, 0.0,
    ]

    const indices = [
        0, 1, 2,

        3, 4, 5
    ]

    // Store data in ELement Buffer Object
    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    // Store data in Buffer Object
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `

        attribute vec3 position;

        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `)

    gl.compileShader(vertexShader)

    // Create & Compile Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, `

        void main()
        {
            gl_FragColor = vec4(1.0,1.0,1.0,1.0); // Sets the Pixel Color
        }
    `)

    gl.compileShader(fragmentShader)

    // Create Program & attach Shaders to it
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Enable Vertex Attributes
    const coords = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(coords)
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    gl.clearColor(0.0, 0.0, 0.0, 1.0) // Sets Background Color
    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the buffer bit

    gl.viewport(0, 0, canvas.width, canvas.height) // Matches the width, height of canvas

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}