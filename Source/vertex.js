const vertexShaderSrc= `
    attribute vec3 aPosition;
    
    uniform mat4 uModelTransformMatrix;

    void main() {
        gl_Position = uModelTransformMatrix*vec4(aPosition, 1.0);
        gl_PointSize = 5.0;
    }
`;

export default vertexShaderSrc;