var slider1;

slider1 = new iceSlider.hammerSlider({
	/* obrigatory */
	wrapper : '#slider1Wrapper',
	container : '#slider1Container', 
	item : '.slider1Item', 
	/* optionals */
	itemActiveClass : 'active',
	leftArrow : '#slider1ArrowL',
	rightArrow : '#slider1ArrowR',
	arrowInactiveClass : 'inactive',
	dots : '#slider1Dots',
	dotActiveClass : 'slider1-currentDot',
	autoSlide : true,
	setTime : 5000
});
slider1.init();
