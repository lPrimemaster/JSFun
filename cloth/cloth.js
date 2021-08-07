let SIZE_X;
let SIZE_Y;
let dt = 0.001;

// This is all completely broken. Nice =]

function IX(i, j, sz_i)
{
    return i + j * sz_i;
}

function hookForce(p0, p1, k, m, pd)
{
    let v = p5.Vector.sub(p1, p0);
    let nd = p5.Vector.mult(p5.Vector.normalize(v), pd);
    v.sub(nd);
    return v.mult(k / m);
}

function Cloth(count_x, count_y, pd)
{
    this.particles = [];
    this.particles_v = [];
    this.pd = pd;
    this.cx = count_x;
    this.cy = count_y;

    this.setup = function()
    {
        this.particles.length = count_x * count_y;
        this.particles_v.length = count_x * count_y;

        for(let x = 1; x <= count_x; x++)
        {
            for(let y = 1; y <= count_y; y++)
            {
                this.particles[IX(x - 1, y - 1, count_y)] = createVector(x * this.pd, y * this.pd);
                this.particles_v[IX(x - 1, y - 1, count_y)] = createVector(0, 0);
                //console.log(this.particles[IX(x, y, count_y)], x, y, this.pd);
            }
        }
    }

    this.simulate = function()
    {
        for(let x = 0; x < this.cx; x++)
        {
            for(let y = 0; y < this.cy; y++)
            {
                if((x == 0 && y == 0) || (x == this.cx - 1 && y == 0))
                    continue;

                let self = this.particles[IX(x, y, count_y)];

                let nx_l;
                if(x != 0)
                    nx_l = this.particles[IX(x - 1, y, count_y)];
                else
                    nx_l = undefined;

                let nx_r;
                if(x != this.cx - 1)
                    nx_r = this.particles[IX(x + 1, y, count_y)];
                else
                    nx_r = undefined;

                let ny_b;
                if(y != this.cy - 1)
                    ny_b = this.particles[IX(x, y + 1, count_y)];
                else
                    ny_b = undefined;

                let ny_t;
                if(y != 0)
                    ny_t = this.particles[IX(x, y - 1, count_y)];
                else
                    ny_t = undefined;
                
                let f = createVector(0, 2);

                let k = 3000;

                if(nx_l !== undefined) f.add(hookForce(self, nx_l, k, 10, this.pd));
                if(nx_r !== undefined) f.add(hookForce(self, nx_r, k, 10, this.pd));
                if(ny_b !== undefined) f.add(hookForce(self, ny_b, k, 10, this.pd));
                if(ny_t !== undefined) f.add(hookForce(self, ny_t, k, 10, this.pd));

                //if(x == 3 && y == 3) console.log(f);s

                this.particles_v[IX(x, y, count_y)].x += f.x * dt;
                this.particles_v[IX(x, y, count_y)].y += f.y * dt;

                let tpv = this.particles_v[IX(x, y, count_y)];

                this.particles[IX(x, y, count_y)].x += tpv.x * dt;
                this.particles[IX(x, y, count_y)].y += tpv.y * dt;
            }
        }
    }

    this.draw = function()
    {
        push();
        translate(SIZE_X / 2 - this.pd * this.cx / 2, 0);
        for(let i = 0; i < this.particles.length; i++)
        {
            let particle = this.particles[i];
            ellipse(particle.x, particle.y, 5, 5);
        }
        pop();
    }
}

let cloth;

function setup()
{
    SIZE_X = windowWidth - 20;
    SIZE_Y = windowHeight - 20;
    createCanvas(SIZE_X, SIZE_Y);

    cloth = new Cloth(20, 20, 20);
    cloth.setup();
}

function draw()
{
    background(51);
    cloth.simulate();
    cloth.draw();
}
