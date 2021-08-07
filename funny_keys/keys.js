/*
This is a p5js sketch that uses the WebMIDI.js library to receive MIDI messages
*/

//background color variable
let bgColor;
const SIZE_X = 1000;

//text to be displayed
let displayText;

function NoteQueue()
{
    this.frame = 0;
    this.notes = {};
    this.push = function(id)
    {
        if(id in this.notes)
        {
            let d = { on: 0, startFrame: this.frame, col: color(map(id, 21, 108, 0, 255), 255, 255) };
            this.notes[id].push(d);
        }
        else
        {
            this.notes[id] = [];
            let d = { on: 0, startFrame: this.frame, col: color(map(id, 21, 108, 0, 255), 255, 255) };
            this.notes[id].push(d);
        }
    }
    
    this.pop = function(id)
    {
        if(id in this.notes)
        {
            for(let iv = 0; iv < this.notes[id].length; iv++)
            {
                if( this.notes[id][iv].on === 0)
                {
                    this.notes[id][iv].on = 1;
                    this.notes[id][iv].endFrame = this.frame;
                    this.notes[id][iv].counter = 0;
                    break;
                }
            }
        }
    }

    this.draw = function()
    {
        noStroke();
        fill(255);

        for(var k in this.notes)
        {
            for(let iv = 0; iv < this.notes[k].length; iv++)
            {
                fill(this.notes[k][iv].col);
                if(this.notes[k][iv].on === 0)
                {
                    for(let i = 0; i < this.frame - this.notes[k][iv].startFrame; i++)
                    {
                        rect(k * 10, 10 * i, 10, 10);
                    }
                }
                else if(this.notes[k][iv].on === 1)
                {
                    if(this.notes[k][iv].counter > 700)
                    {
                        this.notes[k][iv].on = 2; // Dispose
                    }

                    for(let i = 0; i < this.notes[k][iv].endFrame - this.notes[k][iv].startFrame; i++)
                    {
                        rect(k * 10, 10 * (i + this.notes[k][iv].counter), 10, 10);
                    }

                    this.notes[k][iv].counter++;
                }
                else
                {
                    this.notes[k].shift();
                }
            }
        }
        this.frame++;

        for(let i = 0; i < 88; i++)
        {
            stroke(0);
            fill(color(map(i + 21, 21, 108, 0, 255), 255, 255));
            rect((i+21) * 10, 0, 10, 10);
        }
    }
}

let nq;

function setup() 
{
    nq = new NoteQueue();
    //400 by 400 pixel canvas
    createCanvas(SIZE_X, 700);
    colorMode(HSB);

    WebMidi.enable(function (err) { //check if WebMidi.js is enabled
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
        }

        //Choose an input port
        inputSoftware = WebMidi.inputs[0];

        inputSoftware.addListener('noteon', "all", function (e) {
            nq.push(e.note.number);
        });

        inputSoftware.addListener('noteoff', "all", function (e) {
            nq.pop(e.note.number);
        });
	});
}

function draw() { 
    //Draw background with background color variable
    //Will change every time there is a note on
    //background(bgColor);
    background(0);
    nq.draw();
}