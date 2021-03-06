// jshint ignore: start

// @codekit-prepend 'includes/slidebox-util.js'
// @codekit-prepend 'includes/jquery.scrollLock.simple.js'
// @codekit-append 'includes/lazysizes.js'

var slideBoxCm = {};

function initSlides(config) {

	var defaults = {
			container	: '.slide-box', 
			slideBox 	: '.slide-box',
			slide 		: '.slide',
			slideBoxClick : false,
			setPath		: false,
			wrapSlides	: false,
			loopSlides	: false,
			interval 	: 5000,
			debug : debug
		},
		config = typeof(config) === 'object' ? config : defaults,

		$boxes = $(config.slideBox),
		$boxActive = $(),
		$boxZoomed = $(),
		boxDataCache = [],
		
		$slides = $boxes.find(config.slide),
		
		ytPromise,

		//wrapSlides = config.wrapSlides,
		//loopSlides = config.loopSlides,
		//interval = config.slideInterval,
		
		initialState = getState(),
		delta = {
			'prev'	: -1,
			'next'	: +1
		};
	
	//config.wrapSlides = slideCount > 1 && $container.hasClass('wrap-slides');
	//config.loopSlides = slideCount > 1 && $container.hasClass('auto-loop');
	
	if (config.debug) {
		console.log(config);
		//console.log('globalControls '+globalControls);
		//console.log($slides);
	}
	
	
	function initBoxes() {
		
		/* PRELOAD CONTENT OF EACH BOX:
		
		1 which slides it contains
		2 the current slide position
		
		3 (later) local loop settings
		
		*/
		
		var $html5Videos = $boxes.find('video'),
			$ytEmbeds = $boxes.find('.video-yt'),
			$vimeoEmbeds = $boxes.find('.video-vimeo'),
			hasHtml5Videos = $html5Videos.length > 0,
			hasYtEmbeds = $ytEmbeds.length > 0,
			hasVimeoEmbeds = $vimeoEmbeds.length > 0,
			players = {};
			
			//console.log($ytEmbeds);
		
		function loadEmbedAPIs() {

			var tag,
				firstScriptTag;
		
			if (hasYtEmbeds) ytPromise = new Promise(function(onYouTubeIframeAPIReady) {

				window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
				
				tag = document.createElement('script');
				tag.src = "https://www.youtube.com/iframe_api";
				firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			});
			
			if (hasVimeoEmbeds) { // PROMISE??
				
				tag = document.createElement('script');
				tag.src = 'https://player.vimeo.com/api/player.js';
				firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}
	
		}
		
		function pauseVideo($target) {
			
			var id = $target.attr('id');

			console.log('Pause video: '+id);
			//console.log(players);
			
			/// REGULAR HTML 5
			if ($target.is('video')) {
			
				$target.get(0).pause();
				//this.player.pause();
				//if ($(this)[0].player.pause()) 
			} else if ($target.hasClass('video-yt')) {
				
				players[id].pauseVideo();
				//console.log(players[id]);
				
			} else if ($target.hasClass('video-vimeo')) {
			
				players[id].pause();
				//console.log(players[id]);
			}
	
		}
		
		function handlePauseEvent(event) {
			
			var $target = $(event.target);
			/*if (config.debug) {
				console.log('Pause event Fired');
				console.log($target);
			}*/
			pauseVideo($target);
		}
		
		function addPlayerObject($target) {
			
			var id = $target.attr('id');
			//console.log($target.get(0));
			
			if ($target.hasClass('video-yt')) {
				if (config.debug) console.log('Adding YT Player '+id);
				players[id] = new YT.Player(id);
			} else if ($target.hasClass('video-vimeo')) {
				if (config.debug) console.log('Adding Vimeo Player '+id);
				players[id] = new Vimeo.Player($target.get(0));
			}
			
			$target.on('pauseVideo', handlePauseEvent);
			//console.log(players);
			
			//console.log(jQuery._data( $target.get(0) , "events" ));
			
			/*player = new YT.Player('existing-iframe-example', {
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});*/
		}
		
		$html5Videos.on('pauseVideo', handlePauseEvent);
		loadEmbedAPIs();
		
		$boxes.each(function () {
			
			var $box = $(this),
				$parent = $box.closest(config.container),
				boxIndex = $boxes.index($box),
				$slides = $box.find(config.slide),
				$videos = $box.find('video, .video-yt, .video-vimeo'),
				slideCount = $slides.length,
				$slideActive = $box.find('.slide-active'),
				hasActiveSlide = $slideActive.length > 0,
				loopBox = $box.data('loop') || $box.hasClass('auto-loop') || $parent.hasClass('auto-loop'),
				interval = $box.data('interval') ? $box.data('interval') : config.interval,
				$controls = $parent.find('.controls'),
				$prev = $controls.find('.prev'),
				$next = $controls.find('.next'),
				$close = $controls.find('.close'),

				$pager = $box.find('.pager'),
				$pagerAnchors = $pager.find('a');
			
			
			if (!hasActiveSlide) {
				$slideActive = $slides.eq(0);
				$slideActive.addClass('slide-active');
			}
			
			boxDataCache[boxIndex] = {
				slides		: $slides,
				videos		: $videos,
				slideCount	: slideCount,
				slideActive : $slideActive.length > 0 ? $slideActive : $slides.eq(0),
				pos			: $slideActive.length > 0 ? $slides.index($slideActive) : 0,
				controls		: {
						el   : $controls,
						prev : $prev,
						next : $next	,
						close: $close
				},
				pager 		: {
						el	 : $pager,
						a	 : $pagerAnchors
				}
			};
		
			/// START CAROUSEL
			if (loopBox && slideCount > 1) {
	
				setInterval(function() {
					changeSlide($box, 'next');
				}, interval);
			}
			
		});
		
		if (config.debug) console.log(boxDataCache);
		
		function doVideoStuff(e) {
				
			var element = e.target,
				$element = $(element),
				isHtml5 = $element.is('video'),
				isYT = $element.hasClass('video-yt'),
				isVimeo = $element.hasClass('video-vimeo'),
				clone,
				parent,
				$clone,
				$box = $element.closest(config.slideBox),
				boxIndex = $boxes.index($box),
				boxProps = boxDataCache[boxIndex];
				
			if (isYT || isVimeo) { /// isHtml5 || 
				//console.log($(element));
				clone = element.cloneNode(true);
				parent = element.parentNode;
				clone.src = element.getAttribute('data-src');
				clone.classList.remove('lazyload', 'lazyloading');
				clone.classList.add('lazyloaded');
				parent.insertBefore(clone, element);
				element.remove();
				$clone = $(clone);
				
				/// RESET VIDEO CACHE
				boxDataCache[boxIndex].videos = $box.find('video, .video-yt, .video-vimeo');
				
				if (isYT) {
					ytPromise.then(function(val) {
						//console.log(ytPromise);
						addPlayerObject($clone);
					});
				} else if (isVimeo) {
					addPlayerObject($clone);
				} else {
					addPlayerObject($clone);
				}
			}
		}
		
		document.addEventListener('lazybeforeunveil', function(e) {
			
			var element = e.target,
				$element = $(element),
				$slide = $element.closest(config.slide);

			e.preventDefault();
			//console.log($element)
			//console.log('bla');
			
			setSlideBg($slide, defer=true);
			
		});
		
		if (hasYtEmbeds || hasVimeoEmbeds) /// hasHtml5Videos || 
			document.addEventListener('lazybeforeunveil', doVideoStuff);
			//document.addEventListener('lazybeforeunveil', function(e) );
		
	}

	
	function getActiveBox() {
		
		$boxActive = $('.box-active');
	}


	function activateBox($box) {
		
		$box.addClass('box-active');
		getActiveBox();
		
		loadSlideBgs();
	}	
	
	
	function getActiveSlide($box) {

		$slideActive = $box.find('.slide-active');
		return $slideActive;

	}
	
	
	function getSlideIndex(boxIndex) {
		
		var boxIndex = typeof boxIndex !== 'undefined' ? boxIndex : $boxes.index($boxActive),
			$box = typeof boxIndex !== 'undefined' ? $boxes.eq(boxIndex) : $boxActive,
			boxProps = boxDataCache[boxIndex],
			$boxSlides = boxProps.slides,
			lastSlide = boxProps.slideCount - 1,
			$slideActive = $box.find('.slide-active'),
			hasActiveSlide = $slideActive.length > 0,
			prev,
			next;
		

		function getAdjacentSlides() {
			
			prev = boxProps.pos + delta['prev'],
			next = boxProps.pos + delta['next'];
			
			// DO NOT WRAP SLIDES:
			/*boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $();
			boxProps.nextSlide = $boxSlides.eq(next); */

			// WRAP SLIDES:
			boxProps.prevSlide = prev >= 0 ? $boxSlides.eq(prev) : $boxSlides.eq(lastSlide);
			boxProps.nextSlide = next <= lastSlide ? $boxSlides.eq(next) : $boxSlides.eq(0);
			
			if (boxProps.slideCount === 1) {
				boxProps.nextSlide = $();
				boxProps.prevSlide = $();
			}
		}
	
		//getActiveSlide(boxIndex);
		
		boxProps.pos = hasActiveSlide ? $boxSlides.index($slideActive) : 0;
		//if (!hasActiveSlide) $boxSlides.eq(0).addClass('active-slide');
		getAdjacentSlides();
		
		if (config.debug) {
			console.log('slideIndex after load {\n' +
			//if (activeSlide) console.log($slideActive);
			//console.log('boxIndex ' + boxIndex + ', pos : ' + boxProps.pos + ' / ' + $boxSlides.length);
			
			'\tactive : \t' + boxProps.pos + '\t\t #' + $slideActive.attr('id') +'\n'+
			'\tprev : \t\t' + prev + '\t\t #' + boxProps.prevSlide.attr('id') +'\n'+
			'\tnext : \t\t' + next + '\t\t #' + boxProps.nextSlide.attr('id') +'\n'+
			'}');
		}
		
		boxDataCache[boxIndex] = boxProps;
		
	}

		
	function setControlIndex(boxIndex) {
	
		//$boxActive = $('.box-active'); //$boxes.filter('.box-active'),
		var $box = $boxes.eq(boxIndex),
			boxProps = boxDataCache[boxIndex],
			$controls = boxProps.controls.el,
			$prev = boxProps.controls.prev,
			$next = boxProps.controls.next,
			
			$pager = boxProps.pager.el,
			$pagerAnchors = boxProps.pager.a;
		//}
		
		$pagerAnchors
			.removeClass('active')
			.eq(boxProps.pos).addClass('active');
		
		if (boxProps.prevSlide.length === 0) {
			$prev.addClass('disabled'); 
		} else {
			$prev.removeClass('disabled');
		}
		
		if (boxProps.nextSlide.length === 0) {
			$next.addClass('disabled'); 
		} else {
			$next.removeClass('disabled');
		}

	}

	
	function loadSlide($slide) {
		
		if (config.debug) console.log('loadSlide : ' + $slide.attr('id'));
	
		var $box = $slide.closest(config.slideBox),
			boxIndex = $boxes.index($box),
			boxProps = boxDataCache[boxIndex],
			slug = $slide.attr('id'),
			itemPath = createPath(initialState.path, slug),
			itemTitle = $box.find('.list-item-title').text(),
			itemState = createState(itemPath, itemTitle);

		// CLEAN UP
		boxProps.slides
			.removeClass('slide-prev slide-next playing')
			.not($slide).removeClass('slide-active');
		
		// PAUSE ALL VIDEOS
		//console.log(boxProps.videos);
		/*boxProps.videos.each(function() {
			console.log(jQuery._data( this , "events" ));
		});*/
		boxProps.videos.trigger('pauseVideo');
		
		if (!$slide.hasClass('slide-active')) {
			
			$slide.addClass('slide-active');
			$(document).trigger('slideChanged');
			
			getSlideIndex(boxIndex);
			
			// LOAD NEW PATH here
			if (config.setPath) loadState(itemState);
			
			boxProps.prevSlide.addClass('slide-prev');
			boxProps.nextSlide.addClass('slide-next');
				
		} else {
			
			//$box.removeClass('box-active');
			$slide.removeClass('slide-active');

		}
		
		setControlIndex(boxIndex);
		setScroll($box);
		
	}
	
	
	function changeSlide($box, dir) {
	
		var dir = typeof dir !== 'undefined' ? dir : '';
		
		$box.each(function() {
		/// ALLOW FOR BOX TO BE A COLLECTION
		
			var $box = $(this),
				boxIndex = $boxes.index($box),
				boxProps = boxDataCache[boxIndex],
				$boxSlides = boxProps.slides,
				$slideActive = boxProps.slideActive,
				allowChange = $box.hasClass('box-zoomed') || $box.hasClass('slide-box-carousel'),
				pos = boxProps.pos,
				$nextSlide;
			
			function getNextSlide() {
			
				var lastSlide = boxProps.slideCount - 1,
					future = dir !== '' ? pos + delta[dir] : $boxSlides.index($slide),
					$future;
				
				if (future > lastSlide) future = 0;		// go to first slide
				if (future < 0) future = lastSlide;		// go to last slide
					
				if (future !== pos) {
					pos = future;
					boxDataCache[boxIndex].pos = pos;
					$future = $boxSlides.eq(future);
				} else {
					$future = false;
				}
				
				if (config.debug) {
					//console.log($boxSlides);
					//console.log('lastSlide ' + lastSlide + ', future : ' + future);
					//console.log($future);
				}
				
				return $future;
			}

			if (config.debug) {
				//console.log($box);
				//console.log($box.attr('class'));
				console.log('\nboxIndex: '+boxIndex+', '+boxProps.slideCount+'slides,\n' + 
					'dir : ' + dir + ', allowChange: ' + allowChange);
			}
			
			if (allowChange) {
				$nextSlide = getNextSlide();
				if ($nextSlide) loadSlide($nextSlide);
			}

		});
		
	}
	
	
	function findBox(event) {
		
		var isZoomed = $boxZoomed.length>0,
			$target,
			$box, $cont;
		
		if (typeof event === 'object') {
			/// ARROW WIDGETS
			event.preventDefault();
			$target = $(event.target);
			$box = $target.closest(config.slideBox);
			if (!$box.length > 0) {
				$cont = $target.closest(config.container);
				$box = $cont.find(config.slideBox);
			}
			//console.log($box);
		} else { 
			/// KEYBOARD SHORTCUTS
			$box = isZoomed ? $boxZoomed : $boxActive;
		}
		
		if (config.debug) {
			//console.log($target);
			//console.log($cont);
		}
		return $box;
	}
	
	
	function prevSlide(event) {
		
		var $box = findBox(event);
		changeSlide($box, 'prev');
	}
	
	
	function nextSlide(event) {
		
		var $box = findBox(event);
		changeSlide($box, 'next');
	}
	
	
	function toggleControls(boxIndex) {

		if ($boxes.eq(boxIndex).hasClass('box-zoomed')) {
		
			boxDataCache[boxIndex].controls.prev.removeClass('widget-hide');
			boxDataCache[boxIndex].controls.next.removeClass('widget-hide');
			boxDataCache[boxIndex].controls.close.removeClass('widget-hide');
		}
		//console.log ('boxIndex'+boxIndex);
		//$controls.addClass('controls-show');
		
		//$controls.removeClass('controls-show');
		//$close.addClass('widget-hide');
		
	}
	
	
	function toggleZoom($slide) {
		
		var $box,
			boxIndex,
			boxProps,
			$slideActive;
		
		if (typeof $slide !== 'undefined') {
		/// ZOOM IN
			
			$(document).trigger('zoomIn');
			if (config.debug) console.log('Zoom In');
			
			$box = $slide.closest(config.slideBox);
			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			//console.log('how did we get here?');
			
			activateBox($box);
			$box.addClass('box-zoomed');
			$boxZoomed = $box;
			boxProps.slides.addClass('slide-detail');
			
			$.scrollLock(true);
			//boxProps.pos = boxProps.slides.index($slide);
			
			if (!$slide.hasClass('slide-active')) {
				loadSlide($slide);
			}
			
			toggleControls(boxIndex);
			
		} else if ($boxZoomed.length > 0) {
		/// ZOOM OUT
			
			if (config.debug) console.log('Zoom Out');
			
			$box = $boxZoomed;
			$slideActive = $box.find('.slide-active');
			if (config.debug) console.log('slideActive:' + $slideActive.attr('class'));
			
			$(document).trigger('zoomOut');

			boxIndex = $boxes.index($box);
			boxProps = boxDataCache[boxIndex];
			
			$box.removeClass('box-zoomed');
			$boxZoomed = $();
			
			//boxProps.slides.removeClass('slide-active slide-prev slide-next slide-detail');
			boxProps.slides.removeClass('slide-detail');
			if (!$box.hasClass('slide-box-carousel'))
				boxProps.slides.removeClass('slide-active slide-prev slide-next');
			boxProps.videos.trigger('pauseVideo');
			
			$.scrollLock(false);
			
			toggleControls(boxIndex);
			
			//removeHash();
			if (config.setPath) loadState(initialState);
			
			//scrollToTarget($slideActive);
			//$(document).scrollTop( $slideActive.offset().top );
			//$('html,body').scrollTop( $slideActive.offset().top );
			$('html,body').animate({
				scrollTop: $slideActive.offset().top - 60
			}, 0);
		
			$(document).trigger('zoomedOut');
			
		}
		
	}
	
	
	function loadBox($box) {
		
		var $slide = $box.find(config.slide).eq(0);

		activateBox($box);
		toggleZoom($slide);
	}
	
	
	function loadSingleSlide() {
		
		if (hash !== '') {
			if (config.debug) console.log('hash: ' + hash);
			loadBox($('#' + hash));
		}
	}
	
	
	function addEvents() {
		
		// CUSTOM EVENTS
		
		$boxes.on('slideBoxChange', function (event) {
			var $target = $(event.target);
			
			if (config.debug) console.log('slideBoxChange event triggered');
			//if (config.debug) console.log($target);
			activateBox($target);
			getSlideIndex();
		});

		$slides.on('toggleZoom', function (event) {
			var $target = $(event.target);
			
			//if (config.debug) console.log($target);
			toggleZoom($target);
		});
		
		$(document).on('slideChanged', function () {
			if (config.debug) console.log('slideChanged event triggered');
		});
		
		/// REGULAR EVENTS
		
		/*$(document).on('mouseenter', config.slideBox, function () {
			
			var $target = $(this);
			$boxes.not($target).removeClass('box-active');
			activateBox($target);
			getSlideIndex();
		});*/
		
		if (config.slideBoxClick) {
			$(document).on('click', '.slide-box:not(.box-zoomed)', function (event) {
		
				if (config.debug) console.log('\nslideBox clicked');
				loadBox($(this)); 
			});
		} else {
			$(document).on('click', '.slide:not(.slide-detail,.slide.playing)', function (event) {
			// ZOOM IN

				event.stopPropagation();
				if (config.debug) console.log('\nSlide clicked');
				toggleZoom($(this));
			});
		}
		
		$(document).on('click', '.slide-detail:not(.slide.playing)', function (event) {
		// ZOOM OUT
		
			var $slide = $(this),
				$box = $slide.parents('.slide-box'),
				archiveUrl = $slide.data('archiveUrl');
			
			event.stopPropagation();
			if (config.debug) console.log('\nDetail slide clicked:' + $slide);
			
			if (!$box.hasClass('slide-box-carousel')) toggleZoom();
			
		}).on('click', '.controls .prev', prevSlide)
		.on('click', '.controls .next', nextSlide)
		.on('swiperight', prevSlide)
		.on('swipeleft', nextSlide)
		.on('click', '.controls .close', function (event) {
		// ZOOM OUT
		
			event.preventDefault();
			toggleZoom();
			
		}).on('click', '.number', function (event) {

			var $number = $(this),
				$box = $number.closest(config.slideBox),
				boxIndex = $boxes.index($box),
				$boxSlides = boxDataCache[boxIndex].slides,
				no = boxDataCache[boxIndex].pager.a.index($number),
				$slide = $boxSlides.eq(no);

			event.preventDefault();
			if (config.debug) console.log('number clicked ' + parseInt(no+1));
			if (!$slide.hasClass('slide-active')) loadSlide($slide);
			
		}).on('keyup', function (e) {
			
			switch (e.keyCode) {
			case 27: // esc
				toggleZoom();
				break;
			case 37: // left <-
				prevSlide();
				break;
			case 39: // right ->
				nextSlide();
				break;
			}
		});

	}

	if ($boxes.length > 0) {
		
		initBoxes();
		addEvents();

		getActiveBox();
		loadSlideBgs($boxes);
	}
	/*
	if (query.indexOf('zoom') > -1) {

		if (query.indexOf('first') > -1) {
			toggleSlide($slides.eq(0));
		} else if (query.indexOf('last') > -1) {
			toggleSlide($slides.eq($slides.length - 1));
		}
	}
	*/
	

}