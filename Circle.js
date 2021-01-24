import Transform from './transform.js'
import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

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

        this.center_circle = [0, 0];
        this.radius = radius;
        this.vertexAttributesData = [];
        this.vertCount = 3;

        for(var i=0; i<360; i+=1)
        {
            var j = i* Math.PI / 100;

            var vert1 = [
                // X, Y, Z
                Math.sin(j)*radius, Math.cos(j)*radius, 0,
            ];

            var vert2 = [
                // X, Y, Z
                0, 0, 0,
            ];

            this.vertexAttributesData = this.vertexAttributesData.concat(vert1);
            this.vertexAttributesData = this.vertexAttributesData.concat(vert2);
        }		
        this.transform = new Transform();
        this.transform.setTranslate(vec3.fromValues(centerX, centerY, 0));
        this.transform.updateMVPMatrix();

        this.centerX = centerX;
        this.centerY = centerY;
    
        this.translation = vec3.create();
        this.roationAngle = 0;
        this.rotationAxis = vec3.create();
        this.scale = vec3.create();
        this.translateX = centerX;
        this.translateY = centerY;
        this.scalingVal = 1;
        vec3.set(this.translation, this.translateX, this.translateY, 0);
        vec3.set(this.scale, this.scalingVal, this.scalingVal, 1);
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
    }

    is_inside(mouseX, mouseY, mouseZ=0)
    {
        console.log(this.center_circle);
        console.log(this.transform.getMVPMatrix());
        let tempVertexAttributesData = [];
        tempVertexAttributesData = this.multiply(this.transform.getMVPMatrix(), this.center_circle);
        let bool_inside = false;
        let distance = Math.sqrt(
            Math.pow((mouseX-tempVertexAttributesData[0]),2) + Math.pow((mouseY-tempVertexAttributesData[1]),2)
            );
            console.log(distance, this.radius);
        if(distance <= this.radius)
        {
            bool_inside = true;
        }
        return [bool_inside, this.orderid];
    }    
    
    transformation_variable(count_translateX, count_translateY, count_scaling, speedX, speedY, scalePoint)
    {

        if(count_translateX > 0)
        {
            for(let i=0;i<count_translateX;i+=1)
            {
                this.translateX += speedX
            }
            
        }
        else if(count_translateX < 0)
        {
            for(let i=0;i>count_translateX;i-=1)
            {
                this.translateX -= speedX
            }
        }
        if(count_translateY > 0)
        {
            for(let i=0;i<count_translateY;i+=1)
            {
                this.translateY += speedY
            }
        }
        else if (count_translateY < 0)
        {
            for(let i=0;i>count_translateY;i-=1)
            {
                this.translateY -= speedY
            }
        }
        if(count_scaling > 0)
        {
            for(let i=0;i<count_scaling;i+=1)
            {
                this.scalingVal += scalePoint
            }
        }
        else if(count_scaling < 0)
        {
            for(let i=0;i>count_scaling;i-=1)
            {
                this.scalingVal -= scalePoint
            }
        }        
        vec3.set(this.translation, this.translateX, this.translateY, 0);  
        vec3.set(this.scale, this.scalingVal, this.scalingVal, 1);
        this.transform.setTranslate(this.translation);
        this.transform.setScale(this.scale);
        this.transform.updateMVPMatrix();
    }

    multiply(a, b)
    {
        let out = [];
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],  //a , e, i, m
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],  //b, f, j, n
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], //c, g, k, o
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; //d, h, l, p

	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = 0, b3 = 1;
        out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        // out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    // b0 = b[3]; b1 = b[4]; b2 = b[5]; b3 = 1;
	    // out[3] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    // out[4] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    // out[5] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // // out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    // b0 = b[6]; b1 = b[7]; b2 = b[8]; b3 = 1;
	    // out[6] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    // out[7] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    // out[8] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // // out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    // b0 = b[9]; b1 = b[10]; b2 = b[11]; b3 = 1;
	    // out[9] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    // out[10] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    // out[11] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    // // out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
    }
};