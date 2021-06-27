
let dt = 0.01;
let g;
let chart;
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

function Chart(x, y, w, h, size)
{
    this.data = [];
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = size;
    this.pm = w / size;

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

    this.plot = function()
    {
        push();
        translate(this.x, this.y);

        line(0, 0, this.w, 0);
        line(0, this.h, this.w, this.h);
        line(0, 0, this.w, 0);
        line(0, 0, this.w, 0);

        stroke(0, 0, 0, 100);
        for(let i = 0; i < 10; i++)
        {
            let h = this.h / 10 * i;
            line(0, h, this.w, h);
        }

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

function Pendulum(length, a)
{
    this.length = length;

    this.pos = createVector(length * sin(a), -length * cos(a));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.startangle = a;

    this.draw = function()
    {
        drawArrow(this.pos, p5.Vector.mult(this.vel, 1), 'blue');
        drawArrow(this.pos, p5.Vector.mult(this.acc, 10), 'red');
        
        line(0, 0, this.pos.x, this.pos.y);
        ellipse(0, 0, 50);
        ellipse(this.pos.x, this.pos.y, 20);
        drawArrow(vecZero, p5.Vector.mult(this.pos, 0.1), 'black');
    }

    this.calcAcc = function()
    {
        let npos = p5.Vector.normalize(this.pos);
        let stheta = npos.x;
        
        let c_acc = p5.Vector.mult(npos, -pow(this.vel.mag(), 2) / this.length);
        let t_acc = p5.Vector.mult(createVector(npos.y, -npos.x), -stheta * g.y);
        let acc = p5.Vector.add(c_acc, t_acc);
        
        
        //drawArrow(this.pos, p5.Vector.mult(c_acc, 10), 'red');
        //drawArrow(this.pos, p5.Vector.mult(t_acc, 10), 'green');

        return acc;
    }

    this.update = function()
    {
        this.acc = this.calcAcc();

        
        this.vel.add(p5.Vector.mult(this.acc, dt));
        
        chart.add('acc', this.acc.mag() * 25);
        chart.add('vel', this.vel.mag() * 5);
        chart.add('pos', abs(asin(p5.Vector.normalize(this.pos).x)) * 50);
        

        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
    }
}

let pendulum;
let SIZE_X;
let SIZE_Y;

function u_all()
{
    pendulum.update();
}

function restart()
{
    pendulum = new Pendulum(pendulum.length, pendulum.startangle);
}

function setup()
{
    chart = new Chart(0, 0, 250, 250, 1000);
    chart.create('acc', color(255, 0, 0));
    chart.create('vel', color(0, 0, 255));
    chart.create('pos', color(0, 0, 0));
    g = createVector(0, 9.8);
    vecZero = createVector(0, 0);
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);
    pendulum = new Pendulum(450, 15);

    setInterval(u_all, 1);
}

function draw()
{
    
    push();
    translate(width / 2, 0);
    
    background(255);

    fill('red');
    text('Acceleration', width / 2 - 100, 50);
    fill('blue');
    text('Velocity', width / 2 - 100, 70);
    fill('black');
    text('Position heading', width / 2 - 100, 90);
    let dtstr = 'dt = ' + dt;
    text(dtstr, width / 2 - 100, 150);
    text('g = 9.8 px/s', width / 2 - 100, 170);
    textSize(8);
    text('2', width / 2 - 38, 170 - textAscent());
    textSize(12);
    let lstr = 'l = ' + pendulum.length + ' px';
    text(lstr, width / 2 - 100, 190);
    fill(255);

    //pendulum.update();
    pendulum.draw();
    pop();
    
    chart.plot();
}
