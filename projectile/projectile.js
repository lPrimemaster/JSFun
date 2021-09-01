let SIZE_X;
let SIZE_Y;

let dt = 0.02;
let ldt = dt;
let g = 9.8;

let projectiles = [];
let x_chart;
let y_chart;

function drawArrow(base, vec, myColor) 
{
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
}

function drawArrowText(base, vec, myColor, txt) 
{
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    strokeWeight(1);
    rotate(-vec.heading());
    text(txt, 10, 0);
    pop();
}

function Chart(x, y, w, h, size, title)
{
    this.data = [];
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = size;
    this.pm = w / size;
    this.title = title;

    this.lines = [];

    this.dict = {};
    this.dictColor = {};

    this.create = function(name, color)
    {
        this.dict[name] = [];
        this.dictColor[name] = color;
    }

    this.add = function(name, val)
    {
        this.dict[name].push(val);

        if(this.dict[name].length > this.size)
        {
            this.dict[name].shift();
        }
    }

    this.addHLine = function(y, name)
    {
        this.lines.push({h : y, n : name});
    }

    this.clear = function()
    {
        for(let name in this.dict)
        {
            this.dict[name].splice(0, this.dict[name].length);
        }
    }

    this.plot = function()
    {
        push();
        translate(this.x, this.y);

        strokeWeight(1);
        textAlign(CENTER);
        text(this.title, this.w / 2, -5);
        strokeWeight(2);
        line(0, 0, this.w, 0);
        line(0, this.h, this.w, this.h);
        line(0, 0, this.w, 0);
        line(0, 0, this.w, 0);

        stroke(0, 0, 0, 100);
        strokeWeight(1);
        for(let i = 0; i < 10; i++)
        {
            let h = this.h / 10 * i;
            line(0, h, this.w, h);
        }

        for(let i = 0; i < this.lines.length; i++)
        {
            strokeWeight(1.5);
            stroke(100, 100, 100);
            line(0, this.h - this.lines[i].h, this.w, this.h - this.lines[i].h);

            strokeWeight(0.2);
            text(this.lines[i].n, this.w + 20, this.h - this.lines[i].h + 3);
        }

        strokeWeight(1);
        noFill();
        for(let key in this.dict)
        {
            beginShape();
            stroke(this.dictColor[key]);
            for(let i = 0; i < this.dict[key].length; i++)
            {
                let value = this.dict[key];
                curveVertex(i * this.pm, this.h - value[i]);
            }
            endShape();      
        }

        stroke(0);
        fill(255);

        pop();
    }
}

function Projectile(x, y, v, theta, b)
{
    this.b = b;

    this.pos = createVector(x, y);
    this.vel = createVector(v * cos(-theta), v * sin(-theta));
    this.acc = createVector(0, g);

    this.color = color(random(255), random(255), random(255));
    this.trailSize = 12000;

    this.eff_acc = createVector(0, 0);

    this.drawTrail = true;

    this.posRecord = [];

    this.update = function()
    {
        this.eff_acc = p5.Vector.add(this.acc, p5.Vector.mult(this.vel, -this.b));
        this.vel.add(p5.Vector.mult(this.eff_acc, dt));
        this.pos.add(p5.Vector.mult(this.vel, dt));

        if(dt > 0)
        {
            x_chart.add('x_t', this.pos.x / 5);
            y_chart.add('y_t', -this.pos.y / 5);
        }

        this.posRecord.push(this.pos.copy());
        if(this.posRecord.length > this.trailSize)
        {
            this.posRecord.shift();
        }
    }

    this.draw = function()
    {
        stroke(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, 30, 30);
        
        //drawArrowText(this.pos, p5.Vector.mult(p5.Vector.sub(this.acc, g), 10), 'red', '(k / m) * x');
        //drawArrowText(this.pos, p5.Vector.mult(g, 10), 'green', 'g');

        drawArrowText(this.pos, this.vel, 'blue', 'v');
        //drawArrowText(this.pos, createVector(0, g * 10), 'green', 'g');
        drawArrowText(this.pos, p5.Vector.mult(this.eff_acc, 10), 'red', 'eff_acc');
    }

    this.showTrail = function()
    {
        // Display trail
        if(this.drawTrail)
        {
            noFill();
            stroke(this.color);
            beginShape();
            for(let i = 0; i < this.posRecord.length; i++)
            {
                curveVertex(this.posRecord[i].x, this.posRecord[i].y);
            }
            endShape();
            stroke(255);
        }
    }
}

let v0;
let angle;
let bval;
let button;
let v0text;
let angletext;
let bvaltext;
let cbutton;
let cbox;
let randbutton;
let shot_w_graph = false;

function shoot()
{
    dt = ldt;
    if(cbox.checked())
    {
        clearProjectiles();
        shot_w_graph = true;
        x_chart.clear();
        y_chart.clear();
    }
    else
    {
        shot_w_graph = false;
    }
    
    projectiles.push(new Projectile(0, 0, v0.value(), eval(angle.value()), bval.value()));
}

function clearProjectiles()
{
    projectiles.splice(0, projectiles.length);
}

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);

    v0 = createInput(130);
    v0.position(80, 25);
    v0.size(100);
    v0text = createElement('h5', 'v0 (px/s)');
    v0text.position(10, 5);

    angle = createInput('PI / 4');
    angle.position(80, 55);
    angle.size(100);
    angletext = createElement('h5', 'theta (rad)');
    angletext.position(10, 34);

    bval = createInput(0.05);
    bval.position(80, 85);
    bval.size(100);
    bvaltext = createElement('h5', 'b (1/s)');
    bvaltext.position(10, 65);

    button = createButton('Shoot\'em!');
    button.position(v0text.x, 125);
    button.mousePressed(shoot);

    cbutton = createButton('Clear');
    cbutton.position(button.x + 90, 125);
    cbutton.mousePressed(clearProjectiles);

    cbox = createCheckbox('Display x(t) / y(t) graphs!', true);
    cbox.position(button.x, 155);

    randbutton = createButton('Randomize!');
    randbutton.position(cbutton.x + 63, 125);
    randbutton.mousePressed(() => {
        v0.value(int(random(0, 200)));
        angle.value(round(random(0, PI / 2), 2));
        bval.value(round(random(0, 0.3), 2));
    });

    
    textSize(20);

    x_chart = new Chart(SIZE_X - 250,  40, 250, 250, 1000, 'x(t)');
    y_chart = new Chart(SIZE_X - 250, 350, 250, 250, 1000, 'y(t)');
    x_chart.create('x_t', color(0, 0, 0));
    y_chart.create('y_t', color(0, 0, 0));

    // chart2.addHLine(200 / 2, "Natural lenght");
    // chart2.addHLine(200 / 2 + 5 * 9.8, "Natural lenght + (m / k) * g");
}

function draw()
{
    background(255);
    stroke(0);
    for(let i = 0; i < projectiles.length; i++)
        projectiles[i].update();

    push();
    translate(0, height);
    for(let i = 0; i < projectiles.length; i++)
    {
        projectiles[i].draw();
        projectiles[i].showTrail();
        if(projectiles[i].pos.y > 10)
        {
            if(shot_w_graph)
            {
                shot_w_graph = false;
                ldt = dt;
                dt = 0;
            }
            else
            {
                if(projectiles[i].pos.y > 200)
                {
                    projectiles.splice(i, 1);
                }
            }
        }
    }
    pop();
    
    if(shot_w_graph && cbox.value() || dt == 0)
    {
        x_chart.plot();
        y_chart.plot();
    }
}