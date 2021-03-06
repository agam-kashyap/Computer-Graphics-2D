import Transform from './transform.js'
import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Rectangle
{
    constructor(gl, centerX, centerY, width, height, color, orderid)
    {
        this.orderid = orderid;

        this.vertexAttributesData = new Float32Array([
            // x, y, z
            - width/2, -height/2, 0.0, // A
            - width/2, height/2, 0.0, // B
            width/2, height/2, 0.0, // C
            width/2, -height/2, 0.0, // D
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
        this.transform.setTranslate(vec3.fromValues(centerX, centerY, 0));
        this.transform.updateMVPMatrix();

        this.centerX = centerX;
        this.centerY = centerY;

        this.translation = vec3.create();
        this.rotationAngle = 0;
        this.rotationAxis = vec3.create();
        this.scale = vec3.create();
        this.translateX = centerX;
        this.translateY = centerY;
        this.scalingVal = 1;
        vec3.set(this.rotationAxis, 0, 0, 1);
        vec3.set(this.translation, this.translateX, this.translateY, 0);
        vec3.set(this.scale, this.scalingVal, this.scalingVal, 1);
    }

    returnbounds()
    {
        //minx, miny, maxx, maxy
        let temp = [];
        let tempVertexAttributesData = [];
        tempVertexAttributesData = this.multiply(this.transform.getMVPMatrix(), this.vertexAttributesData);
        let count = 0;
        let min_vertex= [], max_vertex = [];
        for(let i in tempVertexAttributesData)
        {
            if(count < 3)
            {
                min_vertex.push(tempVertexAttributesData[i]);
            }
            if(count > 5 && count < 9)
            {
                max_vertex.push(tempVertexAttributesData[i]);
            }
            count +=1;
        }
        return [min_vertex[0], min_vertex[1], max_vertex[0], max_vertex[1]];
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
        this.gl.vertexAttribPointer(aPosition, elementPerVertex, this.gl.FLOAT, false, 0,0);

        const u_color = shader.uniform("u_color");
        this.gl.uniform4fv(u_color, color);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndices, this.gl.DYNAMIC_DRAW);

        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());
        
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndices.length, this.gl.UNSIGNED_SHORT, indexBuffer);
    }

    is_inside(mouseX, mouseY, mouseZ=0)
    {
        let tempVertexAttributesData = [];
        tempVertexAttributesData = this.multiply(this.transform.getMVPMatrix(), this.vertexAttributesData);
        let count = 0;
        let min_vertex= [], max_vertex = [];
        for(let i in tempVertexAttributesData)
        {
            if(count < 3)
            {
                min_vertex.push(tempVertexAttributesData[i]);
            }
            if(count > 5 && count < 9)
            {
                max_vertex.push(tempVertexAttributesData[i]);
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

    multiply(a, b)
    {
        let out = [];
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],  //a , e, i, m
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],  //b, f, j, n
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], //c, g, k, o
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; //d, h, l, p

	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = 1;
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[3]; b1 = b[4]; b2 = b[5]; b3 = 1;
	    out[3] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[4] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[5] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[6]; b1 = b[7]; b2 = b[8]; b3 = 1;
	    out[6] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[7] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[8] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[9]; b1 = b[10]; b2 = b[11]; b3 = 1;
	    out[9] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[10] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[11] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
    }
};