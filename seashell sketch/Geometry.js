// This function creates the cross section, starting with an ellipsoid and then slicing different
// segments from it, using the subtract() function in the CSG library. 
// (A preview of the cross-section appears in the lower-left corner of the screen.)

function makeSection() {
	let BooleanOptions = {
		includeSelfFaces: true,
		includeOtherFaces: false
	};
	fill(255, 50);
	noStroke();
	let section = csg(() => ellipsoid(swidth, sheight, swidth,36,36))
		.subtract(() => {
			push();
			translate(cutx, -120 - cuty, 0);
			rotateZ(QUARTER_PI);
			ellipsoid(cutw, cuth, 100);
			pop();
		})
		.subtract(() => {
			push();
			translate(0, 0, -55);
			rotateY(-PI / 24);
			box(400, 400, 100);
			pop();
		}, BooleanOptions)
		.subtract(() => {
			push();
			translate(0, 0, 55);
			box(400, 400, 100);
			pop();
		}, BooleanOptions)
		.done()
	return section;
}