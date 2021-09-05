let SIZE_X;
let SIZE_Y;
let dt = .1;

let g_selection = null;
let ui;
let elements = [];

function bounded(v, v0, v1)
{
    return v > v0 && v < v1;
}

// from https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

class Gate
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.h = 50;
        this.w = 50;
        this.float = true;
        this.selectedSide = null;

        this.inputs = [];
        this.outputs = [];
    }

    setup(lx, ly)
    {
        this.x = lx;
        this.y = ly;
        this.float = false;
    }

    update()
    {
        if(this.float)
        {
            this.x = mouseX;
            this.y = mouseY;
        }
        // else if(bounded(mouseY, ))
        // {

        // }
    }
}

class And2Gate extends Gate
{
    setup(lx, ly)
    {
        super.setup(lx, ly);
        this.inputs = [null, null];
        this.outputs = [null];
    }

    update()
    {
        super.update();


    }
    
    draw()
    {
        rectMode(CENTER);
        noFill();
        stroke(255);
        strokeWeight(2);
        rect(this.x, this.y, this.w, this.h);

        fill(255);
        // Out
        ellipse(this.x + this.w / 2, this.y, 10);

        // In
        ellipse(this.x - this.w / 2, this.y - this.h / 2 + 12, 10);
        ellipse(this.x - this.w / 2, this.y + this.h / 2 - 12, 10);

        strokeWeight(0.5);
        textAlign(CENTER);
        text("AND", this.x, this.y + 4);
    }
}

class UIButton
{
    constructor(x, y, w, h, placeholder, onClickObj)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.p = placeholder;
        this.oco = onClickObj;

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
            g_selection = new this.oco(mouseX, mouseY);
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
        this.buttons.push(new UIButton(70, SIZE_Y - 20, 50, 20, "2-AND", And2Gate));
        this.buttons.push(new UIButton(140, SIZE_Y - 20, 50, 20, "2-OR"));
        this.buttons.push(new UIButton(210, SIZE_Y - 20, 50, 20, "2-NOT"));
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

    ui.draw();
}

function mouseReleased() 
{
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
