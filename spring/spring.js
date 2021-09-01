let SIZE_X;
let SIZE_Y;

let dt = 0.5;
let g;

let spring;
let chart;
let chart2;
let vecZero;

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

function Chart(x, y, w, h, size)
{
    this.data = [];
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = size;
    this.pm = w / size;

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

    this.plot = function()
    {
        push();
        translate(this.x, this.y);

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

function Spring(km, b, l0)
{
    this.l0 = l0;
    this.km = km;
    this.b = b;

    this.pos = createVector(this.l0 * cos(PI / 2), this.l0 * sin(PI / 2));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.update = function()
    {
        let spring_acc = p5.Vector.mult(p5.Vector.sub(this.pos, p5.Vector.mult(p5.Vector.normalize(this.pos), this.l0)), -this.km);
        this.acc = p5.Vector.add(spring_acc, g);
        this.acc.add(p5.Vector.mult(this.vel, -this.b));
        this.vel.add(p5.Vector.mult(this.acc, dt));
        this.pos.add(p5.Vector.mult(this.vel, dt));

        chart.add('red', this.acc.mag() * 5);
        chart2.add('blue', this.pos.mag() / 2);
    }

    this.draw = function()
    {
        strokeWeight(5);
        stroke(127, 127, 127);
        line(this.pos.x, this.pos.y, 0, 0);

        stroke(0);
        fill(0);
        ellipse(0, 0, 50, 50);
        ellipse(this.pos.x, this.pos.y, 50, 50);
        
        drawArrowText(this.pos, p5.Vector.mult(p5.Vector.sub(this.acc, g), 10), 'red', '(k / m) * x');
        drawArrowText(this.pos, p5.Vector.mult(g, 10), 'green', 'g');
    }
}

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);

    g = createVector(0, 9.8);
    vecZero = createVector(0, 0);

    spring = new Spring(1 / 10, 0.01, 200);
    chart = new Chart(0, 0, 250, 250, 500);
    chart2 = new Chart(0, 270, 250, 250, 500);
    chart.create('red', color(255, 0, 0));
    chart2.create('blue', color(0, 0, 255));

    chart2.addHLine(200 / 2, "Natural lenght");
    chart2.addHLine(200 / 2 + 5 * 9.8, "Natural lenght + (m / k) * g");
}

function draw()
{
    background(255);
    stroke(0);
    spring.update();

    push();
    translate(width / 2, 0);
    spring.draw();
    pop();
    
    chart.plot();
    chart2.plot();
}