let g = 1;
let dt = 0.1;

let offx, offy;

let prev_x = -1;
let prev_y = -1;

let maxPathLength = 300;


function DoublePendulum(length1, length2, mass1, mass2, angle1, angle2, color_val){
    
    this.l1 = length1;
    this.l2 = length2;
    this.m1 = mass1;
    this.m2 = mass2;
    this.a1 = angle1;
    this.a2 = angle2;

    this.w1 = 0;
    this.w2 = 0;

    this.x1 = length1 * sin(angle1);
    this.y1 = length1 * cos(angle1);

    this.x2 = this.x1 + length2 * sin(angle2);
    this.y2 = this.y1 + length2 * cos(angle2);

    this.pointsx = [];
    this.pointsy = [];

    this.color_val = color_val;

    this.draw = function(){

        stroke(200)

        line(0, 0, this.x1, this.y1);
        fill(200);
        stroke(0);
        ellipse(this.x1, this.y1, 10, 10);

        stroke(200);
        line(this.x1, this.y1, this.x2, this.y2);
        stroke(0);
        fill(this.color_val);
        ellipse(this.x2, this.y2, 10, 10);

        for(let i=0; i<this.pointsx.length-1; i++){
            let px1 = this.pointsx[i];
            let px2 = this.pointsx[i+1];
            let py1 = this.pointsy[i];
            let py2 = this.pointsy[i+1];
    
            let alpha = 0.5*i/this.pointsx.length;
    
            stroke(this.color_val);
            strokeWeight(alpha)
            line(px1, py1, px2, py2);
        }
    }

    this.accCalc = function(){

        let num1 = -g * (2 * this.m1 + this.m2) * sin(this.a1);
        let num2 = -this.m2 * g * sin(this.a1 - 2 * this.a2);
        let num3 = -2 * sin(this.a1 - this.a2) * this.m2;
        let num4 = this.w2 * this.w2 * this.l2 + this.w1 * this.w1 * this.l1 * cos(this.a1 - this.a2);
        let den = this.l1 * (2 * this.m1 + this.m2 - this.m2 * cos(2 * this.a1 - 2 * this.a2));
        let alpha1 = (num1 + num2 + num3 * num4) / den;

        num1 = 2 * sin(this.a1 - this.a2);
        num2 = this.w1 * this.w1 * this.l1 * (this.m1 + this.m2);
        num3 = g * (this.m1 + this.m2) * cos(this.a1);
        num4 = this.w2 * this.w2 * this.l2 * this.m2 * cos(this.a1 - this.a2);
        den = this.l2 * (2 * this.m1 + this.m2 - this.m2 * cos(2 * this.a1 - 2 * this.a2));
        let alpha2 = (num1 * (num2 + num3 + num4)) / den;

        return [alpha1, alpha2];
    }

    this.update = function(){

        this.pointsx.push(this.x2);
        this.pointsy.push(this.y2);

        let acc = this.accCalc();

        this.w1 += acc[0] * dt;
        this.w2 += acc[1] * dt;
        this.a1 += this.w1 * dt;
        this.a2 += this.w2 * dt;

        this.x1 = this.l1 * sin(this.a1);
        this.y1 = this.l1 * cos(this.a1);

        this.x2 = this.x1 + this.l2 * sin(this.a2);
        this.y2 = this.y1 + this.l2 * cos(this.a2);
        
        if(this.pointsx.length > maxPathLength){
            this.pointsx.shift();
            this.pointsy.shift();
        }
    }

}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

let num_pend = 3;
let pendulum = [];
let p;
let angle1_0 = Math.PI/2;
let angle2_0 = Math.PI/2;
let start_angle_diff = 1/1000;


function up_all(){
    for(let i=0; i<pendulum.length; i++){
        pendulum[i].update();
    }
}

function restart(){

    for(let i=0; i<pendulum.length; i++){
        pendulum[i] = new DoublePendulum(pendulum[i].l1, pendulum[i].l2, pendulum[i].m1, pendulum[i].m2, angle1_0, angle2_0 + i*angle2_0*start_angle_diff, getRandomColor());
    }
}

function setup(){

    createCanvas(windowWidth - 20, windowHeight - 20);

    offx = width/2;
    offy = height/3;

    for(i=0; i<num_pend; i++){
        p = new DoublePendulum(150, 150, 10, 10, angle1_0, angle2_0 + i*angle2_0*start_angle_diff, getRandomColor());
        pendulum.push(p)
    }
    
    setInterval(up_all, 1);
}

function draw(){

    background(0);
    translate(offx, offy);

    fill(225)
    stroke(0)
    ellipse(0,0,20)

    fill(0)
    ellipse(0,0,15)

    for(i=0; i<pendulum.length; i++){
        pendulum[i].draw();
    }
    
}
