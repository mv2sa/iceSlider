var slider1, slider2;

$(document).ready(function() {
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

	slider2 = new iceSlider.hammerSlider({
		/* obrigatory */
		wrapper : '#slider2Wrapper',
		container : '#slider2Container', 
		item : '.slider2Item', 
		/* optionals */
		itemSize : 85,
		desktop : false,
		centerItem : true
	});
	slider2.init();

	$('.dropCode').click(function(event) {
		/* Act on the event */
		event.preventDefault();
		var link = '#' + $(this).attr('ref');

		if($(link).hasClass('open')) {
			$(this).removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
			$(link).removeClass('open');
		} else {
			$(this).removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
			$(link).addClass('open');
		}
		
	});
});