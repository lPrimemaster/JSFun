let SIZE_X;
let SIZE_Y;
let dt = .1;

const LEFT = 0;
const RIGHT = 1;

let g_selection = null;
let ui;
let elements = [];
let readyToSelect = {gate: null, side: LEFT};
let lineStart = null;
let gateStart = {gate: null, side: LEFT};

const LOW = 0;
const HIGH = 1;
const CLK_RATE = 100; // Period in cycles

function bounded(v, v0, v1)
{
    return v >= v0 && v <= v1;
}

// from https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

class Gate
{
    constructor(x, y, type, isize, tick)
    {
        this.x = x;
        this.y = y;
        this.size_per_input = 30;
        if(isize > 0)
        {
            this.h = this.size_per_input * isize;
        }
        else
        {
            this.h = this.size_per_input;
        }
        this.w = 50;
        this.float = true;
        this.selectedSide = null;

        this.lb = this.x - this.w / 2;
        this.rb = this.x + this.w / 2;
        this.tb = this.y - this.h / 2;
        this.bb = this.y + this.h / 2;

        this.isize = isize;
        this.inputsRef = new Array(isize).fill(null);
        this.outputRef = null;
        this.inputs = new Array(isize).fill(LOW);
        this.output = LOW;

        this.internal = {clk: CLK_RATE};

        this.type = type;
        this.tick = tick;
    }

    firstAvailableInputPos()
    {
        for(let i = 0; i < this.inputsRef.length; i++)
        {
            if(this.inputsRef[i] == null) 
                return {x: this.x - this.w / 2, 
                        y: this.y - this.h / 2 + this.size_per_input * (i + 0.5)};
        }

        return null;
    }

    firstAvailableInput()
    {
        for(let i = 0; i < this.inputsRef.length; i++)
        {
            if(this.inputsRef[i] == null) 
                return i;
        }

        return null;
    }

    outputPos()
    {
        if(this.outputRef == null)
            return {x: this.x + this.w / 2, 
                    y: this.y};
        
        return null;
    }

    outputPosAlways()
    {
        return {x: this.x + this.w / 2, 
                y: this.y};
    }

    setup(lx, ly)
    {
        this.x = lx;
        this.y = ly;

        this.lb = this.x - this.w / 2;
        this.rb = this.x + this.w / 2;
        this.tb = this.y - this.h / 2;
        this.bb = this.y + this.h / 2;

        this.float = false;
    }

    update()
    {
        if(this.float)
        {
            this.x = mouseX;
            this.y = mouseY;
        }
        else if(bounded(mouseY, this.tb, this.bb))
        {
            if(bounded(mouseX, this.lb, this.x))
            {
                readyToSelect.side = LEFT;
                readyToSelect.gate = this;
            }
            else if(bounded(mouseX, this.x, this.rb))
            {
                readyToSelect.side = RIGHT;
                readyToSelect.gate = this;
            }
            else if(readyToSelect.gate == this)
            {
                readyToSelect.gate = null;
            }
        }
        else if(readyToSelect.gate == this)
        {
            readyToSelect.gate = null;
        }

        // Update inputs
        for(let i = 0; i < this.isize; i++)
        {
            if(this.inputsRef[i] != null)
            {
                this.inputs[i] = this.inputsRef[i].output;
            }
        }

        // Update output
        this.output = this.tick(this.inputs, this.internal, this.output);
    }

    draw()
    {
        rectMode(CENTER);
        noFill();
        stroke(255);
        strokeWeight(2);
        rect(this.x, this.y, this.w, this.h);

        // Out
        if(this.output == LOW)
                fill('red');
            else
                fill('green');
        ellipse(this.x + this.w / 2, this.y, 10);

        // In
        for(let i = 0; i < this.isize; i++)
        {
            let x = this.x - this.w / 2;
            let y = this.y - this.h / 2 + this.size_per_input * (i + 0.5);

            if(this.inputs[i] == LOW)
                fill('red');
            else
                fill('green');
            ellipse(x, y, 10);

            if(this.inputsRef[i] != null)
            {
                let out = this.inputsRef[i].outputPosAlways();
                line(x, y, out.x, out.y);
            }
        }

        fill(255);
        strokeWeight(0.5);
        textAlign(CENTER);
        text(this.type, this.x, this.y + 4);
    }
}

class Switch
{
    
}
class UIButton
{
    constructor(x, y, w, h, placeholder, onClickObj, objType, isize, tick)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.p = placeholder;
        this.oco = onClickObj;
        this.type = objType;
        this.tick = tick;
        this.isize = isize;

        this.lb = this.x - this.w / 2;
        this.rb = this.x + this.w / 2;
        this.tb = this.y - this.h / 2;
        this.bb = this.y + this.h / 2;
    }

    maybeClick()
    {
        if(bounded(mouseX, this.lb, this.rb) && bounded(mouseY, this.tb, this.bb))
        {
            console.log("Clicked on ", this.p);
            g_selection = new this.oco(mouseX, mouseY, this.type, this.isize, this.tick);
            return true;
        }
        return false;
    }

    draw()
    {
        rectMode(CENTER);
        noFill();
        stroke(255);
        strokeWeight(3);
        rect(this.x, this.y, this.w, this.h);

        fill(255);
        strokeWeight(0.5);
        textAlign(CENTER);
        text(this.p, this.x, this.y + 4);
    }
}

