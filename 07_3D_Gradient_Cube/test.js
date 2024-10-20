function main() {
    const canvas = document.querySelector("canvas")
    const gl = canvas.getContext("webgl")

    if (!gl) {
        throw new Error("not Supported")
    }

    const numVertices = 36 // 6 * 2 * 3 = 36

    let vertexArray = []
    let colorArray = []

    const vertexData = [
        -0.5, 0.5, 0.5, // Front Top Left
        0.5, 0.5, 0.5, // Front Top Right
        0.5, -0.5, 0.5, // Front Bottom Right
        -0.5, -0.5, 0.5, // Front Bottom Left

        -0.5, 0.5, -0.5, // Bottom Top Left
        0.5, 0.5, -0.5, // Bottom Top Right
        0.5, -0.5, -0.5, // Bottom Bottom Right
        -0.5, -0.5, -0.5 // Bottom Bottom Left
    ]

    const vertexColor = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,

        1.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ]

    drawCube()

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW)

    const cBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW)

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
	
	attribute vec3 vPosition;
	attribute vec4 vColor;
    uniform vec3 theta;
	
	varying vec4 fColor;

	void main()
	{
        vec3 angle = radians(theta);
        vec3 s = sin(angle);
        vec3 c = cos(angle);

        mat4 rx = mat4(
        
        )

 		gl_Position = vec4(vPosition.xyz * scale, 1.0);
		fColor = vColor;
	}
`)

    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, `

	precision mediump float;
	varying vec4 fColor;

	void main()
	{
		gl_FragColor = fColor;
	}
`)

    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const timeLOC = gl.getUniformLocation(program, "time")

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const vertexLOC = gl.getAttribLocation(program, "vPosition")
    gl.enableVertexAttribArray(vertexLOC)
    gl.vertexAttribPointer(vertexLOC, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
    const colorLOC = gl.getAttribLocation(program, "vColor")
    gl.enableVertexAttribArray(colorLOC)
    gl.vertexAttribPointer(colorLOC, 4, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.enable(gl.DEPTH_TEST)

    let time = 0;
    const dt = 0.05

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT)
        gl.viewport(0, 0, canvas.width, canvas.height)
        time += dt
        gl.uniform1f(timeLOC, time);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices)
        requestAnimationFrame(render)
    }

    render()

    function drawCube()
    {
        quad(4,5,1,0) // Top
        quad(1,5,6,2) // right
        quad(7,6,2,3) // bottom
        quad(0,4,7,3) // left
        quad(0,1,2,3) // front
        quad(4,5,6,7) // back
    }

    function quad(a,b,c,d)
    {
        const indexData = [a,b,c,a,c,d]

        for(var i=0;i<indexData.length;i++)
        {
            vertexArray.push(vertexData[3 * indexData[i]], vertexData[3 * indexData[i] + 1], vertexData[3 * indexData[i] + 2])
            colorArray.push(vertexColor[4 * indexData[i]], vertexColor[4 * indexData[i] + 1], vertexColor[4 * indexData[i] + 2], vertexColor[4 * indexData[i] + 3])
        }
    }
}

main()