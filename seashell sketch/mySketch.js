// For the #WCCChallenge, theme: "spiral".
// This paper lays out the math here in terms simple enough that I can (just barely) follow along!
// https://www.mat.uc.pt/~picado/conchas/eng/article.pdf
// For each shell, this sketch generates a unique 3D cross-section, then extrudes the cross-section along a helical path.
// Amazingly, such seemingly different shells all result from small variations in the cross-section and spiral path. 

const e = 2.71828;
let sections = 600;
let section;
let lpos, tlpos;
let orbit, torbit;
let swidth, sheight;
let cutx, cuty;
let orbits, ovel;
let xstretch, ystretch, tilt, bend;
let zoom = 1;
let tzoom, ozoom;

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	ozoom = height / 600;
	lpos = createVector(0, 0);
	tlpos = createVector(0, 0);
	orbit = createVector(0, 0);
	torbit = createVector(0, -HALF_PI);
	makeHTML();
	chooseInitial();
	tzoom = ozoom;
}

function draw() {
	tlpos.x = mouseX - width / 2;
	tlpos.y = mouseY - height / 2;
	if (mouseIsPressed && mouseX > 150) {
		torbit.x += movedX / 100;
		torbit.y -= movedY / 200;
	}
	lpos.lerp(tlpos, 0.05);
	orbit.lerp(torbit, 0.1);
	zoom = lerp(zoom, tzoom, 0.1);
	background(0);
	ambientLight(100);
	pointLight(122, 61, 67, 2 * lpos.x, lpos.y / 2, lpos.y);
	// pointLight(160,82,45, 2 * lpos.x, lpos.y / 2, lpos.y);
	// pointLight(50,75,118, 2 * lpos.x, lpos.y / 2, lpos.y);
	noStroke();
	specularMaterial(255);
	drawPreview();
	scale(zoom);
	rotateY(orbit.x);
	rotateX(orbit.y);
	rotateY(4 * PI / 3);
	let a = 0;
	let C = 1
	let y = -200 * ystretch;
	let layers = min(frameCount * 5, sections);
	for (let i = 0; i < layers; i++) {
		let a = map(i, 0, sections, 0, 8 * TAU);
		let r = C * (e ** (a * (1 / tan(PI / 2.13)))); //Natural log magic!
		y += ystretch * r / (sections / orbits);
		push();
		translate(0, ystretch * y, 0);
		rotateY(-ovel * a + HALF_PI);
		rotateZ(tilt);
		translate(xstretch * r, 0, 0);
		rotateY(bend);
		scale(map(r, 0, 120, 0, 1.5));
		rotateY(PI);
		model(section);
		pop();
	}
}

function drawPreview() {
	push();
	translate(-width / 2 + 75, height / 2 - (sheight + 50), 0);
	rotateY(frameCount / 60);
	model(section);
	pop();
}

function keyPressed() {
	if (keyCode == 32) restoreTilt();
}

function restoreTilt() {
	torbit.x = 0;
	torbit.y = -HALF_PI;
	tzoom = ozoom;
	setTimeout(tiltBack, 2500);
}

function mouseWheel(event) {
	tzoom += event.delta / 100;
}

function tiltBack() {
	torbit.y = PI / 12;
}

function chooseInitial() {
	let pick = floor(random(buttons.length));
	switch (pick) {
		case 0:
			drawClam();
			break;
		case 1:
			drawNautilus();
			break;
		case 2:
			drawOlive();
			break;
		case 3:
			drawPeriwinkle();
			break;
		case 4:
			drawTurritella();
			break;
		case 5:
			drawWhelk();
			break;
	}
}