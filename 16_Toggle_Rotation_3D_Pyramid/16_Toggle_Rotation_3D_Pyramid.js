function main() {
    const canvas = document.querySelector("canvas")
    const gl = canvas.getContext("webgl")

    if (!gl) {
        throw new Error("Webgl is not supported in your browser")
    }

    const totalVertices = 18; // 6 Triangles * 3 vertices = 18

    const vertexData = [
        // Apex
        0.0, 0.5, 0.0,   // Top (Apex)
        // Base
        -0.5, -0.5, 0.5, // Bottom front left
        0.5, -0.5, 0.5,  // Bottom front right
        0.5, -0.5, -0.5, // Bottom back right
        -0.5, -0.5, -0.5 // Bottom back left
    ]

    const colorData = [
        // Apex color
        0.36, 0.20, 0.09, 1.0,
        // Base colors
        0.62, 0.32, 0.17, 1.0,
        0.44, 0.26, 0.08, 1.0,
        0.62, 0.32, 0.17, 1.0,
        0.55, 0.27, 0.07, 1.0
    ];


    const points = []
    const colors = []

    drawPyramid()

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
        attribute vec4 position;
        attribute vec4 vColor;
        varying vec4 fColor;
        uniform vec3 theta;

        void main()
        {
            vec3 angles = radians(theta);
            vec3 c = cos(angles);
            vec3 s = sin(angles);

            mat4 rx = mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, c.x, s.x, 0.0,
                0.0, -s.x, c.x, 0.0,
                0.0, 0.0, 0.0, 1.0
            );

            mat4 ry = mat4(
                c.y, 0.0, -s.y, 0.0,
                0.0, 1.0, 0.0, 0.0,
                s.y, 0.0, c.y, 0.0,
                0.0, 0.0, 0.0, 1.0
            );

            mat4 rz = mat4(
                c.z, s.z, 0.0, 0.0,
                -s.z, c.z, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );

            gl_Position = rz * ry * rx * position;
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

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    const positionLOC = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLOC)
    gl.vertexAttribPointer(positionLOC, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const colorLOC = gl.getAttribLocation(program, 'vColor')
    gl.enableVertexAttribArray(colorLOC)
    gl.vertexAttribPointer(colorLOC, 4, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    const thetaLOC = gl.getUniformLocation(program, 'theta')

    gl.useProgram(program)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let axis = 0
    let theta = [0, 0, 0]
    let flag = false

    const xAxis = 0;
    const yAxis = 1;
    const zAxis = 2;

    document.getElementById("xButton").onclick = () => {
        if (flag) axis = xAxis
    }
    document.getElementById("yButton").onclick = () => {
        if (flag) axis = yAxis
    }
    document.getElementById("zButton").onclick = () => {
        if (flag) axis = zAxis
    }
    document.getElementById("ButtonT").onclick = () => {
        flag = !flag
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        if (flag) theta[axis] += 2.0
        gl.uniform3fv(thetaLOC, theta)
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.drawArrays(gl.TRIANGLES, 0, totalVertices)
        requestAnimationFrame(render)
    }

    render()

    function drawPyramid() {
        faces(0, 1, 2) // Front
        faces(0, 3, 4) // Back
        faces(0, 1, 4) // Left
        faces(0, 2, 3) // Right
        faces(4, 3, 2) // Top
        faces(4, 2, 1) // Bottom
    }

    function faces(a, b, c) {
        const indices = [a, b, c]
        for (let i = 0; i < indices.length; i++) {
            points.push(vertexData[3 * indices[i]], vertexData[3 * indices[i] + 1], vertexData[3 * indices[i] + 2])
            colors.push(colorData[4 * indices[i]], colorData[4 * indices[i] + 1], colorData[4 * indices[i] + 2], colorData[4 * indices[i] + 3])
        }
    }

}

main()