/*
Ice Slider v2
*/
'use strict';
var iceSlider = {
	pageWidth : window.innerWidth || document.documentElement.clientWidth,
	initialized : false,
	cssTransformPrefix : false,
	init : function() {
		iceSlider.initialized = true;
		iceSlider.addEvent(window, 'resize', iceSlider.getWindowWidth);
	},
	getWindowWidth : function() {
		iceSlider.pageWidth = window.innerWidth || document.documentElement.clientWidth;
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
	    this.dragThreshold = typeof obj.dragThreshold !== 'undefined' ? obj.dragThreshold : 35;
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
			interaction : false,
			currentItem : 0,
			autoRun : null,
			isDesktop : null,
			updateInQueue : false,
			mouseover : false,
			swipped : false
		};
		if(iceSlider.initialized === false) {
			iceSlider.init();
		}
		this.init = function() {
			if(self.wrapper === false || self.container === false) {
				console.log('Failure to initialize slider');
			} else {
				self.internal.wrapperQuery = document.getElementById(self.wrapper);
				self.internal.containerQuery = document.getElementById(self.container);
				self.internal.itemQuery =  self.internal.containerQuery.getElementsByClassName(self.item);
				iceSlider.addClass(self.internal.wrapperQuery, 'hammer-set');
				self.internal.itemCount =  self.internal.itemQuery.length;
				self.internal.wrapperPxSize = self.internal.wrapperQuery.offsetWidth;
				iceSlider.addClass(self.internal.itemQuery[0], self.itemActiveClass);
				if(iceSlider.cssTransformPrefix === false) {
					iceSlider.transformPrefix();
				}
			    if(Modernizr.csstransitions === false) {
					self.animation = 'js';
				}
				if(self.dots) {
					self.dots = document.getElementById(self.dots);
    				if (self.internal.itemCount === 1 && self.oneItemDotHide === true) {
    					self.dots.style.visibility = 'hidden';
    				}
    				self.addDots();
    				iceSlider.addEvent(self.dots, 'click', self.dotsEvent);
	    		}
	    		if(!self.desktop && iceSlider.pageWidth >= 768) {
					self.internal.isDesktop = true;
	    		} else if(!self.desktop && iceSlider.pageWidth < 768) {
					self.internal.isDesktop = false;
					self.widthController();
	    		} else {
	    			self.widthController();
	    		}
	    		iceSlider.addEvent(window, 'resize', self.widthControllerEvent);
	    		iceSlider.addEvent(window, 'orientationchange', self.widthControllerEvent);
				if(self.autoSlide) {
					self.internal.autoRun = setInterval(function(){
						self.rotate();
					},self.setTime);
					iceSlider.addEvent(self.internal.wrapperQuery, 'mouseover', self.mouseoverRotationEvent);
					iceSlider.addEvent(self.internal.wrapperQuery, 'mouseout', self.mouseoutRotationEvent);
				}
				if(self.leftArrow) {
					self.leftArrow = document.getElementById(self.leftArrow);
					iceSlider.addClass(self.leftArrow, self.arrowInactiveClass);
					iceSlider.addEvent(self.leftArrow, 'click', self.leftArrowEvent);   
				} 
				if (self.rightArrow) {
					self.rightArrow = document.getElementById(self.rightArrow);
				    if(self.internal.currentItem+1 === self.internal.itemCount) {
    					iceSlider.addClass(self.rightArrow, self.arrowInactiveClass);
    				}
    				iceSlider.addEvent(self.rightArrow, 'click', self.rightArrowEvent);    			
				}
				if (self.desktop || (!self.desktop && iceSlider.pageWidth < 768)) {
					self.showPane(0, true);
				}
				self.hammerHolder = new Hammer(self.internal.wrapperQuery).on('panleft panright panend swipeleft swiperight', self.handleHammer);
				if (self.onInitCallback) {
					self.onInitCallback();
				}
			}
		};
		this.widthControllerEvent = function() {
			if(self.internal.updateInQueue && (!self.desktop && iceSlider.pageWidth < 768)) {
				self.internal.updateInQueue = false;
				self.update();
			} else {
				self.widthController();
			}
		};
		this.dotsEvent = function(event) {
			event.preventDefault();
			if(event.target !== event.currentTarget) {
				if (event.target.nodeName === "SPAN") {
					var index = event.target.parentNode.getAttribute('index');
				} else {
					var index = event.target.getAttribute('index');
				}
				if (index !== null || index !== '') {
					self.internal.interaction = true;
					self.showPane(index-1);				
				}
			}
		};
		this.leftArrowEvent = function(event) {
			event.preventDefault();
			self.internal.interaction = true;
			self.prev();
		};
		this.rightArrowEvent = function(event) {
			event.preventDefault();
			self.internal.interaction = true;
			self.next();
		};
		this.mouseoverRotationEvent = function() {
			clearInterval(self.internal.autoRun);
		};
		this.mouseoutRotationEvent = function() {
			clearInterval(self.internal.autoRun); 
			self.internal.autoRun = setInterval(function(){self.rotate()},self.setTime);
		};
		this.handleHammer = function(ev) {
			if(ev.type !== 'panend') {
				ev.preventDefault();
			}
			if(((!self.desktop && iceSlider.pageWidth < 768) || self.desktop) && self.touchEvents) {
				self.internal.wrapperQuery.scrollLeft = 0;
				switch(ev.type) {
		            case 'panright':
		            case 'panleft':
		            	self.internal.interaction = true;
		            	if(ev.isFinal !== true) {
			            	var gestureX, pane_offset, drag_offset;
					         // stick to the finger
					        gestureX = ev.deltaX;
		                    pane_offset = -(100/self.internal.itemCount)*self.internal.currentItem;
		                    drag_offset = ((100/self.internal.itemPxWidth)*gestureX) / self.internal.itemCount;
		                    // slow down at the first and last pane
		                    if((self.internal.currentItem === 0 && ev.direction === 4) ||
		                        (self.internal.currentItem === self.internal.itemCount-1 && ev.direction === 2)) {
		                        drag_offset *= .3;
		                    }
		                    self.setContainerOffset(drag_offset + pane_offset, false);
		            	}
		            break;
		            case 'swipeleft':
						self.internal.swipped = true; 
						self.next();
		            break;
		            case 'swiperight':
						self.internal.swipped = true; 
						self.prev();
		            break;
		            case 'panend':
		            	if(self.internal.swipped !== true) {
			                if(Math.abs(ev.deltaX) > self.internal.itemPxWidth*(self.dragThreshold/100)) {
			                	switch(ev.direction) {
			                		case 4 :
			                			if(self.internal.currentItem !== 0) {
			                				self.prev();
			                			} else {
			                				self.showPane(self.internal.currentItem);
			                			}
			                		break;
			                		case 2 :
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
		            	} else {
		            		self.internal.swipped = false;
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
	        var offset;
	        index = Math.max(0, Math.min(index, self.internal.itemCount-1));
	        self.internal.currentItem = index;
	        iceSlider.removeClass(self.internal.itemQuery, self.itemActiveClass);
	        iceSlider.addClass(self.internal.containerQuery.querySelectorAll('.' + self.item)[self.internal.currentItem], self.itemActiveClass);
	        if(self.dots) {
	        	iceSlider.removeClass(self.dots.querySelectorAll('a'), self.dotActiveClass);
	        	iceSlider.addClass(self.dots.querySelectorAll('a')[self.internal.currentItem], self.dotActiveClass);
	        }
	        if(self.leftArrow && self.internal.currentItem === 0) {
	        	iceSlider.addClass(self.leftArrow, self.arrowInactiveClass);
	        } else if (self.leftArrow) {
	        	iceSlider.removeClass(self.leftArrow, self.arrowInactiveClass);
	        }
	        if (self.rightArrow && self.internal.currentItem === self.internal.itemCount-1) {
	        	iceSlider.addClass(self.rightArrow, self.arrowInactiveClass);
	        } else if (self.rightArrow) {
	        	iceSlider.removeClass(self.rightArrow, self.arrowInactiveClass);
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
	    	if(self.internal.interaction === false || (self.internal.interaction === true && self.autoSlideInterruption === false)) {
		    	if(self.internal.currentItem+1 !== self.internal.itemCount) {
		    		self.showPane(self.internal.currentItem+1);
		    	} else {
		    		self.showPane(0);
		    	}	    		
	    	}    	
	    };
	    this.widthController = function() {
	    	var i;
		    if((!self.desktop && iceSlider.pageWidth >= 768) && self.internal.isDesktop === false) {
				self.internal.isDesktop = true;
				if(self.autoSlide) {
					clearInterval(self.internal.autoRun);
				}
				self.setContainerOffset(0, false);
				console.log(self.internal.wrapperQuery);
				for (i = 0; i < self.internal.itemQuery.length; i++) {
					self.internal.itemQuery[i].setAttribute('style', '');
				}
	        	self.internal.containerQuery.setAttribute('style', '');
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
			var i;
			self.internal.wrapperPxSize = self.internal.wrapperQuery.offsetWidth;
	    	self.internal.itemPxWidth = self.internal.wrapperPxSize * (self.itemSize/100);
	    	for (i = 0; i < self.internal.itemQuery.length; i++) {
	    		self.internal.itemQuery[i].style.width = self.internal.itemPxWidth + 'px';
	    	}
	        self.internal.containerQuery.style.width = self.internal.itemPxWidth*self.internal.itemCount + 'px';		
        	if (self.onResizeCallback) {
				self.onResizeCallback();
			}
		};
	    this.setContainerOffset = function(percent, animate) {
	    	iceSlider.removeClass(self.internal.containerQuery, self.animationClass);
	        if(animate) {
	        	iceSlider.addClass(self.internal.containerQuery, self.animationClass);
	        }
	        if((Modernizr.csstransforms3d && self.animation === 'auto') || (Modernizr.csstransforms3d && self.animation === 'CSS')) {
	            self.internal.containerQuery.style[iceSlider.cssTransformPrefix] = 'translate3d('+ percent +'%,0,0) scale3d(1,1,1)';
	        }
	        else if((Modernizr.csstransforms && self.animation === 'auto') || (Modernizr.csstransforms && self.animation === 'CSS')) {
	            self.internal.containerQuery.style[iceSlider.cssTransformPrefix] = 'translate('+ percent +'%,0)';
	        }
	        else {
				var px = ((self.internal.itemPxWidth*self.internal.itemCount) / 100) * percent;
	            if(animate && jQuery){
					jQuery(self.internal.containerQuery).dequeue(true).animate({left: px+'px'},300);
	            } else {
	            	self.internal.containerQuery.style.left = px + 'px';
	            }
	            
	        }
	    };
		this.addDots = function() {
			var dotLink, dotSpan, i, currentItem;
			dotLink = document.createElement('a');
			dotSpan = document.createElement('span');
			dotLink.setAttribute('href', '#');
			dotLink.appendChild(dotSpan);
			self.dots.innerHTML = '';
			for(i = 1; i <= self.internal.itemCount; i++){
				currentItem = dotLink.cloneNode(true);
				currentItem.setAttribute('index', i);
	        	self.dots.appendChild(currentItem);
	        }
			iceSlider.addClass(self.dots.firstChild, self.dotActiveClass);
		};
		this.update = function() {
			var i;
			if((!self.desktop && iceSlider.pageWidth < 768) || self.desktop) {
				self.internal.itemQuery = self.internal.itemQuery =  self.internal.containerQuery.getElementsByClassName(self.item);
				self.internal.itemCount = self.internal.itemQuery.length;
				for (i = 0; i < self.internal.itemQuery.length; i++) {
					if(iceSlider.hasClass(self.internal.itemQuery[i], self.itemActiveClass)) {
						self.internal.currentItem = i;
					} else {
						self.internal.currentItem = 0;
					}
				}
				if(self.dots) {
					if (self.internal.itemCount === 1 && self.oneItemDotHide === true) {
						self.dots.style.visibility = 'hidden';
					} else if (self.internal.itemCount > 1 && self.oneItemDotHide === true) {
						self.dots.style.visibility = 'visible';
					}
					self.addDots();
				}
				self.widthController();
				if(self.leftArrow && self.internal.currentItem === 0) {
					iceSlider.addClass(self.leftArrow, self.arrowInactiveClass);
				} else {
					iceSlider.removeClass(self.leftArrow, self.arrowInactiveClass);
				}
				if (self.leftArrow && self.internal.currentItem+1 === self.internal.itemCount) {
					iceSlider.addClass(self.rightArrow, self.arrowInactiveClass);			
				} else {
					iceSlider.removeClass(self.rightArrow, self.arrowInactiveClass);	
				}
				self.showPane(self.internal.currentItem, true);
				if (self.onUpdateCallback) {
					self.onUpdateCallback();
				}
			} else {
				self.internal.updateInQueue = true;
			}

		};
	},
	addEvent : function(obj, type, fn) {
		if (obj.addEventListener) {
			obj.addEventListener(type, fn, false);
		} else if (obj.attachEvent) {
			obj['e' + type + fn] = fn;
			obj[type + fn] = function () {
				obj['e' + type + fn](window.event);
			}
			obj.attachEvent('on' + type, obj[type + fn]);
		}
	},
	removeEvent : function (obj, type, fn) {
		if (obj.removeEventListener) {
			obj.removeEventListener(type, fn, false);
		} else if (obj.detachEvent) {
			obj.detachEvent(type, fn);
		}
	},
	addClass : function(obj, strClass) {
		var currentClassesArray, i;
		if (!iceSlider.isNodeList(obj)) {
			obj = [obj];
		}
		for (i=0; i < obj.length; i++) {
			if (document.documentElement.classList) {
				obj[i].classList.add(strClass);
			} else {
				if (iceSlider.hasClass(obj[i], strClass)) {
					if (obj[i].className === '') {
						obj[i].className = strClass;
					} else {
						obj[i].className = obj[i].className + ' ' + strClass;
					}
				}
			}
		}
	},
	removeClass : function(obj, strClass) {
		var currentClassesArray, reInserted, i, j, removed;
		if (!iceSlider.isNodeList(obj)) {
			obj = [obj];
		}
		for (i=0; i < obj.length; i++) {
			if (document.documentElement.classList) {
				obj[i].classList.remove(strClass);
			} else {
				removed = false;
				currentClassesArray = obj[i].className;
				if (typeof currentClassesArray === 'string') {
					currentClassesArray = currentClassesArray.split(' ');
					for (j=0; j < currentClassesArray.length; j++) {
						if(currentClassesArray[j] === strClass) {
							removed = true;
							currentClassesArray.splice(j, 1);
						}
					}
					if(removed === true) {
						reInserted = '';
						for (j=0; j < currentClassesArray.length; j++) {
							reInserted = reInserted + ' ' + currentClassesArray[j];
						}
						obj[i].className = reInserted.trim();
					}
					removed = false;
				}
			}
		}
	},
	hasClass : function (obj, strClass) {
		var i, currentClassesArray;
		if (document.documentElement.classList) {
			return obj.classList.contains(strClass);
		} else {
			currentClassesArray = obj.className;
			if (typeof currentClassesArray === 'string') {
				currentClassesArray = currentClassesArray.split(' ');
				for (i=0; i < currentClassesArray.length; i++) {
					if(currentClassesArray[i] === strClass) {
						return true;
					}
				}
			}
		}
		return false;
	},
	checkVendorPrefix : function (prefixes) {
		var tmp = document.createElement('div');
		var result = '';
		for (var i = 0; i < prefixes.length; ++i) {
			if (typeof tmp.style[prefixes[i]] != 'undefined'){
				result = prefixes[i];
				break;
			} else {
				result = null;
			} 
		}
		return result;
	},
	transformPrefix : function() {
		iceSlider.cssTransformPrefix = iceSlider.checkVendorPrefix(['transform', 'msTransform', 'MozTransform', 'WebkitTransform', 'OTransform']);
	},
	isNodeList : function(nodes) {
	    var stringRepr = Object.prototype.toString.call(nodes);
	    return typeof nodes === 'object' &&
	        /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
	        nodes.hasOwnProperty('length') &&
	        (nodes.length === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0));
	}
};