class UI
{
    constructor()
    {
        this.buttons = [];
        this.buttons.push(new UIButton(70, SIZE_Y - 20, 50, 20, "2-AND", Gate, "AND", 2, (inputs, int, pout) => {
            let out = HIGH;
            for(let i of inputs)
            {
                out &= i;
            }
            return out;
        }));
        this.buttons.push(new UIButton(140, SIZE_Y - 20, 50, 20, "2-OR", Gate, "OR", 2, (inputs, int, pout) => {
            let out = LOW;
            for(let i of inputs)
            {
                out |= i;
            }
            return out;
        }));
        this.buttons.push(new UIButton(210, SIZE_Y - 20, 50, 20, "2-NAND", Gate, "NAND", 2, (inputs, int, pout) => {
            let out = HIGH;
            for(let i of inputs)
            {
                out &= i;
            }
            return ~out;
        }));
        this.buttons.push(new UIButton(280, SIZE_Y - 20, 50, 20, "2-XOR", Gate, "XOR", 2, (inputs, int, pout) => {
            let out = LOW;
            let x = LOW;
            for(let i of inputs)
            {
                if(i == HIGH)
                {
                    if(x == HIGH)
                    {
                        return LOW;
                    }
                    x = HIGH;
                    out = HIGH;
                }
            }
            return out;
        }));
        this.buttons.push(new UIButton(350, SIZE_Y - 20, 50, 20, "CLK", Gate, "CLK", 0, (inputs, int, pout) => {
            if(--int.clk == 0)
            {
                int.clk = CLK_RATE;
                if(pout == LOW)
                    return HIGH;
                else
                    return LOW;
            }
            return pout;
        }));
        this.buttons.push(new UIButton(420, SIZE_Y - 20, 50, 20, "NOT", Gate, "NOT", 1, (inputs, int, pout) => {
            return !inputs[0];
        }));
    }

    draw()
    {
        for(let i = 0; i < this.buttons.length; i++)
        {
            this.buttons[i].draw();
        }
    }
}

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;

    ui = new UI();

    createCanvas(SIZE_X, SIZE_Y);
}

function draw()
{
    background(0);

    if(g_selection != null)
    {
        g_selection.update();
    }

    for(let i = 0; i < elements.length; i++)
    {
        elements[i].update();
    }

    for(let i = 0; i < elements.length; i++)
    {
        elements[i].draw();
    }

    if(g_selection != null)
    {
        g_selection.draw();
    }

    if(lineStart != null)
    {
        strokeWeight(1);
        line(lineStart.x, lineStart.y, mouseX, mouseY);
    }

    ui.draw();
}

function mouseReleased() 
{
    if(lineStart != null)
    {
        if(readyToSelect.gate != null && readyToSelect.gate != gateStart.gate)
        {
            if(readyToSelect.side != gateStart.side)
            {
                if(readyToSelect.side == LEFT)
                {
                    let i = readyToSelect.gate.firstAvailableInput();
                    if(i != null)
                        readyToSelect.gate.inputsRef[i] = gateStart.gate;
                }
                else
                {
                    let i = gateStart.gate.firstAvailableInput();
                    if(i != null)
                        gateStart.gate.inputsRef[i] = readyToSelect.gate;
                }
            }
        }

        lineStart = null;
    }
}

function mousePressed()
{
    for(let i = 0; i < ui.buttons.length; i++)
    {
        if(ui.buttons[i].maybeClick()) return;
    }

    if(g_selection != null)
    {
        elements.push(clone(g_selection));
        elements[elements.length - 1].setup(mouseX, mouseY);
    }

    if(readyToSelect.gate != null)
    {
        if(readyToSelect.side == LEFT)
        {
            let gate_input_pos = readyToSelect.gate.firstAvailableInputPos();
            if(gate_input_pos != null)
            {
                lineStart = {x: gate_input_pos.x, y: gate_input_pos.y};
                gateStart.gate = readyToSelect.gate;
                gateStart.side = readyToSelect.side;
            }
            else
            {
                lineStart = null;
                gateStart.gate = null;
            }
        }
        else
        {
            let gate_output_pos = readyToSelect.gate.outputPos();
            if(gate_output_pos != null)
            {
                lineStart = {x: gate_output_pos.x, y: gate_output_pos.y};
                gateStart.gate = readyToSelect.gate;
                gateStart.side = readyToSelect.side;
            }
            else
            {
                lineStart = null;
                gateStart.gate = null;
            }
        }
    }
}

function keyPressed()
{
    if(keyCode == ESCAPE)
    {
        g_selection = null;
    }
}

function keyReleased()
{
}
