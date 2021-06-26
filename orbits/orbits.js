const G = 1E-5;
const EarthMass = 1;
const MoonMass = 0.0123 * EarthMass;
const SaturnMass = 95.159 * EarthMass;
const SunMass = 332900 * EarthMass;
const AUR = 1;


let SIZE_X;
let SIZE_Y;

let planets = [];
let ui;
let dt = 10;

let x = 0;
let y = 0;
let sf = 1;
let pfixed = true;
let pfindex = 0;

let drop_x = 0;
let drop_y = 0;
let drop_vx = 0;
let drop_vy = 0;
let released = true;
let ctrl_mod = false;
let place = false;

let pcounter = 0;

function NewtonianGravity(M, r)
{
    let mag = G * M / sqrt(pow(r.x, 2) + pow(r.y, 2));
    r.setMag(mag);
    return r;
}

function Body(n, x, y, vx, vy, m, r, c)
{
    this.pos = createVector(x * AUR, y * AUR);
    this.vel = createVector(vx * AUR, vy * AUR);
    this.acc = createVector(0, 0);
    this.m = m;
    this.color = c;
    this.trailSize = 12000;

    this.drawTrail = true;

    this.name = n;

    this.posRecord = [];

    this.update = function()
    {
        this.acc.mult(0);

        for(let i = 0; i < planets.length; i++)
        {
            if(this.pos.x != planets[i].pos.x || this.pos.y != planets[i].pos.y)
            {
                let force = NewtonianGravity(planets[i].m, p5.Vector.sub(planets[i].pos, this.pos));
                //if(this.m < 100) console.log(force);
                this.acc.add(force);
            }
        }

        this.acc.mult(dt);

        this.vel.add(this.acc);

        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;

        this.posRecord.push(this.pos.copy());
        if(this.posRecord.length > this.trailSize)
        {
            this.posRecord.shift();
        }
    }

    this.show = function()
    {
        fill(this.color);
        ellipse(this.pos.x / AUR, this.pos.y / AUR, r);
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
                if(i < planets[pfindex].posRecord.length)
                    curveVertex(((this.posRecord[i].x - planets[pfindex].posRecord[i].x) * sf + width / 2) / AUR, ((this.posRecord[i].y - planets[pfindex].posRecord[i].y) * sf + height / 2) / AUR);
            }
            endShape();
            stroke(255);
        }
    }
}

function UI()
{
    this.slider_dt = createSlider(0, 10, 1);
    this.slider_dt.position(width / 2 + SIZE_X / 2 - 100, height / 2 - SIZE_Y / 2 + 100);
    this.slider_dt.style('width', '80px');

    this.slider_p = createSlider(0, planets.length - 1, 0);
    this.slider_p.position(width / 2 + SIZE_X / 2 - 100, height / 2 - SIZE_Y / 2 + 120);
    this.slider_p.style('width', '80px');

    this.show = function()
    {
        textSize(12);
        fill(255);
        text('Simulation speed', width / 2 + SIZE_X / 2 - 210, height / 2 - SIZE_Y / 2 + 103);
        if(pfindex >= 0)
            text('Perspective: ' + planets[pfindex].name, width / 2 + SIZE_X / 2 - 270, height / 2 - SIZE_Y / 2 + 123);
        else
            text('Perspective: FreeCam', width / 2 + SIZE_X / 2 - 270, height / 2 - SIZE_Y / 2 + 123);
    }

    this.update = function()
    {
        dt = this.slider_dt.value();
        pfindex = this.slider_p.value();
    }
}

function calculateCM()
{
    let cm_x = 0;
    let cm_y = 0;
    let tMass = 0;
    for(let i = 0; i < planets.length; i++)
    {
        cm_x += planets[i].pos.x * planets[i].m;
        cm_y += planets[i].pos.y * planets[i].m;
        tMass += planets[i].m;
    }
    cm_x /= tMass;
    cm_y /= tMass;
    return createVector(cm_x, cm_y);
}

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;

    createCanvas(SIZE_X, SIZE_Y);
    //fullscreen(true);
    strokeWeight(0.5);
    
    planets.push(new Body("Star", 0, 0, 0, 0, SunMass, 20, color(255, 255, 0)));
    planets.push(new Body("BluePlannet", 40, 0, 0, 1.7, EarthMass, 5, color(0, 100, 255)));
    planets.push(new Body("OrangePlannet", 300, 0, 0, 2, SaturnMass, 10, color(200, 100, 0)));
    planets.push(new Body("RedPlannet", 0, -400, 3, 1, SaturnMass, 10, color(200, 0, 0)));
    planets.push(new Body("GreenPlannet", 500, -500, 2, 1, SaturnMass * 100, 10, color(0, 255, 0)));

    ui = new UI();
}


function draw()
{
    if(place)
    {
        planets.push(new Body("AutoPlanet_" + pcounter.toString(), drop_x - width / 2, drop_y - height / 2, drop_vx * 0.02, drop_vy * 0.02, SaturnMass, 10, color(random(100, 255), random(100, 255), random(100, 255))));
        ui = new UI();
        place = false;
    }

    background(0);
    
    push();
    for(let i = 0; i < planets.length; i++)
    {
        planets[i].drawTrail = true;
    }

    if(pfixed)
    {
        translate(-planets[pfindex].pos.x * sf + width / 2, -planets[pfindex].pos.y * sf + height / 2);
        planets[pfindex].drawTrail = false;
    }
    scale(sf);

    for(let i = 0; i < planets.length; i++)
    {
        planets[i].update();
    }
    for(let i = 0; i < planets.length; i++)
    {
        planets[i].show();
    }
    pop();

    push();
    if(1 / sf > 3)
    {
        strokeWeight((1 / sf) * 0.5);
    }
    
    for(let i = 0; i < planets.length; i++)
    {
        planets[i].showTrail();
    }

    // Drop plannets
    if(mouseIsPressed && released && ctrl_mod)
    {
        drop_x = mouseX;
        drop_y = mouseY;
        released = false;
    }
    if(!released && ctrl_mod)
    {
        drop_vx = mouseX - drop_x;
        drop_vy = mouseY - drop_y;
        line(drop_x, drop_y, mouseX, mouseY);
    }

    pop();

    ui.show();
    ui.update();

    // let cm = calculateCM();
    // fill(0, 255, 0, 50);
    // ellipse(cm.x, cm.y, 20);
}

function mouseReleased() 
{
    if(!released && ctrl_mod)
    {
        pcounter++;
        place = true;
        released = true;
        console.log(drop_y, drop_y, drop_vx, drop_vy);
    }
}

function keyPressed()
{
    if (keyCode === CONTROL) 
    {
        ctrl_mod = true;
    }
}

function keyReleased()
{
    if (keyCode === CONTROL) 
    {
        ctrl_mod = false;
        released = true;
    }
}

window.addEventListener("wheel", function(e) {
    if (e.deltaY > 0)
      sf *= 1.05;
    else
      sf *= 0.95;
  });