// Each button sets a few values to determine the shape of the cross-section and the spiral.

let buttons = [];

function makeHTML() {
	button0 = createButton('Clam');
	button0.style('width', '100px');
	button0.style('background-color', 'rgba(255,255,255,0.1)');
	button0.style('color', 'white');
	button0.position(10, 10);
	button0.mousePressed(drawClam);
	button1 = createButton('Nautilus');
	button1.position(10, 40);
	button1.mousePressed(drawNautilus);
	button2 = createButton('Olive');
	button2.position(10, 70);
	button2.mousePressed(drawOlive);
	button3 = createButton('Periwinkle');
	button3.position(10, 100);
	button3.mousePressed(drawPeriwinkle);
	button4 = createButton('Turritella');
	button4.position(10, 130);
	button4.mousePressed(drawTurritella);
	button5 = createButton('Whelk');
	button5.position(10, 160);
	button5.mousePressed(drawWhelk);
	buttons = [button0, button1, button2, button3, button4, button5];
	for (let b of buttons) {
		b.style('width', '100px');
		b.style('background-color', 'rgba(255,255,255,0.1)');
		b.style('color', 'white');
	}
}

function drawNautilus() {
	highlightButton(button1);
	restoreTilt();
	frameCount = 0;
	sections = 600;
	swidth = 40
	sheight = 40;
	cutx = -200;
	cuty = 0;
	cutw = 100;
	cuth = 150;
	orbits = 6;
	tilt = 0;
	bend = -PI / 9;
	xstretch = 1;
	ystretch = 0;
	ovel = 1;
	section = makeSection();
}

function drawClam() {
	highlightButton(button0);
	restoreTilt();
	frameCount = 0;
	sections = 300;
	swidth = 70
	sheight = 100;
	cutx = -500;
	cuty = -500;
	cutw = 100;
	cuth = 150;
	orbits = 8;
	tilt = 0
	bend = PI / 12;
	xstretch = 0.8;
	ystretch = 0.4;
	ovel = 0.12;
	section = makeSection();
}



function drawOlive() {
	highlightButton(button2);
	restoreTilt();
	frameCount = 0;
	sections = 600;
	swidth = 30
	sheight = 120;
	cutx = 0;
	cuty = 90;
	cutw = 100;
	cuth = 150;
	orbits = 8;
	tilt = PI / 18;
	bend = 0;
	xstretch = 0.35;
	ystretch = 0.92;
	ovel = 1;
	section = makeSection();
}

function drawPeriwinkle() {
	highlightButton(button3);
	restoreTilt();
	frameCount = 0;
	sections = 600;
	swidth = 50
	sheight = 55;
	cutx = -200;
	cuty = 0;
	cutw = 100;
	cuth = 150;
	orbits = 6;
	tilt = PI / 3;
	bend = 0;
	xstretch = 0.75;
	ystretch = 0.5;
	ovel = 1;
	section = makeSection();
}

function drawTurritella() {
	highlightButton(button4);
	restoreTilt();
	frameCount = 0;
	sections = 600;
	swidth = 20
	sheight = 25;
	cutx = -200;
	cuty = 0;
	cutw = 100;
	cuth = 150;
	orbits = 16;
	tilt = -PI / 24;
	bend = 0;
	xstretch = 0.3;
	ystretch = 0.9;
	ovel = 3;
	section = makeSection();
}

function drawWhelk() {
	highlightButton(button5);
	restoreTilt();
	frameCount = 0;
	sections = 600;
	swidth = 50
	sheight = 120;
	cutx = 30;
	cuty = 80;
	cutw = 100;
	cuth = 150;
	orbits = 8;
	tilt = PI / 12;
	bend = 0;
	xstretch = 0.55;
	ystretch = 1;
	ovel = 1;
	section = makeSection();
}

function highlightButton(button) {
	for (let b of buttons) {
		b.style('background-color', 'rgba(255,255,255,0.1)');
	}
	button.style('background-color', 'rgba(255,255,255,0.5)');
}