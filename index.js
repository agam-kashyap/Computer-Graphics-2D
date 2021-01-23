import Renderer from './renderer.js';
import Shader from './shader.js';
import vertexShaderSrc from './vertex.js';
import fragmentShaderSrc from './fragment.js';
import Rectangle from './Rectangle.js';
import Square from './Square.js';
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
// // Transformation Matrix 
let translation = vec3.create();
let rotationAngle = 0;
let rotationAxis = vec3.create();
let scale = vec3.create();
let speedX = 0.01;
let speedY = 0.01;
let translateX = 0;
let translateY = 0;
let scalingVal = 1;
vec3.set(translation, translateX, translateY, 0);
vec3.set(scale, scalingVal, scalingVal, 1);
function mode2_transform(ev)
{
    if(ev.key == "ArrowUp")
    {
        translateY += speedY;
    }
    else if(ev.key == "ArrowDown")
    {
        translateY -= speedY;
    }
    else if(ev.key == "ArrowLeft")
    {
        translateX -= speedX;
    }
    else if(ev.key == "ArrowRight")
    {
        translateX += speedX;
    }
    else if(ev.key == "+")
    {
        scalingVal += 0.1;
    }
    else if(ev.key == "-")
    {
        scalingVal -= 0.1;
    }
    vec3.set(translation, translateX, translateY, 0);
    vec3.set(scale, scalingVal, scalingVal, 1);
}
// New Variable to keep track of when object selection changes to reset transformation parameters
let OldObject = -1;

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
                Figures.push(new Rectangle(gl, clipCoordinates[0], clipCoordinates[1], Color['rectangle'], orderid));
            }
            else if(shape_mode == 's')
            {
                Figures.push(new Square(gl, clipCoordinates[0], clipCoordinates[1], Color['square'], orderid));
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
            if(selected_object_index != OldObject)
            {
                translation = vec3.create();
                rotationAngle = 0;
                rotationAxis = vec3.create();
                scale = vec3.create();
                translateX = 0;
                translateY = 0;
                scalingVal = 1;
                vec3.set(translation, translateX, translateY, 0);
                vec3.set(scale, scalingVal, scalingVal, 1);
            }
            OldObject = selected_object_index;  
        }

        //Grouped Transformation
        else
        {

        }

    });

    document.addEventListener("keydown", (ev) => {
        if(ev.key == "m")
        {
            if(mode_value == 1)
            {
                translation = vec3.create();
                rotationAngle = 0;
                rotationAxis = vec3.create();
                scale = vec3.create();
                translateX = 0;
                translateY = 0;
                scalingVal = 1;
                vec3.set(translation, translateX, translateY, 0);
                vec3.set(scale, scalingVal, scalingVal, 1);
            }
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
            mode2_transform(ev);
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
            console.log("Hi")
            Figures[i].draw_selected(shader, selected_color);
            Figures[i].transform.setTranslate(translation);
            Figures[i].transform.setScale(scale);
            Figures[i].transform.updateMVPMatrix();
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