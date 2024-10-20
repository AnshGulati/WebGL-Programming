main() // Function Call

// Function Body
function main() {
    const canvas = document.querySelector("canvas") // Get Canvas Elt.

    const gl = canvas.getContext("webgl") // To use WebGL API

    // Error Handling
    if (!gl) {
        throw new Error("WebGL is not supported in your Browser")
    }

    gl.clearColor(1.0, 0.0, 0.0, 1.0) // Sets the Canvas Color to Red

    gl.clear(gl.COLOR_BUFFER_BIT) // Clears the Buffer bit
}