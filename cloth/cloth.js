let SIZE_X;
let SIZE_Y;
let dt = 18 / 1000.0;
let dt2 = dt * dt;
let damp = 0.03;
let drag = 1 - damp;
let gravity = 9.8 * 100;
let gMCF = 0;
let pick = -1;
let click_wind = 0;

document.addEventListener('contextmenu', event => event.preventDefault());

function IX(i, j, sz_i)
{
    return i + j * sz_i;
}

function Particle(x, y, m)
{
    this.a = createVector(0, 0);
    this.pos = createVector(x, y);
    this.ppos = this.pos;
    this.original = this.pos;
    this.mass = m;

    this.addForce = function(force)
    {
        this.a.add(force);
    }

    // So I found this cool stuff Verlet did...
    this.verletIntegration = function(dt)
    {
        let deltaPos = p5.Vector.sub(this.pos, this.ppos);
        deltaPos.mult(drag).add(this.pos);
        
        let newPos = p5.Vector.add(deltaPos, this.a.mult(dt));

        this.ppos = this.pos;
        this.pos = newPos;

        this.a.mult(0);
    }

    this.lock = function()
    {
        this.pos = this.original;
        this.ppos = this.original;
    }

    this.lockHere = function()
    {
        this.pos = this.ppos;
    }
}

function Cloth(count_x, count_y, pd, pmass, color)
{
    this.particles = [];
    this.cx = count_x;
    this.cy = count_y;
    this.pd = pd;
    this.color = color;
    this.locked = [];

    this.constrains = [];

    this.indexToPos = function(x, y)
    {
        return [x * this.pd, y * this.pd];
    }

    this.setup = function()
    {
        this.particles.length = count_x * count_y;
        for(let x = 0; x < count_x; x++)
        {
            for(let y = 0; y < count_y; y++)
            {
                let pos = this.indexToPos(x, y);
                this.particles[IX(x, y, count_y)] = new Particle(pos[0], pos[1], pmass);
            }
        }

        // Constrains (edge)
        for(let x = 0; x < count_x; x++)
        {
            for(let y = 0; y < count_y; y++)
            {
                if(y < (this.cy - 1) && (x == 0 || x == (this.cx - 1)))
                {
                    this.constrains.push([
                        this.particles[IX(x, y, this.cy)],
                        this.particles[IX(x, y + 1, this.cy)],
                        this.pd
                    ]);
                }

                if(x < (this.cx - 1) && (y == 0 || y == (this.cy - 1)))
                {
                    this.constrains.push([
                        this.particles[IX(x, y, this.cy)],
                        this.particles[IX(x + 1, y, this.cy)],
                        this.pd
                    ]);
                }
            }
        }

        // Constrains (body)
        for(let x = 0; x < count_x - 1; x++)
        {
            for(let y = 0; y < count_y - 1; y++)
            {
                if(x != 0)
                {
                    this.constrains.push([
                        this.particles[IX(x, y, this.cy)],
                        this.particles[IX(x, y + 1, this.cy)],
                        this.pd
                    ]);
                }

                if(y != 0)
                {
                    this.constrains.push([
                        this.particles[IX(x, y, this.cy)],
                        this.particles[IX(x + 1, y, this.cy)],
                        this.pd
                    ]);
                }
            }
        }
    }

    this.convCoord = function(x, y)
    {
        let ix = x - (SIZE_X / 2 - this.pd * this.cx / 2);
        let iy = y;
        return createVector(ix, iy);
    }

    
    this.closest = function(x, y)
    {
        let mpos = this.convCoord(x, y);

        let target = this.particles.length;
        let min = 9999;

        for(let i = 0; i < this.particles.length; i++)
        {
            let p = this.particles[i];

            let dist = p5.Vector.dist(p.pos, mpos);

            if(dist < min)
            {
                min = dist;
                target = i;
            }
        }

        return [target, min];
    }

    this.simulate = function()
    {
        for(let i = 0; i < this.particles.length; i++)
        {
            let particle = this.particles[i];
            particle.addForce(createVector(0, gravity));
            if(click_wind)
                particle.addForce(createVector(500, 0));
            particle.verletIntegration(dt2);
        }

        if(pick != -1)
        {
            this.particles[pick].pos = this.convCoord(mouseX, mouseY);
        }

        this.constrainCloth();
        
        // lock top edge
        // for(let x = 0; x < this.cx; x++)
        // {
        //     this.particles[IX(x, 0, this.cy)].lock();
        // }

        // lock corners
        this.particles[IX(0, 0, this.cy)].lock();
        this.particles[IX(this.cx - 1, 0, this.cy)].lock();

        for(let i = 0; i < this.locked.length; i++)
        {
            this.particles[this.locked[i]].lockHere();
        }
    }

    this.constrainSingle = function(p0, p1, pd)
    {
        let diff = p5.Vector.sub(p1.pos, p0.pos);
        let dst = diff.mag();
        if(dst > 0)
        {
            let halfCorrect = diff.mult(0.5 * (dst - pd) / dst);

            p0.pos.add(halfCorrect);
            p1.pos.sub(halfCorrect);
            return halfCorrect.mag() * 2;
        }

        return 0;
    }

    this.constrainCloth = function()
    {
        let maxCF = 0;
        for(let i = 0; i < this.constrains.length; i++)
        {
            let ct = this.constrains[i];
            let cf = this.constrainSingle(ct[0], ct[1], ct[2]);
            if(cf > maxCF)
            {
                maxCF = cf;
            }
        }
        gMCF = maxCF;
    }

    this.draw = function()
    {
        noFill();
        stroke(this.color);
        smooth();
        push();
        translate(SIZE_X / 2 - this.pd * this.cx / 2, 0);
        
        for(let x = 0; x < this.cx - 1; x++)
        {
            for(let y = 0; y < this.cy - 1; y++)
            {
                let particleTL = this.particles[IX(x, y, this.cy)];
                let particleTR = this.particles[IX(x + 1, y, this.cy)];
                let particleBL = this.particles[IX(x, y + 1, this.cy)];
                let particleBR = this.particles[IX(x + 1, y + 1, this.cy)];
                beginShape(QUADS);
                vertex(particleTL.pos.x, particleTL.pos.y);
                vertex(particleTR.pos.x, particleTR.pos.y);
                vertex(particleBR.pos.x, particleBR.pos.y);
                vertex(particleBL.pos.x, particleBL.pos.y);
                endShape();
            }
        }
        pop();

        noStroke();
        fill(255);
        text('Max Stress (arbitratry) = ' + int(gMCF), width / 2 + SIZE_X / 2 - 300, height / 2 - SIZE_Y / 2 + 103);
    }
}

let cloth;

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);

    cloth = new Cloth(20, 20, 20, 10, 'aqua');
    cloth.setup();
}

function draw()
{
    background(51);
    cloth.simulate();
    cloth.draw();
}

function mousePressed() 
{
    let arr = cloth.closest(mouseX, mouseY);
    //click_wind = 1;

    if(arr[1] < 25)
    {
        pick = arr[0];
    }
    else
    {
        pick = -1;
    }
}

function mouseReleased()
{
    click_wind = 0;
    if(pick != -1 && mouseButton === RIGHT)
        cloth.locked.push(pick);
    pick = -1;
}
