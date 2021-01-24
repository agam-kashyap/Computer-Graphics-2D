import Renderer from './renderer.js';
import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Rectangle from './Rectangle.js';
import Circle from './Circle.js';
import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

/* Canvas Setup Begins */
const renderer = new Renderer();
const gl = renderer.webGlContext();

const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
shader.use();
/* Canvas Setup Ends */

// Color Dictionary
const Color = {
    'rectangle' : new Float32Array([1.0, 0.0, 0.0, 1.0]),
    'square' : new Float32Array([1.0, 0.0, 1.0, 1.0]),
    'circle' : new Float32Array([0.0, 0.0, 1.0, 1.0]),
};

////////////////// IMPORTANT: FIGURE STORE
const Figures = [];

// Variables Relevant to all Modes
let mode_value = 0; // Varies from 0,1,2
let shape_mode = 'r' // Varies from 'r', 's', 'c'
let terminate = false;
let MouseCoordinates = 0;

// Mode 1 Relevant variables
let orderid = 0;
let selected_object_index = -1;
let selected_color = new Float32Array([0.1, 0.1, 0.1, 0.8]);

let speedX = 0.01;
let speedY = 0.01;
let scalePoint = 0.1;

// User Input
// Use the canvas for taking Mouse input since the its functionality is bounded by the canvas' area
window.onload = () => 
{
    renderer.getCanvas().addEventListener('click', (event) =>
    {
        // Click coordinate conversion to Canvas coordinate System
        let mouseX = event.clientX;
        let mouseY = event.clientY;

        let render_area = renderer.getCanvas().getBoundingClientRect();
        mouseX = mouseX - render_area.left;
        mouseY = mouseY - render_area.top;

        const clipCoordinates = renderer.mouseToClipCoord(mouseX, mouseY);
        // Conversion Complete!

        // Shape Creation Mode
        if(mode_value == 0) 
        {
            if(shape_mode == 'r')
            {
                Figures.push(new Rectangle(gl, clipCoordinates[0], clipCoordinates[1], 0.1, 0.2, Color['rectangle'], orderid));
            }
            else if(shape_mode == 's')
            {
                Figures.push(new Rectangle(gl, clipCoordinates[0], clipCoordinates[1], 0.2, 0.2, Color['square'], orderid));
            }
            else if(shape_mode == 'c')
            {
                let radius = 0.1;
                Figures.push(new Circle(gl, clipCoordinates[0], clipCoordinates[1], radius, Color['circle'], orderid));
            }
            orderid += 1;
        }

        //Individual Transformation Mode: Translate + Scale
        else if(mode_value == 1)
        {
            let max_order = -1;
            for(let i in Figures)
            {
                let ans = Figures[i].is_inside(clipCoordinates[0],clipCoordinates[1]);
                if(ans[0] == true)
                {
                    if(ans[1] > max_order)
                    {
                        max_order = ans[1];
                    }
                }
            }
            selected_object_index = max_order; 
        }

        //Grouped Transformation
        else
        {

        }

    });

    document.addEventListener("keydown", (ev) => {
        if(ev.key == "m")
        {
            mode_value += 1;
            mode_value = (mode_value%3);
        }
        else if(ev.key == 'Escape')
        {
            terminate = true;
        }
        // Handles drawing mode for Shape
        if( mode_value == 0)
        {
            if(ev.key == 'r')
            {
                shape_mode = 'r';
            }
            else if(ev.key == 's')
            {
                shape_mode = 's';
            }
            else if(ev.key == 'c')
            {
                shape_mode = 'c';
            }
        }
        // Handles trigger value for Transformation 
        // Creates values of transformation
        else if( mode_value == 1)
        {
            if(ev.key == "ArrowUp")
            {
                Figures[selected_object_index].translateY += speedY;
                vec3.set(
                    Figures[selected_object_index].translation, 
                    Figures[selected_object_index].translateX, 
                    Figures[selected_object_index].translateY, 
                    0);
                Figures[selected_object_index].transform.setTranslate(Figures[selected_object_index].translation);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
            else if(ev.key == "ArrowDown")
            {
                Figures[selected_object_index].translateY -= speedY;
                vec3.set(
                    Figures[selected_object_index].translation, 
                    Figures[selected_object_index].translateX, 
                    Figures[selected_object_index].translateY, 
                    0);
                Figures[selected_object_index].transform.setTranslate(Figures[selected_object_index].translation);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
            else if(ev.key == "ArrowLeft")
            {
                Figures[selected_object_index].translateX -= speedX;
                vec3.set(
                    Figures[selected_object_index].translation, 
                    Figures[selected_object_index].translateX, 
                    Figures[selected_object_index].translateY, 
                    0);
                Figures[selected_object_index].transform.setTranslate(Figures[selected_object_index].translation);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
            else if(ev.key == "ArrowRight")
            {
                Figures[selected_object_index].translateX += speedX;
                vec3.set(
                    Figures[selected_object_index].translation, 
                    Figures[selected_object_index].translateX, 
                    Figures[selected_object_index].translateY, 
                    0);
                Figures[selected_object_index].transform.setTranslate(Figures[selected_object_index].translation);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
            else if(ev.key == "+")
            {
                Figures[selected_object_index].scalingVal += scalePoint;
                vec3.set(
                    Figures[selected_object_index].scale, 
                    Figures[selected_object_index].scalingVal, 
                    Figures[selected_object_index].scalingVal, 
                    0);
                Figures[selected_object_index].transform.setScale(Figures[selected_object_index].scale);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
            else if(ev.key == "-")
            {
                Figures[selected_object_index].scalingVal -= scalePoint;
                vec3.set(
                    Figures[selected_object_index].scale, 
                    Figures[selected_object_index].scalingVal, 
                    Figures[selected_object_index].scalingVal, 
                    0);
                Figures[selected_object_index].transform.setScale(Figures[selected_object_index].scale);
                Figures[selected_object_index].transform.updateMVPMatrix();
            }
        }
    });

    // Extra for checking continuous coordinates of the mouse
    document.addEventListener("mousemove" , (ev)=> {
        let mouseX = ev.clientX;
        let mouseY = ev.clientY;

        let render_area = renderer.getCanvas().getBoundingClientRect();
        mouseX = mouseX - render_area.left;
        mouseY = mouseY - render_area.top;

        MouseCoordinates = renderer.mouseToClipCoord(mouseX, mouseY);
    });
};

// Shows Mode number
var modeElement = document.querySelector('#mode');
var modeNode = document.createTextNode("");
modeElement.appendChild(modeNode);

// Mouse Coordinates in Canvas system
var mouseXElement = document.querySelector('#mousex');
var mouseX = document.createTextNode("");
mouseXElement.appendChild(mouseX);

var mouseYElement = document.querySelector('#mousey');
var mouseY = document.createTextNode("");
mouseYElement.appendChild(mouseY);

// Displays when in mode 0: Shape drawing mode
var ShapeElement = document.querySelector('#shape');
var shape = document.createTextNode("");
ShapeElement.appendChild(shape);

const name_shapes = {
    'r' : 'Rectangle',
    's' : 'Square',
    'c' : 'Circle'
};

let ran = 0
function animate()
{
    // Text Box dynamic Handler
    modeNode.nodeValue = mode_value;
    if(typeof MouseCoordinates[0] != 'undefined')
    {
        mouseX.nodeValue = MouseCoordinates[0].toPrecision(4);
        mouseY.nodeValue = MouseCoordinates[1].toPrecision(4);
    }
    
    if(mode_value == 0)
    {
        selected_object_index = -1;
        document.getElementsByClassName("shapes")[0].style.visibility="visible";
        document.getElementsByClassName("shapes")[0].style.display="block";
        shape.nodeValue = name_shapes[shape_mode];
    }
    else if(mode_value == 1)
    {
        document.getElementsByClassName("shapes")[0].style.visibility="hidden";
        document.getElementsByClassName("shapes")[0].style.display="none";
    }
    else if(mode_value == 2)
    {
        selected_object_index = -1;
        document.getElementsByClassName("shapes")[0].style.visibility="hidden";
        document.getElementsByClassName("shapes")[0].style.display="none";
    }
    // Text Box Handler ends

    renderer.clear()
    
    // IMPORTANT: Figure handling
    let index = 0;
    for(let i in Figures)
    {
        if(index == selected_object_index)
        {
            Figures[i].draw_selected(shader, selected_color);
        }
        else
        {
            Figures[i].draw(shader);
        }
        index += 1;
    }

    // Activated by pressing 'Escape' key
    if(terminate == false)
        window.requestAnimationFrame(animate);
    else
        window.cancelAnimationFrame(animate);
}

animate();
shader.cleanup();

// Key Presses link = https://keycode.info/