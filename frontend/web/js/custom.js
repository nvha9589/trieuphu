
$(window).load(function() { // makes sure the whole site is loaded

	"use strict";



//------------------------------------------------------------------------
//						PRELOADER SCRIPT
//------------------------------------------------------------------------   
    $('#preloader').delay(400).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('#preloader .inner').fadeOut(); // will first fade out the loading animation



//------------------------------------------------------------------------
//						WOW ANIMATION SETTINGS
//------------------------------------------------------------------------ 	
	var wow = new WOW({
    	offset:100,        // distance to the element when triggering the animation (default is 0)
    	mobile:false,       // trigger animations on mobile devices (default is true)
		live:true
  	});
	wow.init();


	
//------------------------------------------------------------------------
//						STELLAR (PARALLAX) SETTINGS
//------------------------------------------------------------------------ 	




//------------------------------------------------------------------------
//						NAVBAR SLIDE SCRIPT
//------------------------------------------------------------------------ 		
	$(window).scroll(function () {
        if ($(window).scrollTop() > $("nav").height()) {
            $("nav.navbar-slide").addClass("show-menu");
        } else {
            $("nav.navbar-slide").removeClass("show-menu");
			$(".navbar-slide .navMenuCollapse").collapse({toggle: false});
			$(".navbar-slide .navMenuCollapse").collapse("hide");
			$(".navbar-slide .navbar-toggle").addClass("collapsed");
        }
    });
	
//------------------------------------------------------------------------
//						NAVBAR HIDE ON CLICK (COLLAPSED) SCRIPT
//------------------------------------------------------------------------ 		
    $('.nav a').on('click', function(){ 
        if($('.navbar-toggle').css('display') !='none'){
            $(".navbar-toggle").click()
        }
    });
	
})




$(document).ready(function(){
	
	"use strict";


	
//------------------------------------------------------------------------
//						ANCHOR SMOOTHSCROLL SETTINGS
//------------------------------------------------------------------------

	



//------------------------------------------------------------------------
//						FULL HEIGHT SECTION SCRIPT
//------------------------------------------------------------------------
	$("#minimal-intro").css("min-height",$( window ).height());
	$( window ).resize(function() {
		$("#minimal-intro").css("min-height",$( window ).height());
	})

	
});