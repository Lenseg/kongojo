(function ($, window, document) {
	//defaults
	var defaults = {
		overflowBackground:'rgba(255,255,255,.7)'
		,loader : false
		,loaderTimeout : 300
		,buttons : false
		,autoplay :false
	}
	function KongojoConstructor(elem,opts){
		this.elem = $(elem);
		this.opts = $.extend( {}, defaults, opts );
		this.init();
	}
	KongojoConstructor.prototype.init = function() {
		var that = this;
		that.vars = { 
			loader : null
			,imageHolder : null
			,bigImage : null
			,elements : that.elem.find('a')
			,current : null
			,loadTimeout : null
			,autoplayTimeout : null
		}
		that.functions = {
			buttons : {
				left : function(e){
					e.preventDefault();
					e.stopPropagation();
					that.elem.trigger('prev');
				}
				,right : function(e){
					e.preventDefault();
					e.stopPropagation();
					that.elem.trigger('next');
				}
			}
    		,createMarkup : function(){
    			that.vars.imageHolder = $('<div><img class="kongojo-img" src=""></div>',{
					id:'kongojo-wrap'	
				}).css({
					'position':'absolute'
					,'top':'0'
					,'bottom':'0'
					,'left':'0'
					,'right':'0'
					,'background-color':that.opts.overflowBackground
					,'display':'none'
				}).click(function(e){
		    		e.preventDefault();
		    		e.stopPropagation();
					that.elem.trigger('close');
				}).appendTo(that.elem);
				that.vars.bigImage =  that.vars.imageHolder.find('.kongojo-img').css({
					'max-width':'100%'
					,'display':'block'
					,'margin-left':'auto'
					,'margin-right':'auto'
				}).click(function(e){
	    			e.preventDefault();
	    			e.stopPropagation();
					that.elem.trigger('next');
				}).swipe({
					swipeLeft:function(event, direction, distance, duration, fingerCount, fingerData) {
						//blocks desctop swipes
						if(fingerCount)
						that.elem.trigger('next');
					}, 
					swipeRight:function(event, direction, distance, duration, fingerCount, fingerData) {
						//blocks desctop swipes
						if(fingerCount)
						that.elem.trigger('prev');
					}
				});
				if(that.opts.loader){
	    			that.vars.loader = new Image();
	    			that.vars.loader.src = that.opts.loader;
    				that.functions.showLoader();
    			};
    			if(that.opts.buttons){
					var left,right
					if(typeof that.opts.buttons == 'boolean'){
						left = $('<a class="kongojo-button kongojo-button-prev">prev</a>');
						right = $('<a class="kongojo-button kongojo-button-next">next</a>');
						that.vars.imageHolder.append(left,right);
					}
					else {
						left = $(that.opts.buttons.left);
						right = $(that.opts.buttons.right);
					}
					left.click(that.functions.buttons.left);
					right.click(that.functions.buttons.right);
				}
			}
			,showLoader : function(){
				if(that.vars.loader==null)
					return;
				//displays loader if dint loaded fast
				that.vars.loadTimeout = setTimeout(function(){
					that.vars.bigImage.attr('src',that.vars.loader.src).height('auto').css('margin-top',($(window).height()-that.vars.loader.height)/2);
				},that.opts.loadTimeout);
			}
			,setImage : function(src){
				var imgObject = new Image();
    			imgObject.onload = function(){
    				clearTimeout(that.vars.loadTimeout);
    				var winHeight = $(window).height(),
    				winWidth = $(window).width();
    				//drops css
    				that.vars.bigImage.attr('src','').width('auto').height('auto');
    				if(winHeight<imgObject.height){
    					if (imgObject.width*(winHeight/imgObject.height)>$(window).width())
							that.vars.bigImage.width(winWidth).css('margin-top',(winHeight-imgObject.height*(winWidth/imgObject.width))/2);
    					else
    						that.vars.bigImage.height(winHeight).css('margin-top','');
    				}
    				that.vars.bigImage.attr('src',imgObject.src);
    			};
    			imgObject.src = src;
			}
			,bindKeys : function(e){
				//overkill for mozilla
    			var code = e.which || e.charCode || e.keyCode;
    			if(code==39){
    				that.elem.trigger('next');
    			}
    			if(code==37){
    				that.elem.trigger('prev');
    			}
    			//esc
    			if(code==27){
    				that.elem.trigger('close');
    			}
    		}
			,previewClick : function(){
				//from each
	    		var $this = $(this);
	    		$this.click(function(e){
	    			e.preventDefault();
	    			e.stopPropagation();
	    			that.vars.current = $this;
	    			that.vars.imageHolder.fadeIn();
	    			that.functions.setImage($this.attr('href'));
	    			$(document).keyup(that.functions.bindKeys);
	    			if(that.opts.autoplay)
	    				that.functions.autoplay();
	    		})
	    	}
	    	,autoplay : function () {
	    		clearTimeout(that.vars.autoplayInterval);
	    		that.vars.autoplayTimeout = setTimeout(function(){
	    			that.elem.trigger('next');
    			},that.opts.autoplay)
	    	}
	    };
	    //triggerable events
	    that.elem.on('next',function(){
    		var obj = that.vars.current.next();
    		if(!obj.length)
    			obj = that.vars.elements.first();
    		that.functions.showLoader();
    		that.functions.setImage(obj.attr('href'));
    		that.vars.current = obj;
    		if(that.opts.autoplay)
	    		that.functions.autoplay();
    	})	
	    that.elem.on('prev',function(){
    		var obj = that.vars.current.prev();
    		if(!obj.length)
    			obj = that.vars.elements.last();
    		that.functions.showLoader();
    		that.functions.setImage(obj.attr('href'));
    		that.vars.current = obj;
    		if(that.opts.autoplay)
	    		that.functions.autoplay();
    	})
	    that.elem.on('close',function(){
    		that.vars.imageHolder.fadeOut();
    		$(document).unbind('keyup',that.functions.bindKeys);
    	})
		that.functions.createMarkup();
    	that.vars.elements.each(that.functions.previewClick);
	};
	//jquery extending
	$.fn.kongojo = function ( options ) {
        return this.each(function () {
        	//check if already inited
            if (!$.data(this, 'kongojo')) {
                $.data(this, 'kongojo', 
                new KongojoConstructor( this, options ));
            }
        });
    }
})(jQuery, window, document);