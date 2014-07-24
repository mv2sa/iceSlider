/*
Ice Slider v1.14
*/
'use strict';
var iceSlider = {
	pageWidth : window.innerWidth || document.documentElement.clientWidth,
	initialized : false,
	init : function() {
		iceSlider.initialized = true;

			$(window).resize(function(){
				iceSlider.pageWidth = window.innerWidth || document.documentElement.clientWidth;
			});

	},
	hammerSlider : function(obj) {
	    var self = this, hammerHolder;
	    this.dots = typeof obj.dots !== 'undefined' ? obj.dots : false;
	    this.dotActiveClass = typeof obj.dotActiveClass !== 'undefined' ? obj.dotActiveClass : 'hammer-currentDot';
	    this.oneItemDotHide = typeof obj.oneItemDotHide !== 'undefined' ? obj.oneItemDotHide : true;
	    this.wrapper = typeof obj.wrapper !== 'undefined' ? obj.wrapper : false;
	    this.container = typeof obj.container !== 'undefined' ? obj.container : false;
	    this.item = typeof obj.item !== 'undefined' ? obj.item : false;
	    this.itemSize = typeof obj.itemSize !== 'undefined' ? obj.itemSize : 100;
	    this.centerItem = typeof obj.centerItem !== 'undefined' ? obj.centerItem : false;
	    this.itemActiveClass = typeof obj.itemActiveClass !== 'undefined' ? obj.itemActiveClass : 'hammer-currentItem';
	    this.desktop = typeof obj.desktop !== 'undefined' ? obj.desktop : true;
	    this.touchEvents = typeof obj.touchEvents !== 'undefined' ? obj.touchEvents : true;
	    this.leftArrow = typeof obj.leftArrow !== 'undefined' ? obj.leftArrow : false;
	    this.rightArrow = typeof obj.rightArrow !== 'undefined' ? obj.rightArrow : false;
	    this.arrowInactiveClass = typeof obj.arrowInactiveClass !== 'undefined' ? obj.arrowInactiveClass : 'hammer-arrowInactive';
	    this.autoSlide = typeof obj.autoSlide !== 'undefined' ? obj.autoSlide : false;
	    this.autoSlideInterruption = typeof obj.autoSlideInterruption !== 'undefined' ? obj.autoSlideInterruption : true;
	    this.setTime = typeof obj.setTime !== 'undefined' ? obj.setTime : '8000';
	    this.animation = typeof obj.animation !== 'undefined' ? obj.animation : 'auto';
	    this.animationClass = typeof obj.animationClass !== 'undefined' ? obj.animationClass : 'hammer-animate';
	    this.debug = typeof obj.debug !== 'undefined' ? obj.debug : false;
		this.onInitCallback = typeof obj.onInitCallback !== 'undefined' ? obj.onInitCallback : false;
		this.onUpdateCallback = typeof obj.onUpdateCallback !== 'undefined' ? obj.onUpdateCallback : false;
		this.onResizeCallback = typeof obj.onResizeCallback !== 'undefined' ? obj.onResizeCallback : false;
		this.internal = {
			itemQuery : null,
			containerQuery : null,
			wrapperQuery :  null,
			wrapperPxSize :  0,
			itemWidth : 0,
			itemWidthPercent : 0,
			itemPxWidth : 0,
			itemCount : 0,
			swipped : false,
			currentItem : 0,
			autoRun : null,
			isDesktop : null,
			updateInQueue : false,
			mouseover : false
		};
		if(iceSlider.initialized === false) {
			iceSlider.init();
		}
		this.init = function() {
			if(self.wrapper === false || self.container === false) {
				this.error(1);
			} else if (self.wrapper.substring(0 , 1) === '.' || self.container.substring(0 , 1) === '.') {
				this.error(2);
			} else {
				self.internal.itemQuery =  $("> " + self.item, self.wrapper + ' ' + self.container);
				self.internal.itemCount =  self.internal.itemQuery.length;
				self.internal.wrapperQuery = $(self.wrapper);
				self.internal.containerQuery = $(self.wrapper + ' ' + self.container);
				self.internal.wrapperQuery.addClass('hammer-set');
				self.internal.wrapperPxSize = self.internal.wrapperQuery.width();
				self.internal.itemQuery.first().addClass(self.itemActiveClass);
			    if(Modernizr.csstransitions === false) {
					self.animation = 'js';
				}
				if(self.dots) {
		    		if (self.dots.substring(0 , 1) === '.') {
		    			self.error(3);
	    			} else {
	    				if (self.internal.itemCount === 1 && self.oneItemDotHide === true) {
	    					$(self.dots).css('visibility', 'hidden');
	    				}
	    				self.addDots();
	   					$(self.dots).on('click', 'a', function(event) {
				        	event.preventDefault();
				        	var index = $(this).attr('index');
				        	self.internal.swipped = true;
				        	self.showPane(index-1);
				        });
	    			}
	    		}
	    		if(!self.desktop && iceSlider.pageWidth >= 768) {
					self.internal.isDesktop = true;
	    		} else if(!self.desktop && iceSlider.pageWidth < 768) {
					self.internal.isDesktop = false;
					self.widthController();
	    		} else {
	    			self.widthController();
	    		}
	    		$(window).on("load resize orientationchange", function() {
	    			if(self.internal.updateInQueue && (!self.desktop && iceSlider.pageWidth < 768)) {
	    				self.internal.updateInQueue = false;
	    				self.update();
	    			} else {
	    				self.widthController();
	    			}
				});
				if(self.autoSlide) {
					self.internal.autoRun = setInterval(function(){
						self.rotate();
					},self.setTime);
					self.internal.wrapperQuery.mouseover(function() {
				    	clearInterval(self.internal.autoRun); 
					}).mouseout(function() {
						clearInterval(self.internal.autoRun); 
						self.internal.autoRun = setInterval(function(){self.rotate()},self.setTime);
					});
				}
				if(self.leftArrow) {
					$(self.leftArrow).addClass(self.arrowInactiveClass);
					$(self.leftArrow).click(function(event) {
			        	event.preventDefault();
			        	self.internal.swipped = true;
			        	self.prev();
			        });
				} 
				if (self.rightArrow) {
				    if(self.internal.currentItem+1 === self.internal.itemCount) {
    					$(self.rightArrow).addClass(self.arrowInactiveClass)
    				}
					$(self.rightArrow).click(function(event) {
			        	event.preventDefault();
			        	self.internal.swipped = true;
			        	self.next();
			        });	        			
				}
				if (self.desktop || (!self.desktop && iceSlider.pageWidth < 768)) {
					self.showPane(0, true);
				}
				self.hammerHolder = Hammer(self.internal.wrapperQuery, {
					drag_lock_to_axis: true
				}).on('release dragleft dragright swipeleft swiperight', self.handleHammer);
				if (self.onInitCallback) {
					self.onInitCallback();
				}
			}
		};
		this.handleHammer = function(ev) {
			if(ev.type !== 'release') {
				ev.gesture.preventDefault();
			}
			if(((!self.desktop && iceSlider.pageWidth < 768) || self.desktop) && self.touchEvents) {
				self.internal.wrapperQuery.scrollLeft(0);
				switch(ev.type) {
		            case 'dragright':
		            case 'dragleft':
		            	var gestureX, pane_offset, drag_offset;
		            	self.internal.swipped = true;
				         // stick to the finger
				        gestureX = ev.gesture.deltaX;
	                    pane_offset = -(100/self.internal.itemCount)*self.internal.currentItem;
	                    drag_offset = ((100/self.internal.itemPxWidth)*gestureX) / self.internal.itemCount;
	                    // slow down at the first and last pane
	                    if((self.internal.currentItem === 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
	                        (self.internal.currentItem === self.internal.itemCount-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
	                        drag_offset *= .3;
	                    }
	                    self.setContainerOffset(drag_offset + pane_offset, false);
		            break;
		            case 'swipeleft':
						self.internal.swipped = true;
						self.next();
		                ev.gesture.stopDetect();
		            break;
		            case 'swiperight':
						self.internal.swipped = true;
						self.prev();
		                ev.gesture.stopDetect();
		            break;

		            case 'release':
		                // more then 50% moved, navigate
		                self.internal.swipped = true;
		                if(Math.abs(ev.gesture.deltaX) > self.internal.itemPxWidth/2) {
		                	switch(ev.gesture.direction) {
		                		case 'right' :
		                			if(self.internal.currentItem !== 0) {
		                				self.prev();
		                			} else {
		                				self.showPane(self.internal.currentItem);
		                			}
		                		break;
		                		case 'left' :
									if(self.internal.currentItem !== self.internal.itemCount-1) {
				                        self.next();
				                    } else {
				                    	self.showPane(self.internal.currentItem);
				                    }
				                break;
		                	}
		                } else {
		                    self.showPane(self.internal.currentItem);
		                }
		            break;
		        }
	    	}
		};
		this.next = function() { 
			return self.showPane(self.internal.currentItem+1); 
		};
		this.prev = function() { 
			return self.showPane(self.internal.currentItem-1); 
		};
		this.showPane = function(index, updating) {
	        // between the bounds
	        var offset;
	        index = Math.max(0, Math.min(index, self.internal.itemCount-1));
	        self.internal.currentItem = index;
	        self.internal.itemQuery.removeClass(self.itemActiveClass);
	        self.internal.containerQuery.children(self.item + ':nth-child(' + (self.internal.currentItem+1) + ')').addClass(self.itemActiveClass);
	        if(self.dots) {
	        	$(self.dots + ' a').removeClass(self.dotActiveClass);
	        	$(self.dots + ' a:nth-child(' + (self.internal.currentItem+1) + ')').addClass(self.dotActiveClass);
	        }

	        if(self.leftArrow && self.internal.currentItem === 0) {
	        	$(self.leftArrow).addClass(self.arrowInactiveClass);
	        } else if (self.leftArrow) {
	        	$(self.leftArrow).removeClass(self.arrowInactiveClass);
	        }

	        if (self.rightArrow && self.internal.currentItem === self.internal.itemCount-1) {
	        	$(self.rightArrow).addClass(self.arrowInactiveClass);
	        } else if (self.rightArrow) {
	        	$(self.rightArrow).removeClass(self.arrowInactiveClass);
	        }
	        offset = -((100/self.internal.itemCount)*self.internal.currentItem);
	        if(self.itemSize < 100 && !self.centerItem) {
		        if (self.internal.currentItem === self.internal.itemCount-1) {
		        	offset = offset + ((((100-self.itemSize)/(2-(((100-self.itemSize)/100)*2)))/self.internal.itemCount)*2);
		        } else if(self.internal.currentItem > 0) {
		        	offset = offset + (((100-self.itemSize)/(2-(((100-self.itemSize)/100)*2)))/self.internal.itemCount);
		        }
	    	} else if (self.itemSize < 100 && self.centerItem) {
		        offset = offset + (((100-self.itemSize)/(2-(((100-self.itemSize)/100)*2)))/self.internal.itemCount);
	    	}
	    	if(updating === undefined) {
	    		self.setContainerOffset(offset, true);
	    	} else {
	    		self.setContainerOffset(offset, false);
	    	}
	        
	    };
	    this.rotate = function() {
	    	if(self.internal.swipped === false || (self.internal.swipped === true && self.autoSlideInterruption === false)) {
		    	if(self.internal.currentItem+1 !== self.internal.itemCount) {
		    		self.showPane(self.internal.currentItem+1);
		    	} else {
		    		self.showPane(0);
		    	}	    		
	    	}    	
	    };
	    this.widthController = function() {
		    if((!self.desktop && iceSlider.pageWidth >= 768) && self.internal.isDesktop === false) {
				self.internal.isDesktop = true;
				if(self.autoSlide) {
					clearInterval(self.internal.autoRun);
				}
				self.setContainerOffset(0, false);
				self.internal.itemQuery.each(function() {
	            	$(this).attr('style', '');
	        	});
	        	self.internal.containerQuery.attr('style', '');
			} else if ((!self.desktop && iceSlider.pageWidth < 768) && self.internal.isDesktop === true) {
				self.internal.isDesktop = false;
				if(self.autoSlide) {
					clearInterval(self.internal.autoRun);
					self.internal.autoRun = setInterval(function(){self.rotate()},self.setTime);
				}
				self.adjustWidth();
				self.showPane(self.internal.currentItem, true); 
			} else if(self.desktop || !self.internal.isDesktop) {
				self.adjustWidth();
			}
		};
		this.adjustWidth = function() {
			self.internal.wrapperPxSize = self.internal.wrapperQuery.width();
	    	self.internal.itemPxWidth = self.internal.wrapperPxSize * (self.itemSize/100);
	        self.internal.itemQuery.each(function() {
	            $(this).width(self.internal.itemPxWidth);
	        });
	        self.internal.containerQuery.width(self.internal.itemPxWidth*self.internal.itemCount);		
        	if (self.onResizeCallback) {
				self.onResizeCallback();
			}
		};
	    this.setContainerOffset = function(percent, animate) {
			self.internal.containerQuery.removeClass(self.animationClass);
	        if(animate) {
	            self.internal.containerQuery.addClass(self.animationClass);
	        }
	        if((Modernizr.csstransforms3d && self.animation === 'auto') || (Modernizr.csstransforms3d && self.animation === 'CSS')) {
	            self.internal.containerQuery.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
	        }
	        else if((Modernizr.csstransforms && self.animation === 'auto') || (Modernizr.csstransforms && self.animation === 'CSS')) {
	            self.internal.containerQuery.css("transform", "translate("+ percent +"%,0)");
	        }
	        else {
	            var px = ((self.internal.itemPxWidth*self.internal.itemCount) / 100) * percent;
	            if(animate){
					self.internal.containerQuery.dequeue(true).animate({left: px+"px"},300);
	            } else {
	            	self.internal.containerQuery.css("left", px+"px");
	            }
	            
	        }
	    };
		this.addDots = function() {
			var dotLink, dotSpan, i,
				dots = $(self.dots);
			dotLink = document.createElement('a');
			dotSpan = document.createElement('span');
			dotLink.setAttribute('href', '#');
			dotLink.appendChild(dotSpan);
			dotLink = $(dotLink);
			dots.html('');
			for(i = 1; i <= self.internal.itemCount; i++){
	        	if(i === self.internal.currentItem+1) {
	        		dots.append(dotLink.attr('index', i).clone().addClass(self.dotActiveClass));
	        	} else {
	        		dots.append(dotLink.attr('index', i).clone());
	        	}
	        }
		};
		this.update = function() {
			if(!self.desktop && iceSlider.pageWidth < 768) {
				self.internal.itemQuery =  $("> " + self.item, self.wrapper + ' ' + self.container);
				self.internal.itemCount =  self.internal.itemQuery.length;
				self.internal.itemQuery.each(function(index) {
					if($(this).hasClass(self.itemActiveClass)) {
						self.internal.currentItem = index;
					}
				});
				if(self.dots) {
					if (self.internal.itemCount === 1 && self.oneItemDotHide === true) {
						$(self.dots).css('visibility', 'hidden');
					} else if (self.internal.itemCount > 1 && self.oneItemDotHide === true) {
						$(self.dots).css('visibility', 'visible');
					}
					self.addDots();
				}
				self.widthController();
				if(self.leftArrow && self.internal.currentItem === 0) {
					$(self.leftArrow).addClass(self.arrowInactiveClass);
				} else {
					$(self.leftArrow).removeClass(self.arrowInactiveClass);
				}
				if (self.leftArrow && self.internal.currentItem+1 === self.internal.itemCount) {
					$(self.rightArrow).addClass(self.arrowInactiveClass);  			
				} else {
					$(self.rightArrow).removeClass(self.arrowInactiveClass); 
				}
				self.showPane(self.internal.currentItem, true);
				if (self.onUpdateCallback) {
					self.onUpdateCallback();
				}
			} else {
				self.internal.updateInQueue = true;
			}

		};
		this.error = function(error) {
			if(self.debug) {
				switch(error) {
					case 1:
						console.log('Please specify the wrapper and container ID');
						break;
					case 2:
						console.log('Wrapper and container needs to be an ID');
						break;
					case 3:
						console.log('Dots needs to be an ID');
						break;
					default:
						console.log('Unknown error');
						break;
				}
			}
		};
	}
};