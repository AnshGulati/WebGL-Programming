main()

function main() {
    const canvas = document.querySelector("canvas") // Get Canvas Elt.

    const gl = canvas.getContext("webgl") // To use WebGL API

    // Error Handling
    if (!gl) {
        throw new Error("WebGL is not supported in your Browser")
    }

    const vertexData = [
        0.0, 0.0, 0.0, // Vertex-1
        0.5, -0.5, 0.0, // Vertex-2
        1.0, 1.0, 0.0 // Vertex-3
    ]

    // Create a buffer object, where data will be stored.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    // Create & Compile Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) // determines the vertices to be processed
    gl.shaderSource(vertexShader, `
        
        attribute vec3 position; // Holds the vertex Positions

        void main()
        {
            gl_Position = vec4(position, 1.0);
            gl_PointSize = 10.0; // Sets the Point Size
        }

    `)

    gl.compileShader(vertexShader)

    // Create & Compile Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) // determines the color of each pixel
    gl.shaderSource(fragmentShader, `
        
        void main()
        {
            gl_FragColor = vec4(0.0,0.0,0.0,1.0); // Pixel Color to Black
        }


    `)

    gl.compileShader(fragmentShader)

    // Create Program
    const program = gl.createProgram();

    // Attach Shaders to Program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Enable Vertex Attributes
    const coords = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(coords)
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    gl.clearColor(1.0, 0.0, 0.0, 1.0) // Sets the Canvas Color to Red

    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the Buffer bit

    gl.viewport(0, 0, canvas.width, canvas.height) // Match the width & height of Canvas

    gl.drawArrays(gl.POINTS, 0, 3) // Renders the Geometry
}