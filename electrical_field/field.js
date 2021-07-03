let SIZE_X;
let SIZE_Y;
let dt = 0.1;

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

function IX(i, j, sz_i)
{
    return i + j * sz_i;
}

function ij_pos(i, j, si, sj)
{
    return createVector(i * si + si / 2, j * sj + sj / 2);
}

function xy_pos(x, y, si, sj, cols, rows)
{
    let ij = createVector((x - si / 2) / si, (y - sj / 2) / sj);

    if(ij.x < 1)
    {
        ij.x = 1;
    }
    else if(ij.x > cols - 2)
    {
        ij.x = cols - 2;
    }

    if(ij.y < 1)
    {
        ij.y = 1;
    }
    else if(ij.y > rows - 2)
    {
        ij.y = rows - 2;
    }

    return ij;
}

function minus_grad(f, cols, rows, dc, dr)
{
    g = new Array(cols * rows);
    for(let i = 1; i < cols - 1; i++)
    {
        for(let j = 1; j < rows - 1; j++)
        {
            let pdel = createVector(
                -(f[IX(i + 1, j, cols)] - f[IX(i, j, cols)]) / dr, // x
                -(f[IX(i, j + 1, cols)] - f[IX(i, j, cols)]) / dc  // y
            );

            let ndel = createVector(
                -(f[IX(i, j, cols)] - f[IX(i - 1, j, cols)]) / dr, // x
                -(f[IX(i, j, cols)] - f[IX(i, j - 1, cols)]) / dc  // y
            );

            g[IX(i, j, cols)] = p5.Vector.add(pdel, ndel);
        }
    }
    return g;
}

function FreeCharge(charge, x, y)
{
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);

    this.update = function(E, si, sj, cols, rows)
    {
        let ij = xy_pos(this.pos.x, this.pos.y, si, sj, cols, rows);

        let i = Math.trunc(ij.x);
        let j = Math.trunc(ij.y);

        this.vel.add(p5.Vector.mult(E[IX(i, j, cols)], dt));
        this.pos.add(p5.Vector.mult(this.vel, dt));

        this.pos.x = constrain(this.pos.x, si * 1.5, SIZE_X - si * 1.5);
        this.pos.y = constrain(this.pos.y, sj * 1.5, SIZE_Y - sj * 1.5);

        if(this.pos.x == si * 1.5 || this.pos.x == SIZE_X - si * 1.5)
        {
            this.vel.x = 0;
        }
        if(this.pos.y == sj * 1.5 || this.pos.y == SIZE_Y - sj * 1.5)
        {
            this.vel.y = 0;
        }
    }

    this.draw = function()
    {
        fill(0, 0, 100, 1);
        ellipse(this.pos.x, this.pos.y, 10, 10);
    }
}

function FSource(charge, x, y)
{
    this.charge = charge;
    this.pos = createVector(x, y);
    this.size = 7;

    this.update = function()
    {
        this.pos.x = mouseX;
        this.pos.y = mouseY;
        this.size = 7 * (gcharge / 20.0);
        this.charge = gcharge;
    }

    this.draw = function()
    {
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }
}

let farray;
let fsources = [];
let fcharge;

function FArray(cols, rows, size)
{
    this.c = cols;
    this.r = rows;
    this.s = size;
    this.sx = SIZE_X / cols;
    this.sy = SIZE_Y / rows;
    this.intensities = new Array(cols * rows);

    this.update = function(fsources)
    {
        this.intensities.fill(0);

        for(let s = 0; s < fsources.length; s++)
        {
            for(let i = 0; i < cols; i++)
            {
                for(let j = 0; j < rows; j++)
                {
                    let dist = p5.Vector.sub(ij_pos(i, j, this.sx, this.sy), fsources[s].pos).mag();
                    let charge = fsources[s].charge;
                    let value = 3E2 * charge / dist;
                    this.intensities[IX(i, j, cols)] += value;
                }
            }
        }
    }

    this.draw = function()
    {
        let E = minus_grad(this.intensities, cols, rows, 1, 1);



        for(let i = 1; i < cols - 1; i++)
        {
            for(let j = 1; j < rows - 1; j++)
            {
                let hue = map(constrain(this.intensities[IX(i, j, cols)], -100, 100), -100, 100, 110, 360);
                let c = color(hue, 100, 100, 1);
                E[IX(i, j, cols)].setMag(constrain(E[IX(i, j, cols)].mag(), 0, 20));
                drawArrow(createVector(i * this.sx + this.sx / 2, j * this.sy + this.sy / 2), E[IX(i, j, cols)], c);
            }
        }

        return E;
    }
}

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);

    colorMode(HSB);

    farray = new FArray(20 * 2, 10 * 2, 10);
    fsources.push(new FSource(20, 100, 100));
    fcharge = null;
}

function draw()
{
    background(51);
    farray.update(fsources);
    let E = farray.draw();

    fill(0, 0, 100);
    for(let i = 0; i < fsources.length; i++)
    {
        fsources[i].draw();
    }

    fsources[fsources.length - 1].update();

    if(fcharge != null)
    {
        fcharge.update(E, farray.sx, farray.sy, 40, 20);
        fcharge.draw();
    }
}

let gcharge = 20;
let lgc = 0;

function mouseReleased() 
{
    fsources.push(new FSource(gcharge, 100, 100));
}

function keyReleased()
{
    if (keyCode === 32) 
    {
        gcharge *= -1;
    }
    else if(keyCode == 65)
    {
        let l = gcharge;
        gcharge = lgc;
        lgc = l;
    }
    else if(keyCode == 70)
    {
        if(fcharge != null)
        {
            fcharge = null;
        }
        else
        {
            fcharge = new FreeCharge(10, mouseX, mouseY);
        }
    }
}

window.addEventListener("wheel", function(e) {
    if (e.deltaY > 0)
        gcharge *= 1.05;
    else
        gcharge *= 0.95;
  });