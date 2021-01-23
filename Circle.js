import Transform from './transform.js'

export default class Circle
{
    constructor(gl, centerX, centerY, radius, color, orderid)
    {
        this.orderid = orderid;

        this.color = color;
        this.gl = gl;

        this.vertexAttributesBuffer = this.gl.createBuffer();
        if(!this.vertexAttributesBuffer)
        {
            throw new Error("Buffer for Rectangle's vertices could Not be allocated");
        }

        this.center_circle = [centerX, centerY];
        this.radius = radius;
        this.vertexAttributesData = [];
        this.vertCount = 3;

        for(var i=0; i<360; i+=1)
        {
            var j = i* Math.PI / 100;

            var vert1 = [
                // X, Y, Z
                centerX + Math.sin(j)*radius, centerY + Math.cos(j)*radius, 0,
            ];

            var vert2 = [
                // X, Y, Z
                centerX, centerY, 0,
            ];

            this.vertexAttributesData = this.vertexAttributesData.concat(vert1);
            this.vertexAttributesData = this.vertexAttributesData.concat(vert2);
        }		
        this.transform = new Transform();
    }

    draw(shader)
    {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        let vertexData = new Float32Array(this.vertexAttributesData)
        let elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.DYNAMIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, this.color);

        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, vertexData.length/this.vertCount);
    }

    draw_selected(shader, color)
    {		
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        let vertexData = new Float32Array(this.vertexAttributesData)
        let elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.DYNAMIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, color);

		shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, vertexData.length/this.vertCount);
        console.log("We drew");
    }

    is_inside(mouseX, mouseY, mouseZ=0)
    {
        let bool_inside = false;
        let distance = Math.sqrt(
            Math.pow((mouseX-this.center_circle[0]),2) + Math.pow((mouseY-this.center_circle[1]),2)
            );
        if(distance <= this.radius)
        {
            bool_inside = true;
        }
        return [bool_inside, this.orderid];
    }
};