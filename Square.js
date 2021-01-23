import Transform from './transform.js'

export default class Square
{
    constructor(gl, centerX, centerY, color, orderid)
    {
        this.orderid =orderid
        this.vertexAttributesData = new Float32Array([
            // x, y, z
            centerX - 0.15, centerY - 0.15, 0.0, // A
            centerX - 0.15, centerY + 0.15, 0.0, // B
            centerX + 0.15, centerY + 0.15, 0.0, // C
            centerX + 0.15, centerY - 0.15, 0.0, // D
        ]);

        this.vertexIndices = new Uint16Array([
            0, 1, 3,
            3, 1, 2,
        ]);
        this.color = color;
        this.gl = gl;

        this.vertexAttributesBuffer = this.gl.createBuffer();
        if(!this.vertexAttributesBuffer)
        {
            throw new Error("Buffer for Rectangle's vertices could Not be allocated");
        }
        this.transform = new Transform();
    }

    draw(shader)
    {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        
        let elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexAttributesData, this.gl.DYNAMIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, this.color);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, this.gl.DYNAMIC_DRAW);
        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, indexBuffer);
    }

    draw_selected(shader, color)
    {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        
        let elementPerVertex = 3;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexAttributesData, this.gl.DYNAMIC_DRAW);

        const aPosition = shader.attribute("aPosition");
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0)

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, color);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, this.gl.DYNAMIC_DRAW);
        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, indexBuffer);
        console.log("We drew");
    }

    // Function which returns if the mouseclick is inside the object
    is_inside(mouseX, mouseY, mouseZ=0)
    {
        var iterator = this.vertexAttributesData.entries();
        let count = 0;
        let min_vertex= [], max_vertex = [];
        for(let i in this.vertexAttributesData)
        {
            if(count < 3)
            {
                min_vertex.push(this.vertexAttributesData[i]);
            }
            if(count > 5 && count < 9)
            {
                max_vertex.push(this.vertexAttributesData[i]);
            }
            count +=1;
        }

        let bool_inside = false;
        if(mouseX >= min_vertex[0] && mouseX <= max_vertex[0])
        {
            if(mouseY >= min_vertex[1] && mouseY <= max_vertex[1])
            {
                bool_inside = true;
            }
        }
        return [bool_inside, this.orderid];
    }
};