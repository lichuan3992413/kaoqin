/*
 * $Id: om-core.js,v 1.24 2012/05/02 06:54:38 licongping Exp $
 * operamasks-ui om-core 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */
(function( $, undefined ) {
// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.om = $.om || {};
if ( $.om.version ) {
	return;
}

$.extend( $.om, {
	version: "1.2",
	keyCode: {
	    TAB: 9,
	    ENTER: 13,
	    ESCAPE: 27,
	    SPACE: 32,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40
	},
	lang : {
		// ��ȡ���ԵĹ��ʻ��ַ�������������options���Ѿ��������ֵ��ֱ��ʹ�ã������$.om.lang[comp]�л�ȡ
		_get : function(options, comp, attr){
			return options[attr] ? options[attr] : $.om.lang[comp][attr]; 
		}
	}
});
// plugins
$.fn.extend({
	propAttr: $.fn.prop || $.fn.attr,
	_oldFocus: $.fn.focus,//Ϊ������jQuery ui��ͻ������ѭ�������ﲻҪȡ��Ϊ'_focus'
	//����Ԫ�ؽ��㣨delay���ӳ�ʱ�䣩
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._oldFocus.apply( this, arguments );
	},
	//��ȡ���ù������Ե� ��Ԫ��
	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}
		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},
	//���û��ȡԪ�صĴ�ֱ����
	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}
		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}
		return 0;
	},
	//����Ԫ�ز�֧�ֱ�ѡ��
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".om-disableSelection", function( event ) {
				event.preventDefault();
			});
	},
	//����Ԫ��֧�ֱ�ѡ��
	enableSelection: function() {
		return this.unbind( ".om-disableSelection" );
	}
});
// ��չinnerWidth��innerHeight��outerWidth��outerHeight������������������ȡֵ��������������ü����Ŀ�ߡ�
$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			// ����innerWidth/innerHeight
			return orig[ "inner" + name ].call( this );
		}
		return this.each(function() {
			// ���ÿ��/�߶� = (size - padding)
			$( this ).css( type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			// ����outerWidth/outerHeight
			return orig[ "outer" + name ].call( this, size );
		}
		return this.each(function() {
			// ���ÿ��/�߶� = (size - padding - border - margin)
			$( this).css( type, reduce( this, size, true, margin ) + "px" );
		});
	};
});
// selectors
function focusable( element, isTabIndexNotNaN ) {
	var nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		var map = element.parentNode,
			mapName = map.name,
			img;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName )
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
		// the element and all of its ancestors must be visible
		&& visible( element );
}
function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}
$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},
	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},
	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});
// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );
	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});
	// �жϵ�ǰ����������Ƿ�֧��minHeight����
	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;
	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});

// deprecated
$.extend( $.om, {
	// $.om.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.om[module].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	}
});

})( jQuery );


(function( $, undefined ) {
// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) { 
			$( elem ).triggerHandler( "om-remove" );
		}
		_cleanData( elems );
	};
}

$.omWidget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;
	// �������name='om.tabs'�����namespace='om',name='tabs',fullName='om-tabs' 
	// baseĬ��ΪWidget�࣬���Ĭ�ϻ�̳�base������з���  
	if ( !prototype ) {
		prototype = base;
		base = $.OMWidget;
	}
	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};
	// ���������ռ�$.om.tabs  
	$[ namespace ] = $[ namespace ] || {};
	// ����Ĺ��캯��
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// ��ʼ�����࣬һ�������$.Widget  
	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//		$.each( basePrototype, function( key, val ) {
//			if ( $.isPlainObject(val) ) {
//				basePrototype[ key ] = $.extend( {}, val );
//			}
//		});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	// ��om.tabs�̳и��������ԭ�ͷ����Ͳ���  
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		// ������¼���ǰ׺������_trigger��ʱ���Ĭ�ϸ�trigger���¼�����ǰ׺  
        // ����_trigger('create')ʵ�ʻᴥ��'tabscreate'�¼�  
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );
	// ��tabs�����ҵ�jquery�����ϣ�Ҳ����$('#tab1').tabs();  
	$.omWidget.bridge( name, $[ namespace ][ name ] );
};

$.omWidget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		// ���tabs������һ��������string���ͣ�����Ϊ�ǵ�������ķ������������options����  
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;
		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;
		// '_'��ͷ�ķ�������Ϊ���ڲ����������ᱻִ�У���$('#tab1').tabs('_init')  
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}
		if ( isMethodCall ) {
			this.each(function() {
				// ִ���������  
				var instance = $.data( this, name );
				if (options == 'options') {
				    returnValue = instance && instance.options;
				    return false;
                } else {
    				var	methodValue = instance && $.isFunction( instance[options] ) ?
    						instance[ options ].apply( instance, args ) : instance;
    				if ( methodValue !== instance && methodValue !== undefined ) {
    					returnValue = methodValue;
    					return false;
    				}
                }
			});
		} else {
			// ���������options����  
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					// ����options���ٴε���_init��������һ�ε�������_createWidget�������档���������Ҫ������ȥʵ�֡�  
                    // ��Ҫ�ǵ��ı������ĳЩ�����������Ҫ����������ػ�  
                    instance._setOptions( options || {} );
				    $.extend(instance.options, options);
					instance._init();
				} else {
					// û��ʵ���Ļ�����������������Ĺ��캯�������ѹ�����ʾ��������dom��data���档ע�������this��dom��object��ģ���� 
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};
$.omWidget.addCreateListener = function(name,fn){
    var temp=name.split( "." );
    $[ temp[0] ][ temp[1] ].prototype.createListeners.push(fn);
};
$.omWidget.addInitListener = function(name,fn){
    var temp=name.split( "." );
    $[ temp[0] ][ temp[1] ].prototype.initListeners.push(fn);
};
$.OMWidget = function( options, element ) {
    this.createListeners=[];
    this.initListeners=[];
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};
$.OMWidget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );
		var self = this;
		//ע�⣬��Ҫ����ǰ�ߵ� "om-"����Ȼ����jquery-ui��ͻ
		this.element.bind( "om-remove._" + this.widgetName, function() {
			self.destroy();
		});
		// ������ʵ��  
		this._create();
		$(this.createListeners).each(function(){
	        this.call(self);
	    });
		// ������˳�ʼ���Ļص��������������ﴥ����ע��󶨵��¼�������Ҫ����ǰ׺�ģ���$('#tab1').bind('tabscreate',function(){});  
		this._trigger( "create" );
		// ������ʵ�� 
		this._init();
		$(this.initListeners).each(function(){
	        this.call(self);
	    });
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},
	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName );
	},
	widget: function() {
		return this.element;
	},
	option: function( key, value ) {
        var options = key;
        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            return $.extend( {}, this.options );
        }
        if  (typeof key === "string" ) {
            if ( value === undefined ) {
                return this.options[ key ]; // ��ȡֵ
            }
            options = {};
            options[ key ] = value;
        }
        this._setOptions( options ); // ����ֵ
        return this;
    },
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});
		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;
		return this;
	},
	
	// $.widget���Ż�����trigger������type�ǻص��¼������ƣ���"onRowClick"��event�Ǵ����ص����¼���ͨ��û������¼���ʱ��null��
	// �������ֻ��������������������������������ֱ��д��event��������
	_trigger: function( type, event ) {
		// ��ȡ��ʼ������config�еĻص�����
		var callback = this.options[ type ];
		// ��װjs��׼event����Ϊjquery��Event����
		event = $.Event( event );
		event.type = type;
		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}
		// ���촫���ص������Ĳ�����event���������
		var newArgs = [],
			argLength = arguments.length;
		for(var i = 2; i < argLength; i++){
			newArgs[i-2] = arguments[i];
		}
		if( argLength > 1){
			newArgs[argLength-2] = arguments[1];
		}
		return !( $.isFunction(callback) &&
			callback.apply( this.element, newArgs ) === false ||
			event.isDefaultPrevented() );
	}
};
})( jQuery );/*
 * $Id: om-mouse.js,v 1.3 2012/03/29 06:01:25 chentianzhen Exp $
 * operamasks-ui omMouse 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-core.js
 */
(function( $, undefined ) {

$.omWidget("om.omMouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
				    $.removeData(event.target, self.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		// TODO: figure out why we have to use originalEvent
		event.originalEvent = event.originalEvent || {};
		if (event.originalEvent.mouseHandled) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();
		event.originalEvent.mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target == this._mouseDownEvent.target) {
			    $.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);
/*
 * $Id: om-position.js,v 1.2 2012/03/29 06:02:46 chentianzhen Exp $
 * operamasks-ui omPosition 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */
(function( $, undefined ) {

$.om = $.om || {};

var horizontalPositions = /left|center|right/,
	verticalPositions = /top|center|bottom/,
	center = "center",
	_position = $.fn.position,
	_offset = $.fn.offset;

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var target = $( options.of ),
		targetElem = target[0],
		collision = ( options.collision || "flip" ).split( " " ),
		offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
		targetWidth,
		targetHeight,
		basePosition;

	if ( targetElem.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: 0, left: 0 };
	// TODO: use $.isWindow() in 1.9
	} else if ( targetElem.setTimeout ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( targetElem.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		basePosition = { top: options.of.pageY, left: options.of.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		basePosition = target.offset();
	}

	// force my and at to have valid horizontal and veritcal positions
	// if a value is missing or invalid, it will be converted to center 
	$.each( [ "my", "at" ], function() {
		var pos = ( options[this] || "" ).split( " " );
		if ( pos.length === 1) {
			pos = horizontalPositions.test( pos[0] ) ?
				pos.concat( [center] ) :
				verticalPositions.test( pos[0] ) ?
					[ center ].concat( pos ) :
					[ center, center ];
		}
		pos[ 0 ] = horizontalPositions.test( pos[0] ) ? pos[ 0 ] : center;
		pos[ 1 ] = verticalPositions.test( pos[1] ) ? pos[ 1 ] : center;
		options[ this ] = pos;
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	// normalize offset option
	offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
	if ( offset.length === 1 ) {
		offset[ 1 ] = offset[ 0 ];
	}
	offset[ 1 ] = parseInt( offset[1], 10 ) || 0;

	if ( options.at[0] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[0] === center ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[1] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[1] === center ) {
		basePosition.top += targetHeight / 2;
	}

	basePosition.left += offset[ 0 ];
	basePosition.top += offset[ 1 ];

	return this.each(function() {
		var elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseInt( $.curCSS( this, "marginLeft", true ) ) || 0,
			marginTop = parseInt( $.curCSS( this, "marginTop", true ) ) || 0,
			collisionWidth = elemWidth + marginLeft +
				( parseInt( $.curCSS( this, "marginRight", true ) ) || 0 ),
			collisionHeight = elemHeight + marginTop +
				( parseInt( $.curCSS( this, "marginBottom", true ) ) || 0 ),
			position = $.extend( {}, basePosition ),
			collisionPosition;

		if ( options.my[0] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[0] === center ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[1] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[1] === center ) {
			position.top -= elemHeight / 2;
		}

		// prevent fractions (see #5280)
		position.left = Math.round( position.left );
		position.top = Math.round( position.top );

		collisionPosition = {
			left: position.left - marginLeft,
			top: position.top - marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.om.omPosition[ collision[i] ] ) {
				$.om.omPosition[ collision[i] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: offset,
					my: options.my,
					at: options.at
				});
			}
		});

		if ( $.fn.bgiframe ) {
			elem.bgiframe();
		}
		elem.offset( $.extend( position, { using: options.using } ) );
	});
};

$.om.omPosition = {
	fit: {
		left: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
			position.left = over > 0 ? position.left - over : Math.max( position.left - data.collisionPosition.left, position.left );
		},
		top: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
			position.top = over > 0 ? position.top - over : Math.max( position.top - data.collisionPosition.top, position.top );
		}
	},

	flip: {
		left: function( position, data ) {
			if ( data.at[0] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					-data.targetWidth,
				offset = -2 * data.offset[ 0 ];
			position.left += data.collisionPosition.left < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		},
		top: function( position, data ) {
			if ( data.at[1] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
				myOffset = data.my[ 1 ] === "top" ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[ 1 ];
			position.top += data.collisionPosition.top < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		}
	}
};

// offset setter from jQuery 1.4
if ( !$.offset.setOffset ) {
	$.offset.setOffset = function( elem, options ) {
		// set position first, in-case top/left are set even on static elem
		if ( /static/.test( $.curCSS( elem, "position" ) ) ) {
			elem.style.position = "relative";
		}
		var curElem   = $( elem ),
			curOffset = curElem.offset(),
			curTop    = parseInt( $.curCSS( elem, "top",  true ), 10 ) || 0,
			curLeft   = parseInt( $.curCSS( elem, "left", true ), 10)  || 0,
			props     = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
		
		if ( 'using' in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	};

	$.fn.offset = function( options ) {
		var elem = this[ 0 ];
		if ( !elem || !elem.ownerDocument ) { return null; }
		if ( options ) { 
			return this.each(function() {
				$.offset.setOffset( this, options );
			});
		}
		return _offset.call( this );
	};
}

}( jQuery ));
/*
 * $Id: om-draggable.js,v 1.17 2012/03/29 06:03:09 chentianzhen Exp $
 * operamasks-ui omTree 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *	om-core.js
 *	om-mouse.js
 */
/** 
     * @name omDraggable
     * @class �����ṩ�϶�����.<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     * 		<li>�������������á�</li>
     * 		<li>�������϶��ķ�Χ������</li>
     * 		<li>���Զ���������϶�ʱ����ʽ��</li>
     * </ol>
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#selector').omDraggable();
     * });
     * &lt;/script&gt;
     * 
     * &lt;div id="selector"&gt;
	 * &lt;/div&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
;(function( $, undefined ) {

$.omWidget("om.omDraggable", $.om.omMouse, {
	widgetEventPrefix: "drag",
	options: {
		/**
         * ָ���϶��ķ���,�ṩ��ȡֵ�С�x������y����Ĭ�ϲ�ָ�����򣬿��������϶���
         * @name omDraggable#axis
         * @type String
         * @default ��
         * @example
         * //ֻ������x��ķ����϶�
         * $("#selector").omDraggable({axis:"x"});
         */
		axis: false,
		/**
         * �����϶��ķ�Χ,�����϶����÷�Χ����ĵط���Ĭ�ϲ�ָ���϶��ķ�Χ�����������϶���
         * ��ֵ�����ǣ���parent������document������window����[x1,y1,x2,y2]�ȡ�
         * @name omDraggable#containment
         * @type Selector,Element,String,Array
         * @default ��
         * @example
         * //ֻ������һ����Ԫ�ط�Χ���϶�
         * $("#selector").omDraggable({containment:"parent"});
         */
		containment: false,
		/**
         * ��������϶�ʱ����ʽ����ֵΪCSS��cursor���Ե�ȡֵ��
         * @name omDraggable#cursor
         * @type String
         * @default ��auto��
         * @example
         * //�϶�Ԫ��ʱ��������ʮ��״
         * $("#selector").omDraggable({cursor:"crosshair"});
         */
		cursor: "auto",
		/**
         * ���������϶�����������
         * @name omDraggable#cancel
         * @type Selector
         * @default :input,option
         * @example
         * //$("#selector")����Ԫ�ص�&lt;p /&gt�����ܹ������϶�����
         * $("#selector").omDraggable({cancel:"p"});
         */
		_scope:"default",
		/**
         * �ܹ������϶�����������Ĭ�ϲ�ָ�������϶�Ԫ���ڵ��������򶼿��������϶�������
         * @name omDraggable#handle
         * @type Selector
         * @default ��
         * @example
         * //ֻ��$("#selector")����Ԫ�ص�&lt;p /&gt�ڲ��ܹ������϶�����
         * $("#selector").omDraggable({handle:"p"});
         */
		handle: false,
		/**
         * �ṩһ��������Ԫ����ΪԪ�ر��϶�ʱ��չ�֣�Ĭ��Ϊ���϶�Ԫ�ر�����Ϊ�϶�ʱ��չ��Ԫ�ء�
         * @name omDraggable#helper
         * @type String,function
         * @default "original"
         * @example
         * //$("#selector")��cloneԪ�ؽ���Ϊ����Ԫ��
         * $("#selector").omDraggable({helper:"clone"});
         */
		helper: "original",
		/**
         * ���õ��϶�������Ԫ���Ƿ�᷵�ص���ʼλ�á�Ĭ��Ϊfalse�����᷵�أ���֮Ϊtrueʱ�����ص���ʼλ�á�
         * String���͵�ȡֵ�У���valid������invalid���������ֵΪ��invalid������Ԫ��û���϶���Ŀ��λ��ʱ���أ���֮Ϊ��valid��
         * ʱ����Ԫ���϶���Ŀ��λ�÷��ء�
         * @name omDraggable#revert
         * @type Boolean,String
         * @default false
         * @example
         * //Ԫ��û���϶���Ŀ��λ��ʱ�����ص�ԭλ��
         * $("#selector").omDraggable({revert:"invalid"});
         */
		revert: false,
		/**
		 * �Ƿ���϶���
		 * @name omDraggable#disabled
         * @type Boolean
         * @default false
         * @example
         * //Ԫ�ز����϶�
         * $("#selector").omDraggable({disabled:true});
         */

		/**
		 * �϶�Ԫ��ʱ���Ƿ��Զ�������
		 * @name omDraggable#scroll
         * @type Boolean
         * @default true
         * @example
         * //�϶�Ԫ��ʱ�����Զ�����
         * $("#selector").omDraggable({scroll:false});
         */
		scroll: true
		
		/**
         * ��ʼ�϶�ʱ�����¼���
         * @event
         * @param ui Objec���󡣰����ĸ����ԣ�helper��position(��ǰλ��)��originalPosition(ԭʼλ��)��offset(ƫ����)
         * @param event jQuery.Event����
         * @name omDraggable#onStart
         * @type Function
         * @example
         *   $("#selector").omDraggable({onStart : function(ui, event) {doSomething...}});
         */
		
		/**
         * �϶�ʱ�����¼���������Ϊfalseʱ����ȡ���϶�������
         * @event
         * @param ui Objec���󡣰����ĸ����ԣ�helper��position(��ǰλ��)��originalPosition(ԭʼλ��)��offset(ƫ����)
         * @param event jQuery.Event����
         * @name omDraggable#onDrag
         * @type Function
         * @example
         *   $("#selector").omDraggable({onDrag : function(ui, event) {doSomething...}});
         */
		
		/**
         * ֹͣ�϶�ʱ�����¼���
         * @event
         * @param ui Objec���󡣰����ĸ����ԣ�helper��position(��ǰλ��)��originalPosition(ԭʼλ��)��offset(ƫ����)
         * @param event jQuery.Event����
         * @name omDraggable#onStop
         * @type Function
         * @example
         *   $("#selector").omDraggable({onStop : function(ui, event) {doSomething...}});
         */
	},
	_create: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		this.element.addClass("om-draggable");
		(this.options.disabled && this.element.addClass("om-draggable-disabled"));

		this._mouseInit();

	},

	/**
     * ɾ��Ԫ�ص��϶�����.
     * @name omDraggable#destroy
     * @function
     * @returns JQuery����
     * @example
     * var $selector = $("#selector").omDraggable('destroy');
     * 
     */
	destroy: function() {
		if(!this.element.data('omDraggable')) return;
		this.element
			.removeData("omDraggable")
			.unbind(".draggable")
			.removeClass("om-draggable"
				+ " om-draggable-dragging"
				+ " om-draggable-disabled");
		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).is('.om-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;
		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.om.ddmanager)
			$.om.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("onStart", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.om.ddmanager && !o.dropBehaviour)
			$.om.ddmanager.prepareOffsets(this, event);

		this.helper.addClass("om-draggable-dragging");
		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		
		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.om.ddmanager ) $.om.ddmanager.dragStart(this, event);
		
		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger('onDrag', event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.om.ddmanager) $.om.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.om.ddmanager && !this.options.dropBehaviour)
			dropped = $.om.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}
		
		//if the original element is removed, don't bother to continue if helper is set to "original"
		if((!this.element[0] || !this.element[0].parentNode) && this.options.helper == "original")
			return false;

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var self = this;
			$(this.helper).animate(this.originalPosition, 500, function() {
				if(self._trigger("onStop", event) !== false) {
					self._clear();
				}
			});
		} else {
			if(this._trigger("onStop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},
	
	_mouseUp: function(event) {
		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.om.ddmanager ) $.om.ddmanager.dragStop(this, event);
		
		return $.om.omMouse.prototype._mouseUp.call(this, event);
	},
	
	cancel: function() {
		
		if(this.helper.is(".om-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}
		
		return this;
		
	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);

		if(!helper.parents('body').length)
			helper.appendTo( this.element[0].parentNode);

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

		return helper;

	},

	

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
			o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
		        var c = $(o.containment);
			var ce = c[0]; if(!ce) return;
			var co = c.offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				(parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0),
				(parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0),
				(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
				(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top  - this.margins.bottom
			];
			this.relative_container = c;

		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
		         var containment;
		         if(this.containment) {
				 if (this.relative_container){
				     var co = this.relative_container.offset();
				     containment = [ this.containment[0] + co.left,
						     this.containment[1] + co.top,
						     this.containment[2] + co.left,
						     this.containment[3] + co.top ];
				 }
				 else {
				     containment = this.containment;
				 }

				if(event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("om-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.om.ddmanager) $.om.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.om.plugin.call(this, type, [event, ui]);
		if(type == "onDrag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.OMWidget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function(event) {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.om.plugin.add("omDraggable", "cursor", {
	onStart: function(ui, event) {
		var t = $('body'), o = $(this).data('omDraggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	onStop: function(ui, event) {
	    var drag = $(this).data('omDraggable');
	    if(drag){
	        var o = drag.options;
	        if (o._cursor) $('body').css("cursor", o._cursor);
	    }
	}
});

$.om.plugin.add("omDraggable", "scroll", {
	onStart: function(ui, event) {
		var i = $(this).data("omDraggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	onDrag: function(ui, event) {
		
		var i = $(this).data("omDraggable"), o = i.options, scrolled = false, scrollSensitivity = 20, scrollSpeed = 20;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + scrollSpeed);
			}

		}

		if(scrolled !== false && $.om.ddmanager && !o.dropBehaviour)
			$.om.ddmanager.prepareOffsets(i, event);

	}
});

})(jQuery);
/*
 * $Id: om-droppable.js,v 1.12 2012/03/15 07:16:12 wangfan Exp $
 * operamasks-ui omTree 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *	om-core.js
 *	om-mouse.js
 *	om-draggable.js
 */
/** 
     * @name omDroppable
     * @class �����ṩ���ù��ܡ�<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     * 		<li>�������������á�</li>
     * 		<li>�ɶ������Ԫ�صķ�Χ��</li>
     * </ol>
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#selector').omDroppable();
     * });
     * &lt;/script&gt;
     * 
     * &lt;div id="selector"&gt;
	 * &lt;/div&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
;(function( $, undefined ) {

$.omWidget("om.omDroppable", {
	widgetEventPrefix: "drop",
	options: {
		/**
         * ָ�����Խ��ܵ��϶�Ԫ�أ�Ĭ������Ԫ�ض����Ա����ܡ�
         * @name omDroppable#accept
         * @type Selector��function
         * @default "*"
         * @example
         * //ֻ����idΪdraggable��Ԫ��
         * $("#selector").omDroppable({accept:"#draggable"});
         */
		accept: '*',
		/**
         * ���ɽ��ܵ�Ԫ�ر��϶�ʱ����ӵ�droppableԪ���ϵ���ʽ��
         * @name omDroppable#activeClass
         * @type String
         * @default ��
         * @example
         * $("#selector").omDroppable({activeClass:"om-state-highlight"});
         */
		activeClass: false,
		/**
         * ָ���Ƿ���Ƕ�׵�droppableԪ������ֹ�¼�������Ĭ��Ϊfalse������ֹ�¼�����������Ϊtrueʱ����ֹ�¼�������
         * @name omDroppable#greedy
         * @type Boolean
         * @default false
         * @example
         * $("#selector").omDroppable({greedy:true});
         */
		greedy: false,
		/**
         * ���ɽ��ܵ�Ԫ����ͣ��droppableԪ����ʱ����ӵ�droppableԪ���ϵ���ʽ��
         * @name omDroppable#hoverClass
         * @type String
         * @default ��
         * @example
         * $("#selector").omDroppable({hoverClass:"om-state-hover"});
         */
		hoverClass: false,
		_scope: 'default'
		/**
		 * ���÷��ù����Ƿ���á�
		 * @name omDroppable#disabled
         * @type Boolean
         * @default false
         * @example
         * $("#selector").omDroppable({disabled:true});
         */
		
		/**
         * �ɽ��ܵ�Ԫ�ؿ�ʼ�϶�ʱ�����¼���
         * @event
         * @param source ���϶���DomԪ�ء�
         * @param event jQuery.Event����
         * @name omDroppable#onDragStart
         * @type Function
         * @example
         *   $("#selector").omDroppable({onDragStart : function(source, event) {doSomething...}});
         */
			
		/**
         * �϶�Ԫ�ؿ��Է���ʱ�����¼���
         * @event
         * @param source ���϶���DomԪ�ء�
         * @param event jQuery.Event����
         * @name omDroppable#onDragOver
         * @type Function
         * @example
         *   $("#selector").omDroppable({onDragOver : function(source, event) {doSomething...}});
         */
			
		/**
         * �϶�Ԫ���Ƴ��ɷ���λ��ʱ�����¼���
         * @event
         * @param source ���϶���DomԪ�ء�
         * @param event jQuery.Event����
         * @name omDroppable#onDragOut
         * @type Function
         * @example
         *   $("#selector").omDroppable({onDragOut : function(source, event) {doSomething...}});
         */
		
		/**
         * �϶���Ԫ�سɹ�����ʱ�����¼���
         * @event
         * @param source ���϶���DomԪ�ء�
         * @param event jQuery.Event����
         * @name omDroppable#onDrop
         * @type Function
         * @example
         *   $("#selector").omDroppable({onDrop : function(source, event) {doSomething...}});
         */
	},
	_create: function() {

		var o = this.options, accept = o.accept;
		this.isover = 0; this.isout = 1;

		this.accept = $.isFunction(accept) ? accept : function(d) {
			return d.is(accept);
		};

		//Store the droppable's proportions
		this.proportions = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight };

		// Add the reference and positions to the manager
		$.om.ddmanager.droppables[o._scope] = $.om.ddmanager.droppables[o._scope] || [];
		$.om.ddmanager.droppables[o._scope].push(this);

		this.element.addClass("om-droppable");

	},
	
	/**
     * ɾ��Ԫ�صķ��ù��ܡ�
     * @name omDroppable#destroy
     * @function
     * @returns JQuery����
     * @example
     * var $selector = $("#selector").omDroppable('destroy');
     * 
     */
	destroy: function() {
		var drop = $.om.ddmanager.droppables[this.options._scope];
		for ( var i = 0; i < drop.length; i++ )
			if ( drop[i] == this )
				drop.splice(i, 1);

		this.element
			.removeClass("om-droppable om-droppable-disabled")
			.removeData("omDroppable")
			.unbind(".droppable");

		return this;
	},

	_setOption: function(key, value) {

		if(key == 'accept') {
			this.accept = $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		}
		$.OMWidget.prototype._setOption.apply(this, arguments);
	},

	_activate: function(event) {
		var draggable = $.om.ddmanager.current;
		if(this.options.activeClass) this.element.addClass(this.options.activeClass);
		(draggable && this._trigger('onDragStart', event, draggable.currentItem || draggable.element));
	},

	_deactivate: function(event) {
		var draggable = $.om.ddmanager.current;
		if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
		//(draggable && this._trigger('onDeactivate', event, draggable.currentItem || draggable.element));
	},

	_over: function(event) {

		var draggable = $.om.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.addClass(this.options.hoverClass);
			this._trigger('onDragOver', event, draggable.currentItem || draggable.element);
		}

	},

	_out: function(event) {

		var draggable = $.om.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('onDragOut', event, draggable.currentItem || draggable.element);
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.om.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return false; // Bail if draggable and droppable are same element

		var childrenIntersection = false;
		this.element.find(":data(omDroppable)").not(".om-draggable-dragging").each(function() {
			var inst = $.data(this, 'omDroppable');
			if(
				inst.options.greedy
				&& !inst.options.disabled
				&& inst.options._scope == draggable.options._scope
				&& inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element))
				&& $.om.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }))
			) { childrenIntersection = true; return false; }
		});
		if(childrenIntersection) return false;

		if(this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('onDrop', event, draggable.currentItem || draggable.element);
			return this.element;
		}

		return false;

	}

});


$.om.intersect = function(draggable, droppable) {

	if (!droppable.offset) return false;

	var x1 = (draggable.positionAbs || draggable.position.absolute).left, x2 = x1 + draggable.helperProportions.width,
		y1 = (draggable.positionAbs || draggable.position.absolute).top, y2 = y1 + draggable.helperProportions.height;
	var l = droppable.offset.left, r = l + droppable.proportions.width,
		t = droppable.offset.top, b = t + droppable.proportions.height;
	return (l < x1 + (draggable.helperProportions.width / 2) // Right Half
		&& x2 - (draggable.helperProportions.width / 2) < r // Left Half
		&& t < y1 + (draggable.helperProportions.height / 2) // Bottom Half
		&& y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
};

/*
	This manager tracks offsets of draggables and droppables
*/
$.om.ddmanager = {
	current: null,
	droppables: { 'default': [] },
	prepareOffsets: function(t, event) {

		var m = $.om.ddmanager.droppables[t.options._scope] || [];
		var type = event ? event.type : null; // workaround for #2317
		var list = (t.currentItem || t.element).find(":data(omDroppable)").andSelf();

		droppablesLoop: for (var i = 0; i < m.length; i++) {

			if(m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0],(t.currentItem || t.element)))) continue;	//No disabled and non-accepted
			for (var j=0; j < list.length; j++) { if(list[j] == m[i].element[0]) { m[i].proportions.height = 0; continue droppablesLoop; } }; //Filter out elements in the current dragged item
			m[i].visible = m[i].element.css("display") != "none"; if(!m[i].visible) continue; 									//If the element is not visible, continue

			if(type == "mousedown") m[i]._activate.call(m[i], event); //Activate the droppable if used directly from draggables

			m[i].offset = m[i].element.offset();
			m[i].proportions = { width: m[i].element[0].offsetWidth, height: m[i].element[0].offsetHeight };

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		$.each($.om.ddmanager.droppables[draggable.options._scope] || [], function() {

			if(!this.options) return;
			if (!this.options.disabled && this.visible && $.om.intersect(draggable, this))
				dropped = dropped || this._drop.call(this, event);

			if (!this.options.disabled && this.visible && this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = 1; this.isover = 0;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		//Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if( !draggable.options.refreshPositions ) $.om.ddmanager.prepareOffsets( draggable, event );
		});
	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) $.om.ddmanager.prepareOffsets(draggable, event);

		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.om.ddmanager.droppables[draggable.options._scope] || [], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) return;
			var intersects = $.om.intersect(draggable, this);

			var c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
			if(!c) return;

			var parentInstance;
			if (this.options.greedy) {
				var parent = this.element.parents(':data(omDroppable):eq(0)');
				if (parent.length) {
					parentInstance = $.data(parent[0], 'omDroppable');
					parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c == 'isover') {
				parentInstance['isover'] = 0;
				parentInstance['isout'] = 1;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = 1; this[c == 'isout' ? 'isover' : 'isout'] = 0;
			this[c == "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c == 'isout') {
				parentInstance['isout'] = 0;
				parentInstance['isover'] = 1;
				parentInstance._over.call(parentInstance, event);
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		//Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if( !draggable.options.refreshPositions ) $.om.ddmanager.prepareOffsets( draggable, event );
	}
};

})(jQuery);
/*
 * $Id: om-resizable.js,v 1.5 2012/03/29 06:04:00 chentianzhen Exp $
 * operamasks-ui omResizable 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-core.js
 *  om-mouse.js
 */
(function( $, undefined ) {

$.omWidget("om.omResizable", $.om.omMouse, {
	widgetEventPrefix: "resize",    
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		zIndex: 1000
	},
	_create: function() {

		var self = this, o = this.options;
		this.element.addClass("om-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || 'om-resizable-helper' : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Opera fix for relative positioning
			if (/relative/.test(this.element.css('position')) && $.browser.opera)
				this.element.css({ position: 'relative', top: 'auto', left: 'auto' });

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$('<div class="om-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css('position'),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css('top'),
					left: this.element.css('left')
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"resizable", this.element.data('resizable')
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css('resize');
			this.originalElement.css('resize', 'none');

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: 'static', zoom: 1, display: 'block' }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css('margin') });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$('.om-resizable-handle', this.element).length ? "e,s,se" : { n: '.om-resizable-n', e: '.om-resizable-e', s: '.om-resizable-s', w: '.om-resizable-w', se: '.om-resizable-se', sw: '.om-resizable-sw', ne: '.om-resizable-ne', nw: '.om-resizable-nw' });
		if(this.handles.constructor == String) {

			if(this.handles == 'all') this.handles = 'n,e,s,w,se,sw,ne,nw';
			var n = this.handles.split(","); this.handles = {};

			for(var i = 0; i < n.length; i++) {

				var handle = $.trim(n[i]), hname = 'om-resizable-'+handle;
				var axis = $('<div class="om-resizable-handle ' + hname + '"></div>');

				// increase zIndex of sw, se, ne, nw axis
				//TODO : this modifies original option
				if(/sw|se|ne|nw/.test(handle)) axis.css({ zIndex: ++o.zIndex });

				//TODO : What's going on here?
				if ('se' == handle) {
					axis.addClass('om-icon om-icon-gripsmall-diagonal-se');
				};

				//Insert into internal handles object and append to element
				this.handles[handle] = '.om-resizable-'+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			target = target || this.element;

			for(var i in this.handles) {

				if(this.handles[i].constructor == String)
					this.handles[i] = $(this.handles[i], this.element).show();

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					var axis = $(this.handles[i], this.element), padWrapper = 0;

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					var padPos = [ 'padding',
						/ne|nw|n/.test(i) ? 'Top' :
						/se|sw|s/.test(i) ? 'Bottom' :
						/^e$/.test(i) ? 'Right' : 'Left' ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length)
					continue;

			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $('.om-resizable-handle', this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!self.resizing) {
				if (this.className)
					var axis = this.className.match(/om-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				//Axis, default = se
				self.axis = axis && axis[1] ? axis[1] : 'se';
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("om-resizable-autohide")
				.hover(function() {
					if (o.disabled) return;
					$(this).removeClass("om-resizable-autohide");
					self._handles.show();
				},
				function(){
					if (o.disabled) return;
					if (!self.resizing) {
						$(this).addClass("om-resizable-autohide");
						self._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	destroy: function() {

		this._mouseDestroy();

		var _destroy = function(exp) {
			$(exp).removeClass("om-resizable om-resizable-disabled om-resizable-resizing")
				.removeData("resizable").unbind(".resizable").find('.om-resizable-handle').remove();
		};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			var wrapper = this.element;
			wrapper.after(
				this.originalElement.css({
					position: wrapper.css('position'),
					width: wrapper.outerWidth(),
					height: wrapper.outerHeight(),
					top: wrapper.css('top'),
					left: wrapper.css('left')
				})
			).remove();
		}

		this.originalElement.css('resize', this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var handle = false;
		for (var i in this.handles) {
			if ($(this.handles[i])[0] == event.target) {
				handle = true;
			}
		}

		return !this.options.disabled && handle;
	},

	_mouseStart: function(event) {

		var o = this.options, iniPos = this.element.position(), el = this.element;

		this.resizing = true;
		this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

		// bugfix for http://dev.jquery.com/ticket/1749
		if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
			el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
		}

		//Opera fixing relative position
		if ($.browser.opera && (/relative/).test(el.css('position')))
			el.css({ position: 'relative', top: 'auto', left: 'auto' });

		this._renderProxy();

		var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

	    var cursor = $('.om-resizable-' + this.axis).css('cursor');
	    $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

		el.addClass("om-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var el = this.helper, o = this.options, props = {},
			self = this, smp = this.originalMousePosition, a = this.axis;

		var dx = (event.pageX-smp.left)||0, dy = (event.pageY-smp.top)||0;
		var trigger = this._change[a];
		if (!trigger) return false;

		// Calculate the attrs that will be change
		var data = trigger.apply(this, [event, dx, dy]), ie6 = $.browser.msie && $.browser.version < 7, csdif = this.sizeDiff;

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey)
			data = this._updateRatio(data, event);

		data = this._respectSize(data, event);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		el.css({
			top: this.position.top + "px", left: this.position.left + "px",
			width: this.size.width + "px", height: this.size.height + "px"
		});

		if (!this._helper && this._proportionallyResizeElements.length)
			this._proportionallyResize();

		this._updateCache(data);

		// calling the user callback at the end
		this._trigger('resize', event, this.ui());

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var o = this.options, self = this;

		if(this._helper) {
			var pr = this._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
				soffseth = ista && self._hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
				soffsetw = ista ? 0 : self.sizeDiff.width;

			var s = { width: (self.helper.width()  - soffsetw), height: (self.helper.height() - soffseth) },
				left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
				top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

			if (!o.animate)
				this.element.css($.extend(s, { top: top, left: left }));

			self.helper.height(self.size.height);
			self.helper.width(self.size.width);

			if (this._helper && !o.animate) this._proportionallyResize();
		}

		$('body').css('cursor', 'auto');

		this.element.removeClass("om-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) this.helper.remove();
		return false;

	},

    _updateVirtualBoundaries: function(forceAspectRatio) {
        var o = this.options, pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b;

        b = {
            minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
            maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
            minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
            maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
        };

        if(this._aspectRatio || forceAspectRatio) {
            // We want to create an enclosing box whose aspect ration is the requested one
            // First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
            pMinWidth = b.minHeight * this.aspectRatio;
            pMinHeight = b.minWidth / this.aspectRatio;
            pMaxWidth = b.maxHeight * this.aspectRatio;
            pMaxHeight = b.maxWidth / this.aspectRatio;

            if(pMinWidth > b.minWidth) b.minWidth = pMinWidth;
            if(pMinHeight > b.minHeight) b.minHeight = pMinHeight;
            if(pMaxWidth < b.maxWidth) b.maxWidth = pMaxWidth;
            if(pMaxHeight < b.maxHeight) b.maxHeight = pMaxHeight;
        }
        this._vBoundaries = b;
    },

	_updateCache: function(data) {
		var o = this.options;
		this.offset = this.helper.offset();
		if (isNumber(data.left)) this.position.left = data.left;
		if (isNumber(data.top)) this.position.top = data.top;
		if (isNumber(data.height)) this.size.height = data.height;
		if (isNumber(data.width)) this.size.width = data.width;
	},

	_updateRatio: function(data, event) {

		var o = this.options, cpos = this.position, csize = this.size, a = this.axis;

		if (isNumber(data.height)) data.width = (data.height * this.aspectRatio);
		else if (isNumber(data.width)) data.height = (data.width / this.aspectRatio);

		if (a == 'sw') {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a == 'nw') {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function(data, event) {

		var el = this.helper, o = this._vBoundaries, pRatio = this._aspectRatio || event.shiftKey, a = this.axis,
				ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
					isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);

		if (isminw) data.width = o.minWidth;
		if (isminh) data.height = o.minHeight;
		if (ismaxw) data.width = o.maxWidth;
		if (ismaxh) data.height = o.maxHeight;

		var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
		var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

		if (isminw && cw) data.left = dw - o.minWidth;
		if (ismaxw && cw) data.left = dw - o.maxWidth;
		if (isminh && ch)	data.top = dh - o.minHeight;
		if (ismaxh && ch)	data.top = dh - o.maxHeight;

		// fixing jump error on top/left - bug #2330
		var isNotwh = !data.width && !data.height;
		if (isNotwh && !data.left && data.top) data.top = null;
		else if (isNotwh && !data.top && data.left) data.left = null;

		return data;
	},

	_proportionallyResize: function() {

		var o = this.options;
		if (!this._proportionallyResizeElements.length) return;
		var element = this.helper || this.element;

		for (var i=0; i < this._proportionallyResizeElements.length; i++) {

			var prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')],
					p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];

				this.borderDif = $.map(b, function(v, i) {
					var border = parseInt(v,10)||0, padding = parseInt(p[i],10)||0;
					return border + padding;
				});
			}

			if ($.browser.msie && !(!($(element).is(':hidden') || $(element).parents(':hidden').length)))
				continue;

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		};

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $('<div style="overflow:hidden;"></div>');

			// fix ie6 offset TODO: This seems broken
			var ie6 = $.browser.msie && $.browser.version < 7, ie6offset = (ie6 ? 1 : 0),
			pxyoffset = ( ie6 ? 2 : -1 );

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() + pxyoffset,
				height: this.element.outerHeight() + pxyoffset,
				position: 'absolute',
				left: this.elementOffset.left - ie6offset +'px',
				top: this.elementOffset.top - ie6offset +'px',
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx, dy) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.om.plugin.call(this, n, [event, this.ui()]);
		(n != "resize" && this._trigger(n, event, this.ui()));
	},

	// only used by resizable, remove from om-core.js
    _hasScroll: function( el, a ) {
        //If overflow is hidden, the element might have extra content, but the user wants to hide it
        if ( $( el ).css( "overflow" ) === "hidden") {
            return false;
        }
        var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
            has = false;
        if ( el[ scroll ] > 0 ) {
            return true;
        }
        // TODO: determine which cases actually cause this to happen
        // if the element doesn't have the scroll set, see if it's possible to
        // set the scroll
        el[ scroll ] = 1;
        has = ( el[ scroll ] > 0 );
        el[ scroll ] = 0;
        return has;
    },
	
	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

$.extend($.om.resizable, {
	version: "1.1"
});

/*
 * Resizable Extensions
 */

$.om.plugin.add("omResizable", "alsoResize", {

	start: function (event, ui) {
		var self = $(this).data("omResizable"), o = self.options;

		var _store = function (exp) {
			$(exp).each(function() {
				var el = $(this);
				el.data("resizable-alsoresize", {
					width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
					left: parseInt(el.css('left'), 10), top: parseInt(el.css('top'), 10),
					position: el.css('position') // to reset Opera on stop()
				});
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
			else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function (event, ui) {
		var self = $(this).data("omResizable"), o = self.options, os = self.originalSize, op = self.originalPosition;

		var delta = {
			height: (self.size.height - os.height) || 0, width: (self.size.width - os.width) || 0,
			top: (self.position.top - op.top) || 0, left: (self.position.left - op.left) || 0
		},

		_alsoResize = function (exp, c) {
			$(exp).each(function() {
				var el = $(this), start = $(this).data("resizable-alsoresize"), style = {}, 
					css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ['width', 'height'] : ['width', 'height', 'top', 'left'];

				$.each(css, function (i, prop) {
					var sum = (start[prop]||0) + (delta[prop]||0);
					if (sum && sum >= 0)
						style[prop] = sum || null;
				});

				// Opera fixing relative position
				if ($.browser.opera && /relative/.test(el.css('position'))) {
					self._revertToRelativePosition = true;
					el.css({ position: 'absolute', top: 'auto', left: 'auto' });
				}

				el.css(style);
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function (event, ui) {
		var self = $(this).data("omResizable"), o = self.options;

		var _reset = function (exp) {
			$(exp).each(function() {
				var el = $(this);
				// reset position for Opera - no need to verify it was changed
				el.css({ position: el.data("resizable-alsoresize").position });
			});
		};

		if (self._revertToRelativePosition) {
			self._revertToRelativePosition = false;
			if (typeof(o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
				$.each(o.alsoResize, function (exp) { _reset(exp); });
			}else{
				_reset(o.alsoResize);
			}
		}

		$(this).removeData("resizable-alsoresize");
	}
});

$.om.plugin.add("omResizable", "animate", {

	stop: function(event, ui) {
		var self = $(this).data("omResizable"), o = self.options;

		var pr = self._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
					soffseth = ista && self._hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
						soffsetw = ista ? 0 : self.sizeDiff.width;

		var style = { width: (self.size.width - soffsetw), height: (self.size.height - soffseth) },
					left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
						top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

		self.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(self.element.css('width'), 10),
						height: parseInt(self.element.css('height'), 10),
						top: parseInt(self.element.css('top'), 10),
						left: parseInt(self.element.css('left'), 10)
					};

					if (pr && pr.length) $(pr[0]).css({ width: data.width, height: data.height });

					// propagating resize, and updating values for each animation step
					self._updateCache(data);
					self._propagate("resize", event);

				}
			}
		);
	}

});

$.om.plugin.add("omResizable", "containment", {

	start: function(event, ui) {
		var self = $(this).data("omResizable"), o = self.options, el = self.element;
		var oc = o.containment,	ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
		if (!ce) return;

		self.containerElement = $(ce);

		if (/document/.test(oc) || oc == document) {
			self.containerOffset = { left: 0, top: 0 };
			self.containerPosition = { left: 0, top: 0 };

			self.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			var element = $(ce), p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			self.containerOffset = element.offset();
			self.containerPosition = element.position();
			self.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			var co = self.containerOffset, ch = self.containerSize.height,	cw = self.containerSize.width,
						width = (self._hasScroll(ce, "left") ? ce.scrollWidth : cw ), height = (self._hasScroll(ce) ? ce.scrollHeight : ch);

			self.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function(event, ui) {
		var self = $(this).data("omResizable"), o = self.options,
				ps = self.containerSize, co = self.containerOffset, cs = self.size, cp = self.position,
				pRatio = self._aspectRatio || event.shiftKey, cop = { top:0, left:0 }, ce = self.containerElement;

		if (ce[0] != document && (/static/).test(ce.css('position'))) cop = co;

		if (cp.left < (self._helper ? co.left : 0)) {
			self.size.width = self.size.width + (self._helper ? (self.position.left - co.left) : (self.position.left - cop.left));
			if (pRatio) self.size.height = self.size.width / o.aspectRatio;
			self.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (self._helper ? co.top : 0)) {
			self.size.height = self.size.height + (self._helper ? (self.position.top - co.top) : self.position.top);
			if (pRatio) self.size.width = self.size.height * o.aspectRatio;
			self.position.top = self._helper ? co.top : 0;
		}

		self.offset.left = self.parentData.left+self.position.left;
		self.offset.top = self.parentData.top+self.position.top;

		var woset = Math.abs( (self._helper ? self.offset.left - cop.left : (self.offset.left - cop.left)) + self.sizeDiff.width ),
					hoset = Math.abs( (self._helper ? self.offset.top - cop.top : (self.offset.top - co.top)) + self.sizeDiff.height );

		var isParent = self.containerElement.get(0) == self.element.parent().get(0),
		    isOffsetRelative = /relative|absolute/.test(self.containerElement.css('position'));

		if(isParent && isOffsetRelative) woset -= self.parentData.left;

		if (woset + self.size.width >= self.parentData.width) {
			self.size.width = self.parentData.width - woset;
			if (pRatio) self.size.height = self.size.width / self.aspectRatio;
		}

		if (hoset + self.size.height >= self.parentData.height) {
			self.size.height = self.parentData.height - hoset;
			if (pRatio) self.size.width = self.size.height * self.aspectRatio;
		}
	},

	stop: function(event, ui){
		var self = $(this).data("omResizable"), o = self.options, cp = self.position,
				co = self.containerOffset, cop = self.containerPosition, ce = self.containerElement;

		var helper = $(self.helper), ho = helper.offset(), w = helper.outerWidth() - self.sizeDiff.width, h = helper.outerHeight() - self.sizeDiff.height;

		if (self._helper && !o.animate && (/relative/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

		if (self._helper && !o.animate && (/static/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

	}
});

$.om.plugin.add("omResizable", "ghost", {

	start: function(event, ui) {

		var self = $(this).data("omResizable"), o = self.options, cs = self.size;

		self.ghost = self.originalElement.clone();
		self.ghost
			.css({ opacity: .25, display: 'block', position: 'relative', height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass('om-resizable-ghost')
			.addClass(typeof o.ghost == 'string' ? o.ghost : '');

		self.ghost.appendTo(self.helper);

	},

	resize: function(event, ui){
		var self = $(this).data("omResizable"), o = self.options;
		if (self.ghost) self.ghost.css({ position: 'relative', height: self.size.height, width: self.size.width });
	},

	stop: function(event, ui){
		var self = $(this).data("omResizable"), o = self.options;
		if (self.ghost && self.helper) self.helper.get(0).removeChild(self.ghost.get(0));
	}

});

$.om.plugin.add("omResizable", "grid", {

	resize: function(event, ui) {
		var self = $(this).data("omResizable"), o = self.options, cs = self.size, os = self.originalSize, op = self.originalPosition, a = self.axis, ratio = o._aspectRatio || event.shiftKey;
		o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
		var ox = Math.round((cs.width - os.width) / (o.grid[0]||1)) * (o.grid[0]||1), oy = Math.round((cs.height - os.height) / (o.grid[1]||1)) * (o.grid[1]||1);

		if (/^(se|s|e)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
		}
		else if (/^(ne)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.top = op.top - oy;
		}
		else if (/^(sw)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.left = op.left - ox;
		}
		else {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.top = op.top - oy;
			self.position.left = op.left - ox;
		}
	}

});

var num = function(v) {
	return parseInt(v, 10) || 0;
};

var isNumber = function(value) {
	return !isNaN(parseInt(value, 10));
};

})(jQuery);
/*
 * $Id: om-sortable.js,v 1.6 2012/03/29 06:04:20 chentianzhen Exp $
 * operamasks-ui omSortable 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-core.js
 *  om-mouse.js
 */
(function( $, undefined ) {

$.omWidget("om.sortable", $.om.omMouse, {
	widgetEventPrefix: "sort",
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

	},

	destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled")
			.removeData("sortable")
			.unbind(".sortable");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData("sortable-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;
	
			this.widget()
				[ value ? "addClass" : "removeClass"]( "ui-sortable-disabled" );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.OMWidget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
			if($.data(this, 'sortable-item') == self) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options, self = this;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.om.ddmanager)
			$.om.ddmanager.current = this;

		if ($.om.ddmanager && !o.dropBehaviour)
			$.om.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.om.ddmanager && !o.dropBehaviour)
				$.om.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			if(itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.om.ddmanager) $.om.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.om.ddmanager && !this.options.dropBehaviour)
			$.om.ddmanager.drop(this, event);

		if(this.options.revert) {
			var self = this;
			var cur = self.placeholder.offset();

			self.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				self._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		var self = this;

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, self._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, self._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_isOverAxis: function( x, reference, size ) {
        //Determines when x coordinate is over "b" element axis
        return ( x > reference ) && ( x < ( reference + size ) );
    },
	
	_intersectsWithPointer: function(item) {

		var isOverElementHeight = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},
	
	_getItemsAsjQuery: function(connected) {

		var self = this;
		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(sortable-item)");

		for (var i=0; i < this.items.length; i++) {

			for (var j=0; j < list.length; j++) {
				if(list[j] == this.items[i].item[0])
					this.items.splice(i,1);
			};

		};

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var self = this;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data('sortable-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {

		var self = that || this, o = self.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(self.currentItem[0].nodeName))
						.addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

		//Append it after the actual current item
		self.currentItem.after(self.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(self, self.placeholder);

	},

	_contactContainers: function(event) {
		
		// get innermost container that intersects with item 
		var innermostContainer = null, innermostIndex = null;		
		
		
		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself 
			if($.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue 
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i]; 
				innermostIndex = i;
					
			} else {
				// container doesn't intersect. trigger "out" event if necessary 
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}
		
		// if no intersecting containers found, return 
		if(!innermostContainer) return; 

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else if(this.currentContainer != this.containers[innermostIndex]) { 

			//When entering a new container, we will find the item with the least distance and append our item near it 
			var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top']; 
			for (var j = this.items.length - 1; j >= 0; j--) { 
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue; 
				var cur = this.items[j][this.containers[innermostIndex].floating ? 'left' : 'top']; 
				if(Math.abs(cur - base) < dist) { 
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j]; 
				} 
			} 

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled 
				return; 

			this.currentContainer = this.containers[innermostIndex]; 
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true); 
			this._trigger("change", event, this._uiHash()); 
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this)); 

			//Update the placeholder 
			this.options.placeholder.update(this.currentContainer, this.placeholder); 
		
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this)); 
			this.containers[innermostIndex].containerCache.over = 1;
		} 
	
		
	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var self = this, counter = this.counter;

		window.setTimeout(function() {
			if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		},0);

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [], self = this;

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		if(!$.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
			if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
			for (var i = this.containers.length - 1; i >= 0; i--){
				if($.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
					delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
					delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
				}
			};
		};

		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.OMWidget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(inst) {
		var self = inst || this;
		return {
			helper: self.helper,
			placeholder: self.placeholder || $([]),
			position: self.position,
			originalPosition: self.originalPosition,
			offset: self.positionAbs,
			item: self.currentItem,
			sender: inst ? inst.element : null
		};
	}

});

$.extend($.om.sortable, {
	version: "1.1"
});

})(jQuery);
/*
 * $Id: om-panel.js,v 1.42 2012/03/15 07:16:12 wangfan Exp $
 * operamasks-ui omPanel 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *   om-core.js
 */
(function($) {
	var innerToolId = ['collapse','min','max','close'],
		innerToolCls = ['om-panel-tool-collapse','om-panel-tool-expand','om-panel-tool-min','om-panel-tool-max','om-panel-tool-close'],
		effects = {anim:true , speed: 'fast'};
	/**
     * @name omPanel
     * @class �����һ�����������ͬʱҲ��һ��չʾ���ݵ�������<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ�ñ�������Դ��Ҳ����ʹ��Զ������Դ��ͬʱ�ṩ�ѺõĴ�������ơ�</li>
     *      <li>֧�ֶ�̬�޸ı������ݺ�ͼ�ꡣ</li>
     *      <li>��������ť���������չ��</li>
     *      <li>�ṩ�ḻ���¼���</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#panel').omPanel({
     *         width: '400px',
     *         height: '200px',
     *         title: 'panel����',
     *         collapsed: false,//���������Ϊ����״̬
     *         collapsible: true,//��Ⱦ������չ����ť
     *         closable: true, //��Ⱦ�رհ�ť
     *         onBeforeOpen: function(event){if(window.count!==0)return false;}, 
     *         onOpen: function(event){alert('panel�����ˡ�');}
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;input id="panel"/>
     * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
	$.omWidget("om.omPanel" , {
		options:/** @lends omPanel#*/{
			/**
			 * panel�ı��⣬λ��ͷ����ߵ�λ�á�
			 * @type String 
			 * @default ��
			 * @example
             * $("#panel").omPanel({title:"&lt;span style='color:red'&gt;����&lt;/span&gt;"});<br/>
             * ��Ϊ�����ı���ᵱ��html�ı������Ե����������ַ�ʱ�������ת�壬��"<"����ת��Ϊ"&amp;lt;"��
			 */
			title: '',
			/**
			 * panel��ͼ����ʽ��λ��ͷ����ߵ�λ�á�
			 * @name omPanel#iconCls
			 * @type String
			 * @default ��
			 * @example
			 * $("#panel").omPanel({iconCls:'myCls'});(myClsΪ�Զ����css��ʽ���)
			 */
			/**
			 * panel����Ŀ�ȣ���ȡֵΪ'auto'��Ĭ�����,�������������ȣ�������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С��width:100%�����κ�������ֵ������ٷֱȡ����֡�em��λ��px��λ��ֵ�ȵȣ�����ֱ�Ӹ���width���ԡ� 
			 * @type Number,String
			 * @default 'auto'
			 * @example
			 * $("#panel").omPanel({width:'300px'});
			 */ 
			width: 'auto',
			/**
			 * panel����ĸ߶ȣ���ȡֵΪ'auto'�������ݾ����߶ȣ�������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С��height:100%�����κ�������ֵ������ٷֱȡ����֡�em��λ��px��λ��ֵ�ȵȣ�����ֱ�Ӹ���height���ԡ�
			 * @type Number,String
			 * @default 'auto'
			 * @example
			 * $("#panel").omPanel({height:'200px'});
			 */
			height: 'auto',
			/**
			 * ���������ʱ�Ƿ�Ҫ��Ⱦ��ͷ����
			 * @type Boolean
			 * @default true
			 * @example
			 * $("#panel").omPanel({header:false}); //��Ҫ��Ⱦpanel��ͷ��
			 */
			header: true,
			/**
			 * ������ݵ�������Դ���������˴�ֵ��������Զ�̻�ȡ������������岿�֡����Ե���reload������̬��������������ݡ�
			 * @name omPanel#url
			 * @type String
			 * @default ��
			 * @example
			 * $("#panel").omPanel({url:'http://www.ui.operamasks.org/test'});
			 */
			/**
			 * �������ʱ�Ƿ���ʾ���𹤾߰�ť(λ��ͷ���ұ�)��
			 * @type Boolean
			 * @default false
			 * @example
			 * $("#panel").omPanel({collapsible:true});
			 */
			collapsible: false,
			/**
			 * �������ʱ�Ƿ���ʾ�رչ��߰�ť(λ��ͷ���ұ�)��
			 * @type Boolean
			 * @default false
			 * @example
			 * $("#panel").omPanel({closable:true});
			 */
			closable: false,
			/**
			 * ����������Ƿ��ڹر�״̬���ɵ���open������̬�򿪸������
			 * @type Boolean
			 * @default false
			 * @example
			 * $("#panel").omPanel({closed:false});
			 */
			closed: false,
			/**
			 * ����������Ƿ�������״̬���ɵ���expand������̬չ������������ݡ�
			 * @type Boolean
			 * @default false
			 * @example
			 * $("#panel").omPanel({collapsed:true});
			 */
			collapsed: false,
			/**
			 * ���ͷ�����ϽǵĹ�������<br/>
			 * ��ΪArrayʱ��������ÿ�����������һ�����߰�ť,ÿ�������ʽ����:<br/>
			 * <pre>
			 * {
			 *     id:���ù��߰�ť����ѡֵΪ'min'��'max'��'close'��collapse'��
			 *     iconCls:���߰�ť����ʽ�����id���Դ��ڣ�����Դ����ԣ������Կ�ΪString����Array��
			 *             ��ΪStringʱ����ʾ��ť������״̬�µ���ʽ����ΪArrayʱ������0��ʾ��ť
			 * 	           ��̬�µ���ʽ������1��ʾ��ť�����hoverʱ����ʽ��
			 *     handler:��ťͼ�걻����ʱ�������¼�(���û���ṩ�����ԣ���ť���º��û�з�Ӧ)��
			 * }
			 * </pre>
			 * ����:���ǵ��û�ϰ�ߣ�Ĭ������£����collapsible=true�������ʾ����ť��������Զ���ڵ�һ��λ�á�<br/>
			 * ���closable=true,�����ʾ�رհ�ť��������Զ�������һ��λ�á� <br/>
			 * ���Կ�����Ϊtools�����Ĺ�����������м䣬����û�����������������������Ҫ����collapsible��closable���������ԣ�ֱ������tools�������¶�����Ҫ�Ĺ������� <br/><br/>
			 * 
			 * ��ΪSelectorʱ����Selector��Ӧ��dom�ṹ����Ϊtool��һ���ֽ�����Ⱦ����ʱ�¼���ע�ᣬ��ʽ�ı任����ȫ�����û�����
			 * @type Array,Selector
			 * @default []
			 * @example
			 * <pre>
			 * $("#panel").omPanel({tools:[
			 *         {id:'min',handler:function(panel , event){ alert("��С��������δʵ��."); }},
			 *         {id:'max',handler:function(panel , event){ alert("��󻯲�����δʵ��."); }}
			 *     ]}
			 * );
			 * </pre>
			 */
			tools: [],
			/**
			 * Զ�̼�������ʱ����ʾ��Ϣ��ֻ��������url���ߵ���reload����ʱ����һ��url����Ч��
			 * ������һ��Ĭ�ϵ���ʽ(��ʾһ�����ڼ��ص�ͼ��)���������ַ���"default"ʱ���ô�Ĭ����ʽ��
			 * @type String
			 * @default 'default'
			 * @example
			 * $("#panel").omPanel({loadingMessage:"&lt;img src='load.gif'&gt;&lt;/img&gt;loading......"});
			 */
			loadingMessage: "default",
			/**
			 * ��Զ��ȡ��ʱ���õ����ݺ���ʾ����ǰ��һ��Ԥ��������������һ�������������ã��ú����ķ���ֵ��Ϊ���յ����ݡ�
			 * @name omPanel#preProcess
			 * @type Function
			 * @param data ����˷��ص����� 
			 * @param textStatus �������Ӧ��״̬
			 * @default null
			 * @example
			 * $("#panel").omPanel({url:'test.do',preProcess:function(data , textStatus){return 'test';}});
			 * //���ܷ���������ʲô���ݣ�����������ԶΪ'test'
			 */
			/**
			 * Զ��ȡ����������ʱ�����ĺ�����
			 * @event
			 * @param xmlHttpRequest XMLHttpRequest����
			 * @param textStatus  ��������
			 * @param errorThrown  ������쳣����
			 * @param event jQuery.Event����
			 * @name omPanel#onError
			 * @type Function
			 * @default null
			 * @example
			 * <pre>
			 * $("#panel").omPanel({url:'test.do',
			 *     onError:function(xmlHttpRequest, textStatus, errorThrown, event){
			 *         alert('���緢���˴������Ժ����ԡ�');
			 *     }
			 * });
			 * </pre>
			 */
			/**
			 * Զ��ȡ���ɹ��󴥷��ĺ�����
			 * @event
			 * @param data �ӷ��������ص�����
			 * @param textStatus �������Ӧ��״̬
			 * @param xmlHttpRequest XMLHttpRequest����
			 * @param event jQuery.Event����
			 * @name omPanel#onSuccess
			 * @type Function
			 * @default null
			 * @example
			 * <pre>
			 * $("#panel").omPanel({url:'test.do',
			 *     onSuccess:function(data, textStatus, xmlHttpRequest, event){
			 *         alert("���������ص�����Ϊ:" + data);
			 *     }
			 * });
			 * </pre>
			 */
			/**
			 * ��panel���ǰ�����ĺ���������false������ֹ�򿪡�
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onBeforeOpen
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onBeforeOpen:function(event){alert("��Զ�򲻿������.");return false;}});
			 */
			/**
			 * ��panel����󴥷��ĺ�����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onOpen
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onOpen:function(event){alert("panel�Ѿ������ˡ�");}});
			 */
			/**
			 * �ر�panel���ǰ�����ĺ���������false������ֹ�رա�
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onBeforeClose
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onBeforeClose:function(event){alert("������������رա�");}});
			 */
			/**
			 * �ر�panel����󴥷��ĺ�����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onClose
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onClose:function(event){alert("panel�Ѿ����ر��ˡ�");}});
			 */
			/**
			 * ����panel���ǰ�����ĺ���������false������ֹ����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onBeforeCollapse
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onBeforeCollapse:function(event){alert("���������������");}});
			 */
			/**
			 * ����panel����󴥷��ĺ�����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onCollapse
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onCollapse:function(event){alert("panel�Ѿ��������ˡ�");}});
			 */
			/**
			 * չ��panel���ǰ�����ĺ���������false������ֹչ����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onBeforeExpand
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onBeforeExpand:function(event){alert("�����������չ����");}});
			 */
			/**
			 * չ��panel����󴥷��ĺ�����
			 * @event
			 * @param event jQuery.Event����
			 * @name omPanel#onExpand
			 * @type Function
			 * @default null
			 * @example
			 * $("#panel").omPanel({onExpand:function(event){alert("panel�Ѿ���չ���ˡ�");}});
			 */
			 /**
			  *����Ĺر�ģʽ��������close����ʱ��ô��������Ĺرգ�"hidden"��ʾֱ��display:none ,"visibility"��ʾ��СΪ1px�ĵ�
			  * ��������ʱ����¶
			  */
			 _closeMode : "hidden"
		},
		_create: function(){
		    this.element.addClass("om-panel-body om-widget-content")
		    	.wrap("<div class='om-widget om-panel'></div>");
		},
		_init: function(){
			var options = this.options,
				$body = this.element,
				$parent = $body.parent(),
				$header;
			this._renderHeader();
			$header = $body.prev();
			if(options.header === false){
		 		$body.addClass("om-panel-noheader");
		 	}
			this._bindEvent();
		 	this._resize($parent);
		 	var headerHeight = options.header !== false? $header.outerHeight() : 0;
		 	if(options.collapsed !== false){
		 		"auto"!==options.height && $parent.height(headerHeight);		 		
		 		$body.hide();
		 		if(options.header !== false){
		 			$header.find(">.om-panel-tool >.om-panel-tool-collapse").removeClass("om-panel-tool-collapse")
		 				.addClass("om-panel-tool-expand");
		 		}
		 	}else{
		 		$body.show();
		 		"auto"!==options.height && $parent.height(headerHeight + $body.outerHeight());
		 		if(options.header !== false){
		 			$header.find(">.om-panel-tool >.om-panel-tool-expand").removeClass("om-panel-tool-expand")
		 				.addClass("om-panel-tool-collapse");
		 		}	
		 	}
		 	options.closed !== false? this._hide($parent) : this._show($parent);
		 	this.reload();
		},
		_hide: function($target){
			if("hidden" === this.options._closeMode){
				$target.hide();
			}else if("visibility" === this.options._closeMode){
				$target.addClass("om-helper-hidden-accessible");
			}
		},
		_show: function($target){
			if("hidden" === this.options._closeMode){
				$target.show();
			}else if("visibility" === this.options._closeMode){
				$target.removeClass("om-helper-hidden-accessible");
			}
		},
		_bindEvent: function(){
			var self = this,
				$body = this.element,
				options = this.options,
				tools = $body.prev().find("> .om-panel-tool");
				
			if(options.collapsible){
				tools.find(">.om-panel-tool-collapse , .om-panel-tool-expand")
					.click(function(){
						if(options.collapsed !== false){
							self.expand();
						}else{
							self.collapse();
						}
					});
			}
			if(options.closable !== false){
				tools.find(">.om-panel-tool-close")
					.click(function(){
						self.close();
					});
			}
			$(window).bind("resize.ompanel" , function(){
				$frame = $body.find(">.panel-inner-frame");
				if($frame.length !== 0 && options.width==='auto'){
					$frame.width($body.innerWidth());
				}
			});
		},
		_renderHeader: function(){
			this.header && this.header.remove();
			if(this.options.header === false){
				return ;
			}
			var that = this,
				options = this.options,
				tools = options.tools,
				$header = this.header = $("<div class='om-panel-header'></div>").insertBefore(this.element);
			if(options.iconCls){
				$("<div class='om-icon om-panel-icon'></div>").addClass(options.iconCls).appendTo($header);
			}
			$("<div class='om-panel-title'></div>").html(options.title).appendTo($header);
			$tool = $("<div class='om-panel-tool'></div>");
			if(options.collapsible !== false){
				$("<div class='om-icon om-panel-tool-collapse'></div>").appendTo($tool);	
			}
			//�����Զ���ͷ���ұߵĹ�����
			if($.isArray(tools)){
				for(var i=0,len=tools.length; i<len; i++){
					var tool = tools[i],
						iconCls;
					if(iconCls = this._getInnerToolCls(tool.id)){
						$("<div class='om-icon'></div>").addClass(iconCls)
							.click(	function(event){
								tool.handler.call(this,that,event);
							}).appendTo($tool);
					}else if(typeof tool.iconCls === 'string'){
						$("<div class='om-icon'></div>").addClass(tool.iconCls)
							.click(	function(event){
								tool.handler.call(this,that,event);
							}).appendTo($tool);
					}else if($.isArray(tool.iconCls)){
						//�������Ҫ���ڲ�������������Ϊhover���õ���tool������tool��ֵ�ܿ����Ѿ����ĵ���
						(function(tool){
							$("<div class='om-icon'></div>").addClass(tool.iconCls[0])
								.click(function(event){
									tool.handler.call(this,that,event);
								})
								.hover(function(){
									if(tool.iconCls[1]){
										$(this).toggleClass(tool.iconCls[1]);
									}
								}).appendTo($tool);
						})(tool);
					}
				}
			}else{
				try{
					$(tools).appendTo($tool);
				}catch(error){
					throw "bad format of jquery selector.";
				}
			}
			
			if(options.closable !== false){
				$("<div class='om-icon om-panel-tool-close'></div>").appendTo($tool);	
			}
			//�������ù��߰�ťhoverʱ����ʽ�任
			$tool.find(">div.om-icon").hover(
				function(){
					var self = this;
					$.each(innerToolCls , function(){
						if($(self).hasClass(this)){
							$(self).toggleClass(this+"-hover");
						}
					});
				}
			);
			$tool.appendTo($header);
		},
		/**
		 * ��ʼ��panel,header,body�Ŀ�͸�
		 */
	 	_resize: function($panel){
	 		var $body = this.element,
	 			$header = $body.prev(),
	 			$panel = $body.parent(),
	 			options = this.options;
	 		if(options.width == 'fit'){
	 			options.width = '100%';
	 			$panel.width('100%');
	 			$header.css("width" , "");
	 			$body.css("width" , "");
	 		}else if(options.width !== 'auto'){
				$panel.width(options.width);
				$header.outerWidth($panel.width());
				$body.outerWidth($panel.width());
	 		}else{
	 			var style = $body.attr("style");
	 			if(style && style.indexOf("width") !== -1){
	 				$panel.width($body.outerWidth());
	 				$header.outerWidth($body.outerWidth());
	 			}else{
	 				$panel.css("width" , "");
		 			$header.css("width" , "");
		 			$body.css("width" , "");
	 			}
	 		}
	 		if(options.height == 'fit'){
	 			options.height = '100%';
	 			$panel.height('100%');
	 			$body.outerHeight($panel.height()- (this.options.header!==false?$header.outerHeight():0) );	 
	 		}else if(options.height !== 'auto'){
				$panel.height(options.height);
				$body.outerHeight($panel.height()- (this.options.header!==false?$header.outerHeight():0) );	 
	 		}else{
	 			var style = $body.attr("style");
	 			if(style && style.indexOf("height") !== -1){
	 				$panel.height($header.outerHeight() + $body.outerHeight());
	 			}else{
	 				$panel.css("height" , "");
		 			$body.css("height" , "");
	 			}
	 		}
	 	},
	 	_getInnerToolCls: function(id){
	 		return $.inArray(id , innerToolId)!=-1? 'om-panel-tool-'+id : null;
	 	},
		_showLoadingMessage: function(){
			var options = this.options,
				$body = this.element,
				$loadMsg = $body.next(".om-panel-loadingMessage"),
				position = {
					width:$body.innerWidth(), 
					height:$body.innerHeight(),
					left:$body.position().left + parseInt($body.css("border-left-width")),
					top:$body.position().top
				};
			if($loadMsg.length === 0){
				if("default" === options.loadingMessage){
					$("<div class='om-panel-loadingMessage'><div class='valignMiddle'><div class='loadingImg'>���ݼ�����</div></div></div>")
					.css(position).appendTo($body.parent());
				}else{
					$("<div class='om-panel-loadingMessage'></div>").appendTo($body.parent())
					.html(options.loadingMessage)
					.css(position);
				}
			}else{
				$loadMsg.css(position).show();
			}
		},
		_hideLoadingMessage: function(){
			this.element.parent().find(".om-panel-loadingMessage").hide();
		},
		/**
		 * ����panel�ı���
		 * @name omPanel#setTitle
		 * @function
		 * @param title �µı���
		 */
		setTitle: function(title){
		 	this.element.prev().find(">.om-panel-title").html(title);
		},
		/**
		 * ����panel��ͼ����ʽ
		 * @name omPanel#setIconClass
		 * @function
		 * @param iconCls �µ�ͼ����ʽ
		 * @returns ��ǰjquery����
		 */
		setIconClass: function(iconCls){
			var $header = this.element.prev();
			var $icon = $header.find(">.om-panel-icon");
		 	if(iconCls == null && $icon.length!==0){
		 		$icon.remove();
		 	}else{
		 		if($icon.length==0){
		 			$icon = $("<div class='om-icon om-panel-icon'></div>").insertBefore($header.find(">.om-panel-title"));
		 		}
		 		if(this.options.iconCls){
		 			$icon.removeClass(this.options.iconCls);
		 		}
		 		$icon.addClass(iconCls);
		 		this.options.iconCls = iconCls;
		 	}
		},
		/**
		 * �������ʹ����ɼ���
		 * @name omPanel#open
		 * @function
		 */
		open: function(){
			var $body = this.element,
				options = this.options;
			if(options.closed){
				if(options.onBeforeOpen && this._trigger("onBeforeOpen") === false){
					return ;
				}
				this._show($body.parent());
				options.closed = false;
				options.onOpen && this._trigger("onOpen");
			}
		},
		/**
		 * �ر������ʹ������ɼ���
		 * @name omPanel#close
		 * @function
		 */
		close: function(){
			var $body = this.element,
				options = this.options;
			if(!options.closed){
				if(options.onBeforeClose && this._trigger("onBeforeClose") === false){
					return ;
				}
				this._hide($body.parent());
				options.closed = true;
				options.onClose && this._trigger("onClose");
			}
		},
		/**
		 * ���¼�������,Ϊʹ�÷�����Ч���������ʱ����ָ��url���Ի��ߵ��ô˷���ʱ����һ���Ϸ���url��
		 * @name omPanel#reload
		 * @function
		 * @param url һ����Ч��ȡ����ַ
		 */
		reload: function(url){
			var options = this.options,
				$body = this.element,
				self = this;
			if($body.data("loading")){
				return ;
			}else{
				$body.data("loading" , true);
			}
		 	url = url || options.url;
		 	if(!url){
		 		$body.data("loading" , false);
		 		return ;
		 	}
		 	options.url = url;
		 	this._showLoadingMessage();
		 	$.ajax(url , {
		 		cache: false,
		 		success: function(data, textStatus, jqXHR){
		 			$body.html(options.preProcess? options.preProcess.call($body[0] , data , textStatus) : data);
		 			$body.data("loading" , false);
		 			self._hideLoadingMessage();
		 			options.onSuccess && self._trigger("onSuccess", null, data, textStatus, jqXHR);
		 		},
		 		error: function(jqXHR, textStatus, errorThrown){
		 			$body.data("loading" , false);
		 			self._hideLoadingMessage();
		 			options.onError && self._trigger("onError", null, jqXHR, textStatus, errorThrown);
		 		}
		 	});
		},
		/**
		 * �ı�����Ĵ�С��
		 * @name omPanel#resize
		 * @function
		 * @param position (1)����ΪObject,��ʽ��{width:'100px',height:'100px'} <br/>
		 *                 (2)ֻ��һ��������ʾwidth,����������ʱ���α�ʾwidth,height
		 */
		resize: function(position){
		 	var options = this.options,
		 		width,
		 		height;
		 	if($.isPlainObject(position)){
		 		width = position.width || null;
		 		height = position.height || null;
		 	}else{
		 		width = arguments[0];
		 		height = arguments[1];
		 	}
		 	options.width = width || options.width;
		 	options.height = height || options.height;
		 	this._resize(this.element.parent());
		},
		/**
		 * ���������
		 * @name omPanel#collapse
		 * @function
		 */
		collapse: function(/**anim , speed**/){
		 	var self = this,
		 		$body = this.element,
				$header = $body.prev(),
				$parent = $body.parent(),
				options = this.options,
				anim = effects.anim,
				speed = effects.speed;
				if(arguments[0] != undefined){//����animΪboolean�����Բ�����д�� anim = arguments[0] || effects.anim
					anim = arguments[0];//�ڲ�ʹ��
				}
				speed = arguments[1] || speed;//�ڲ�ʹ��
			if (options.onBeforeCollapse && self._trigger("onBeforeCollapse") === false) {
            	return ;
        	}
			if($header.length !== 0){
				var $expandTool = $header.find("> .om-panel-tool > div.om-panel-tool-collapse");
				if($expandTool.length !== 0){
					$expandTool.removeClass("om-panel-tool-collapse").addClass("om-panel-tool-expand");
					if($expandTool.hasClass("om-panel-tool-collapse-hover")){
						$expandTool.toggleClass("om-panel-tool-collapse-hover om-panel-tool-expand-hover");
					}
				}
			}

			$parent.animate({
					height: '-='+$body.outerHeight()
				} , 
				anim? (speed || 'normal') : 0 , 
				function(){
					$body.hide();
					options.collapsed = true;
					"auto"===options.height && $parent.css("height" , "");//����ִ�к�parent���Զ���Ӹ߶�ֵ����������Ϊ"auto"ʱҪ�ֶ�ȥ���˸߶�
                	options.onCollapse && self._trigger("onCollapse");
				}
			);    
		},
		/**
		 * չ�������
		 * @name omPanel#expand
		 * @function
		 */
		expand: function(/**anim , speed**/){
			var self = this,
				$body = this.element,
				$header = $body.prev(),
				$parent = $body.parent(),
				options = this.options,
				anim = effects.anim,
				speed = effects.speed;
				if(arguments[0] != undefined){//����animΪboolean�����Բ�����д�� anim = arguments[0] || effects.anim
					anim = arguments[0];//�ڲ�ʹ��
				}
				speed = arguments[1] || speed;//�ڲ�ʹ��
			if (options.onBeforeExpand && self._trigger("onBeforeExpand") === false) {
            	return ;
        	}
			if($header.length !== 0){
				var $expandTool = $header.find("> .om-panel-tool > div.om-panel-tool-expand");
				if($expandTool.length !== 0){
					$expandTool.removeClass("om-panel-tool-expand").addClass("om-panel-tool-collapse");
					if($expandTool.hasClass("om-panel-tool-expand-hover")){
						$expandTool.toggleClass("om-panel-tool-expand-hover om-panel-tool-collapse-hover");
					}
				}
			}
			//���parentû�����ø߶�ֵ��Ҫ����һ������Ȼ����Ч���ǳ�������
			"auto"===options.height && $parent.height($header.outerHeight());
			$body.show();
			$parent.animate({
					height: '+='+$body.outerHeight()
				} , 
				anim? (speed || 'normal') : 0 , 
				function(){
					options.collapsed = false;
					"auto"===options.height && $parent.css("height" , "");//����ִ�к�parent���Զ���Ӹ߶�ֵ����������Ϊ"auto"ʱҪ�ֶ�ȥ���˸߶�
	                options.onExpand && self._trigger("onExpand");
				}
			);     
		},
		/**
		 * �������
		 * @name omPanel#destroy
		 * @function
		 */
		destroy: function(){
			var $body = this.element;
			$body.parent().after($body).remove();
		}
	});
})(jQuery);/*
 * $Id: om-grid.js,v 1.141 2012/05/09 01:06:08 chentianzhen Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-core.js
 *  om-mouse.js
 *  om-resizable.js
 */
 
/**
     * @name omGrid
     * @class ��������������html�е�table��֧�ֺ�̨����Դ����ҳ���Զ��п���ѡ/��ѡ������ʽ���Զ�������Ⱦ�ȹ��ܡ�<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>ʹ��Զ������Դ</li>
     *      <li>֧�ַ�ҳչ��</li>
     *      <li>�Զ�����к�</li>
     *      <li>����ĳ�еĿ���Զ����䣨���п�ȵ��ڱ���ܿ����ȥ�����п��֮�ͣ�</li>
     *      <li>�����������Զ����ţ��Զ����Ÿ��еĿ�ȣ�ʹ������Ӧ�����ܿ�ȣ�</li>
     *      <li>���Զ��Ƹ�����ʽ��Ҳ���Ը��ݼ�¼�Ĳ�ͬʹ�ò�ͬ������ʽ</li>
     *      <li>���Զ��Ƹ��е���ʾЧ��</li>
     *      <li>�������ñ�ͷ�ͱ����Զ�����</li>
     *      <li>���Ըı��п�</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     *  $(document).ready(function() {
     *      $('#mytable').omGrid({
     *          height : 250,
     *          width : 600,
     *          limit : 8, //��ҳ��ʾ��ÿҳ��ʾ8��
     *          singleSelect : false, //����checkbox�У�����ѡ��ͬʱ���м�¼
     *          colModel : [    {header:'���',name:'id', width:100, align : 'center'},
     *                          {header:'����',name:'city', width:250, align : 'left',wrap:true},
     *                          {header:'��ַ',name:'address', width:'autoExpand',renderer:function(value,rowData,rowIndex){ return '&lt;b>'+value+'&lt/b>'; }}
     *          ],
     *          dataSource : 'griddata.json' //��̨ȡ����URL
     *      });
     *  });
     * &lt;/script>
     * 
     * &lt;table id="mytable"/>
     * </pre>
     * 
     * colModel����������ģ�ͣ��������˱������������޹ص�չ�֡�����һ��JSON���飬����������ÿһ��item����һ��JSON���󣩴������е�һ�С�����ʹ���������ԣ�<br/>
     * <ol>
     *      <li>header:String���ͣ���ʾ���ı�ͷ���֡���Ĭ��ֵ��</li>
     *      <li>width:Number���ͻ�'autoExpand'�����������200��ʾ���п����200px�������'autoExpand'��ʾ���еĿ���Ǳ���ܿ�ȼ�ȥ�������п��֮�͡�Ĭ��ֵ��60��</li>
     *      <li>align:'left'��'right'��'center'����ʾ���ı�ͷ�ͱ������ֵĶ��뷽ʽ��Ĭ��ֵ��'left'��</li>
     *      <li>name:String���ͣ�˵��������һ��Ҫ��ʾ��̨���ص����ݼ�¼��JSON�����е��ĸ����Ե�ֵ����name:'sex'��ʾ��һ����ʾJSON�����sex���Ե�ֵ����Ĭ��ֵ��</li>
     *      <li>wrap:Boolean���ͣ�˵����һ�еı�ͷ�ͱ��嵱����̫��ʱ�Ƿ������Զ�������ʾ����wrap:true��ʾ��һ�еı�ͷ�ͱ�������ʾʱ�Զ����У�������п����100px���Ǳ���ĳtd���ݿ����120pxʱ���td�������Զ�������ʾ����Ĭ��ֵ��false��</li>
     *      <li>renderer:Function���ͣ���������ʾ���е�ֵ�ǽ��пͻ��˴�����Ĭ��ֵ������ת��ֱ�����������id��'name'���н���ֱ�Ӱ�JSON�������е�name���Ե�ֵ��ʾ�ڱ���td�У�����ʱ������Ҫ����һЩ�������磺<br/>
     *          <ul>
     *              <li>��td�е�����Ҫ�Ӵֿ���ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){
     *          return '&lt;b>'+value+'&lt;/b>';
     *      }
     *                  </pre>
     *              </li>
     *              <li>�����̨���ص�������sex��0��1��ҳ����Ҫת��Ϊ����'��'��'Ů'����ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){
     *          return value==0?'��':'Ů';
     *      }
     *                  </pre>
     *              </li>
     *              <li>����һ����̨���ص�������score�Ƿ�������Ҫ��100�����Ϊ��ɫ��'����'С��60��ʱ�����ɫ��'������'�����Ĳ��䣬����ʹ��
     *                  <pre>
     *      renderer:function(value , rowData , rowIndex){ 
     *          if(value==100){
     *              return value==100?'&lt;font color="green">����&lt;/font>';
     *          }else if(value&lt;60){
     *              return '&lt;font color="red">������&lt;/font>';
     *          }else{
     *              return value;
     *          }
     *      }
     *                  </pre>
     *              </li>
     *          <ul>
     *      </li>
     * </ol>
     * 
     * ��̨���ص����ݸ�ʽ���£����Բ������ո��еȸ�ʽ���ݣ��������ڵĸ�����˳������⽻������<br/>
     * <pre>
     * {"total":126, "rows":
     *     [
     *         {"address":"CZ88.NET ","city":"IANA������ַ","id":"1"},
     *         {"address":"CZ88.NET ","city":"�Ĵ�����","id":"2"},
     *         {"address":"����","city":"����ʡ","id":"3"},
     *         {"address":"CZ88.NET ","city":"�Ĵ�����","id":"4"},
     *         {"address":"CZ88.NET ","city":"̩��","id":"5"},
     *         {"address":"CZ88.NET ","city":"�ձ�","id":"6"},
     *         {"address":"����","city":"�㶫ʡ","id":"7"},
     *         {"address":"CZ88.NET ","city":"�ձ�","id":"8"}
     *     ]
     * }
     * </pre>
     * 
     * <b>��������˵����</b><br/>
     * ����һ��ʱ�п��ܻᴥ��onRowSelect��onRowDeselect��onRowClick��Щ�¼���һ��һ���������������������ģ�
     * <ol>
     *     <li>��ѡ��һ��ֻ��ѡ��һ�У���񣺢�������л�δ��ѡ�У��ȴ���������ѡ����е�onRowDeselect�¼������ٴ������е�onRowSelect�¼������ڴ������е�onRowClick�¼�������</li>
     *     <li>��ѡ��һ�ο���ѡ����У���񣺢�������л�δ��ѡ�У��ȴ������е�onRowSelect�¼���������������Ѿ�ѡ�У����ȴ������е�onRowDeselect�¼������ڴ������е�onRowClick�¼�������</li>
     * </ol>
     * 
     * �������˵��
     * <ol>
     * 		<li>�������������ʱ�����start��limit�������������������һҳ����ʱurl���Զ������ start=0&limit=20�� </li>
     * </ol>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
;(function($) {
    $.omWidget('om.omGrid', {
        options:/** @lends omGrid#*/{
            //���
            /**
             * ���߶ȣ���λΪpx��
             * @default 462
             * @type Number
             * @example
             * $('.selector').omGrid({height : 300});
             */
            height:462,
            /**
             * ����ȣ���λΪpx��
             * @type Number
             * @default '100%'
             * @example
             * $('.selector').omGrid({width : 600});
             */
            width:'100%',
            /**
             * ������ģ�͡�ÿһ��Ԫ�ض���һ��������������������еĸ������ԣ���Щ���԰���:<br/>
             * header : ��ͷ���֡�<br/>
             * name : ������ģ�Ͷ�Ӧ���ֶΡ�<br/>
             * align : �����ֶ��뷽ʽ������Ϊ'left'��'center'��'right'֮�е�һ����<br/>
             * renderer : �е���Ⱦ����������3��������v��ʾ��ǰֵ��rowData��ʾ��ǰ�����ݣ�rowIndex��ʾ��ǰ�к�(��0��ʼ)��<br/>
             * width : �еĿ�ȣ�ȡֵΪNumber����'autoExpand'��ע��ֻ����һ���б�����Ϊ'autoExpand'���ԡ�<br/>
             * wrap : �Ƿ��Զ����У�ȡֵΪtrue����false��<br/>
             * @type Array[JSON]
             * @default false
             * @example
             * 
             * $(".selector").omGrid({
             *      colModel : [ {
             *              header : '����',          //��ͷ����
             *              name : 'city',          //������ģ�Ͷ�Ӧ���ֶ�
             *              width : 120,            //�п�,�����þ������֣�Ҳ������Ϊ'autoExpand'����ʾ�Զ���չ
             *              align : 'left',         //�����ֶ���
             *              renderer : function(v, rowData , rowIndex) {   //����Ⱦ����������3��������v��ʾ��ǰֵ��rowData��ʾ��ǰ�����ݣ�rowIndex��ʾ��ǰ�к�(��0��ʼ)
             *                  return '&lt;b>'+v+'&lt;/b>';  //������һ�е����ּӴ���ʾ
             *              }
             *          }, {
             *              header : '��ַ',
             *              name : 'address',
             *              align : 'left',
             *              width : 'autoExpand'
             *          } 
             *      ]
             * });
             */
            colModel:false,
            /**
             * �Ƿ��Զ������������Ӧ���Ŀ�ȣ����繲2�е�һ�п��100�ڶ��п��200���򵱱���ܿ����600pxʱ��һ���Զ�����200px�ڶ��п�Ȼ��Զ����400px�����������ܿ����210pxʱ��һ���Զ�����70px�ڶ��п�Ȼ��Զ����140px����<b>ע�⣺ֻ�������еĿ�ȶ�����'autoExpand'ʱ�����ԲŻ������á�</b>
             * @default false
             * @type Boolean
             * @example
             * $('.selector').omGrid({autoFit : true});
             */
            autoFit:false,
            /**
             * �Ƿ����������ʾ����С�
             * @default true
             * @type Boolean
             * @example
             * $('.selector').omGrid({showIndex : false});
             */
            showIndex:true,
            //����Դ
            /**
             * ajaxȡ����ʽ��Ӧ��url��ַ��
             * @type String
             * @default ��
             * @example
             * //�����ʾ�����õ�url����ʾ����griddata.json�����ַȡ����ͬʱ������start��limit�������������
             * //���ļ����뷵��һ�ξ����ض���ʽ����ʽ�ɲο��ĵ��ġ�Ԥ����ҳǩ��˵������JSON���ݣ�omGrid�õ������ݼ������������
             * $('.selector').omGrid({url:'griddata.json'});
             */
            dataSource:false,
             /**
             * ajaxȡ��ʱ���ӵ�����Ķ��������<b>ע�⣺����JSON��valueֵֻ��ʹ����ֵͨ�������������Ϊ{key1:1,key2:'2',key3:0.2,key4:true,key5:undefined}���������ǲ���������Ϊ{key1:[]}��{key2:{a:1,b:2}}����Ϊ[]��{a:1,b:2}��������ֵͨ</b>
             * @type JSON
             * @default {}
             * @example
             * //�����ʾ����Ajaxȡ��ʱ����griddata.json�����ַȡ����ͬʱ������start��limit��googType��localtion��4�����������
             * //������URL��ַ������griddata.json?start=0&limit=10&goodType=1&location=beijing
             * $('.selector').omGrid({url:'griddata.json',extraData:{googType:1,localtion:'beijing'} });
             */
            extraData:{},
            /**
             * ʹ��GET������POST������ȡ���ݣ�ȡֵΪ��'POST'��'GET'��
             * @type String
             * @default 'GET'
             * @example
             * $('.selector').omGrid({method : 'POST'});
             */
            method:'GET',
            /**
             * ����ȡ��ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#loadingMsg
             * @type String
             * @default '���ڼ������ݣ����Ժ�...'
             * @example
             * $('.selector').omGrid({loadingMsg : 'ȡ����...'});
             */
            //loadingMsg:$.om.lang.omGrid.loadingMsg,
            /**
             * ȡ����ɺ��Ǻ�̨û�з����κ�����ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#emptyMsg
             * @type String
             * @default 'û������'
             * @example
             * $('.selector').omGrid({emptyMsg : 'No data!'});
             */
            //emptyMsg:$.om.lang.omGrid.emptyMsg,
            /**
             * ȡ����������ʱ��ʾ�ڷ�ҳ���ϵ���ʾ��
             * @name omGrid#errorMsg
             * @type String
             * @default 'ȡ������'
             * @example
             * $('.selector').omGrid({emptyMsg : 'Ӧ���쳣��������վ����Ա��ϵ!'});
             */
            //errorMsg:$.om.lang.omGrid.errorMsg,
            /**
             * ȡ���ɹ����Ԥ����������ȡ���ɹ���ʼ��ʾ����ǰ�Ժ�̨���ص����ݽ���һ��Ԥ����<b>ע�⣺�˷���һ��Ҫ����һ��ֵ</b>��
             * @type Function
             * @default ��
             * @example
             * //����̨���ص����������м�¼��id���Ը�����name���ԣ�����sex�е�0/1�ֱ�ת��Ϊ'��'��'Ů'��
             * //���̨����{"total":35,"rows":[{id:1,sex:0,password:'abc'},{id:2,sex:1,password:'def'}]}
             * //ת������Ϊ{"total":35,"rows":[{name:1,sex:'��',password:'abc'},{name:2,sex:'Ů',password:'def'}]}
             * $('.selector').omGrid({preProcess : function(data){
             *          var temp;
             *          for(var i=0,len=data.rows.length;i&lt;len;i++){
             *              temp=data.rows[i];
             *              temp.name=temp.id;
             *              temp.id=undefined;
             *              temp.sex= temp.sex==0?'��':'Ů';
             *          }
             *          return data;
             *      }
             * });
             */
            preProcess:false,
            //��ҳ
            /**
             * ÿҳ��������������ÿҳҪ��ʾ10�������10��<b>ע�⣺������0�����򲻷�ҳ</b>�������Խ�����ȡ����������ʾ�������limit���10��ȡ��ʱ���ߺ�̨Ҫ10�����ݣ������̨��Ҫ����15�����ݣ���ҳ�����ʾ��15��������10�����ݣ���
             * @type Number
             * @default 15
             * @example
             * $('.selector').omGrid({limit : 15});
             */
            limit:15,
            /**
             * ��ʾ�ڷ�ҳ���ϡ���һҳ���͡���һҳ����ť֮������֡�����ʾʱ���е�{totalPage}�ᱻ�滻Ϊ��ҳ����{index}�ᱻ�滻Ϊһ�������Ĭ����ʾ��ǰ��ҳ�ţ��û�����������������Ȼ��س�����ת��ָ����ҳ����
             * @name omGrid#pageText
             * @type String
             * @default '��{index}ҳ����{totalPage}ҳ'
             * @example
             * $('.selector').omGrid({pageText : '��{totalPage}ҳ��ת��{index}ҳ'});
             */
            //pageText:$.om.lang.omGrid.pageText,
            /**
             * ��ʾ�ڷ�ҳ���ϵ�ͳ�����֡�����ʾʱ���е�{total}�ᱻ�滻Ϊ�ܼ�¼����{from}��{to}�ᱻ�滻Ϊ��ǰ��ʾ����ֹ�кš�������ܻ���ʾ��'��125�����ݣ���ʾ21-30��'��
             * @name omGrid#pageStat
             * @type String
             * @default '��{total}�����ݣ���ʾ{from}-{to}��'
             * @example
             * $('.selector').omGrid({pageStat : '�ܹ���{total}����¼����ǰ������ʾ��{from}������{to}��'});
             */
            //pageStat:$.om.lang.omGrid.pageStat,
            //����ʾ
            /**
             * ����ʽ��Ĭ����ʾ�ɰ����ƣ���ż�б�����һ��������Ȼ�û�Ҳ���Զ����3��һѭ����5��һѭ����Ҳ���Զ����һ��Function�����������ݲ�ͬ��ʾ�ɲ�ͬ����ʽ������һ����ʾѧ���ɼ��ı���аѲ�����ļ�¼������ʾ�ɺ�ɫ���������ֵļ�¼������ʾ����ɫ��������
             * @type Array��Function
             * @default ['oddRow','evenRow']
             * @example
             * 
             * //ʾ��1���������е�1/4/7/10...�е�tr�������ʽclass1��
             * //��2/5/8/11...�е�tr�������ʽclass2��
             * //��3/6/9/12...�е�tr�������ʽclass3
             * $('.selector').omGrid({rowClasses : ['class1','class2','class2']});
             * 
             * //ʾ��2�����ֵ��м�����ʽfullMarks����������м�����ʽflunk��������ʹ��Ĭ����ʽ��
             * $('.selector').omGrid({rowClasses : function(rowIndex,rowData){
             *          if(rowData.score==100){
             *              reuturn 'fullMarks';
             *          }else if(rowData.score<60){
             *              return 'flunk';
             *          }
             *      }
             * });
             */
            rowClasses:['oddRow','evenRow'],
            //��ѡ��
            /**
             * �Ƿ�ֻ�ܵ�ѡ��һ��ֻ��ѡ��һ����¼��ѡ��ڶ���ʱ��һ�����Զ�ȡ��ѡ�񣩡�������Ϊfalse��ʾ���Զ�ѡ��ѡ��������ʱԭ���Ѿ�ѡ��Ľ���������ѡ��״̬����<b>ע�⣺���trueʱ���������checkbox�У����false���Զ�����checkbox��</b>��
             * @type Boolean
             * @default true
             * @example
             * $('.selector').omGrid({singleSelect : false});
             */
            singleSelect:true,
            
            /**
             * ��������ı���
             * @type String
             * @default ''
             * @example
             * $('.selector').omGrid({title : 'Data Grid'});
             */
            title: '',
            
            //event
            /**
             * ѡ��һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowSelect:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been selected!');
             *      }
             *  });
             */
            onRowSelect:function(rowIndex,rowData,event){},
            /**
             * ȡ��һ�м�¼��ѡ���ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowDeselect:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been deselected!');
             *      }
             *  });
             */
            onRowDeselect:function(rowIndex,rowData,event){},
            /**
             * ����һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowClick:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been clicked!city='+rowData.city);
             *      }
             *  });
             */
            onRowClick:function(rowIndex,rowData,event){},
            /**
             * ˫��һ�м�¼��ִ�еķ�����
             * @event
             * @type Function
             * @param rowIndex �кţ���0��ʼ��
             * @param rowData ѡ������������JSON����
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onRowDblClick:function(rowIndex,rowData,event){
             *          alert('the '+rowIndex+'th row has been double clicked!city='+rowData.city);
             *      }
             *  });
             */
            onRowDblClick:function(rowIndex,rowData,event){},
            /**
             * �ı��ҳ<b>֮ǰ</b>ִ�еķ�����<b>ע�⣺����˷�������false�򲻽��з�ҳ�л�����ת</b>��
             * @event
             * @type Function
             * @param type �л����ͣ���'first'��'prev'��'next'��'last'��'input'֮һ��
             * @param newPage Ҫת����ҳ�ţ���1��ʼ����һҳ��1������0��
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onPageChange:function(type,newPage,event){
             *          alert('will goto page '+newPage);
             *      }
             *  });
             */
            onPageChange:function(type,newPage,event){},
            /**
             * �Ӻ�̨ȡ���ɹ�ʱִ�еķ�����
             * @event
             * @type Function
             * @param data ȡ���������ݣ� ��ʽ��{"total":35,"rows":[{"id":11,"city":"����ʡ������","address":"����"},{"id":12,"city":"������","address":"���������Ƽ����޹�˾"},{"id":13,"city":"�Ĵ�����","address":"CZ88.NET"}]}  ����
             * @param testStatus ��Ӧ��״̬���ο�jQuery��$.ajax��success���ԣ�
             * @param XMLHttpRequest XMLHttpRequest���󣨲ο�jQuery��$.ajax��success���ԣ�
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onSuccess:function(data,testStatus,XMLHttpRequest,event){
             *          alert('fetch data success,got '+data.rows+' rows');
             *      }
             *  });
             */
            onSuccess:function(data,testStatus,XMLHttpRequest,event){},
            /**
             * �Ӻ�̨ȡ��ʧ��ʱִ�еķ�����
             * @event
             * @type Function
             * @param XMLHttpRequest XMLHttpRequest���󣨲ο�jQuery��$.ajax��error���ԣ�
             * @param testStatus ��Ӧ��״̬���ο�jQuery��$.ajax��error���ԣ�
             * @param errorThrown ������쳣���󣨲ο�jQuery��$.ajax��error���ԣ�
             * @param event jQuery.Event����
             * @default ��
             * @example
             *  $(".selector").omGrid({
             *      onError:function(XMLHttpRequest,textStatus,errorThrown,event){
             *          alert('fetch data error');
             *      }
             *  });
             */
            onError:function(XMLHttpRequest,textStatus,errorThrown,event){},
            /**
             * ������ȫ����ʾ�������к�ִ�еķ�����
             * @event
             * @type Function
             * @param nowPage ��ǰҳ��(��һҳ��1�ڶ�ҳ��2)
             * @param pageRecords ��ǰҳ�����м�¼
             * @param event jQuery.Event����
             * @default ��
             * @example
             * //������ʾ����Զ�ѡ�����е�ַ��'����'���С�
             *  $(".selector").omGrid({
             *      signleSelect:false,
             *      onRefresh:function(nowPage,pageRecords,event){
             *          var rows=[];
             *          $(pageRecords).each(function(i){
             *              if(this.address=='����'){
             *                  rows.push(i);
             *              }
             *          });
             *          $('.selector').omGrid('setSelections',rows);
             *      }
             *  });
             */
            onRefresh:function(nowPage,pageRecords,event){},
            /**
             *���ɹ����غ�Ļص��¼��б���Ҫ�����б༭�����(���ڲ�ʹ��)
            */
            _onRefreshCallbacks : [],
            
            /**
             * �������иı��Сʱ�Ļص��¼��б���Ҫ�����б༭�����(���ڲ�ʹ��)
             */
            _omResizableCallbacks : []
        },
        //private methods
        _create:function(){
            var options=this.options,el=this.element.show() // show if hidden
                .attr({
                    cellPadding : 0,
                    cellSpacing : 0,
                    border : 0
                })
                .empty()
                .append('<tbody></tbody>');
            el.wrap('<div class="om-grid om-widget om-widget-content"><div class="bDiv" style="width:100%"></div></div>').closest('.om-grid');
            var colModel=options.colModel;
            if(!$.isArray(colModel)){
                return; //���colModelû���û�ֵ���ԣ�ʲôҲ����
            }
            
            this.hDiv = $('<div class="hDiv om-state-default"></div>').append('<div class="hDivBox"><table cellPadding="0" cellSpacing="0"></table></div>');
            el.parent().before(this.hDiv);
            this.pDiv=$('<div class="pDiv om-state-default"></div>');
            el.parent().after(this.pDiv);
            
            var grid = el.closest('.om-grid');
            this.loadMask=$('<div class="gBlock"><div align="center" class="gBlock-valignMiddle" ><div class="loadingImg" style="display:block"/></div></div>')
                    .mousedown(function(e){
                        return false;  //����˫����Ĭ��˫��ȫ��div���������ȫѡ��
                    })
                    .hide();
            grid.append(this.loadMask);
            
            this.titleDiv = $("<div class='titleDiv'></div>");
            grid.prepend(this.titleDiv);
            
            this.tbody=this.element.children().eq(0);
            this._guid = 0;//����ÿһ�ж����һ�� "_row_id"�Խ���Ψһ��ʶ
        },
        _init:function(){
        	var el=this.element,
        		options = this.options,
                grid = el.closest('.om-grid');
                
        	grid.width(options.width).height(options.height);
        	
            if(!$.isArray(this.options.colModel)){
                return; //���colModelû���û�ֵ���ԣ�ʲôҲ����
            }
            
            this.tbody.empty();
            $('table', this.hDiv).empty();
            this.pDiv.empty();
            this.titleDiv.empty();
            this._buildTableHead();
            this._buildPagingToolBar();
            this._buildLoadMask();
            this._bindSelectAndClickEnvent();
            this._bindScrollEnvent();
            this._makeColsResizable();
            this._buildTitle();
            
            var theadHeight = grid.children('.hDiv').outerHeight(),
                pagingToolBarHeight = grid.children('.pDiv').outerHeight() || 0,
                titleHeight = this.titleDiv.is(":hidden")? 0 : this.titleDiv.outerHeight() || 0,
                tbody = grid.children('.bDiv');
            tbody.height(grid.height()-theadHeight-pagingToolBarHeight-titleHeight);
            this.pageData={nowPage:1,totalPages:1};
            this._populate();
        },
        _buildTitle : function() {
        	var $title = this.titleDiv;
            if (this.options.title) {
                $title.html("<div class='titleContent'>" + this.options.title + "</div>").show();
            }else{
            	$title.empty().hide();
            }
        },
        _buildTableHead:function(){
            var op=this.options,
                el=this.element,
                grid = el.closest('.om-grid'),
                cms=op.colModel,
                allColsWidth = 0, //colModel�Ŀ��
                indexWidth = 0, //colModel�Ŀ��
                checkboxWidth = 0, //colModel�Ŀ��
                autoExpandColIndex = -1;
                thead=$('<thead></thead>');
                tr=$('<tr></tr>').appendTo(thead);
            //��Ⱦ�����
            if(op.showIndex){
                var cell=$('<th></th>').attr({axis:'indexCol',align:'center'}).addClass('indexCol').append($('<div class="indexheader" style="text-align:center;width:25px;"></div>'));
                tr.append(cell);
                indexWidth=25;
            }
            //��Ⱦcheckbox��
            if(!op.singleSelect){
                var cell=$('<th></th>').attr({axis:'checkboxCol',align:'center'}).addClass('checkboxCol').append($('<div class="checkboxheader" style="text-align:center;width:17px;"><span class="checkbox"/></div>'));
                tr.append(cell);
                checkboxWidth=17;
            }
            //��ȾcolModel����
            for (var i=0,len=cms.length;i<len;i++) {
                var cm=cms[i],cmWidth = cm.width || 60,cmAlign=cm.align || 'center';
                if(cmWidth == 'autoExpand'){
                    cmWidth = 0;
                    autoExpandColIndex = i;
                }
                var thCell=$('<div></div>').html(cm.header).css({'text-align':cmAlign,width:cmWidth});
                cm.wrap && thCell.addClass('wrap');
                var th=$('<th></th>').attr('axis', 'col' + i).addClass('col' + i).append(thCell);
                if(cm.name) {
                    th.attr('abbr', cm.name);
                }
                if(cm.align) {
                    th.attr('align',cm.align);
                }
                //var _div=$('<div></div>').html(cm.header).attr('width', cmWidth);
                allColsWidth += cmWidth;
                tr.append(th);
            }
            //tr.append($('<th></th'));
            el.prepend(thead);
            
            
            $('table',this.hDiv).append(thead);
            //�������е��п�
            if(autoExpandColIndex != -1){ //˵����ĳ��Ҫ�Զ�����
                var tableWidth=grid.width()-30,
                	toBeExpandedTh=tr.find('th[axis="col'+autoExpandColIndex+'"] div');
                //��ȻtoBeExpandedTh.parent().width()Ϊ0,����ͬ������ڼ����±ߵ�thead.width()��Ȼ�в���(Chrome)�����Ըɴ��������ˣ���֤�������������thead.width()ֵһ��
                toBeExpandedTh.parent().hide();
                var usableWidth=tableWidth-thead.width();
                toBeExpandedTh.parent().show();
                if(usableWidth<=0){
                    toBeExpandedTh.css('width',60);
                }else{
                    toBeExpandedTh.css('width',usableWidth);
                }
            }else if(op.autoFit){
                var tableWidth=grid.width()-20,
                    usableWidth=tableWidth-thead.width(),
                    percent=1+usableWidth/allColsWidth,
                    toFixedThs=tr.find('th[axis^="col"] div');
                for (var i=0,len=cms.length;i<len;i++) {
                    var col=toFixedThs.eq(i);
                    col.css('width',parseInt(col.width()*percent));
                }
            }
            this.thead=thead;
            thead = null;
        },
        _buildPagingToolBar:function(){
            var op=this.options;
            if(op.limit<=0){
                return;
            }
            var self=this,
                el=this.element,
                pDiv= this.pDiv;
            pDiv.html('<div class="pDiv2">'+
                    '<div class="pGroup">'+
                    '<div class="pFirst pButton om-icon"><span class="om-icon-seek-start"></span></div>'+
                    '<div class="pPrev pButton om-icon"><span class="om-icon-seek-prev"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup"><span class="pControl"></span></div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup">'+
                    '<div class="pNext pButton om-icon"><span class="om-icon-seek-next"></span></div>'+
                    '<div class="pLast pButton om-icon"><span class="om-icon-seek-end"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup">'+
                    '<div class="pReload pButton om-icon"><span class="om-icon-refresh"></span></div>'+
                '</div>'+
                '<div class="btnseparator"></div>'+
                '<div class="pGroup"><span class="pPageStat"></span></div>'+
            	'</div>');
            var pageText = $.om.lang._get(op,"omGrid","pageText").replace(/{totalPage}/, '<span>1</span>').replace(/{index}/, '<input type="text" size="4" value="1" />');
            $('.pControl',pDiv).html(pageText);
            el.parent().after(pDiv);
            $('.pReload', pDiv).click(function() {
                self._populate();
            });
            $('.pFirst', pDiv).click(function() {
                self._changePage('first');
            });
            $('.pPrev', pDiv).click(function() {
                self._changePage('prev');
            });
            $('.pNext', pDiv).click(function() {
                self._changePage('next');
            });
            $('.pLast', pDiv).click(function() {
                self._changePage('last');
            });
            $('.pControl input', pDiv).keydown(function(e) {
                if (e.keyCode == $.om.keyCode.ENTER) {
					self._changePage('input');
				}
            });
            $('.pButton', pDiv).hover(function() {
                $(this).addClass('om-state-hover');
            }, function() {
                $(this).removeClass('om-state-hover');
            });
            this.pager=pDiv;
        },
        _buildLoadMask:function(){
            var grid = this.element.closest('.om-grid');
            this.loadMask.css({width:grid.width(),height:grid.height()});
        },
        _changePage : function(ctype) { // change page
            if (this.loading) {
                return true;
            }
            var el=this.element,
                op=this.options,
                grid = el.closest('.om-grid'),
                pageData = this.pageData,
                nowPage=pageData.nowPage,
                totalPages=pageData.totalPages,
                newPage = nowPage;
            this._oldPage = nowPage;//����þɵ�ҳ������Щ�����sort����Ҫ�õ���
            switch (ctype) {
                case 'first':
                    newPage = 1;
                    break;
                case 'prev':
                    if (nowPage > 1) {
                        newPage = nowPage - 1;
                    }
                    break;
                case 'next':
                    if (nowPage < totalPages) {
                        newPage = nowPage + 1;
                    }
                    break;
                case 'last':
                    newPage = totalPages;
                    break;
                case 'input':
                    var nv = parseInt($('.pControl input', el.closest('.om-grid')).val());
                    if (isNaN(nv)) {
                        nv = nowPage;
                    }
                    if (nv < 1) {
                        nv = 1;
                    } else if (nv > totalPages) {
                        nv = totalPages;
                    }
                    $('.pControl input', this.pDiv).val(nv);
                    newPage = nv;
                    break;
                default:
                    if (/\d/.test(ctype)) {
                        var nv = parseInt(ctype);
                        if (isNaN(nv)) {
                            nv = 1;
                        }
                        if (nv < 1) {
                            nv = 1;
                        } else if (nv > totalPages) {
                            nv = totalPages;
                        }
                        $('.pControl input', el.closest('.om-grid')).val(nv);
                        newPage = nv;
                    }
            }
            if (newPage == nowPage) {
                return false;
            }
            //�����¼�
            if(this._trigger("onPageChange",null,ctype,newPage)===false){
                return;
            }
            //�޸�pageData
            pageData.nowPage=newPage;
            //��ҳʱȥ��ȫѡ״̬
            $('th.checkboxCol span.checkbox',grid).removeClass('selected');
            //ˢ������
            this._populate();
        },
        //ˢ������
        _populate : function() { // get latest data
            var self=this,
                el = this.element,
                grid = el.closest('.om-grid'),
                op = this.options,
                pageStat = $('.pPageStat', grid);
            if (!op.dataSource) {
                $('.pPageStat', grid).html(op.emptygMsg);
                return false;
            }
            if (this.loading) {
                return true;
            }
            var pageData = this.pageData,
                nowPage = pageData.nowPage || 1,
                loadMask = $('.gBlock',grid);
            //�߱��������ݵ�ǰ�������ˣ�׼������
            this.loading = true;
            pageStat.html($.om.lang._get(op,"omGrid","loadingMsg"));
            loadMask.show();
            var limit = (op.limit<=0)?100000000:op.limit;
            var param =$.extend(true,op.extraData,{
                start : limit * (nowPage - 1),
                limit : limit,
                _time_stamp_ : new Date().getTime()
            });
            $.ajax({
                type : op.method,
                url : op.dataSource,
                data : param,
                dataType : 'json',
                success : function(data,textStatus,request) {
                    var onSuccess = op.onSuccess;
                    if (typeof(onSuccess) == 'function') {
                        self._trigger("onSuccess",null,data,textStatus,request);
                    }
                    self._addData(data);
                    self._trigger("onRefresh",null,nowPage,data.rows);
                    for(var i=0 , len=op._onRefreshCallbacks.length; i<len; i++){
                    	op._onRefreshCallbacks[i].call(self);
                    }
                    loadMask.hide();
                    self.loading = false;
                },
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    pageStat.html($.om.lang._get(op,"omGrid","errorMsg")).css('color','red');
                    try {
                        var onError = op.onError;
                        if (typeof(onError) == 'function') {
                            onError(XMLHttpRequest, textStatus, errorThrown);
                        }
                    } catch (e) {
                        // do nothing 
                    } finally {
                        loadMask.hide();
                        self.loading = false;
                        return false;
                    }
                    
                }
            });
        },
        _addData:function(data){
            var op = this.options,
                el = this.element,
                grid = el.closest('.om-grid'),
                pageStat = $('.pPageStat', grid),
                preProcess = op.preProcess,
                pageData=this.pageData;
            //Ԥ����
            preProcess && (data=preProcess(data));
            pageData.data=data;
            pageData.totalPages = Math.ceil(data.total/op.limit);
            //ˢ�·�ҳ��
            this._buildPager();
            this._renderDatas();
        },
        _buildPager:function(){
            var op=this.options;
            if(op.limit<=0){
                return;
            }
            var el=this.element,
                pager=this.pager,
                pControl=$('.pControl',pager),
                pageData = this.pageData,
                nowPage=pageData.nowPage,
                totalPages=pageData.totalPages,
                data=pageData.data,
                from=op.limit* (nowPage-1)+1,
                to=from-1+data.rows.length,
                pageStat='';
            if(data.total===0){
                pageStat=$.om.lang._get(op,"omGrid","emptyMsg");
            }else{
                pageStat = $.om.lang._get(op,"omGrid","pageStat").replace(/{from}/, from).replace(/{to}/, to).replace(/{total}/, data.total);
            }
            $('input',pControl).val(nowPage);
            $('span',pControl).html(totalPages);
            $('.pPageStat', pager).html(pageStat);
        },
        _renderDatas:function(){
            var self=this,
                el=this.element,
                op=this.options,
                grid=el.closest('.om-grid'),
                gridHeaderCols=$('.hDiv thead tr:first th',grid),
                rows=this.pageData.data.rows,
                colModel=op.colModel,
                rowClasses=op.rowClasses,
                tbody=$('tbody',el).empty(),
                isRowClassesFn= (typeof rowClasses === 'function'),
                pageData = this.pageData,start=(pageData.nowPage-1)*op.limit,
                tdTmp = "<td align='$' abbr='$' class='$'><div align='$' class='$' style='width:$px'>$</div></td>",//tdģ��
                headerWidth = [],
                bodyContent = [],
                cols,
                j;
            
            self.hDiv.scrollLeft(0);
            
            $(gridHeaderCols).each(function(index){
            	headerWidth[index] = $('div',$(this)).width();
            });
    		
            $.each(rows,function(i, rowData) {
                var rowCls = isRowClassesFn? rowClasses(i,rowData):rowClasses[i % rowClasses.length];
                var rowValues=self._buildRowCellValues(colModel,rowData,i);
                bodyContent.push("<tr _grid_row_id="+(self._guid++)+" class='om-grid-row " + rowCls + "'>");
               
               	$(gridHeaderCols).each(function(index){
                    var axis = $(this).attr('axis'),wrap=false,html;
                    if(axis == 'indexCol'){
                        html=i+start+1;
                    }else if(axis == 'checkboxCol'){
                        html = '<span class="checkbox"/>';
                    }else if(axis.substring(0,3)=='col'){
                        var colIndex=axis.substring(3);
                        html=rowValues[colIndex];
                        if(colModel[colIndex].wrap){
							wrap=true;
						} 
                    }else{
                        html='';
                    }
                    cols = [this.align , this.abbr , axis , this.align , wrap?'wrap':'', headerWidth[index] , html];
                    j=0;
                    bodyContent.push(tdTmp.replace(/\$/g , function(){
                    	return cols[j++];
                    }));
                });
                bodyContent.push("</tr>");
            });
           	tbody.html(bodyContent.join(" ")); 
        },
        _buildRowCellValues:function(colModel,rowData,rowIndex){
            var len=colModel.length,values=[];
            for(var i=0;i<len;i++){
                var c=colModel[i],
                	v,
                	r=c.renderer;
                if(c.name.indexOf(".") > 0){
                	var properties = c.name.split("."),
                		j = 1,
                		length = properties.length,
                		v = rowData[properties[0]];
                	while(j<length && v && (v=v[properties[j++]]) != undefined){}
                }
                v = v || rowData[c.name] || "";
                if(typeof r === 'function'){
                    v=r(v,rowData,rowIndex);
                }
                values[i]=v;
                v = null;
            }
            return values;
        },
        //����ˮƽ������ʱ�ñ�ͷ�ͱ���һ����������û�����������ֻ�б����������ͷ���ᶯ����ͷ�ͱ���ͶԲ����ˣ�
        _bindScrollEnvent:function(){
            var hDiv=this.thead.closest('.hDiv');
            this.tbody.closest('.bDiv').scroll(function(){
                hDiv.scrollLeft($(this).scrollLeft());
            });
        },
        //����ѡ��/�з�ѡ/�е���/��˫�����¼�����
        _bindSelectAndClickEnvent:function(){
            var self=this;
            //�����checkbox������¼�
            if(!this.options.singleSelect){ //���Զ�ѡ
                // ȫѡ/��ѡ,����Ҫˢ��headerChekcbox��ѡ��״̬
                $('th.checkboxCol span.checkbox',this.thead).click(function(){
                    var thCheckbox=$(this),trSize=self._getTrs().size();
                    if(thCheckbox.hasClass('selected')){ //˵����Ҫȫ��ȡ��ѡ��
                        thCheckbox.removeClass('selected');
                        for(var i=0;i<trSize;i++){
                            self._rowDeSelect(i);
                        }
                    }else{ //˵����Ҫȫѡ
                        thCheckbox.addClass('selected');
                        for(var i=0;i<trSize;i++){
                            self._rowSelect(i);
                        }
                    }
                });
                //�е���,��Ҫˢ��headerChekcbox��ѡ��״̬
                this.tbody.delegate('tr.om-grid-row','click',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        self._rowDeSelect(index);
                    }else{
                        self._rowSelect(index);
                    }
                    self._refreshHeaderCheckBox();
                    self._trigger("onRowClick",event,index,self._getRowData(index));
                });
                //��˫��
                this.tbody.delegate('tr.om-grid-row','dblclick',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        //do nothing
                    }else{
                        self._rowSelect(index);
                        self._refreshHeaderCheckBox();
                    }
                    self._trigger("onRowDblClick",event,index,self._getRowData(index));
                });
            }else{ //���ɶ�ѡ
                //�е���
                this.tbody.delegate('tr.om-grid-row','click',function(event){
                    var row=$(this),index=self._getRowIndex(row);
                    if(row.hasClass('om-state-highlight')){ //��ѡ��
                        // no need to deselect another row and select this row
                    }else{
                        var lastSelectedIndex = self._getRowIndex(self.tbody.find('tr.om-state-highlight:not(:hidden)'));
                        (lastSelectedIndex != -1) && self._rowDeSelect(lastSelectedIndex);
                        self._rowSelect(index);
                    }
                    self._trigger("onRowClick",event,index,self._getRowData(index));
                });
                
                //��˫��,��Ϊ˫��һ�����ȴ������������Զ��ڵ�ѡ���˫��ʱ��һ��һ����ѡ�еģ����Բ���Ҫǿ��˫��ǰѡ��
                this.tbody.delegate('tr.om-grid-row','dblclick',function(event){
                    var index = self._getRowIndex(this);
                    self._trigger("onRowDblClick",event,index,self._getRowData(index));
                });
            }
        },
        _getRowData:function(index){
            return this.pageData.data.rows[index];
        },
        _rowSelect:function(index){
             var el=this.element,
                op=this.options,
                tbody=$('tbody',el),
                tr=this._getTrs().eq(index),
                chk=$('td.checkboxCol span.checkbox',tr);
            tr.addClass('om-state-highlight');
            chk.addClass('selected');
            this._trigger("onRowSelect",null,index,this._getRowData(index));
        },
        _rowDeSelect:function(index){
            var el=this.element,
                op=this.options,
                tbody=$('tbody',el),
                tr=this._getTrs().eq(index),
                chk=$('td.checkboxCol span.checkbox',tr);
            tr.removeClass('om-state-highlight');
            chk.removeClass('selected');
            this._trigger("onRowDeselect",null,index,this._getRowData(index));
        },
        _refreshHeaderCheckBox:function(){
            var selectedRowSize=$('td.checkboxCol span.selected',this.tbody).size(),
                headerCheckbox = $('th.checkboxCol span.checkbox',this.thead);
            if(selectedRowSize < this._getTrs().size()){
                headerCheckbox.removeClass('selected');
            }else{
                headerCheckbox.addClass('selected');
            }
        },
        //���п��Ըı��ȣ�index�к�checkbox�в����Ըı��ȣ�
        _makeColsResizable:function(){
            var self=this,
                bDiv=self.tbody.closest('.bDiv'),
                grid=self.element.closest('.om-grid'),
                $titleDiv = this.titleDiv,
                pDiv=self.pager,
                differWidth;
                
            $('th[axis^="col"] div',self.thead).omResizable({
                handles: 'e',//ֻ��ˮƽ�ı��С
                containment: 'document',
                minWidth: 60,
                resize: function(ui , event) {
                    var _this=$(this),abbr=_this.parent().attr('abbr'),dataCells=$('td[abbr="'+abbr+'"] > div',self.tbody),hDiv=self.thead.closest('.hDiv');
                    _this.width(ui.size.width).height('');
                    dataCells.width(ui.size.width).height('');
                    bDiv.height(grid.height()-($titleDiv.is(":hidden")?0:$titleDiv.outerHeight())-hDiv.outerHeight()-pDiv.outerHeight());
                    hDiv.scrollLeft(bDiv.scrollLeft());
                },
                start: function(ui , event) {
                	differWidth = $(this).parent().width();
                },
                stop: function(ui , event) {
                	var callbacks = self.options._omResizableCallbacks,
                		$th = $(this).parent(),
                		hDiv=self.thead.closest('.hDiv');
                	differWidth = $th.width() - differWidth;
                	for(var i=0,len=callbacks.length; i<len; i++){
                		callbacks[i].call(self , $th , differWidth );
                	}
                	hDiv.scrollLeft(bDiv.scrollLeft());
                }
            });
        },
        //����������������Ϊ�˸�����������grid�������Ϊ�ܶ������tr���в����������б༭������tr�������أ����������ȡ������Ҫע�ⲻ������ͻ��
		_getRowIndex:function(tr){
			return this._getTrs().index(tr);
		},
		//��ȡ�����������У��˷���һ�����Լ������������
		_getTrs:function(){
			return this.tbody.find("tr.om-grid-row:not(:hidden)");		
		},
        //public methods
        /**
         * �޸�ȡ��url������ˢ�����ݡ�һ�����ڲ�ѯ���������翪ʼʱȡ��url��data.json���̨ʵ���յ�data.json?start=0&limit=15���������󡣲�ѯʱʹ��setData������ȡ��url�ĳ�data.json?queryString=admin����̨ʵ���յ�data.json?queryString=admin&start=0&limit=15���������󣬺�̨���ݲ���queryString������ѯ���ɡ�
         * @name omGrid#setData
         * @function
         * @param url �µ�����Դurl
         * @returns jQuery����
         * @example
         *  //ʹ���µ�url��ȡ������������������ʼˢ�±�����ݡ�
         *  $('.selector').omGrid('setData', 'newgriddata.json');
         */
        setData:function(url){
            this.options.dataSource=url;
            this.pageData={nowPage:1,totalPages:1};
            this._populate();
        },
        /**
         * ��ȡ���JSON���ݡ�<br/>
         *     
         * @name omGrid#getData
         * @function
         * @returns ���û������preProcess�򷵻��ɺ�̨�������Ķ��������preProcess�򷵻ش����Ķ���
         * @example
         * //��ȡgrid������Դ
         * var store = $('.selector').omGrid('getData');
         * 
         * 
         */
        getData:function(){
            return this.pageData.data;
        },
        /**
         * ʹ��getData�����Ľ��������Ⱦ���ݡ�<b>ע�⣺�÷��������ᷢ��Ajax���󣬶���������ǰ���ڼ������ݣ�loadmask��δ��ʧ���Ļ���ʲôҲ����ֱ�ӷ���</b>��
         * @name omGrid#refresh
         * @function
         * @returns jQuery����
         * @example
         * //���ݵ�ǰgrid����ģ���е����ݣ�����ˢ��grid
         * $('.selector').omGrid('refresh');//ע��refreshû�д������
         * 
         */
        refresh:function(){
            // �޸�����ģ�ͺ�����ô˷�����ǿ��ˢ�£����ͻ�����Ϊ,�����̨��������
            if (this.loading) {
                return true;
            }
            this.loading = true;
            var op=this.options;
            $('.pPageStat', this.pager).html($.om.lang._get(op,"omGrid","loadingMsg"));
            this.loadMask.show();
            this._buildPager();
            this._renderDatas();
            this._trigger("onRefresh",null,this.pageData.nowPage || 1,this.pageData.data.rows);
            //�����б༭���
            for(var i=0 , len=op._onRefreshCallbacks.length; i<len; i++){
            	op._onRefreshCallbacks[i].call(this);
            }
            this.loadMask.hide();
            this.loading = false;
        },
        /**
         * ˢ�±�����û�в�����ˢ�µ�ǰҳ������в�����ת����������ʾ��ҳ������������Ϸ����Զ�������������<b>ע�⣺�÷����ᷢ��Ajax���󣬶���������ǰ���ڼ������ݣ�loadmask��δ��ʧ���Ļ���ʲôҲ����ֱ�ӷ���</b>��
         * @name omGrid#reload
         * @function
         * @param page Ҫת����ҳ������Ϊ�ձ�ʾˢ�µ�ǰҳ����������������ֻ���С��1���Զ�����Ϊ1���������������ҳ�����Զ�����Ϊ��ҳ����
         * @returns jQuery����
         * @example
         * $('.selector').omGrid('reload');//ˢ�µ�ǰҳ
         * $('.selector').omGrid('reload',3);//ת����3ҳ
         * 
         */
        reload:function(page){
            if (this.loading) {
                return true;
            }
            if(typeof page !=='undefined'){
                page=parseInt(page) || 1;
                if(page<0){
                    page = 1;
                }
                if(page>this.pageData.totalPages){
                    page=this.pageData.totalPages;
                }
                this.pageData.nowPage = page;
            }
            //�൱��goto(page) and reload()����ת����һҳ������ˢ�����ݣ����̨��������
            //û�в���ʱˢ�µ�ǰҳ
            this._populate();
        },
        /**
         * ѡ���С�<b>ע�⣺����Ĳ�������ţ���һ����0�ڶ�����1�����飨����[0,1]��ʾѡ���һ�к͵ڶ��У���Ҫ���������ѡ����ʹ�ÿ�����[]��Ϊ������ֻ�ܴ���������飬���Ҫ�����ӵ�ѡ���㷨�������������ط���������������ô˷������˷������������ѡ��״̬����ѡ���1,2��Ȼ��setSelections([3])�������ֻ�е�3�У���setSelections([3,4]);setSelections([5,6])��ֻ��ѡ��5,6����</b>��
         * @name omGrid#setSelections
         * @function
         * @param indexes ��ţ���һ����0�ڶ�����1�����顣
         * @returns jQuery����
         * @example
         * //ѡ�����еڶ��С������С�������
         * $('.selector').omGrid('setSelections',[1,2,4]);
         * 
         */
        setSelections:function(indexes){
            var self=this;
            if(!$.isArray(indexes)){
                indexes=[indexes];
            }
            var selected=this.getSelections();
            $(selected).each(function(){
                self._rowDeSelect(this);
            });
            $(indexes).each(function(){
                self._rowSelect(this);
            });
            self._refreshHeaderCheckBox();
        },
        /**
         * ��ȡѡ����е��кŻ��м�¼��<b>ע�⣺Ĭ�Ϸ��ص����������ɵ����飨��ѡ���˵�2�к͵�5���򷵻�[1,4]�������Ҫ�����м�¼JSON��ɵ�������Ҫ����һ��true��Ϊ����</b>��
         * @name omGrid#getSelections
         * @function
         * @param needRecords ����Ϊtrueʱ���صĲ����������������м�¼���顣����Ϊ�ջ���trueʱ������������顣
         * @returns jQuery����
         * @example
         * var selectedIndexed = $('.selector').omGrid('getSelections');
         * var selectedRecords = $('.selector').omGrid('getSelections',true);
         * 
         */
        getSelections:function(needRecords){
            //needRecords=trueʱ����Record[],�����Ϊfalseʱ����index[]
            var self=this,
            	selectedTrs=$('tr.om-state-highlight:not(:hidden)',this.tbody),
            	trs = self._getTrs(),
            	result=[];
            if(needRecords){
            	var rowsData = self.getData().rows;
            	selectedTrs.each(function(index , tr){
            		result[result.length] = rowsData[trs.index(tr)];
            	});
            }else{
            	selectedTrs.each(function(index , tr){
            		result[result.length] = trs.index(tr);
            	});
            }
            return result;
        },
        destroy:function(){
        	var $el = this.element;
        	$el.closest('.om-grid').after($el).remove();
        }
    });
    
    $.om.lang.omGrid = {
        loadingMsg:'���ڼ������ݣ����Ժ�...',
        emptyMsg:'û������',
        errorMsg:'ȡ������',
        pageText:'��{index}ҳ����{totalPage}ҳ',
        pageStat:'��{total}�����ݣ���ʾ{from}-{to}��'
    };
})(jQuery);/*
 * $Id: om-accordion.js,v 1.67 2012/03/16 05:51:30 chentianzhen Exp $
 * operamasks-ui omAccordion 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 *  om-panel.js
 */
(function( $, undefined ) {
    var panelIdPrefix = 'om-accordion-panel-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-',
    id = 0;
	/**
     * @name omAccordion
     * @class ���벼��������Գ������ʽչ����Ϣ��ÿ���������ݿ�Ϊ��ǰҳ�����ݣ�Ҳ����ʹ��Ajaxװ������ҳ������ݣ���ԭ����jQuery��load������û�õ�Ƕ���iframe����֧�ֿ���װ��.֧�ֳ�ʼ�������ٴθ���ĳ�����������Դ(����url����)��ֵ��ע�����:��������Դ���ᴥ�������ˢ�²�������Ҫ��ʾ������һ��api�����(����reload����)��<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>֧��Ajaxװ��</li>
     *      <li>֧���Զ���ÿ������ͼ��</li>
     *      <li>֧�ֶ��ֳ����л���ʽ</li>
     *      <li>֧�ֶ�̬��������Դ</li>
     *      <li>֧�ֶ�̬��������</li>
     *      <li>֧�ֶ�ʱ�Զ��л�����</li>
     *      <li>֧�ֶ����¼�����</li>
     * </ol>
     * <b>ʹ�÷�ʽ��</b><br/><br/>
     * ҳ����������html���
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#make-accordion').omAccordion();
     * });
     * &lt;/script>
     * 
     * &lt;div id="make-accordion"&gt;
     *    &lt;ul&gt;
     *        &lt;li&gt;
     *            &lt;a href="./remote.html" id="accordion1"&gt;Title1&lt;/a&gt;&lt;!--�˳����idΪaccordion1�����û����ʾָ�������Զ�����--&gt;
     *        &lt;/li&gt;
     *        &lt;li&gt;
     *             &lt;a href="#accordion2"&gt;Title2&lt;/a&gt;&lt;!--�˳����idΪaccordion2--&gt;
     *         &lt;/li&gt;
     *         &lt;li&gt;
     *             &lt;a href="#accordion3"&gt;Title3&lt;/a&gt;&lt;!--�˳����idΪaccordion3--&gt;
     *         &lt;/li&gt;
     *    &lt;/ul&gt;
     *    &lt;div id="accordion2"&gt;
     *      this is accordion2 content
     *    &lt;/div&gt;
     *    &lt;div id="accordion3"&gt;
     *      this is accordion3 content
     *    &lt;/div&gt;
     * &lt;/div&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{width:500, height:300}
     */
$.omWidget( "om.omAccordion", {
	
    options: /**@lends omAccordion#*/{
        /**
         * ���벼���״�չ��ʱ��Ĭ��չ���ĳ��������������Ϊ����,Ҳ����Ϊ�����id,��ȡ��ǰ���ڼ���״̬�ĳ���id����getActivated()������<br/>
         * ����������ʱ�����г��붼��չ����������������<br/>
         * $('#make-accordion').omAccordion({collapsible:true,active:-1});<br/>
         * ��������Ȱ�id���д�������Ҳ�����Ӧ���룬�������������ڴ�������ʱ��������parseInt��isNaN���д���<br/>
         * <ul>
         * <li>����������Ϊ0����active=-1��</li>
         * <li>��������������0����activeС��0(��Ϊ-1ʱ����collapsible!==false��������������г���)����active=0��</li>
         * <li>��������������0����active���ڳ���ĸ�������active=����ĸ���-1</li>
         * </ul>
         * @default 0
         * @type Number String
         * @example
         * //�����һ������
         * $('#make-accordion').omAccordion({active: 1});
         * //����idΪ'contentId'�ĳ���
         * $('#make-accordion').omAccordion({active: 'contentId'});
         * //�������еĳ���(��ʱ������collapsible!==false)
         * $('#make-accordion').omAccordion({active:-1});
         */
        active:0,
        /**
         * �Ƿ��Զ�ѭ���л����롣��interval���ʹ�ã�interval����ָ���л���ʱ������
         * @default false
         * @type Boolean
         * @example
         * //�Զ�ѭ���л�����
         * $('#make-accordion').omAccordion({autoPlay: true});
         */
        autoPlay : false,
        /**
         * �Ƿ��������г������𡣵���ֵΪtrueʱ������Ѿ�չ���ĳ���ʱ�ó��뱻���𣬽�����г��붼��������״̬����Ĭ������²���������ó��룬��һʱ������һ�������Ǵ��ڼ���״̬�ģ���
         * @default false
         * @type Boolean
         * @example
         * //���ÿ����������еĳ���
         * $('#make-accordion').omAccordion({collapsible :true});<br/>
         * //������ִ���±ߴ���Ϳ����������г�����
         * $('#make-accordion').omAccordion({active : -1});<br/>
         */
        collapsible : false,
        /**
         * �Ƿ���������������ã��򲻿��ԶԳ�������κβ�����
         * @type Boolean
         * @default false
         * @example
         * $('#make-accordion').omAccordion({disabled:true});
         */
        disabled : false,
        /**
         * ���벼�ֵĸ߶ȣ���ȡֵΪ'auto'��ÿ������ĸ߶ȷֱ��ɳ�������ݾ�����������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С��height:100%�����κ�������ֵ������ٷֱȡ����֡�em��λ��px��λ��ֵ�ȵȣ�����ֱ�Ӹ���height���ԡ�
         * @default 'auto'
         * @type Number,String
         * @example
         * $('#make-accordion').omAccordion({height: '50%'});
         */
        height:'auto',
        /**
         * ÿ�������headerǰ���������һ��Сͼ�꣬iconClsΪ��Сͼ�����ʽ����ͼ����������������Բ�ͬ������������config�����У�������ΪDOM�ṹ�� &lt;a&gt; ��ǩ�����Զ����ڡ�
         * �������demo"�򵥳���"�п��Կ���������ʾ����
         * @default ��
         * @type String
         * @example
         * //DOM���ṹ��ע��a��ǩ�ϵ�iconCls
         * &lt;div id="make-accordion"&gt;
         *  &lt;ul&gt;
         *      &lt;li&gt;
         *          &lt;a iconCls="file-save" href="#accordion-1"&gt;&lt;/a&gt;
         *      &lt;/li&gt;
         *  &lt;/ul&gt;
         *  &lt;div id="accordion-1"&gt;
         *      This is Accordion-1
         *  &lt;/div&gt;
         * &lt;/div&gt;
         */
        iconCls : null,
        /**
         * ���Զ�ѭ���л����루��autoPlay����true��ʱ�������л�����֮���ʱ��������λΪ���롣
         * @default 1000
         * @type Number
         * @example
         * //ÿ��2s�Զ��л�����
         * $('#make-accordion').omAccordion({autoPlay: true, interval : 2000});
         */
        interval : 1000,
        /**
         * �����л�ʱ�Ƿ���Ҫ����Ч���������ö���Ч������ʹ��jQuery��slideUp��slideDown�������ٶ�Ϊfast�� ����Ч�����ɶ��ơ�
         * @default false
         * @type Boolean
         * @example
         * //�����չ������ʱʹ�ö���Ч��
         * $('#make-accordion').omAccordion({switchEffect: true});
         */
        switchEffect : false,
        /**
         * �����л��ķ�ʽ��ȡֵΪ�����2��֮һ: "click"��"mouseover"��click��ʾ�����л���mouseover��ʾ��껬���л���
         * @default "click"
         * @type String
         * @example
         * //��껬���л�����
         * $('#make-accordion').omAccordion({switchMode: 'mouseover'});
         */
        switchMode:"click",
        /**
         * ���벼�ֵĿ�ȣ���ȡֵΪ'auto'��Ĭ�����,�������������ȣ�������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С��width:100%�����κ�������ֵ������ٷֱȡ����֡�em��λ��px��λ��ֵ�ȵȣ�����ֱ�Ӹ���width���ԡ� 
         * @default 'auto'
         * @type Number,String
         * @example
         * $('#make-accordion').omAccordion({width: 500});
         */
        width:'auto',
        /**
         * ����һ������ʱִ�еķ���
         * @event
         * @param index ������ĳ������������0��ʼ������
         * @param event jQuery.Event����
         * @default emptyFn 
         * @example
         *  $('#make-accordion').omAccordion({
         *      onActivate : function(index, event) {
         *          alert('accordion ' + index + ' has been activated!');
         *      }
         *  });
         */
        onActivate: function(index, event){
        },
        /**
         * ����һ������֮ǰִ�еķ�����
         * ������ز���ֵfalse,��ô��Ӧ���뽫���ἤ�
         * @event
         * @param index ��ѡ��ĳ������������0��ʼ������
         * @param event jQuery.Event����
         * @default emptyFn 
         * @example
         *  $('#make-accordion').omAccordion({
         *      onBeforeActivate : function(index, event) {
         *          alert('accordion ' + index + ' will be activated!');
         *      }
         *  });
         */
        onBeforeActivate: function(index, event){
        },
        /**
         * ����һ������ǰִ�еķ�����
         * ������ز���ֵfalse,��ô��Ӧ���뽫���ᱻ����
         * @event
         * @param index ������ĳ������������0��ʼ������
         * @param event jQuery.Event����
         * @default emptyFn 
         * @example
         *  $('#make-accordion').omAccordion({
         *      onBeforeCollapse : function(index, event) {
         *          alert('accordion ' + index + ' will been collapsed!');
         *      }
         *  });
         */
        onBeforeCollapse: function(index, event){
        },
        /**
         * ����һ������ʱִ�еķ�����
         * @event
         * @param index ������ĳ������������0��ʼ������
         * @param event jQuery.Event����
         * @default emptyFn 
         * @example
         *  $('#make-accordion').omAccordion({
         *      onCollapse : function(index, event) {
         *          alert('accordion ' + index + ' has been collapsed!');
         *      }
         *  });
         */
        onCollapse : function(index, event) {
        }
    },
    /**
     * ����ָ���ĳ��롣indexΪ�������߳����id��<br/>
     * �κ��������ݽ�����parseInt��isNaN���д���
     * (ע�⣬������Ϊ����״̬��ִ�д˷������κ�Ч��)
     * <ul>
     * <li>����������Ϊ0���򲻼����κγ���</li>
     * <li>��������������0����index<0���򼤻��һ������(����Ϊ0���Ǹ�����)</li>
     * <li>��������������0����index>=����ĸ������򼤻����һ������</li>
     * </ul>
     * @name omAccordion#activate
     * @function
     * @param index Ҫ����ĳ��������(��0��ʼ)���߳����id
     * @example
     * $('#make-accordion').omAccordion('activate', '1');
     */
    activate: function(index){
    	var options = this.options;
    	clearInterval(options.autoInterId);
        this._activate(index);
        this._setAutoInterId(this);
    },
    /**
     * �����������������
     * @name omAccordion#disable
     * @function
     * @example
     * $('#make-accordion').omAccordion('disable');
     */
    disable : function() {
        var $acc = this.element,
        	options = this.options,
        	$disableDiv;
        if (options.autoPlay) {
            clearInterval(options.autoInterId);
        }
        options.disabled = true;
        
        if( ($disableDiv = $acc.find(">.om-accordion-disable")).length === 0 ){
	        $("<div class='om-accordion-disable'></div>").css({position:"absolute",top:0,left:0})
	        	.width($acc.outerWidth()).height($acc.outerHeight()).appendTo($acc);
        }
        $disableDiv.show();
    },
    /**
     * ʹ�������봦�ڿ���״̬(���ǽ���״̬)
     * @name omAccordion#enable
     * @function
     * @example
     * $('#make-accordion').omAccordion('enable');
     */
    enable : function() {
        this.options.disabled = false;
        this.element.find(">.om-accordion-disable").hide();
    },
    /**��ȡ��ǰ���ڼ���״̬�ĳ����id,�����������Ϊ0���ߵ�ǰû�г��봦�ڼ���״̬����ô����null<br/>
     * �����id�ڴ���ʱ��������ָ�������û��ָ��������ڲ��ᶯ̬����һ����<br/>
     * //DOM���ṹ��ע�⣬������봴����ĳ����idΪaccordion-1.<br/>
     * <pre>
     * &lt;div id="make-accordion"&gt;
     *  &lt;ul&gt;
     *      &lt;li&gt;
     *          &lt;a iconCls="file-save" href="#accordion-1"&gt;&lt;/a&gt;
     *      &lt;/li&gt;
     *  &lt;/ul&gt;
     *  &lt;div id="accordion-1"&gt;
     *      This is Accordion-1
     *  &lt;/div&gt;
     * &lt;/div&gt;
     * </pre>
     * @name omAccordion#getActivated
     * @function
     * @returns ��ǰ���ڼ���״̬�ĳ����id
     * @example
     * $('#make-accordion').omAccordion('getActivated');
     */
    getActivated: function(){
        var panels= $.data(this.element , "panels");
        for(var i=0, len = panels.length; i < len; i++){
        	if(!panels[i].omPanel("option" , "collapsed")){
        		return panels[i].prop("id");
        	}
        }
        return null;
    },
    /**
     * ��ȡ�����������
     * @name omAccordion#getLength
     * @function
     * @return len ���������
     * @example
     * var len = $('#make-accordion').omAccordion('getLength');
     * alert('total lenght of accordoins is : ' + len);
     */
    getLength: function(){
        return $.data(this.element, "panels").length;
    },
    /**
     * ����װ��ָ�����������.����ó��������Դ��url������ݸ�urlȥȡ���ݣ�����ó��������Դ����ͨ�ı�����ʲô����������
     * @name omAccordion#reload
     * @function
     * @param index Ҫ����װ�����ݵĳ������������0��ʼ�����������ǳ����id
     * @example
     * //����װ������Ϊ1�ĳ���
     * $('#make-accordion').omAccordion('reload', 1);
     */
    reload: function(index) {
        var panels= $.data(this.element , "panels");
        if(this.options.disabled !== false || panels.length === 0){
            return this;
        }
        index = this._correctIndex(index);
        panels[index].omPanel('reload');
    },
    /**
     * ���¼��㲢��̬�ı�������������Ĵ�С,��������������Ŀ�͸ߺ�Ҫ���ô˷����ſ�����Ч��
     */
    resize: function() {
        var $acc = this.element,
        	options  = this.options,
            panels = $.data(this.element , "panels"),
            headerHeight = 0;
        this._initWidthOrHeight('width');
        this._initWidthOrHeight('height');
    	$.each(panels , function(index , panel){
    		headerHeight += panel.prev().outerHeight();
    	});
    	$.each(panels , function(index , panel){
    		if(options.height === 'auto'){
    			panel.css('height'  , "");
    		}else{
    			panel.outerHeight($acc.height() - headerHeight);
    		}
    	});
    }, 
    /**
     * ����ָ������ı��⣬�������ݿ���Ϊhtml�ı���
     * @name omAccordion#setTitle
     * @function
     * @param index Ҫ�ı����ĳ������������0��ʼ�����������ǳ����id
     * @param title �µı��⣬���ݿ���Ϊhtml
     * @example
     * $('#make-accordion').omAccordion('setTitle',0,'apusic').omAccordion('setTitle',1,'AOM');
     */
    setTitle: function(index , title){
        var panels= $.data(this.element , "panels");
        if(this.options.disabled !== false || panels.length === 0){
            return this;
        }
        index = this._correctIndex(index);
        panels[index].omPanel("setTitle" , title);
    },
    
    /**
     * ��������ָ�����������Դ��ע��÷���ֻ��������������Դ������������ȥװ�ء�<br/>
     * ����װ����Ҫ������һ��api : $('make-accordion').omAccordion('reload',1);<br/>
     * �����Ҫ�������ݵĳ��벢������urlȥװ�صģ����������·�������:<br/>
     * $("#accordionId").find("#accordion-2").html("������AOM��һ��������Ŷ�");<br/>
     * ����accordion-2Ϊ�����id.
     * @name omAccordion#url
     * @function
     * @param index Ҫ������������Դ�ĳ������������0��ʼ������
     * @example
     * //�������õڶ������������Դ��Ȼ������װ�ظó��������
     * $('#make-accordion').omAccordion( 'url', 1, './ajax/content2.html' );
     * $('#make-accordion').omAccordion( 'reload',1 );
     */
    url : function(index, url) {
        var panels= $.data(this.element , "panels");
        if (!url || this.options.disabled !== false || panels.length === 0) {
            return ;
        }
        index = this._correctIndex(index);
        panels[index].omPanel('option' , "url" , url);
    },
    _create: function(){
        var $acc = this.element,
            options = this.options;
        $acc.addClass("om-widget om-accordion").css("position","relative");
        this._renderPanels();
        options.active = this._correctIndex(options.active);
        this.resize();
        this._buildEvent();
        if(options.disabled !== false){
        	this.disable();
        }
    },
    /**
     * ��������������ֵΪ-1,0,1,2,...,len-1
     */
    _correctIndex: function(index){
    	var $acc = this.element,
        	panels = $.data(this.element , "panels"),
        	panel = $acc.children().find(">div#"+index),
        	len = panels.length,
        	oldIndex = index;
        index = panel.length ? $acc.find(">.om-panel").index(panel.parent()) : index;
        index = index==-1 ? oldIndex : index;
        //���id�Ҳ���������Ϊ����������������
        var r = parseInt(index);
        r = (isNaN(r) && '0' || r)-0;
        return len==0 || (r === -1 && this.options.collapsible !== false) ? -1: (r<0? 0 : (r>=len?len-1 : r));
    },
    _panelCreateCollapse: function(len , index){
    	var $acc = this.element,
    		options = this.options,
    		panel,
    		num;
    	if(options.active === -1 && options.collapsible === true){
    		return true;
    	}else{
			panel = $acc.find(">div#"+options.active);
			num = $acc.children().index(panel);
			num = (num == -1? options.active : num); 		
    		var r = parseInt(num);
    		r = (isNaN(r) && '0' || r)-0;
    		r = r<0? 0 : (r>=len?len-1 : r);
    		return r !== index;  
    	}
    },
    _renderPanels: function () {
        var $acc = this.element,
        	self = this,
            panels = [],
            options = this.options;
        var $headers = $acc.find("ul:first");
        var cfg = [];
        $headers.find("a").each(function(n){
            var href  = this.getAttribute('href', 2);
            var hrefBase = href.split( "#" )[ 0 ],
                baseEl;
            if ( hrefBase && ( hrefBase === location.toString().split( "#" )[ 0 ] ||
                    ( baseEl = $( "base" )[ 0 ]) && hrefBase === baseEl.href ) ) {
                href = this.hash;
                this.href = href;
            }
            var $anchor = $(this);
            cfg[n] = {
                    title : $anchor.text(),
                    iconCls: $anchor.attr("iconCls"),
                    onExpand : function(event) {
                    	self._trigger("onActivate",event,n);
                    },
                    tools:[{id:"collapse" , handler: function(panel , event){
                    	clearInterval(options.autoInterId);
	                    self._activate(n , true);
	                    self._setAutoInterId(self);
	                    event.stopPropagation();
                    }}],
                    onCollapse : function(event) {
                    	self._trigger("onCollapse",event,n);
                    },
                    onSuccess : function() {
                    	self.resize();
                    },
                    onError : function() {
                    	self.resize();
                    }
            };
            var target = $('>' + href, $acc);
            var pId = target.prop("id"); 
            //targetҪôָ��һ����ǰҳ���div��Ҫô��һ��url
            if (!!(target[0])) {
                if(!pId){
                    target.prop("id" , panelIdPrefix+(id++));
                }
                target.appendTo($acc);
            } else {
                cfg[n].url = $anchor.attr('href');
                $("<div></div>").prop('id',$anchor.prop('id') || panelIdPrefix+(id++)).appendTo($acc);
            }
            /**
            if(n === 0){
                var $h = panels[0].prev();
                $h.css('border-top-width' , $h.css('border-bottom-width'));
            }
            **/
        }); 
        $headers.remove();
        $.each(cfg , function(index , config){
        	config.collapsed = self._panelCreateCollapse(cfg.length , index);
        });
		$.each($acc.children() , function(index , panel){
			panels.push(self._createPanel(panel , cfg[index]));
			if( index === 0){
				var $h = panels[0].prev();
                $h.css('border-top-width' , $h.css('border-bottom-width'));
			}
		});
        $.data($acc , "panels" , panels);  
    },
    _initWidthOrHeight: function(type){
    	var $acc = this.element,
        	options = this.options,
        	styles = this.element.attr("style"),
        	value = options[type];
        if(value == 'fit'){
            $acc.css(type, '100%');
        }else if(value !== 'auto'){
        	$acc.css(type , value);
        }else if(styles && styles.indexOf(type)!=-1){
        	options[type] = $acc.css(type);
        }else{//'auto'
        	$acc.css(type , '');
        }
    },
    _createPanel: function(target, config){
        return $(target).omPanel(config);
    },
    _buildEvent: function() {
        var options = this.options,
            self = this;
        this.element.children().find('>div.om-panel-header').each(function(n){
            var header = $(this);
            header.hover(function(){
                $(this).toggleClass("om-panel-header-hover");
            });
            if ( options.switchMode == 'mouseover' ) {
                header.bind('mouseenter.omaccordions', function(event){
                	clearInterval(options.autoInterId);
                    var timer = $.data(self.element, 'expandTimer');
                    (typeof timer !=='undefined') && clearTimeout(timer);
                    timer = setTimeout(function(){
                    	self._activate(n , true);
                        self._setAutoInterId(self);
                    },200);
                    $.data(self.element, 'expandTimer', timer);
                });
            } else if ( options.switchMode == 'click' ) {
                header.bind('click.omaccordions', function(event) {
                    clearInterval(options.autoInterId);
                    self._activate(n , true);
                    self._setAutoInterId(self);
                });
            } 
        });
        if (options.autoPlay) {
            clearInterval(options.autoInterId);
            self._setAutoInterId(self);
        }
        
    },
    _setAutoInterId: function(self){
    	var options = self.options;
    	if (options.autoPlay) {
    		options.autoInterId = setInterval(function(){
                self._activate('next');
            }, options.interval);
        }
    },
    _setOption: function( key, value ) {
    	$.OMWidget.prototype._setOption.apply( this, arguments );
		var options = this.options;
		switch(key){
			case "active":
				this.activate(value);
				break;
			case "disabled":
				value===false?this.enable():this.disable();
				break;
			case "width":
			    options.width = value;
			    this._initWidthOrHeight("width");
				break;
			case "height":
			    options.height = value;
			    this._initWidthOrHeight("height");
				break;
		}
    },
    _activate: function(index , isSwitchMode){
        var panels = $.data(this.element , "panels"),
        len = panels.length,
        options = this.options,
        self = this,
        isExpand = false,
        expandIndex=-1,
        anim = false,
        speed;
    	if(options.disabled !== false && len === 0){
    		return ;
    	}
    	index = index==='next' ? (options.active + 1) % len : self._correctIndex(index);
        if (options.switchEffect) {
            anim = true;
            speed = 'fast';
        }
        for(var i=0; i<len; i++){
            $(panels[i]).stop(true , true);
        }
        //�ҳ���ǰչ����panel
        var active = self.getActivated();
        isExpand = !!active;
        if(isExpand){
            expandIndex = self._correctIndex(active);
            if(expandIndex == index){
                if( isSwitchMode === true && options.collapsible !== false && self._trigger("onBeforeCollapse",null,expandIndex)!==false){
                    $(panels[expandIndex]).omPanel('collapse', anim, speed);
                    options.active = -1;
                }else{
                	options.active = expandIndex;
                }
            }else{//��ǰ��Ҫ����ĳ��벢���Ǵ��ڼ���״̬
                if(index === -1){
                	if(self._trigger("onBeforeCollapse",null,expandIndex)!==false){
	                	//������룬Ȼ����������ĳ��붼����������״̬
	                    $(panels[expandIndex]).omPanel('collapse', anim, speed);
	                    options.active = -1;
					}else{
						options.active = expandIndex;
					}
                }else if( self._trigger("onBeforeCollapse",null,expandIndex)!==false 
                        && (canAct=self._trigger("onBeforeActivate",null,index)!==false)  ){
                    $(panels[expandIndex]).omPanel('collapse', anim, speed);
                    $(panels[index]).omPanel('expand', anim, speed);
                    options.active = index;
                }else{
                	options.active = expandIndex;
                }
            }
        }else{//��ǰ��û���κ��Ѿ�����ĳ���
        	if(index === "-1"){
        		options.active = -1;
        	}else if(self._trigger("onBeforeActivate",null,index)!==false){
        		$(panels[index]).omPanel('expand', anim, speed);
                options.active = index;
        	}
        }
    }
});
})( jQuery );
/*
 * $Id: om-ajaxsubmit.js,v 1.14 2012/03/15 07:16:12 wangfan Exp $
 * operamasks-ui omAjaxSubmit 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */
;(function($) {

/*
	Usage Note:
	-----------
	Do not use both omAjaxSubmit and ajaxForm on the same form.  These
	functions are intended to be exclusive.  Use omAjaxSubmit if you want
	to bind your own submit handler to the form.  For example,

	$(document).ready(function() {
		$('#myForm').bind('submit', function(e) {
			e.preventDefault(); // <-- important
			$(this).omAjaxSubmit({
				target: '#output'
			});
		});
	});

	Use ajaxForm when you want the plugin to manage all the event binding
	for you.  For example,

	$(document).ready(function() {
		$('#myForm').ajaxForm({
			target: '#output'
		});
	});

	When using ajaxForm, the omAjaxSubmit function will be invoked for you
	at the appropriate time.
*/

/**
 * @name omAjaxSubmit
 * @class
 * <div>
 * omAjaxSubmit() �ṩʹ��ajax��ʽ�ύHTML form��һ�ֻ��ơ���������������submit�¼���<br/>
 * ���Ǵ�ͳ��submit�¼�����������ʹ��ajax��ʽ������submit�¼����ڱ��ύ֮ǰ����������ռ�<br/>
 * ���еı��ֶΣ�����֮���л��󸽼���ajax�����������(data)�С�֧�����б�׼��html���ύ��<br/>
 * ��Ԫ�ء�
 * </div><br/>
 * <b>�¼��ص�</b><br/>
 * <div>
 * ͨ���ḻ�����ò�����omAjaxSubmit���Ը߶��Զ��ơ�ͬʱ�ṩ����¼��ص���������ÿһ������<br/>
 * �ı��ύ�Ĺ����У��û���ʱ���ܹ����ύ����������޸ġ�
 * </div>
 * <pre>beforeSerialize:</pre>
 * <div style="text-indent:2em;">��form���л�֮ǰִ�еĻص��������ڻ�ȡ����form���ֶε�ֵ֮ǰ���ú����ṩ��һ������form��ʱ��</div>
 * <pre>beforeSubmit:</pre>
 * <div style="text-indent:2em;">��form���ύ֮ǰִ�еĻص��������ú����ṩ��һ��ʱ����ִ��Ԥ�ύ���߼��������У��</div><br/>
 * <b>���߷���</b><br/>
 * <div>omAjaxSubmit���ṩ��һϵ�о�̬���߷��������ڷ���ز����������ֶΡ�</div>
 * <pre>$.fn.formToArray()</pre>
 * <div style="text-indent:2em;">��������Ԫ��ת����key/value�����飬����[{name:'username', value:'jack'},{name:'password', value:'secret'}]��<br/>
 * ע��:�����齫��Ϊ�������ݸ�beforeSubmit����</div>
 * <pre>$.fn.formSerialize()</pre>
 * <div style="text-indent:2em;">�����������л��ɿ��ύ���ַ���������name1=value1&amp;name2=value2</div>
 * <pre>$.fn.fieldSerialize()</pre>
 * <div style="text-indent:2em;">��������Ԫ�����л��ɿ��ύ���ַ���������name1=value1&amp;name2=value2</div>
 * <pre>$.fn.fieldValue()</pre>
 * <div style="text-indent:2em;">��ȡ��ǰԪ��(��Ԫ������)��ֵ</div>
 * <pre>$.fieldValue(successful)</pre>
 * <div style="text-indent:2em;">��̬���߷��������ڻ�ȡԪ�ص�ֵ������successful������ͬ��</div>
 * <pre>$.fn.clearForm()</pre>
 * <div style="text-indent:2em;">��յ�ǰ������Ԫ�ص�ֵ</div>
 * <pre>$.fn.clearFields()</pre>
 * <div style="text-indent:2em;">��յ�ǰԪ��(��Ԫ������)��ֵ</div>
 * <pre>$.fn.resetForm()</pre>
 * <div style="text-indent:2em;">���õ�ǰ������Ԫ�ص�ֵ</div>
 * <pre>$.fn.enable(b)</pre>
 * <div style="text-indent:2em;">���õ�ǰԪ��(��Ԫ������)��ʹ��״̬</div>
 * <pre>$.fn.selected(selected)</pre>
 * <div style="text-indent:2em;">���õ�ǰԪ��(��Ԫ������)��ѡ��״̬</div><br/>
 * <b>ʾ��</b><br/>
 * <pre>
 *  $(document).ready(function() {
 *      $('#myForm').bind('submit', function(e) {
 *          e.preventDefault(); //��ֹformĬ�ϵ��ύ��Ϊ
 *              $(this).omAjaxSubmit(//ʹ��ajax�ύ
 *                  {
 *                      target: '#output'
 *                  }
 *              );
 *      });
 *  });
 * 
 * </pre>
 * @constructor
 * @param options ��׼config����
 * @example
 * 	$('#formId').omAjaxSubmit({target: '#output'});
 */
$.fn.omAjaxSubmit = function(options) {
	// fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
	if (!this.length) {
		log('omAjaxSubmit: skipping submit process - no element selected');
		return this;
	}
	
	var method, action, url, $form = this;

	if (typeof options == 'function') {
		options = { success: options };
	}

	method = this.attr('method');
	action = this.attr('action');

	url = (typeof action === 'string') ? $.trim(action) : '';
	url = url || window.location.href || '';
	if (url) {
		// clean url (don't include hash vaue)
		url = (url.match(/^([^#]+)/)||[])[1];
	}

	options = $.extend(true, {
        /**
         * ���ύ��url��
         * @name omAjaxSubmit#url
         * @type String
         * @default form��action����ֵ
         * @example
         * $('#formId').omAjaxSubmit({url : 'result.jsp'});
         */
		url:  url,
        /**
         * �����ύ�ɹ���ȡ����Ӧʱ��ִ�еĻص�������
         * @name omAjaxSubmit#success
         * @param responseText ��Ӧ���ı��������ȡֵ����options�е�dataType�йأ���ο�dataType���Ե�˵���ĵ���
         * @param statusText ��Ӧ��״̬���ڸûص��У�������ȡֵΪsuccess
         * @param xhr XMLHttpRequest����
         * @param $form ����jQuery��װ��form����
         * @event
         * @default ��
         * @example
         * //����һ������
         * function showResponse(responseText, statusText, xhr, $form) {
         *  alert('submit success!');
         * }
         * //�ύ�ɹ�ȡ����Ӧʱ�Ļص�����
         * $('#formId').omAjaxSubmit({success: showResponse});
         */
		success: $.ajaxSettings.success,
        /**
         * �����ύ������ȡֵΪ��'GET' ���� 'POST'��
         * @name omAjaxSubmit#method
         * @type String
         * @default 'GET'
         * @example
         * $('#formId').omAjaxSubmit({method:'POST'});
         */
		method: method || 'GET',
        /**
         * iframe��src����ֵ����������ҳ������iframe��ʱ����õõ���ͨ����ʱform�����ļ���Ҫ�ϴ���<br/>
         * Ĭ��ֵ��about:blank �������ǰҳ���ַʹ�� https Э�飬���ֵΪjavascript:false
         * @blocked
         */
		iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
	}, options);

	// hook for manipulating the form data before it is extracted;
	// convenient for use with rich editors like tinyMCE or FCKEditor
	var veto = {};
	this.trigger('form-pre-serialize', [this, options, veto]);
	if (veto.veto) {
		log('omAjaxSubmit: submit vetoed via form-pre-serialize trigger');
		return this;
	}

    /**
     * ��form���л�֮ǰִ�еĻص��������ڻ�ȡform��Ԫ�ص�ֵ֮ǰ���ú����ṩ��һ������form��ʱ����<br/>
     * �ú�������2������<br/>
     * @name omAjaxSubmit#beforeSerialize
     * @event
     * @param $form form��Ӧ��jQuery����
     * @param options ����ajaxSubmit��options����
     * @return false ȡ��form���ύ
     * @example
     * beforeSerialize: function($form, options) { 
     *     // return false to cancel submit                  
     * }
     */
	// provide opportunity to alter form data before it is serialized
	if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
		log('omAjaxSubmit: submit aborted via beforeSerialize callback');
		return this;
	}

    /**
     * 
     * �Ƿ����ϸ�����廯˳���ύform��Ԫ�ء�ͬʱ�������˸����Ի���Ա��е�image��ǩ��<br/>
     * ������һ�㲻������(Ĭ��Ϊfalse)��ֻ�е���ķ�������semantic order���ϸ�Ҫ��<br/>
     * ������ı��к���imageʱ�������Ҫ������Ϊtrue<br/>
     * @blocked
     */
	var n,v,a = this.formToArray(options.semantic);
    /**
     * ajax�ύ�еĸ������ݣ���JSON����ʽ���(key/value)�����value�����飬���ᱻչ��;���value�Ǻ��������ᱻ��ֵ��
     * @type JSON
     * @name omAjaxSubmit#data
     * @default ��
     * @example
     * data: { key1: 'value1', key2: 'value2' }
     */
	if (options.data) {
		options.extraData = options.data;
		for (n in options.data) {
			if(options.data[n] instanceof Array) {
				for (var k in options.data[n]) {
					a.push( { name: n, value: options.data[n][k] } );
				}
			}
			else {
				v = options.data[n];
				v = $.isFunction(v) ? v() : v; // if value is fn, invoke it
				a.push( { name: n, value: v } );
			}
		}
	}

    /**
     * ��form���ύ֮ǰִ�еĻص��������ú����ṩ��һ��ʱ����ִ��Ԥ�ύ���߼������߿�����������У���Ԫ�ء�<br/>
     * �ú�������3������:arr, $form, options��<br/>
     * ����������false�����ȡ��form���ύ��<br/>
     * @name omAjaxSubmit#beforeSubmit
     * @type Function
     * @event
     * @param arr һ�����飬����form�����ֶε�key/valueֵ������: [{key:value},{key1:value1},{key2:value2}]
     * @param $form form��Ӧ��jQuery����
     * @param options ���ݸ�ajaxSubmit��options����
     * @return false ȡ���ύ��
     * @example
     * beforeSubmit: function(arr, $form, options) { 
     *     // The array of form data takes the following form: 
     *     // [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ] 
     *     // return false to cancel submit                  
     * }
     */
	// give pre-submit callback an opportunity to abort the submit
	if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
		log('omAjaxSubmit: submit aborted via beforeSubmit callback');
		return this;
	}

	// fire vetoable 'validate' event
	this.trigger('form-submit-validate', [a, this, options, veto]);
	if (veto.veto) {
		log('omAjaxSubmit: submit vetoed via form-submit-validate trigger');
		return this;
	}

	var q = $.param(a);

	if (options.method.toUpperCase() == 'GET') {
		options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
		options.data = null;  // data is null for 'get'
	}
	else {
		options.data = q; // data is the query string for 'post'
	}

    var callbacks = [];
    /**
     * ��form�ɹ��ύ���Ƿ�form�ֶ�����
     * @name omAjaxSubmit#resetForm
     * @type Boolean
     * @default false
     * @example
     * //�ύ�����ñ��ֶ�
     * $('#formId').omAjaxSubmit({resetForm: true});
     */
	if (options.resetForm) {
		callbacks.push(function() { $form.resetForm(); });
	}
    /**
     * ��form�ɹ��ύ���Ƿ�form�ֶ���ա�<br/>
     * @name omAjaxSubmit#clearForm
     * @type Boolean
     * @default false
     * @example
     * $('#formId').omAjaxSubmit({clearForm: true});
     */
	if (options.clearForm) {
		callbacks.push(function() { $form.clearForm(); });
	}

    /**
     * ��Ӧ�����ݸ�ʽ����ѡ��ȡֵΪ'xml'�� 'script'�� 'json'����null����ѡ���������Ӧ��Ҫ����δ���<br/>
     * ��jQuery.httpDataһһ��Ӧ�������ȡֵ����������£�<br/>
     * <pre>
     *      'xml':	��Ӧ���ᱻ��Ϊ��xml��ʽ�ģ�����Ϊ��һ���������ݸ�success�ص�����
     *      'json':	��Ӧ���ᱻ��Ϊ��json��ʽ�ģ��佫�ᱻ��ֵ�����������Ϊ��һ���������ݸ�success�ص�����
     *      'script':��Ӧ���ᱻ��Ϊ��js�ű����佫��ȫ���������б�ִ��
     * </pre>
     * @name omAjaxSubmit#dataType
     * @type String
     * @default ��
     * @example
     * $('#formId').omAjaxSubmit({dataType : 'json'}); 
     */
    /**
     * ָ����һ���������򣬸����򽫻ᱻajax��Ӧ���¡�<br/>
     * ��ֵ������DOMԪ�أ�jQuery���󣬻���һ�����Ա�jQueryѡ�񵽵�ѡ������
     * @name omAjaxSubmit#target
     * @type DOM, jQuery, or String
     * @default ��
     * @example
     * $('#formId').omAjaxSubmit({target : '#targetDivId'});
     */
	// perform a load on the target only if dataType is not provided
	if (!options.dataType && options.target) {
		var oldSuccess = options.success || function(){};
		callbacks.push(function(data) {
            /**
             * ��ѡ���ã��Ƿ��滻targetָ��������<br/>
             * ��Ϊtrue���������滻target��Ӧ��DOM�ڵ㣬��Ϊfalse��ֻ���滻�ڵ�����ݡ�<br/>
             * @name omAjaxSubmit#replaceTarget
             * @type Boolean 
             * @default false
             * @example
             * $('#formId').omAjaxSubmit({replaceTarget : true});
             */
			var fn = options.replaceTarget ? 'replaceWith' : 'html';
			$(options.target)[fn](data).each(oldSuccess, arguments);
		});
	}
	else if (options.success) {
		callbacks.push(options.success);
	}

	options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
		var context = options.context || options;   // jQuery 1.4+ supports scope context 
		for (var i=0, max=callbacks.length; i < max; i++) {
			callbacks[i].apply(context, [data, status, xhr || $form, $form]);
		}
	};

	// are there files to upload?
	var fileInputs = $('input:file', this).length > 0;
	var mp = 'multipart/form-data';
	var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

    /**
     * �Ƿ����ǽ�form����Ӧָ��һ��iframe�������������ļ��ϴ�����������á�
     * @blocked
     */
	// options.iframe allows user to force iframe mode
	// 06-NOV-09: now defaulting to iframe mode if file input is detected
   if (options.iframe !== false && (fileInputs || options.iframe || multipart)) {
	   // hack to fix Safari hang (thanks to Tim Molendijk for this)
	   // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
	   if (options.closeKeepAlive) {
		   $.get(options.closeKeepAlive, function() { fileUpload(a); });
		}
	   else {
		   fileUpload(a);
		}
   }
   else {
		// IE7 massage (see issue 57)
		if ($.browser.msie && method == 'get') { 
			var ieMeth = $form[0].getAttribute('method');
			if (typeof ieMeth === 'string')
				options.method = ieMeth;
		}
		options.type = options.method;
		$.ajax(options);
   }

	// fire 'notify' event
	this.trigger('form-submit-notify', [this, options]);
	return this;


	// private function for handling file uploads (hat tip to YAHOO!)
	function fileUpload(a) {
		var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
        var useProp = !!$.fn.prop;

        if (a) {
        	// ensure that every serialized input is still enabled
          	for (i=0; i < a.length; i++) {
                el = $(form[a[i].name]);
                el[ useProp ? 'prop' : 'attr' ]('disabled', false);
          	}
        }

		if ($(':input[name=submit],:input[id=submit]', form).length) {
			// if there is an input with a name or id of 'submit' then we won't be
			// able to invoke the submit fn on the form (at least not x-browser)
			alert('Error: Form elements must not have name or id of "submit".');
			return;
		}
		
		s = $.extend(true, {}, $.ajaxSettings, options);
		s.context = s.context || s;
		id = 'jqFormIO' + (new Date().getTime());
		/**
		 * ָ��һ��iframeԪ�ء���������������ļ��ϴ���formʱ��һ�����ʱ����һ�����ص�iframe��������Ӧ��<br/>
		 * ���ø����ԣ��û�����ʹ��һ���Ѵ��ڵ�iframe��������ʹ����ʱiframe��<br/>
		 * ע��ʹ�ø����Ժ󣬱����������ȥ���Դ������������Ӧ��<br/>
		 * @blocked
         */
		if (s.iframeTarget) {
			$io = $(s.iframeTarget);
			n = $io.attr('name');
			if (n == null)
			 	$io.attr('name', id);
			else
				id = n;
		}
		else {
			$io = $('<iframe name="' + id + '" src="'+ s.iframeSrc +'" />');
			$io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
		}
		io = $io[0];


		xhr = { // mock object
			aborted: 0,
			responseText: null,
			responseXML: null,
			status: 0,
			statusText: 'n/a',
			getAllResponseHeaders: function() {},
			getResponseHeader: function() {},
			setRequestHeader: function() {},
			abort: function(status) {
				var e = (status === 'timeout' ? 'timeout' : 'aborted');
				log('aborting upload... ' + e);
				this.aborted = 1;
				$io.attr('src', s.iframeSrc); // abort op in progress
				xhr.error = e;
				s.error && s.error.call(s.context, xhr, e, status);
				g && $.event.trigger("ajaxError", [xhr, s, e]);
				s.complete && s.complete.call(s.context, xhr, e);
			}
		};

		g = s.global;
		// trigger ajax global events so that activity/block indicators work like normal
		if (g && ! $.active++) {
			$.event.trigger("ajaxStart");
		}
		if (g) {
			$.event.trigger("ajaxSend", [xhr, s]);
		}

		if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
			if (s.global) {
				$.active--;
			}
			return;
		}
		if (xhr.aborted) {
			return;
		}

		// add submitting element to data if we know it
		sub = form.clk;
		if (sub) {
			n = sub.name;
			if (n && !sub.disabled) {
				s.extraData = s.extraData || {};
				s.extraData[n] = sub.value;
				if (sub.type == "image") {
					s.extraData[n+'.x'] = form.clk_x;
					s.extraData[n+'.y'] = form.clk_y;
				}
			}
		}
		
		var CLIENT_TIMEOUT_ABORT = 1;
		var SERVER_ABORT = 2;

		function getDoc(frame) {
			var doc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
			return doc;
		}
		
		// take a breath so that pending repaints get some cpu time before the upload starts
		function doSubmit() {
			// make sure form attrs are set
			var t = $form.attr('target'), a = $form.attr('action');

			// update form attrs in IE friendly way
			form.setAttribute('target',id);
			if (!method) {
				form.setAttribute('method', 'POST');
			}
			if (a != s.url) {
				form.setAttribute('action', s.url);
			}

			// ie borks in some cases when setting encoding
			if (! s.skipEncodingOverride && (!method || /post/i.test(method))) {
				$form.attr({
					encoding: 'multipart/form-data',
					enctype:  'multipart/form-data'
				});
			}

			// support timout
			if (s.timeout) {
				timeoutHandle = setTimeout(function() { timedOut = true; cb(CLIENT_TIMEOUT_ABORT); }, s.timeout);
			}
			
			// look for server aborts
			function checkState() {
				try {
					var state = getDoc(io).readyState;
					log('state = ' + state);
					if (state.toLowerCase() == 'uninitialized')
						setTimeout(checkState,50);
				}
				catch(e) {
					log('Server abort: ' , e, ' (', e.name, ')');
					cb(SERVER_ABORT);
					timeoutHandle && clearTimeout(timeoutHandle);
					timeoutHandle = undefined;
				}
			}

			// add "extra" data to form if provided in options
			var extraInputs = [];
			try {
				if (s.extraData) {
					for (var n in s.extraData) {
						extraInputs.push(
							$('<input type="hidden" name="'+n+'" />').attr('value',s.extraData[n])
								.appendTo(form)[0]);
					}
				}

				if (!s.iframeTarget) {
					// add iframe to doc and submit the form
					$io.appendTo('body');
	                io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
				}
				setTimeout(checkState,15);
				form.submit();
			}
			finally {
				// reset attrs and remove "extra" input elements
				form.setAttribute('action',a);
				if(t) {
					form.setAttribute('target', t);
				} else {
					$form.removeAttr('target');
				}
				$(extraInputs).remove();
			}
		}
        /**
         * ǿ��ͬ������������˸����ԣ���form�ύʱ�����������ļ��ϴ����������ύ������ӳ�10�����ٽ����ļ��ϴ���<br/>
         * ���ӳٵ���һ����ʱ���������л������DOM�ṹ��������Ҫ���û�չʾ"���Ժ�..."����ʾ��<br/>
         * ��ʾ��Щ����ʾ����Ҫʱ��������DOM�ṹ�ġ���ͣ��һ���ʱ�䣬�������ύ�����������������ԡ�<br/>
         * @blocked
         */
		if (s.forceSync) {
			doSubmit();
		}
		else {
			setTimeout(doSubmit, 10); // this lets dom updates render
		}

		var data, doc, domCheckCount = 50, callbackProcessed;

		function cb(e) {
			if (xhr.aborted || callbackProcessed) {
				return;
			}
			try {
				doc = getDoc(io);
			}
			catch(ex) {
				log('cannot access response document: ', ex);
				e = SERVER_ABORT;
			}
			if (e === CLIENT_TIMEOUT_ABORT && xhr) {
				xhr.abort('timeout');
				return;
			}
			else if (e == SERVER_ABORT && xhr) {
				xhr.abort('server abort');
				return;
			}

			if (!doc || doc.location.href == s.iframeSrc) {
				// response not received yet
				if (!timedOut)
					return;
			}
            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

			var status = 'success', errMsg;
			try {
				if (timedOut) {
					throw 'timeout';
				}

				var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
				log('isXml='+isXml);
				if (!isXml && window.opera && (doc.body == null || doc.body.innerHTML == '')) {
					if (--domCheckCount) {
						// in some browsers (Opera) the iframe DOM is not always traversable when
						// the onload callback fires, so we loop a bit to accommodate
						log('requeing onLoad callback, DOM not available');
						setTimeout(cb, 250);
						return;
					}
					// let this fall through because server response could be an empty document
					//log('Could not access iframe DOM after mutiple tries.');
					//throw 'DOMException: not available';
				}

				//log('response detected');
                var docRoot = doc.body ? doc.body : doc.documentElement;
                xhr.responseText = docRoot ? docRoot.innerHTML : null;
				xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
				if (isXml)
					s.dataType = 'xml';
				xhr.getResponseHeader = function(header){
					var headers = {'content-type': s.dataType};
					return headers[header];
				};
                // support for XHR 'status' & 'statusText' emulation :
                if (docRoot) {
                    xhr.status = Number( docRoot.getAttribute('status') ) || xhr.status;
                    xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
                }

				var dt = s.dataType || '';
				var scr = /(json|script|text)/.test(dt.toLowerCase());
				if (scr || s.textarea) {
					// see if user embedded response in textarea
					var ta = doc.getElementsByTagName('textarea')[0];
					if (ta) {
						xhr.responseText = ta.value;
                        // support for XHR 'status' & 'statusText' emulation :
                        xhr.status = Number( ta.getAttribute('status') ) || xhr.status;
                        xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;
					}
					else if (scr) {
						// account for browsers injecting pre around json response
						var pre = doc.getElementsByTagName('pre')[0];
						var b = doc.getElementsByTagName('body')[0];
						if (pre) {
							xhr.responseText = pre.textContent ? pre.textContent : pre.innerHTML;
						}
						else if (b) {
							xhr.responseText = b.innerHTML;
						}
					}
				}
				else if (s.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
					xhr.responseXML = toXml(xhr.responseText);
				}

                try {
                    data = httpData(xhr, s.dataType, s);
                }
                catch (e) {
                    status = 'parsererror';
                    xhr.error = errMsg = (e || status);
                }
			}
			catch (e) {
				log('error caught: ',e);
				status = 'error';
                xhr.error = errMsg = (e || status);
			}

			if (xhr.aborted) {
				log('upload aborted');
				status = null;
			}

            if (xhr.status) { // we've set xhr.status
                status = (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) ? 'success' : 'error';
            }

			// ordering of these callbacks/triggers is odd, but that's how $.ajax does it
			if (status === 'success') {
				s.success && s.success.call(s.context, data, 'success', xhr);
				g && $.event.trigger("ajaxSuccess", [xhr, s]);
			}
            else if (status) {
				if (errMsg == undefined)
					errMsg = xhr.statusText;
				s.error && s.error.call(s.context, xhr, status, errMsg);
				g && $.event.trigger("ajaxError", [xhr, s, errMsg]);
            }

			g && $.event.trigger("ajaxComplete", [xhr, s]);

			if (g && ! --$.active) {
				$.event.trigger("ajaxStop");
			}

			s.complete && s.complete.call(s.context, xhr, status);

			callbackProcessed = true;
			if (s.timeout)
				clearTimeout(timeoutHandle);

			// clean up
			setTimeout(function() {
				if (!s.iframeTarget)
					$io.remove();
				xhr.responseXML = null;
			}, 100);
		}

		var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
			if (window.ActiveXObject) {
				doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML(s);
			}
			else {
				doc = (new DOMParser()).parseFromString(s, 'text/xml');
			}
			return (doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror') ? doc : null;
		};
		var parseJSON = $.parseJSON || function(s) {
			return window['eval']('(' + s + ')');
		};

		var httpData = function( xhr, type, s ) { // mostly lifted from jq1.4.4

			var ct = xhr.getResponseHeader('content-type') || '',
				xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
				data = xml ? xhr.responseXML : xhr.responseText;

			if (xml && data.documentElement.nodeName === 'parsererror') {
				$.error && $.error('parsererror');
			}
			if (s && s.dataFilter) {
				data = s.dataFilter(data, type);
			}
			if (typeof data === 'string') {
				if (type === 'json' || !type && ct.indexOf('json') >= 0) {
					data = parseJSON(data);
				} else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
					$.globalEval(data);
				}
			}
			return data;
		};
	}
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of omAjaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *	is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *	used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for omAjaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
	// in jQuery 1.3+ we can fix mistakes with the ready state
	if (this.length === 0) {
		var o = { s: this.selector, c: this.context };
		if (!$.isReady && o.s) {
			log('DOM not ready, queuing ajaxForm');
			$(function() {
				$(o.s,o.c).ajaxForm(options);
			});
			return this;
		}
		// is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
		log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
		return this;
	}

	return this.ajaxFormUnbind().bind('submit.form-plugin', function(e) {
		if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
			e.preventDefault();
			$(this).omAjaxSubmit(options);
		}
	}).bind('click.form-plugin', function(e) {
		var target = e.target;
		var $el = $(target);
		if (!($el.is(":submit,input:image"))) {
			// is this a child element of the submit el?  (ex: a span within a button)
			var t = $el.closest(':submit');
			if (t.length == 0) {
				return;
			}
			target = t[0];
		}
		var form = this;
		form.clk = target;
		if (target.type == 'image') {
			if (e.offsetX != undefined) {
				form.clk_x = e.offsetX;
				form.clk_y = e.offsetY;
			} else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
				var offset = $el.offset();
				form.clk_x = e.pageX - offset.left;
				form.clk_y = e.pageY - offset.top;
			} else {
				form.clk_x = e.pageX - target.offsetLeft;
				form.clk_y = e.pageY - target.offsetTop;
			}
		}
		// clear form vars
		setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
	});
};

// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
	return this.unbind('submit.form-plugin click.form-plugin');
};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * omAjaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic) {
	var a = [];
	if (this.length === 0) {
		return a;
	}

	var form = this[0];
	var els = semantic ? form.getElementsByTagName('*') : form.elements;
	if (!els) {
		return a;
	}

	var i,j,n,v,el,max,jmax;
	for(i=0, max=els.length; i < max; i++) {
		el = els[i];
		n = el.name;
		if (!n) {
			continue;
		}

		if (semantic && form.clk && el.type == "image") {
			// handle image inputs on the fly when semantic == true
			if(!el.disabled && form.clk == el) {
				a.push({name: n, value: $(el).val()});
				a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
			}
			continue;
		}

		v = $.fieldValue(el, true);
		if (v && v.constructor == Array) {
			for(j=0, jmax=v.length; j < jmax; j++) {
				a.push({name: n, value: v[j]});
			}
		}
		else if (v !== null && typeof v != 'undefined') {
			a.push({name: n, value: v});
		}
	}

	if (!semantic && form.clk) {
		// input type=='image' are not found in elements array! handle it here
		var $input = $(form.clk), input = $input[0];
		n = input.name;
		if (n && !input.disabled && input.type == 'image') {
			a.push({name: n, value: $input.val()});
			a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
		}
	}
	return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
	//hand off to jQuery.param for proper encoding
	return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
	var a = [];
	this.each(function() {
		var n = this.name;
		if (!n) {
			return;
		}
		var v = $.fieldValue(this, successful);
		if (v && v.constructor == Array) {
			for (var i=0,max=v.length; i < max; i++) {
				a.push({name: n, value: v[i]});
			}
		}
		else if (v !== null && typeof v != 'undefined') {
			a.push({name: this.name, value: v});
		}
	});
	//hand off to jQuery.param for proper encoding
	return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *	  <input name="A" type="text" />
 *	  <input name="A" type="text" />
 *	  <input name="B" type="checkbox" value="B1" />
 *	  <input name="B" type="checkbox" value="B2"/>
 *	  <input name="C" type="radio" value="C1" />
 *	  <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *	   array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
	for (var val=[], i=0, max=this.length; i < max; i++) {
		var el = this[i];
		var v = $.fieldValue(el, successful);
		if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
			continue;
		}
		v.constructor == Array ? $.merge(val, v) : val.push(v);
	}
	return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
	var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
	if (successful === undefined) {
		successful = true;
	}

	if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
		(t == 'checkbox' || t == 'radio') && !el.checked ||
		(t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
		tag == 'select' && el.selectedIndex == -1)) {
			return null;
	}

	if (tag == 'select') {
		var index = el.selectedIndex;
		if (index < 0) {
			return null;
		}
		var a = [], ops = el.options;
		var one = (t == 'select-one');
		var max = (one ? index+1 : ops.length);
		for(var i=(one ? index : 0); i < max; i++) {
			var op = ops[i];
			if (op.selected) {
				var v = op.value;
				if (!v) { // extra pain for IE...
					v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
				}
				if (one) {
					return v;
				}
				a.push(v);
			}
		}
		return a;
	}
	return $(el).val();
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function() {
	return this.each(function() {
		$('input,select,textarea', this).clearFields();
	});
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function() {
	var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list
	return this.each(function() {
		var t = this.type, tag = this.tagName.toLowerCase();
		if (re.test(t) || tag == 'textarea') {
			this.value = '';
		}
		else if (t == 'checkbox' || t == 'radio') {
			this.checked = false;
		}
		else if (tag == 'select') {
			this.selectedIndex = -1;
		}
	});
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
	return this.each(function() {
		// guard against an input with the name of 'reset'
		// note that IE reports the reset function as an 'object'
		if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
			this.reset();
		}
	});
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
	if (b === undefined) {
		b = true;
	}
	return this.each(function() {
		this.disabled = !b;
	});
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
	if (select === undefined) {
		select = true;
	}
	return this.each(function() {
		var t = this.type;
		if (t == 'checkbox' || t == 'radio') {
			this.checked = select;
		}
		else if (this.tagName.toLowerCase() == 'option') {
			var $sel = $(this).parent('select');
			if (select && $sel[0] && $sel[0].type == 'select-one') {
				// deselect all other options
				$sel.find('option').selected(false);
			}
			this.selected = select;
		}
	});
};

// helper fn for console logging
function log() {
	var msg = '[jquery.form] ' + Array.prototype.join.call(arguments,'');
	if (window.console && window.console.log) {
		window.console.log(msg);
	}
	else if (window.opera && window.opera.postError) {
		window.opera.postError(msg);
	}
};

})(jQuery);/*
 * $Id: om-borderlayout.js,v 1.13 2012/04/11 03:35:27 licongping Exp $
 * operamasks-ui omBorderLayout 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 * om-core.js
 * om-mouse.js
 * om-resizable.js
 * om-panel.js
 */
    /** 
     * @name omBorderLayout
     * @class omBroderLayout��ҳ�沼�ֵĻ������.��ҳ����Ϊnorth,south,west,center,east���ϡ��¡����С��ң�5�����򣬳���center�Ǳ������õ�֮�������Ķ��ǿ�ѡ�ġ�<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     * 		<li>��omPanel��Ϊ��������������(north,south,west,center,east)����omPanelʵ�֡���ÿ��panel��֧��omPanel�е��������á�</li>
     * 		<li>��omPanel�Ļ���������������ԣ�region��ʾ��������resizable��ʾ�����Ƿ�������ı��С��</li>
     * 		<li>������ÿ������֮��ļ����С��</li>
     * 		<li>������borderLayout�Զ���Ӧ�������Ĵ�С��</li>
     * </ol>
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#page').omBorderLayout({
     *     panels:[{ 
     *        id:"north-panel", 
     *        title:"This is north panel", 
     *        region:"north", 
     *        resizable:true, 
     *        collapsible:true 
     *    },{ 
     *        id:"center-panel", 
     *        title:"This is center panel", 
     *        region:"center" 
     *    },{ 
     *        id:"west-panel", 
     *        title:"This is west panel", 
     *        region:"west", 
     *        resizable:true, 
     *        collapsible:true, 
     *        width:200 
     *    },{ 
     *        id:"east-panel", 
     *        title:"This is east panel", 
     *        region:"east", 
     *        resizable:true, 
     *        collapsible:true, 
     *        width:100 
     *    }], 
     *    spacing:3 
     * });
     * &lt;/script&gt;
     * 
     * &lt;div id="page" style="width:800px;height:600px;"&gt;
     *	&lt;div id="north-panel" /&gt;
     *	&lt;div id="center-panel" /&gt;
     *	&lt;div id="west-panel" /&gt;
     *	&lt;div id="east-panel" /&gt;
	 * &lt;/div&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
(function($) {
	$.omWidget("om.omBorderLayout", {
		options : /** @lends omBorderLayout#*/{
            /**
             * ����borderlayoutÿ�������panel��
             * @name omBorderLayout#panels
             * @default ""
             * @type Array
             * @example
		     *     $('#page').omBorderLayout({
		     *     panels:[{ 
		     *        id:"north-panel", 
		     *        title:"This is north panel", 
		     *        region:"north", 
		     *        resizable:true, 
		     *        collapsible:true 
		     *    },{ 
		     *        id:"center-panel", 
		     *        title:"This is center panel", 
		     *        region:"center" 
		     *    },{ 
		     *        id:"west-panel", 
		     *        title:"This is west panel", 
		     *        region:"west", 
		     *        resizable:true, 
		     *        collapsible:true, 
		     *        width:200 
		     *    },{ 
		     *        id:"east-panel", 
		     *        title:"This is east panel", 
		     *        region:"east", 
		     *        resizable:true, 
		     *        collapsible:true, 
		     *        width:100 
		     *    }], 
		     *    spacing:3 
		     * });
             */
			// panels:"",
            /**
             * ��������Ƿ��Զ�������������
             * @default false
             * @type Boolean
             * @example
             * $('#page').omBorderLayout({fit : true});
             */
			fit : false,
            /**
             * ���������panel֮��ļ����ֻ������Ϊ���֣���λ��px��
             * @default 5
             * @type Number
             * @example
             * $('#page').omBorderLayout({spacing : 3});
             */
			spacing : 5
		},
		_create : function() {
			if(!this.options.panels) return;
			// ����region�����ı��ȵ���Сֵ
			this._minWidth = 50;
			// ����region�����ı�߶ȵ���Сֵ
			this._minHeight = 28;
			this._buildRegion();
			this._resizeRegion();
			$(window).resize($.proxy(this, "_resizeRegion"));
		},
		// ��ȡ����Ĵ�С������������������ȡ��������(regionProxy)�Ĵ�С�������������Ҳ�������򷵻�0
		_getRegionSize : function(region){
			var $region = this._getRegion(region),
				$proxy = this._getRegionProxy(region),
				size = {};
			size.width = this._regionVisible($region)?$region.outerWidth(true):
				(this._regionVisible($proxy)?$proxy.outerWidth(true):0);
			size.height = this._regionVisible($region)?$region.outerHeight(true):
				(this._regionVisible($proxy)?$proxy.outerHeight(true):0);
			return size;
		},
		_resizeRegion : function() {
			var $centerRegion = this._getRegion("center"),
				$northRegion = this._getRegion("north"),
				$southRegion = this._getRegion("south"),
				$westRegion = this._getRegion("west"),
				$eastRegion = this._getRegion("east"),

				$northProxy = this._getRegionProxy("north"),
				$southProxy = this._getRegionProxy("south"),
				$westProxy = this._getRegionProxy("west"),
				$eastProxy = this._getRegionProxy("east"),
				
				northHeight = this._getRegionSize("north").height;
				southHeight = this._getRegionSize("south").height;
				westWidth = this._getRegionSize("west").width;
				eastWidth = this._getRegionSize("east").width;
				layoutWidth = this.element.width();
				layoutHeight = this.element.height();
			
			$northProxy && $northProxy.outerWidth(layoutWidth);
			$northRegion && $northRegion.find(">.om-panel-body").omPanel("resize",{width:layoutWidth});

			$southProxy && $southProxy.outerWidth(layoutWidth);
			$southRegion && $southRegion.find(">.om-panel-body").omPanel("resize",{width:layoutWidth});
				
			$centerRegion.css({top:northHeight,left:westWidth});
			$centerRegion.find(">.om-panel-body").omPanel("resize",{
				width:layoutWidth - westWidth - eastWidth,
				height:layoutHeight - northHeight - southHeight
			});
			var centerHeight = $centerRegion.outerHeight(true);
			if($southRegion){
				$southRegion.css({top:layoutHeight-$southRegion.outerHeight(true)});
			}
			if($westRegion){
				$westRegion.css({top:northHeight});
				$westRegion.find(">.om-panel-body").omPanel("resize",{height:centerHeight});
				if($westProxy){
					$westProxy.css({top:northHeight});
					$westProxy.outerHeight(centerHeight);
				}
			}
			if($eastRegion){
				$eastRegion.css({top:northHeight});
				$eastRegion.find(">.om-panel-body").omPanel("resize",{height:centerHeight});
				if($eastProxy){
					$eastProxy.css({top:northHeight});
					$eastProxy.outerHeight(centerHeight);
				}
			}
			
		},
		_regionVisible : function($region){
			return $region && $region.css("display") != "none";
		},
		_createRegionProxy : function(panel){
			var _self = this;
			var proxyHtml = "<div class=\"om-borderlayout-proxy om-borderlayout-proxy-"+panel.region+"\" proxy=\""+panel.region+"\">" +
							"<div class=\"om-panel-title\"></div>"+
							"<div class=\"om-panel-tool\">"+
							"<div class=\"om-icon panel-tool-expand\">"+
							"</div>"+
							"</div>"+
							"</div>";
			var $proxy = $(proxyHtml);
			$proxy.hover(function(){
						$(this).toggleClass("om-borderlayout-proxy-hover");
					}).appendTo(this.element);
			(function(panel){
				$proxy.find(".panel-tool-expand").hover(function(){
					$(this).toggleClass("panel-tool-expand-hover");
				}).click(function(){
					_self.expandRegion(panel.region);
				});
			})(panel);
		},
		// �������ֿ��
		_buildRegion : function() {
			var _self = this;
			var $layout = this.element;
			this.element.addClass("om-borderlayout");
			if (this.options.fit) {
				$layout.css({
					"width" : "100%",
					"height" : "100%"
				});
			}
			for ( var i = 0; i < this.options.panels.length; i++) {
				var panel = $.extend({},this.options.panels[i]);
				var $panelEl = this.element.find("#" + panel.id);
				// ��Ӵ�������
				if(panel.collapsible && panel.region != "center"){
					this._createRegionProxy(panel);
				}
				
				// ��չpanel��ʼ�����������һЩ��Ҫ���¼�
				if(panel.collapsible){
					$.extend(panel,{
						collapsible:false,
						tools:[{
							iconCls:["panel-tool-collapse","panel-tool-collapse-hover"],
							handler:function(widget){
								_self.collapseRegion(widget.element.parent().attr("region"));
							}
						}]
					});
				}
				if(panel.closable){
					var oldPanelOnClose = panel.onClose;
					$.extend(panel,{
						onClose:function(){
							oldPanelOnClose && oldPanelOnClose.call($panelEl[0]);
							_self._resizeRegion();
						}
					});
				}
				
				
				// ����panel���
				$panelEl.omPanel(panel);
				
				// ��ʼ��north��south�Ŀ��
				if(panel.region == "north" || panel.region == "south"){
					$panelEl.omPanel("resize",{"width":$layout.width()});
				}
				
				var margin = "0",
					spacing = this.options.spacing + "px";
				// ��panel���resize����
				if(panel.resizable && panel.region != "center"){
					var handles = "";
						handleClass = {};
					if(panel.region == "west"){
						handles = "e";
						handleClass.width = spacing;
						handleClass.right = "-" + spacing;
					} else if(panel.region == "east"){
						handles = "w";
						handleClass.width = spacing;
						handleClass.left = "-" + spacing;
					} else if(panel.region == "south"){
						handles = "n";
						handleClass.height = spacing;
						handleClass.top = "-" + spacing;
					} else if(panel.region == "north"){
						handles = "s";
						handleClass.height = spacing;
						handleClass.bottom = "-" + spacing;
					}
					$panelEl.parent().omResizable({
						handles : handles,
						helper : "om-borderlayout-resizable-helper-" + handles,
						stop : function(ui,event){
							$layout.find(">.om-borderlayout-mask").remove();
							ui.element.find(">.om-panel-body").omPanel("resize",ui.size);
							_self._resizeRegion();
						},
						start : function(ui,event){
							var helper = ui.element.omResizable("option","helper");
							// �޸�resizable��helper�Ŀ�/��Ϊspacing��С
							$("body").find("." + helper).css("border-width",_self.options.spacing);
							// ���������ı��С�ķ�Χ
							var region = ui.element.attr("region"),
								maxWidth = $layout.width() - 2*_self._minWidth,
								maxHeight = $layout.height() - 2*_self._minHeight;
							if(region == "west"){
								maxWidth = $layout.width() - (_self._getRegionSize("east").width + _self._minWidth);
								ui.element.omResizable( "option", "maxWidth", maxWidth );
							} else if(region == "east"){
								maxWidth = $layout.width() - (_self._getRegionSize("west").width + _self._minWidth);
								ui.element.omResizable( "option", "maxWidth", maxWidth );
							} else if(region == "north"){
								maxHeight = $layout.height() - (_self._getRegionSize("south").height + _self._minHeight + _self.options.spacing);
								ui.element.omResizable( "option", "maxHeight", maxHeight );
							} else if(region == "south"){
								maxHeight = $layout.height() - (_self._getRegionSize("north").height + _self._minHeight + _self.options.spacing);
								ui.element.omResizable( "option", "maxHeight", maxHeight );
							}
							$('<div class="om-borderlayout-mask"></div>').css({
								width:$layout.width(),
								height:$layout.height()
							}).appendTo($layout);
						},
						minWidth : _self._minWidth,
						minHeight : _self._minHeight
						
					});
					$panelEl.parent().find(".om-resizable-handle").css(handleClass);
					margin = (panel.region == "south" ? spacing : 0) + " " +
							 (panel.region == "west" ? spacing : 0) + " " +
							 (panel.region == "north" ? spacing : 0) + " " +
							 (panel.region == "east" ? spacing : 0);
				}
				
				$panelEl.parent()
					   .addClass("om-borderlayout-region")
					   .addClass("om-borderlayout-region-" + panel.region)
					   .css("margin",margin)
					   .attr("region",panel.region);
				//���header class��������borderlayout��borderlayout����Ƕ��panelʹ�õ�tools ͼƬ
				$panelEl.prev().addClass("om-borderlayout-region-header");
			}
		},
		_getRegion : function(region){
			var $regionEl = this.element.find(">[region=\""+region+"\"]");
			return $regionEl.size()>0?$regionEl:false;
		},
		_getRegionProxy : function(region){
			var $proxyEl = this.element.find(">[proxy=\""+region+"\"]");
			return $proxyEl.size()>0?$proxyEl:false;
		},
		_getPanelOpts : function(region){
			for(var i = 0; i < this.options.panels.length; i++){
				if(region == this.options.panels[i].region){
					return this.options.panels[i];
				}
			}
			return false;
		},
        /**
         * �۵�ĳ�������panel��
         * @name omBorderLayout#collapseRegion
         * @function
         * @param region ��������
         * @example
         * //�۵�north�����panel
         * $('#page').omBorderLayout('collapseRegion', 'north');
         */
		collapseRegion : function(region){
			var panel = this._getPanelOpts(region);
			if(!panel || !panel.collapsible){
				return;
			}
			var $region = this._getRegion(region);
				$body = $region.find(">.om-panel-body");
			if($region){
				var panelInstance = $.data($body[0],"omPanel");
				if(panelInstance.options.closed) return;
				if(panel.onBeforeCollapse && panelInstance._trigger("onBeforeCollapse") === false){
					return false;
				}
				$region.hide();
				panel.onCollapse && panelInstance._trigger("onCollapse");
				this._getRegionProxy(region).show();
				this._resizeRegion();
			}
		},
		/**
		 * չ��ĳ�������panel��
		 * @name omBorderLayout#expandRegion
		 * @function
		 * @param region ��������
		 * @example
		 * //չ��north�����panel
		 * $('#page').omBorderLayout('expandRegion', 'north');
		 */
		expandRegion : function(region){
			var panel = this._getPanelOpts(region);
			if(!panel || !panel.collapsible){
				return;
			}
			var $region = this._getRegion(region);
				$body = $region.find(">.om-panel-body");
			if($region){
				var panelInstance = $.data($body[0],"omPanel");
				if(panelInstance.options.closed) return;
				if(panel.onBeforeExpand && panelInstance._trigger("onBeforeExpand") === false){
					return false;
				}
				$region.show();
				panel.onExpand && panelInstance._trigger("onExpand");
				this._getRegionProxy(region).hide();
				this._resizeRegion();
			}
		},
		/**
		 * �ر�ĳ�������panel��
		 * @name omBorderLayout#closeRegion
		 * @function
		 * @param region ��������
		 * @example
		 * //�ر�north�����panel
		 * $('#page').omBorderLayout('closeRegion', 'north');
		 */
		closeRegion : function(region){
			var panel = this._getPanelOpts(region);
			if(!panel || !panel.closable){
				return;
			}
			var $region = this._getRegion(region);
				$body = $region.find(">.om-panel-body");
			if($region){
				var panelInstance = $.data($body[0],"omPanel");
				if(panelInstance.options.closed) return;
				
				$region.find(">.om-panel-body").omPanel("close");
				this._getRegionProxy(region).hide();
				this._resizeRegion();
			}
		},
		/**
		 * ��ĳ�������panel��
		 * @name omBorderLayout#openRegion
		 * @function
		 * @param region ��������
		 * @example
		 * //��north�����panel
		 * $('#page').omBorderLayout('openRegion', 'north');
		 */
		openRegion : function(region){
			var panel = this._getPanelOpts(region);
			if(!panel || !panel.closable){
				return;
			}
			var $region = this._getRegion(region);
				$body = $region.find(">.om-panel-body");
			if($region){
				var panelInstance = $.data($body[0],"omPanel");
				if(!panelInstance.options.closed) return;
				
				$region.find(">.om-panel-body").omPanel("open");
				this._getRegionProxy(region).hide();
				this._resizeRegion();
			}
		}

	});
})(jQuery);/*
 * $Id: om-button.js,v 1.53 2012/03/15 06:14:47 linxiaomin Exp $
 * operamasks-ui omButton 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
;(function($) {
	/**
     * @name omButton
     * @class ��ť�����������html�е�button��input[type=submit]��input[type=button]��ʹ�ñ���ͼƬʵ��Բ�ǣ�֧��icon������ֻ��ʾicon��<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>ʵ��Բ��</li>
     *      <li>֧����icon����icon����ͬʱ��������icon��Ҳ����ֻ��ʾicon����ʾlabel</li>
     *      <li>��ť������Ŀ���ޣ�Ҳ�����������ð�ť���</li>
     *      <li>֧��input[type=button]��input[type=submit]��input[type=reset]��button��a���ֱ�ǩ��ʽ</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#bnt').omButton({
     *         icons : {left:'images/help.png',right:'images/edit_add.png'},
     *         width : 150,
     *         disabled : 'disabled',
     *         onClick : function(event){
     *             // do something
     *         }
     *     });
     * });
     * &lt;/script&gt;
     * 
     * &lt;input id="btn" type="submit" /&gt;
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omButton', {
    	
        options: /**@lends omButton# */{
        	/**
        	 * �Ƿ�����������ͨ��('#id').attr('disabled')�жϰ�ť�Ƿ���á�
             * @type String 
             * @default null 
             * @example
             * $("#button").omButton({disabled: true}); 
             */
            disabled : null ,
            /**
             * ��ʾ�ı���labelֵ����д��domԪ�����棬Ҳ�����������������棬���õ�������������ȼ���ߡ�
             * @type String 
             * @default ""
             * @example
             * $("#button").omButton({label: "apusic"});
             */
            label : null ,
            /**
        	 * ��ʾ��ťͼ�꣬left��ʾ��ͼ�꣬right��ʾ��ͼ�꣬ȡֵ��ΪͼƬ·����
             * @type Object 
             * @default null 
             * @example
             * $("#button").omButton({
             *     icons: {
             *         left: 'images/help.png',
             *         right: 'images/edit_add.png'
             *     }
             * });
             */
            icons: {
    			left: null,
    			right: null
    		},
    		/**
        	 * ��ť��ȣ����ù̶����֮��ť�����������ֵĶ��ٶ��ı䡣
             * @type Number 
             * @default null 
             * @example
             * width : 150
             */
            width : null ,
            /**
        	 * �����ťʱ�������¼���
             * @event
             * @param event jQuery.Event����
             * @name omButton#onClick 
             * @example
             * onClick : function(event){
             *    //do something
             * }
             */
            onClick : null
        },
        
        _create : function() {
            this._determineButtonType();
            
            var wrapperSpan = $( '<span>' ).addClass( 'om-btn om-state-default').css('border','none'),
            leftSpan = $( '<span>' ).addClass( 'om-btn-bg om-btn-left' ),
            centerSpan = $( '<span>' ).addClass( 'om-btn-bg om-btn-center' ),
            rightSpan = $( '<span>' ).addClass( 'om-btn-bg om-btn-right' );
            
            this.element.addClass( 'om-btn-txt' )
                .css( {'background-position':'left center','background-repeat':'no-repeat'} )
                .wrap( wrapperSpan )
                .before( leftSpan )
                .after( rightSpan )
                .wrap( centerSpan );
        },
        
        _init : function(){
            var self = this,
                options = this.options,
                element = this.element;
            if ( typeof options.disabled != "boolean" ) {
                options.disabled = element.propAttr( "disabled" );
    		}
            if ( element.attr('disabled') == 'disabled' || options.disabled == 'disabled') {
    			options.disabled = true;
    		}
            this._initButton();
            if(options.disabled){
            	self._addClass('disabled');
            	element.css('cursor','default');
            }
            var $newelement = element.parent().parent();
            $newelement.bind( 'mouseenter',function( event ){
            					if ( options.disabled ) {
            						return false;
            					}
            					self._addClass('hover');
            				}).bind( "mouseleave", function( event ) {
            					if ( options.disabled ) {
            						return false;
            					}
            					self._removeClass('hover');
            					self._removeClass('active');
            				}).bind( "click", function( event ){
            					if ( options.disabled ) {
            						event.preventDefault();
            						event.stopImmediatePropagation();
            						return false;
            					}else if(self.options.onClick){
            						self._trigger("onClick",event);
            					}
            				}).bind( "mousedown", function( event ) {
            					if ( options.disabled ) {
            						return false;
            					}
            					self._addClass('active');
            				    self._removeClass('focus');
            					var onClick = options.onClick;
            				})
            				.bind( "mouseup", function( event ) {
            					if ( options.disabled ) {
            						return false;
            					}
            					self._addClass('focus');
            					self._removeClass('active');
            				})
            				.bind( "keydown", function(event) {
            					if ( options.disabled ) {
            						return false;
            					}
            					if ( event.keyCode == $.om.keyCode.SPACE || event.keyCode == $.om.keyCode.ENTER ) {
            						self._addClass('active');
            					}
            					if( event.keyCode == $.om.keyCode.SPACE){
            						var onClick = options.onClick;
            		                if ( onClick && self._trigger("onClick",event) === false ) {
            		                    return;
            		                }
            					}
            				})
            				.bind( "keyup", function() {
            					self._removeClass('active');
            				});
	            element.bind( "focus.button", function( event ) {
								if ( options.disabled ) {
									return false;
								}
								self._addClass('focus');
							}).bind( "blur.button", function( event ) {
	        					if ( options.disabled ) {
	        						return false;
	        					}
	        					self._removeClass('focus');
	        				});
        },
        /**
         * ���������
         * @name omButton#enable
         * @function
         * @example
         * $('#btn').omButton('enable');
         */
        enable : function(){
            this._removeClass('disabled');
            this.options.disabled = false;
            this.element.css('cursor','pointer')
                        .removeAttr('disabled');
        },
        /**
         * ���������
         * @name omButton#disable
         * @function
         * @example
         * $('#btn').omButton('disable');
         */
        disable : function(){
        	this._addClass('disabled');
            this.options.disabled = true;
            this.element.css('cursor','default')
                        .attr('disabled', 'disabled');
        },
        /**
         * ��������¼���
         * @name omButton#click
         * @function
         * @example
         * $('#btn').omButton('click');
         */
        click : function(){
        	if(!this.options.disabled && this.options.onClick){
        		this._trigger("onClick");
            }
        },
        /**
         * �ı䰴ť��label���ԡ�
         * @name omButton#changeLabel
         * @function
         * @param label ��ť�ı�
         * @example
         * $('#btn').omButton('changeLabel','��ťlabel');
         */
        changeLabel : function(label){
            if(this.type == 'a'){
            	this.element.text(label) ;
            }else if( this.type == 'input' ){
            	this.element.val(label) ;
            }else if ( this.type == 'button' ){
            	this.element.html(label) ;
            }
        },
        /**
         * �ı䰴ť��icon���ԡ�
         * @name omButton#changeIcons
         * @function
         * @param icons ͼ��·��
         * @example
         * $('#btn').omButton('changeIcons',{
         *     left: 'images/help.png',
         *     right: 'images/edit_add.png'
         * });
         */
        changeIcons : function( icons ){
        	if( !this.options.disabled ){
	            if( icons ){
	            	icons.left?this.element.css( 'backgroundImage','url( '+icons.left+' )' ):null;
	            	icons.right?this.element.next().attr( 'src',icons.right ):null;
	            }
            }
        },
        destroy : function(){
        	$el = this.element;
        	$el.closest(".om-btn").after($el).remove();
        },
        _addClass : function( state ){
        	this.element.parent().parent().addClass( 'om-state-'+state );
        },
        _removeClass : function( state ){
        	this.element.parent().parent().removeClass( 'om-state-'+state );
        },
        _initButton : function(){
        	var options = this.options,
        	    label = this._getLabel(),
        	    element = this.element;
        	
            element.removeClass('om-btn-icon om-btn-only-icon')
                .next("img").remove();
        	
        	if( options.width > 10 ){
        		element.parent().css( 'width',parseInt( options.width )-10 );
        	}
        	if( this.type == 'a' || this.type == 'button' ){
        	    element.html( label );
        	}else{
        	    element.val( label );
        	}
        	
        	if( options.icons.left ){
        	    if( label ){
        	        element.addClass( 'om-btn-icon' ).css( 'background-image','url('+options.icons.left+')' );
        	    }else{
        	        element.addClass( 'om-btn-only-icon' ).css('background-image','url('+options.icons.left+')' );
        	    }
        	}
        	if( options.icons.right ){
        	    if( label != '' ){
        	        $( '<img>' ).attr( 'src',options.icons.right ).css( {'vertical-align':'baseline','padding-left':'3px'} ).insertAfter( element );
        	    }else{
        	        $( '<img>' ).attr( 'src',options.icons.right ).css( 'vertical-align','baseline' ).insertAfter( element );
        	    }
            }
        },
        _getLabel : function(){
        	return this.options.label || this.element.html() || this.element.text() || this.element.val();
        },
        _determineButtonType: function() {
    		if ( this.element.is("input") ) {
    			this.type = "input";
    		}  else if ( this.element.is("a") ) {
    			this.type = "a";
    		} else if ( this.element.is('button') ){
    			this.type = "button";
    		}
    	}
    });
})(jQuery);/*
 * $Id: om-calendar.js,v 1.105 2012/05/08 07:28:27 linxiaomin Exp $
 * operamasks-ui omCalendar 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */
/**
 * @name omCalendar
 * @param p ��׼config���� {minDate : new Date(2011, 7, 5), maxDate : new Date(2011, 7, 15)}
 * @class �����ؼ���Ĭ��ͨ����һ��������������չʾ��ͬʱҲ����ֱ����ʾ��ҳ���ϡ�<br /> 
 * �����ؼ��ṩ��һϵ������������ͳ��õ����api���������ǵ����ֲ�ͬ��Ӧ�ó�������ע�⣬�˿ؼ�֧�ֵ���ݴ�100��10000��<br /><br/>
 * <b>���߷���:</b>
 * <pre>$.omCalendar.formatDate(date, formatter)</pre>
 * <p>����������ڶ���date����formatter��ʽ����һ��string������.</p>
 * <pre>$.omCalendar.parseDate(date_string, formatter)</pre>
 * <p>�����string��ѭformatter��ʽ,��ʱ��ȡ������Ϣ,�������������ڶ���.</p>
 * <p>��������������һ����ʽ�ַ�������formater�������������"yy-m-d H:i"��<br />
 * �ڸ��ַ�����ÿ����ĸ(�� yy , m �ȵ�)�����ϸ�Ķ��壬������ʾ��<br /></p>
 * <b>���ڸ�ʽ����:</b>
 * <pre>
 * y:   ���(ȡ����2λ�ַ�),<br />
 * yy:  ���(��4λ�ַ���ʾ),<br />
 * m:   �·�(���ֱ�ʾ,����1���ַ���ʾ),<br />
 * mm:  �·�(���ֱ�ʾ,����2���ַ���ʾ,����ʱ��ǰ�����0),<br />
 * d:   ����(����1���ַ���ʾ),<br />
 * dd:  ����(����2���ַ���ʾ,����ʱ��ǰ�����0),<br />
 * h:   Сʱ(12Сʱ��,����2���ַ���ʾ,����ʱ��ǰ�����0,ȡֵ��Χ00~11),<br />
 * H:   Сʱ(24Сʱ��,����2���ַ���ʾ,����ʱ��ǰ�����0,ȡֵ��Χ00~23),<br />
 * g:   Сʱ(12Сʱ��,����1���ַ���ʾ,ȡֵ��Χ0~11),<br />
 * G:   Сʱ(24Сʱ��,����1���ַ���ʾ,ȡֵ��Χ0~23),<br />
 * i:   ����(����2���ַ���ʾ,ȡֵ��Χ00~59),<br />
 * s:   ����(����2���ַ���ʾ,ȡֵ��Χ00~59),<br />
 * u:   ����(����3���ַ���ʾ,ȡֵ��Χ000~999),<br />
 * D:   ���ڵļ�д(�� Sun, Sat�ȵ�),<br />
 * DD:  ���ڵ�ȫ��(�� Sunday, Saturday�ȵ�),<br />
 * M:   �·ݵļ�д(�� Jan, Feb �ȵ�),<br />
 * MM:  �·ݵ�ȫ��(�� January, February��),<br />
 * a:   ��������(Сд am & pm),<br />
 * A:   ��������(��д AM & PM),<br />
 * </pre>
 */
;(function($) {
    
    $.omWidget("om.omCalendar", {
        options : {
            /**
             * Ĭ����ʾ���ڡ�
             * @name omCalendar#date
             * @type Date
             * @default ��ǰ����
             * @example 
             *   $("#input").omCalendar({date : new Date(2012, 0, 1)});
             */
            date:        new Date(),
            
            /**
             * �������е�һ�������ڼ���Ĭ����ʼ�����������죩��ֵΪ0-6�����֣��ֱ���������쵽��������
             * @name omCalendar#startDay
             * @type Number
             * @default 0
             * @example
             *   $("#input").omCalendar({startDay : 1});
             */
            startDay:    0,
            
            /**
             * ��������һ����ʾ�����¡�Ĭ��ֻ��ʾһ���¡�
             * @name omCalendar#pages
             * @type Number
             * @default 1
             * @example
             *   $("#input").omCalendar({pages : 3});
             */
            pages:       1,
            
            /**
             * ��С���ڡ�С��������ڵ����ڽ���ֹѡ��
             * @name omCalendar#minDate
             * @type Date
             * @default ��
             * @example
             *   $("#input").omCalendar({minDate : new Date(2010, 0, 1)});
             */
            minDate:  false,
            
            /**
             * ������ڡ�����������ڵ����ڽ���ֹѡ��
             * @name omCalendar#maxDate
             * @type Date
             * @default ��
             * @example
             *   $("#input").omCalendar({maxDate : new Date(2010, 0, 1)});
             */
            maxDate:    false,
            
            /**
             * �Ƿ����input�����falseʱ�����򽫲�����Ҫͨ�������õ�������������ʾ������������ֱ����ʾ��ҳ���ϡ�
             * @name omCalendar#popup
             * @type Boolean
             * @default true
             * @example
             *   <div id="container" />
             *   $("#container").omCalendar({popup : false});
             */
            popup:       true,
            
            /**
             * �Ƿ���ʾʱ�䡣Ĭ�������ֻ��ʾ���ڲ���ʾʱ�䡣
             * @name omCalendar#showTime
             * @type Boolean
             * @default false
             * @example
             *   $("#input").omCalendar({showTime : true});
             */
            showTime:    false,
            
            /**
             * ѡ�����ں󴥷���
             * @event
             * @name omCalendar#onSelect
             * @type Function
             * @default emptyFn
             * @param date ѡ�е�����
             * @param event jQuery.Event����
             * @example
             *   $("#input").omCalendar({onSelect : function(date,event) {alert(date);}});
             */
            onSelect:    function(date,event) {}, 
            
            /**
             * ����ѡ�����ڡ��������ͣ������Ԫ��Ϊ 0-6���ֱ���������쵽��������
             * @name omCalendar#disabledDays
             * @type Array[Number]
             * @default []
             * @example
             *   ������������������Ϊ������:
             *     $("#input").omCalendar({disabledDays : [0, 6]});
             */
            disabledDays : [], 
            
            /**
             * ���ù��˲���ѡ���ڷ�����
             * @name omCalendar#disabledFn
             * @type Function
             * @default ��
             * @param δ�����˵�����
             * @example 
             * ���ڵ���10�ŵ����ڲ�����
             * $("#input").omCalendar({
             *     disabledFn : function disFn(date) {
             *         var nowMiddle = new Date();
             *         nowMiddle.setDate(10);
             *         if (date > nowMiddle) {
             *             return false;
             *         }
             *     }
             * });
             */
            disabledFn : function(d) {}, 
            
            /**
             * �Ƿ���������
             * @name omCalendar#disabled
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({disabled : false});
             */
            disabled : false,
            
            /**
             * ����Ƿ�ֻ����
             * @name omCalendar#readOnly
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({readOnly : false});
             */
            readOnly : false,
            
            /**
             * ����Ƿ�ɱ༭��������false��ֻ����ͨ��������ѡ�����ڣ����������������ֱ���������ڡ�
             * @name omCalendar#editable
             * @type Boolean
             * @default false
             * @example
             * $("#input").omCalendar({editable : true});
             */
            editable : true,
            
            /**
             * ���ڸ�ʽ������������ڸ�ʽ��������ο�Ԥ��ҳǩ���������showtime:false��Ĭ��ȡֵΪ 'yy-mm-dd'������Ϊ 'yy-mm-dd H:i:s'��
             * @name omCalendar#dateFormat
             * @type String
             * @default 'yy-mm-dd H:i:s'
             * @example
             * $("#input").omCalendar({dateFormat : 'yy-mm-dd'});
             */
            dateFormat : false
        },
        
        /**
         * ���ؼ�����Ϊ�����á��Ὣinput����Ϊ�����á�
         * @name omCalendar#disable
         * @function
         * @returns jQuery����
         * @example
         * $('#input').omCalendar('disable');
         */
        disable : function() {
            if (this.options.popup) {
                this.hide();
                this.options.disabled = true;
                this.element.attr("disabled", true)
                    .unbind('.omCalendar')
                    .next().addClass('om-state-disabled').unbind();
            }
        }, 
        
        /**
         * ���ؼ�����Ϊ����״̬���Ὣinput����Ϊ����״̬��
         * @name omCalendar#enable
         * @function
         * @returns jQuery����
         * @example
         * $('#input').omCalendar('enable');
         */
        enable : function() {
            if (this.options.popup) {
                this.options.disabled = false;
                this.element.attr("disabled", false)
                    .next().removeClass('om-state-disabled');
                this._buildStatusEvent();
            }
        },
        
        /**
         * ��ȡ�ؼ�ѡ�е����ڡ�
         * @name omCalendar#getDate
         * @function
         * @returns Date
         * @example
         * var date = $('#input').omCalendar('getDate');
         */
        getDate : function(){
                return this.options.date;
        }, 
       
        /**
         * ���ÿؼ�ѡ�е����ڡ�
         * @name omCalendar#setDate
         * @function
         * @param Date
         * @returns jQuery ����
         * @example
         * $('#input').omCalendar('setDate', new Date(2012, 0, 1));
         */
        setDate : function(d) {
            this.options.date = d;
            this._render({date : d});
        },
        
        _create : function() {
            var $self = this.element, opts = this.options;
                this.cid = this._stamp($self);
            
            if (opts.popup) {
                $self.wrap('<span></span>').after('<span class="om-calendar-trigger"></span>')
                    .parent().addClass("om-calendar om-widget om-state-default");
                
                this.con = $('<div></div>').appendTo(document.body).css({
                        'top':'0px',
                        'position':'absolute',
                        'background':'white',
                        'visibility':'hidden',
                        'z-index':'2000'});
                this._buildBodyEvent();
                this._buildStatusEvent();
            } else {
                this.con = this.element;
            }
            
            this.con.addClass('om-calendar-list-wrapper om-widget om-clearfix om-widget-content');
        },
        
        _init : function() {
            var $ele = this.element,
                opts = this.options;
            this.con.addClass('multi-' + opts.pages);
            this._buildParam();
            if (opts.popup) {
                $ele.val() && (opts.date = $.omCalendar.parseDate($ele.val(), opts.dateFormat || this._defaultFormat) || new Date());
            }
            this._render();
            
            if (opts.readOnly || !opts.editable) {
                $ele.attr('readonly', 'readOnly').unbind();
            } else {
                $ele.removeAttr('readonly');
            }
            
            opts.disabled ? this.disable() :  this.enable();
        }, 
        
        _render : function(o) {
            var i = 0,
                _prev,_next,_oym,
                $self = this.element,
                opt = this.options;
            this.ca = [];
            this._parseParam(o);
            
            this.con.html('');

            for (i = 0,_oym = [this.year,this.month]; i < opt.pages; i++) {
                if (i === 0) {
                    _prev = true;
                } else {
                    _prev = false;
                    _oym = this._computeNextMonth(_oym);
                }
                _next = i == (opt.pages - 1);
                this.ca.push(new $.om.omCalendar.Page({
                    year:_oym[0],
                    month:_oym[1],
                    prevArrow:_prev,
                    nextArrow:_next,
                    showTime:self.showTime
                }, this));
                this.ca[i]._render();
            }
            if(opt.pages > 1){
                var calbox = $self.find(".om-cal-box");
                var array = [];
                $.each(calbox, function(i,n){
                    array.push($(n).css("height"));
                });
                array.sort();
                calbox.css("height",array[array.length-1]);
            }
        },
    

        /**
         * ���Ը���������id�ı��,������id�򷵻�
         * @method _stamp
         * @param { JQuery-Node }
         * @return { string }
         * @private
         */
        _stamp: function($el){
            if($el.attr('id') === undefined || $el.attr('id')===''){
                $el.attr('id','K_'+ new Date().getTime());
            }
            return $el.attr('id');
        },

        _buildStatusEvent : function() {
            var self = this;
            this.element.unbind('.omCalendar').bind('click.omCalendar', this.globalEvent=function(e) {
                e.preventDefault();
                self.toggle();
            }).bind('focus.omCalendar', function(){
                $(this).parent().addClass('om-state-hover om-state-active');
            }).bind('blur.omCalendar', function(){
                $(this).parent().removeClass('om-state-hover om-state-active');
            }).next().unbind().click(function() {             // icon trigger
                self.element.trigger('focus');
                self.show();
            }).mouseover(function() {
                $(this).parent().addClass('om-state-hover');
            }).mouseout(function() {
                !self.isVisible() && $(this).parent().removeClass('om-state-hover');
            });
        },
        
        _buildBodyEvent: function() {
            var opts = this.options,
                $ele = this.element, 
                self = this;
            $('body').bind('mousedown.omCalendar', function(e) {
                var $source = $(e.target);
                //�����������
                if ($source.attr('id') === self.cid){
                    return;
                }
                if (($source.hasClass('om-next') || $source.hasClass('om-prev')) && 
                    $source[0].nodeName.toLowerCase() === 'a'){
                    return;
                }
                //�������ѡ������
                if ($.contains(self.con[0], $source[0]) &&
                        ($source[0].nodeName.toLowerCase() === 'option' ||
                                $source[0].nodeName.toLowerCase() === 'select')) {
                        return;
                } 
                
                //�����trigger��
                if ($source.attr('id') == self.cid || $source.siblings().attr('id') == self.cid){
                    return;
                }

                if($ele.css('visibility') == 'hidden') return ;
                var inRegion = function(dot,r){
                    if(dot[0]> r[0].x && dot[0]<r[1].x && dot[1] > r[0].y && dot[1] < r[1].y){
                        return true;
                    }else{
                        return false;
                    }
                };

                if(!inRegion([e.pageX,e.pageY],[
                                {
                                    x:self.con.offset().left,
                                    y:self.con.offset().top
                                },
                                {
                                    x:self.con.offset().left + self.con.width(),
                                    y:self.con.offset().top + self.con.height()
                                }])){
                    self.hide();
                }
            });
        },

        /**
         * �ı������Ƿ���ʾ��״̬
         * @mathod toggle
         */
        toggle: function() {
            if (!this.isVisible()) {
                this.show();
            } else {
                this.hide();
            }
        },
        
        isVisible : function() {
            if (this.con.css('visibility') == 'hidden') {
                return false;
            } 
            return true;
        },

        /**
         * ��ʾ����
         * @method show
         */
        show: function() {
            var $container = this.element.parent();
            this.con.css('visibility', '');
            var _x = $container.offset().left,
                height = $container.offsetHeight || $container.outerHeight(),
                _y = $container.offset().top + height;
            this.con.css('left', _x.toString() + 'px');
            this.con.css('top', _y.toString() + 'px');
        },

        /**
         * ��������
         * @method hide
         */
        hide: function() {
            this.con.css('visibility', 'hidden');
        },

		destroy : function() {
        	var $self = this.element;
        	$('body').unbind('.omCalendar' , this.globalEvent);
        	if(this.options.popup){
        		$self.parent().after($self).remove();
        		this.con.remove();
        	}
        },
        
        /**
         * ���������б�
         * @method _buildParam
         * @private
         */
        _buildParam: function() {
            var opts = this.options;
            opts.startDay && (opts.startDay = (7 - opts.startDay) % 7);
            !opts.dateFormat &&  (this._defaultFormat = opts.showTime ?  "yy-mm-dd H:i:s" : "yy-mm-dd"); 
            this.EV = [];
            return this;
        },

        /**
         * ���˲����б�
         * @method _parseParam
         * @private
         */
        _parseParam: function(o) {
            o && $.extend(this.options, o);
            this._handleDate();
        },

        /**
         * ģ�庯��
         * @method _templetShow
         * @private
         */
        _templetShow: function(templet, data) {
            var str_in,value_s,i,m,value,par;
            if (data instanceof Array) {
                str_in = '';
                for (i = 0; i < data.length; i++) {
                    str_in += arguments.callee(templet, data[i]);
                }
                templet = str_in;
            } else {
                value_s = templet.match(/{\$(.*?)}/g);
                if (data !== undefined && value_s !== null) {
                    for (i = 0,m = value_s.length; i < m; i++) {
                        par = value_s[i].replace(/({\$)|}/g, '');
                        value = (data[par] !== undefined) ? data[par] : '';
                        templet = templet.replace(value_s[i], value);
                    }
                }
            }
            return templet;
        },

        /**
         * ��������
         * @method _handleDate
         * @private
         */
        _handleDate: function() {
            var date = this.options.date;
            this.day = date.getDate();//����
            this.month = date.getMonth();//�·�
            this.year = date.getFullYear();//���
        },

        //get����
        _getHeadStr: function(year, month) {
            return year.toString() + $.om.lang.omCalendar.year + (Number(month) + 1).toString() + $.om.lang.omCalendar.month;
        },

        //�¼�
        _monthAdd: function() {
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            self.options.date.setFullYear(self.year, self.month);
            return this;
        },

        //�¼�
        _monthMinus: function() {
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            self.options.date.setFullYear(self.year, self.month);
            return this;
        },

        //������һ���µ�����,[2009,11],��:fullYear����:��0��ʼ����
        _computeNextMonth: function(a) {
            var _year = a[0],
                _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year,_month];
        },

        //�������ڵ�ƫ����
        _handleOffset: function() {
            var self = this,
                i18n = $.om.lang.omCalendar,
                data = [i18n.Su, i18n.Mo, i18n.Tu, i18n.We, i18n.Th, i18n.Fr, i18n.Sa],
                temp = '<span>{$day}</span>',
                offset = this.options.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i - offset + 7) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html:day_html
            };
        }
    });
	
	$.extend($.om.omCalendar, {
		Page: function(config, father) {
		    var i18n = $.om.lang.omCalendar;
            //����
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//ʱ��ѡ���ʵ��
            this.id = '';
            this.EV = [];
            this.html = [
                '<div class="om-cal-box" id="{$id}">',
                '<div class="om-cal-hd om-widget-header">',
                '<a href="javascript:void(0);" class="om-prev {$prev}"><span class="om-icon om-icon-seek-prev">Prev</span></a>',
                '<a href="javascript:void(0);" class="om-title">{$title}</a>',
                '<a href="javascript:void(0);" class="om-next {$next}"><span class="om-icon om-icon-seek-next">Next</span></a>',
                '</div>',
                '<div class="om-cal-bd">',
                '<div class="om-whd">',
                /*
                 '<span>��</span>',
                 '<span>һ</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 '<span>��</span>',
                 */
                father._handleOffset().day_html,
                '</div>',
                '<div class="om-dbd om-clearfix">',
                '{$ds}',
                /*
                 <a href="" class="om-null">1</a>
                 <a href="" class="om-state-disabled">3</a>
                 <a href="" class="om-selected">1</a>
                 <a href="" class="om-today">1</a>
                 <a href="">1</a>
                 */
                '</div>',
                '</div>',
                '<div class="om-setime om-state-default hidden">',
                '</div>',
                '<div class="om-cal-ft {$showtime}">',
                '<div class="om-cal-time om-state-default">',
                'ʱ�䣺00:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="om-selectime om-state-default hidden">',//<!--���Դ�ŵ�ѡʱ���һЩ�ؼ�ֵ-->',
                '</div>',
                '</div><!--#om-cal-box-->'
            ].join("");
            this.nav_html = [
                '<p>',
                i18n.month,
                '<select value="{$the_month}">',
                '<option class="m1" value="1">01</option>',
                '<option class="m2" value="2">02</option>',
                '<option class="m3" value="3">03</option>',
                '<option class="m4" value="4">04</option>',
                '<option class="m5" value="5">05</option>',
                '<option class="m6" value="6">06</option>',
                '<option class="m7" value="7">07</option>',
                '<option class="m8" value="8">08</option>',
                '<option class="m9" value="9">09</option>',
                '<option class="m10" value="10">10</option>',
                '<option class="m11" value="11">11</option>',
                '<option class="m12" value="12">12</option>',
                '</select>',
                '</p>',
                '<p>',
                i18n.year,
                '<input type="text" value="{$the_year}" onfocus="this.select()"/>',
                '</p>',
                '<p>',
                '<button class="ok">',
                i18n.ok,
                '</button><button class="cancel">',
                i18n.cancel,
                '</button>',
                '</p>'
            ].join("");


            //����
            //���õ����ݸ�ʽ����֤
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n)){
						return false;
					}
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n)){
							return false;
						}
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
                        if (!/^\d+$/i.test(n)){
							return false;
						}
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };

            };

            /**
             * ��Ⱦ��������UI
             */
            this._renderUI = function() {
                var cc = this,_o = {},ft,fOpts = cc.father.options;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showTime) {
                    _o.showtime = 'hidden';
                }
                _o.id = cc.id = 'om-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = $('#' + cc.id);
                if (fOpts.showTime) {
                    ft = cc.node.find('.om-cal-ft');
                    ft.removeClass('hidden');
                    cc.timmer = new $.om.omCalendar.TimeSelector(ft, cc.father);
                }
                return this;
            };
            /**
             * �������������¼�
             */
            this._buildEvent = function() {
                var cc = this,i,
                    con = $('#' + cc.id), 
                    fOpts = cc.father.options;

                cc.EV[0] = con.find('div.om-dbd').bind('click', function(e) {
                    //e.preventDefault();
                    var $source = $(e.target);
                    if ($source.filter('.om-null, .om-state-disabled').length > 0){
						return;
					}
                    var selected = Number($source.html());
					//���������30�ջ���31�գ�����2�·ݾͻ������
                    var d = new Date(fOpts.date);
                    d.setFullYear(cc.year, cc.month, selected);
                    cc.father.dt_date = d;
                    
                    if (!fOpts.showTime) {
                    	cc.father._trigger("onSelect",e,d);
                    }
                    
                    if (fOpts.popup && !fOpts.showTime) {
                        cc.father.hide();
                        if(!isNaN(cc.father.dt_date)){  //���ie7�϶�������Ȼ��������⣬���������������Ի���
                            var dateStr = $.omCalendar.formatDate(cc.father.dt_date, fOpts.dateFormat || cc.father._defaultFormat);
                            $(cc.father.element).val(dateStr);
                        }
                    }
                    cc.father._render({date:d});
                }).find('a').bind('mouseover',function(e){
                    $(this).addClass('om-state-hover om-state-nobd');
                }).bind('mouseout',function(e){
                    $(this).removeClass('om-state-hover')
                        .not('.om-state-highlight, .om-state-active')
                        .removeClass('om-state-nobd');
                });
                //��ǰ
                cc.EV[1] = con.find('a.om-prev').bind('click', function(e) {
                    e.preventDefault();
                    cc.father._monthMinus()._render();
                });
                //���
                cc.EV[2] = con.find('a.om-next').bind('click', function(e) {
                    e.preventDefault();
                    cc.father._monthAdd()._render();
                });
                cc.EV[3] = con.find('a.om-title').bind('click', function(e) {
                    try {
                        cc.timmer.hidePopup();
                        e.preventDefault();
                    } catch(exp) {
                    }
                    var $source = $(e.target);
                    var in_str = cc.father._templetShow(cc.nav_html, {
                        the_month:cc.month + 1,
                        the_year:cc.year
                    });
                    con.find('.om-setime').html(in_str)
	                    .removeClass('hidden')
                        .find("option:[value=" + (cc.month + 1) + "]").attr("selected", "selected");
                    this.blur();   
                    con.find('input').bind('keydown', function(e) {
                        var $source = $(e.target);
                        if (e.keyCode == $.om.keyCode.UP) {
                            $source.val(Number($source.val()) + 1);
                            $source[0].select();
                        }
                        if (e.keyCode == $.om.keyCode.DOWN) {
                            $source.val(Number($source.val()) - 1);
                            $source[0].select();
                        }
                        if (e.keyCode == $.om.keyCode.ENTER) {
                            var _month = con.find('.om-setime select').val();
                            var _year = con.find('.om-setime input').val();
                            con.find('.om-setime').addClass('hidden');
                            if (!cc.Verify().isYear(_year)){
								return;
							}
                            if (!cc.Verify().isMonth(_month)){
								return;
							}
                            cc.father._render({
                                date : cc._computeDate(cc, _year, _month)
                            });
                        }
                    });
                }).bind("mouseover", function(e){
                    $(this).addClass("om-state-hover");
                }).bind("mouseout", function(e){
                    $(this).removeClass("om-state-hover");
                });
                cc.EV[4] = con.find('.om-setime').bind('click', function(e) {
                    e.preventDefault();
                    var $source = $(e.target),
                        $this = $(this);
                    if ($source.hasClass('ok')) {
                        var _month = $this.find('select').val(),
                            _year = $this.find('input').val();
                        $this.addClass('hidden');
                        if (!cc.Verify().isYear(_year)){
							return;
						}
                        if (!cc.Verify().isMonth(_month)){
							return;
						}
                        _month = _month - $this.parent().prevAll('.om-cal-box').length - 1;
                        cc.father._render({
                            date: cc._computeDate(cc, _year, _month)
                        });
                    } else if ($source.hasClass('cancel')) {
                        $this.addClass('hidden');
                    }
                });
            };
            
            this._computeDate = function(cc, year, month) {
                var result = new Date(cc.father.options.date.getTime());
                result.setFullYear(year, month);
                return result;
            };
            
            /**
             * �õ���ǰ��������node����
             */
            this._getNode = function() {
                var cc = this;
                return cc.node;
            };
            /**
             * �õ�ĳ���ж�����,��Ҫ���������ж�����
             */
            this._getNumOfDays = function(year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };
            /**
             * �������ڵ�html
             */
            this.createDS = function() {
                var cc = this,
                    fOpts = cc.father.options,
                    s = '',
                    startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + fOpts.startDay + 7) % 7,//���µ�һ�������ڼ�
                    k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday,
                    i, _td_s;
                
                
                var _dis_days = [];
                for (i = 0; i < fOpts.disabledDays.length; i++) {
                    _dis_days[i] = fOpts.disabledDays[i] % 7;
                }

                for (i = 0; i < k; i++) {
                    var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    if (i < startweekday) {//null
                        s += '<a href="javascript:void(0);" class="om-null" >0</a>';
                    } else if ($.inArray((i + fOpts.startDay) % 7, _dis_days) >= 0) {
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (fOpts.disabledFn(_td_e) === false) {
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (fOpts.minDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() < (fOpts.minDate.getTime() + 1)) {//disabled
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';

                    } else if (fOpts.maxDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > fOpts.maxDate.getTime()) {//disabled
                        s += '<a href="javascript:void(0);" class="om-state-disabled">' + (i - startweekday + 1) + '</a>';
                    } else if (i == (startweekday + (new Date()).getDate() - 1) &&
                        (new Date()).getFullYear() == cc.year  &&
                        (new Date()).getMonth() == cc.month) {//today
                        s += '<a href="javascript:void(0);" class="om-state-highlight om-state-nobd">' + (i - startweekday + 1) + '</a>';

                    } else if (i == (startweekday + fOpts.date.getDate() - 1) &&
                        cc.month == fOpts.date.getMonth() &&
                        cc.year == fOpts.date.getFullYear()) {//selected
                        s += '<a href="javascript:void(0);" class="om-state-active om-state-nobd">' + (i - startweekday + 1) + '</a>';
                    } else {//other
                        s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                    }
                }
                if (k % 7 !== 0) {
                    for (i = 0; i < (7 - k % 7); i++) {
                        s += '<a href="javascript:void(0);" class="om-null">0</a>';
                    }
                }
                cc.ds = s;
            };
            /**
             * ��Ⱦ
             */
            this._render = function() {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
            };


        }//Page constructor over
    });
	
	$.extend($.om.omCalendar, {
        /**
         * ʱ��ѡ������
         * @constructor Calendar.TimerSelector
         * @param {object} ft ,timer���ڵ�����
         * @param {object} father ָ��Calendarʵ����ָ�룬��Ҫ������Ĳ���
         */
        TimeSelector:function(ft, father) {
            //����
            var date = father.options.date,
                i18n = $.om.lang.omCalendar;
            
            this.father = father;
            this.fcon = ft.parent('.om-cal-box');
            this.popupannel = this.fcon.find('.om-selectime');//��ѡʱ��ĵ�����
            if (typeof date == 'undefined') {//ȷ����ʼֵ�͵�ǰʱ��һ��
                father.options.date = new Date();
            }
            this.time = father.options.date;
            this.status = 's';//��ǰѡ���״̬��'h','m','s'�����жϸ����ĸ�ֵ
            this.ctime = $('<div class="om-cal-time om-state-default">' + i18n.time + '��<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u om-icon om-icon-triangle-1-n"></button><button class="d om-icon om-icon-triangle-1-s"></button></div><!--arrow}}--></div>');
            this.button = $('<button class="ct-ok om-state-default">' + i18n.ok +'</button>');
            //Сʱ
            this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
            //����
            this.m_a = ['00','10','20','30','40','50'];
            //��
            this.s_a = ['00','10','20','30','40','50'];


            //����
            /**
             * ������Ӧ������html��ֵ��������a��
             * ������Ҫƴװ������
             * ���أ�ƴ�õ�innerHTML,��β��Ҫ��һ���رյ�a
             *
             */
            this.parseSubHtml = function(a) {
                var in_str = '';
                for (var i = 0; i < a.length; i++) {
                    in_str += '<a href="javascript:void(0);" class="om-cal-item">' + a[i] + '</a>';
                }
                in_str += '<a href="javascript:void(0);" class="x">x</a>';
                return in_str;
            };
            /**
             * ��ʾom-selectime����
             * ����������õ�innerHTML
             */
            this.showPopup = function(instr) {
                var self = this;
                this.popupannel.html(instr);
                this.popupannel.removeClass('hidden');
                var status = self.status;
                var active_cls = "om-state-active om-state-nobd";
                self.ctime.find('span').removeClass(active_cls);
                switch (status) {
                    case 'h':
                        self.ctime.find('.h').addClass(active_cls);
                        break;
                    case 'm':
                        self.ctime.find('.m').addClass(active_cls);
                        break;
                    case 's':
                        self.ctime.find('.s').addClass(active_cls);
                        break;
                }
            };
            /**
             * ����om-selectime����
             */
            this.hidePopup = function() {
                this.popupannel.addClass('hidden');
            };
            /**
             * ������������������ļ��裬��������time��ʾ����
             */
            this._render = function() {
                var self = this;
                var h = self.get('h');
                var m = self.get('m');
                var s = self.get('s');
                self.father._time = self.time;
                self.ctime.find('.h').html(h);
                self.ctime.find('.m').html(m);
                self.ctime.find('.s').html(s);
                return self;
            };
            //�����set��get��ֻ�Ƕ�time�Ĳ��������������������������
            /**
             * set(status,v)
             * h:2,'2'
             */
            this.set = function(status, v) {
                var self = this;
                v = Number(v);
                switch (status) {
                    case 'h':
                        self.time.setHours(v);
                        break;
                    case 'm':
                        self.time.setMinutes(v);
                        break;
                    case 's':
                        self.time.setSeconds(v);
                        break;
                }
                self._render();
            };
            /**
             * get(status)
             */
            this.get = function(status) {
                var self = this;
                var time = self.time;
                switch (status) {
                    case 'h':
                        return time.getHours();
                    case 'm':
                        return time.getMinutes();
                    case 's':
                        return time.getSeconds();
                }
            };

            /**
             * add()
             * ״ֵ̬����ı�����1
             */
            this.add = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v++;
                self.set(status, v);
            };
            /**
             * minus()
             * ״ֵ̬����ı�����1
             */
            this.minus = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v--;
                self.set(status, v);
            };


            //����
            this._timeInit = function() {
                var self = this;
                ft.html('').append(self.ctime);
                ft.append(self.button);
                self._render();
				//TODO:
                self.popupannel.bind('click', function(e) {
                    var el = $(e.target);
                    if (el.hasClass('x')) {//�ر�
                        self.hidePopup();
                    } else if (el.hasClass('om-cal-item')) {//��ѡһ��ֵ
                        var v = Number(el.html());
                        self.set(self.status, v);
                        self.hidePopup();
                    }
                });
                //ȷ���Ķ���
                self.button.bind('click', function(e) {
                    //��ʼ����ȡ�����date
                    var fOpts = self.father.options;
                    var d = typeof self.father.dt_date == 'undefined' ? fOpts.date : self.father.dt_date;
                    d.setHours(self.get('h'));
                    d.setMinutes(self.get('m'));
                    d.setSeconds(self.get('s'));
                    self.father._trigger("onSelect",e,d);
                    if (fOpts.popup) {
                        var dateStr = $.omCalendar.formatDate(d, fOpts.dateFormat || self.father._defaultFormat);
                        $(self.father.element).val(dateStr);
                        self.father.hide();
                    }
                });
                //ctime�ϵļ����¼������¼������Ҽ��ļ���
                //TODO �����Ƿ�ȥ��
                self.ctime.bind('keyup', function(e) {
                    if (e.keyCode == $.om.keyCode.UP || e.keyCode == $.om.keyCode.LEFT) {//up or left
                        //e.stopPropagation();
                        e.preventDefault();
                        self.add();
                    }
                    if (e.keyCode == $.om.keyCode.DOWN || e.keyCode == $.om.keyCode.RIGHT) {//down or right
                        //e.stopPropagation();
                        e.preventDefault();
                        self.minus();
                    }
                });
                //�ϵļ�ͷ����
                self.ctime.find('.u').bind('click', function() {
                    self.hidePopup();
                    self.add();
                });
                //�µļ�ͷ����
                self.ctime.find('.d').bind('click', function() {
                    self.hidePopup();
                    self.minus();
                });
                //����ѡ��Сʱ
                self.ctime.find('.h').bind('click', function() {
                    var in_str = self.parseSubHtml(self.h_a);
                    self.status = 'h';
                    self.showPopup(in_str);
                });
                //����ѡ�����
                self.ctime.find('.m').bind('click', function() {
                    var in_str = self.parseSubHtml(self.m_a);
                    self.status = 'm';
                    self.showPopup(in_str);
                });
                //����ѡ����
                self.ctime.find('.s').bind('click', function() {
                    var in_str = self.parseSubHtml(self.s_a);
                    self.status = 's';
                    self.showPopup(in_str);
                });
            };
            this._timeInit();
        }

    });
	
	$.omCalendar = $.omCalendar || {};
	
	$.extend($.omCalendar, {
        leftPad : function (val, size, ch) {
            var result = new String(val);
            if(!ch) {
                ch = " ";
            }
            while (result.length < size) {
                result = ch + result;
            }
            return result.toString();
        }
    });
	$.extend($.omCalendar, {
	    getShortDayName : function(day){
            return $.omCalendar.dayMaps[day][0];
        },
        getDayName : function (day) { 
            return $.omCalendar.dayMaps[day][1];
        },
	    
        getShortMonthName : function(month){
            return $.omCalendar.monthMaps[month][0];
	    },
	    getMonthName : function (month) { 
	        return $.omCalendar.monthMaps[month][1];
	    },
	    dayMaps : [
            ['Sun', 'Sunday'],
	        ['Mon', 'Monday'],
	        ['Tue', 'Tuesday'],
	        ['Wed', 'Wednesday'],
	        ['Thu', 'Thursday'],
	        ['Fri', 'Friday'],
	        ['Sat', 'Saturday']
	    ],
	    monthMaps : [
            ['Jan', 'January'],
            ['Feb', 'February'],
            ['Mar', 'March'],
            ['Apr', 'April'],
            ['May', 'May'],
            ['Jun', 'June'],
            ['Jul', 'July'],
            ['Aug', 'August'],
            ['Sep', 'September'],
            ['Oct', 'October'],
            ['Nov', 'November'],
            ['Dec', 'December']
        ],
        /**
         * g: getter method
         * s: setter method
         * r: regExp
         */
        formatCodes : {
	        //date
	        d: {
	            g: "this.getDate()", //date of month (no leading zero)
	            s: "this.setDate({param})",
	            r: "(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])"
	        },
	        dd: {
	            g: "$.omCalendar.leftPad(this.getDate(), 2, '0')", //date of month (two digit)
	            s: "this.setDate(parseInt('{param}', 10))",
	            r: "(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])"
	        },
	         
	        //month
	        m: {
	            g: "(this.getMonth() + 1)", // get month in one digits, no leading zero
	            s: "this.setMonth(parseInt('{param}', 10))",
	            r: "(0[1-9]|1[0-2]|[1-9])"
	        },
	        mm: { 
	            g: "$.omCalendar.leftPad(this.getMonth() + 1, 2, '0')",//two digits
	            s: "this.setMonth(parseInt('{param}', 10))",
	            r: "(0[1-9]|1[0-2]|[1-9])"
	        },
	        
	        //year
	        y: {
	            g: "('' + this.getFullYear()).substring(2, 4)", // get year in 2 digits
	            s: "this.setFullYear(parseInt('20{param}', 10))",
	            r: "(\\d{2})"
	        },
	        yy: {
	            g: "this.getFullYear()", // get year in 4 digits
	            s: "this.setFullYear(parseInt('{param}', 10))",
	            r: "(\\d{4})"
	        },
	        
	        //hour
	        h: {
	            g: "$.omCalendar.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",// 12 hours, two digits
	            s: "this.setHours(parseInt('{param}', 10))", // TODO,need to be fixed
	            r: "(0[0-9]|1[0-1])" // 00~11
	        },
            H: {
                g: "$.omCalendar.leftPad(this.getHours(), 2, '0')",   //24 hours, two digits
                s: "this.setHours(parseInt('{param}', 10))",
                r: "([0-1][0-9]|2[0-3])"   //00~23
            },
            g: {
                g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)", // 12 hours, no leading 0
                s: "this.setHours(parseInt('{param}', 10))", // TODO,need to be fixed
                r: "([0-9]|1[0-1])" // 0, 1, 2, 3, ..., 11
            },
            G: {
                g: "this.getHours()",   // 24 hours, no leading 0
                s: "this.setHours(parseInt('{param}', 10))",
                r: "([0-9]|1[0-9]|2[0-3])" //0, 1, 2, 3, ..., 23
            },
            
            //minute
            i: {
                g: "$.omCalendar.leftPad(this.getMinutes(), 2, '0')", // get minute (two digits)
                s: "this.setMinutes(parseInt('{param}', 10))",
                r: "([0-5][0-9])" //00, 01, 02, ..., 59
            }, 
            
            //second
            s: {
                g: "$.omCalendar.leftPad(this.getSeconds(), 2, '0')", // get seconds (two digits)
                s: "this.setSeconds(parseInt('{param}', 10))",
                r: "([0-5][0-9])" //00, 01, 02, ..., 59
            },
            
            // millisecond
            u: {
                g: "$.omCalendar.leftPad(this.getMilliseconds(), 3, '0')",
                s: "this.setMilliseconds(parseInt('{param}', 10))",
                r: "(\\d{1,3})" //0, 1, 2, ..., 999
            },
            
            //localised names
            D: {
                g: "$.omCalendar.getShortDayName(this.getDay())", // get localised short day name
                s: "",
                r: ""
            },
            DD: {
                g: "$.omCalendar.getDayName(this.getDay())", // get localised long day name
                s: "",
                r: ""
            },
            
            M: {
                g: "$.omCalendar.getShortMonthName(this.getMonth())", // get localised short month name
                s: "",
                r: ""
            },
            MM: {
                g: "$.omCalendar.getMonthName(this.getMonth())", // get localised long month name
                s:"",
                r:""
            },
            
            //am & pm
            a: {
                g: "(this.getHours() < 12 ? 'am' : 'pm')", // am pm
                s: "",
                r: ""
            },
            A: {
                g: "(this.getHours() < 12 ? 'AM' : 'PM')", // AM PM
                s: "",
                r: ""
            }
        }
	});
	$.extend($.omCalendar, {
		
	    formatDate : function(date, formatter){
	        if (!date || !formatter) {
	            return null;
	        }
	        if (!(Object.prototype.toString.call(date) === '[object Date]')) {
	            return null;
	        }
	        var i, fi , result = '', literal = false;
	        for (i = 0; i < formatter.length ; i++ ) {
	            fi = formatter.charAt(i);
	            fi_next = formatter.charAt(i + 1);
	            if (fi == "'") {
	                literal = !literal;
	                continue;
	            }
	            if (!literal && $.omCalendar.formatCodes[fi + fi_next]) {
	                fi = new Function("return " + $.omCalendar.formatCodes[fi + fi_next].g).call(date);
	                i ++;
	            } else if (!literal && $.omCalendar.formatCodes[fi]) {
	                fi = new Function("return " + $.omCalendar.formatCodes[fi].g).call(date);
	            }
	            result += fi;
	        }
	        return result;
	        
	    },
	    parseDate : function(date_string, formatter){
	        if (!date_string || !formatter) {
	            return null;
	        }
	        if (!(Object.prototype.toString.call(date_string) === '[object String]')) {
	            return null;
	        }
	        var setterArr = [], i, fi, $fci = null, m_result;
	        for (i = 0 ; i < formatter.length; i ++) {
	            fi = formatter.charAt(i);
	            fi_next = formatter.charAt(i + 1);
	            if ($.omCalendar.formatCodes[fi + fi_next]) {
	                $fci = $.omCalendar.formatCodes[fi + fi_next];
                    i ++;
                } else if ($.omCalendar.formatCodes[fi]) {
                    $fci = $.omCalendar.formatCodes[fi];
                } else {
                    continue;
                }
	            m_result = date_string.match(new RegExp($fci.r));
	            if (!m_result) {
	                // your string and your formmatter is not matched!
	                return null;
	            }
	            setterArr.push($fci.s.replace('{param}', m_result[0]));
	            date_string = date_string.substring(m_result.index + m_result[0].length);
	            var newChar = formatter.charAt(i + 1);
	            if (!(newChar == "" && date_string == "") 
	                    && (newChar !== date_string.charAt(0))
	                    && ($.omCalendar.formatCodes[newChar] === undefined)) {
	                // your string and your formmatter is not matched!
                    return null;
                }
	        }
	        var date = new Date();
	        new Function(setterArr.join(";")).call(date);
            date.setMonth(date.getMonth() - 1);
	        return date;
	    }
	});
	
	$.om.lang.omCalendar = {
        year : '��',
        month : '��',
        Su : '��',
        Mo : 'һ',
        Tu : '��',
        We : '��',
        Th : '��',
        Fr : '��',
        Sa : '��',
        cancel : 'ȡ��',
        ok : 'ȷ��',
        time : 'ʱ��'
    };
})(jQuery);/*
 * $Id: om-combo.js,v 1.166 2012/05/10 02:55:58 linxiaomin Exp $
 * operamasks-ui omCombo 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
;(function($) {
    var _valueKey='_value';
    
    // Array.prototype.indexOf is added in JavaScript v1.6.
    // IE8 only support JavaScript v1.3. So added it to make this component support IE.
    if(!Array.prototype.indexOf){
        Array.prototype.indexOf=function(item){
            var len=this.length;
            for(var i=0;i<len;i++){
                if(this[i]===item){
                    return i;
                }
            }
            return -1;
        };
    }
	/**
     * @name omCombo
     * @class ��������������������html�е�select�����ǿ������룬���Թ��ˣ�����ʹ��Զ�����ݡ�<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ�ñ�������Դ��Ҳ����ʹ��Զ������Դ</li>
     *      <li>֧��������Ļ����أ���һ����ʾʱ�ų�ʼ���������е����ݣ�</li>
     *      <li>�û��ɶ��������������ݵ���ʾЧ��</li>
     *      <li>�û��ɶ���ѡ���������������</li>
     *      <li>�û��ɶ���ѡ��������valueֵ</li>
     *      <li>�û��ɶ���������Ŀ�Ⱥ����߶�</li>
     *      <li>���б�����߹��˵Ĺ��ܣ�Ҳ�ɶ��ƹ��˵��㷨</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#combo').omCombo({
     *         dataSource:[
     *                 {text:'Java',value:'1'},
     *                 {text:'JavaScript',value:'2'},
     *                 {text:'C',value:'3'},
     *                 {text:'PHP',value:'4'},
     *                 {text:'ASP',value:'5'}
     *         ],
     *         optionField:function(data,index){
     *             return '&lt;font color="red">'+index+'��&lt;/font>'+data.text+'('+data.value+')';
     *         },
     *         emptyText:'select one option!',
     *         value:'1',
     *         editable:false,
     *         lazyLoad:true,
     *         listMaxHeight:40
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;input id="combo"/>
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
	$.omWidget('om.omCombo', {
	    options: 
	       /** @lends omCombo#*/
	       {
                /**
                 * ��JSON�������ĸ��ֶ���Ϊoption��text������ָ��ΪJSON��һ�����ԣ�Ҳ����ָ��һ��function���Լ����������ʾoption��text��<br/><br/> 
                 * <ul>
                 * <li>����[{"text":"Java����","value":"java"},{"text":"C����","value":"c"},{"text":"C#����","value":"c#"}]�����Ķ���,�����Կ��Բ����ã�������Ĭ��ֵ'text'��</li>
                 * <li>����[{"label":"Java����","id":"java"},{"label":"C����","id":"c"},{"label":"C#����","id":"c#"}]�����Ķ���,�����Կ�������Ϊ'label'��</li>
                 * <li>����[{"name":"����","abbreviation":"sz","code":"0755"},{"name":"�人","abbreviation":"wh","code":"027"},{"name":"����","abbreviation":"bj","code":"010"}]�����Ķ���,�����Կ�������Ϊ</li>
                 * </ul>
                 * <br/>
                 * @type String or Function 
                 * @default 'text' 
                 * @example
                 * optionField:function(data,index){ 
                 *   return data.name+'('+ data.abbreviation+')'; 
                 * }  
                 * // ���options����ʾ��"����(sz)���人(wh)������(bj)"�����ġ�
                 * // ��ȻҲ����д������������������Ĵ������ʵ��optionsΪ��ͼƬ�����ֵ����
                 * // return '&lt;img src="options.jpg" style="float:left"/>&lt;span style="float:right">' + data.value+'&lt;/span>'; 
                 */
                optionField : 'text',
                /**
                 * JSON�������ĸ��ֶ���Ϊoption��value���ԣ�����ָ��ΪJSON��һ�����ԣ�Ҳ����ָ��һ��function���Լ����������ʾoption��value��<br/><br/>
                 * <ul>
                 *   <li>[{"text":"Java����","value":"java"},{"text":"C����","value":"c"},{"text":"C#����","value":"c#"}] ������Ĭ��ֵ'value'��</li>
                 *   <li>[{"label":"Java����","id":"java"},{"label":"C����","id":"c"},{"label":"C#����","id":"c#"}] �����Կ�������Ϊ'id'��</li>
                 *   <li>[{"name":"����","abbreviation":"sz","code":"0755"},{"name":"�人","abbreviation":"wh","code":"027"},{"name":"����","abbreviation":"bj","code":"010"}]�����Կ�������Ϊ'code'</li>
                 * </ul>
                 * <br/>
                 * @type String , Function
                 * @default 'value'
                 * @example
                 * ���JSON����Ϊ
                 * [
                 *   {"name":"����","abbreviation":"sz","code":"0755"},
                 *   {"name":"�人","abbreviation":"wh","code":"027"}
                 * ]
                 * function(data,index){
                 *    return data.code+'(' + data.abbreviation+')';
                 * } 
                 *  ����options��ֵ�ֱ���"0755(sz)��027(wh)��010(bj)"�����ġ�
                 *  ��ȻҲ����д���������ӵĶ�������return data.code.substring(1); 
                 *  ��ʵ�ֽ�����ǰ���0ȥ����Ϊoption��value�����Ĺ��ܡ�
                 */
                valueField : 'value',
                /**
                 * �����ȡ�����ʹ��px��pt��em��auto����'100px'��'10pt'��'15em'��'auto'
                 * @type String
                 * @default 'auto'
                 * @example
                 * width : '100px'
                 */
                width : 'auto',
                /**
                 * �Ƿ���������������ã��򲻿������룬form�ύʱҲ��������������
                 * @type Boolean
                 * @default false
                 * @example
                 * disabled : true
                 */
                disabled : false,
                /**
                 * ����Ƿ�ֻ���������ֻ�����򲻿������룬������ͨ��������ѡ��һ��option��form�ύʱ��������������
                 * @type Boolean
                 * @default false
                 * @example
                 * readOnly : true
                 */
                readOnly : false,
                /**
                 * ����Ƿ�������롣���falseʱ���������룬�����Դ���������ѡ��һ��option��
                 * @type Boolean
                 * @default true
                 * @example
                 * editable : true
                 */
                editable : true,
                /**
                 * �Ƿ��ӳټ������������ѡ����trueʱҳ����ʾʱ������������ѡ���һ��չ��������ż��ء�
                 * @type Boolean
                 * @default false
                 * @example
                 * lazyLoad : true
                 */
                lazyLoad : false,
                /**
                 * ���������������߶ȣ����'auto'ʱ�߶Ȳ��̶����ж���ѡ�����ʾ��ߣ����50ʱ��ʾ���������߶�50px����������������ʾ��ֱ��������<b>ע�⣺��������������ƣ�������Ե���Сֵ��31�����С�����ֵʱ����������ֱ������</b>
                 * @type Number
                 * @default 300
                 * @example
                 * listMaxHeight : 500
                 */
                listMaxHeight : 300,
                /**
                 * �����������Ŀ���Ƿ��Զ���չ�����falseʱ������Ŀ�Ƚ���������ȱ���һ�£����trueʱ�������Ƚ����������Ǹ�ѡ��Ŀ�ȡ�
                 * @type Boolean
                 * @default false
                 * @example
                 * listAutoWidth : true
                 */
                listAutoWidth : false,
                /**
                 * �Ƿ��Զ�����������ѡ����trueʱ�������н�����ʾ�������ǰֵƥ�䣨ƥ���㷨��filterStrategy��������ѡ�
                 * @type Boolean
                 * @default true
                 * @example
                 * autoFilter : true
                 */
                autoFilter : true,
                /**
                 * �Զ�����������ѡ����õĹ����㷨��<b>ע�⣺����autoFilter��Ϊfalseʱ�����Բ���Ч��</b><br/>
                 * Ĭ��ֵΪ'first'��ʾ�����ƥ�䣨�൱��startWith�������������ѡ���label��������ֵ��ͷ�ĲŻ���ʾ��<br/>
                 * ��Ϊ'last'��ʾ���ұ�ƥ�䣨�൱��endWith�������������ѡ���label��������ֵ��β�ĲŻ���ʾ��<br/>
                 * ��Ϊ'anywhere'��ʾ������λ��ƥ�䣨�൱��contains�������������ѡ���labelֻҪ���ֹ���������ֵһ���Ķ�����ʾ��<br/>
                 * Ҳ������Ϊһ���Զ���function����function����true��ʾƥ��ɹ���������ʾ�������б��У�����true����ʾ��
                 * @type String,Function
                 * @default 'first'
                 * @example
                 * //�����Կ�������Ϊ'first' �� 'last' �� 'anywhere' �� 
                 * function(text,record){ 
                 *      var reg=new RegExp(text); 
                 *      //ֻҪ��ǰ��¼��postCode���Ի�idCardNo�����а���������ֵ����ƥ��ɹ�
                 *      return reg.test(record.postCode) || reg.test(record.idCradNo); 
                 * } 
                 */
                filterStrategy : 'first',
                /**
                 * �Զ�����������ѡ���ӳ�ʱ�䣨��λ�����룩��������300���ʾ��300��������������������Σ���ֻ�������һ�ΰ����Ĺ��ˡ�<b>ע�⣺����autoFilter��Ϊfalseʱ�����Բ���Ч��</b>
                 * @type Number
                 * @default 500
                 * @example
                 * filterDelay : 1000
                 */
                filterDelay : 500, 
                
                /**
                 * �Ƿ�֧�ֶ�ѡ��Ĭ��Ϊ false�����֧�ֶ�ѡĬ�Ͻ����ɱ༭ֻ��ѡ��
                 * @type Boolean
                 * @default false
                 * @example
                 *  multi : true
                 */
                multi : false, 
                
                /**
                 * ֧�ֶ�ѡʱ�Ķ��ѡ��֮��ķָ�����Ĭ��Ϊ ','.
                 * @type String
                 * @default ','
                 * @example
                 *  multiSeparator : ';'
                 */
                multiSeparator : ','
                
                /**
                 * ����Դ���ԣ���������Ϊ����̨��ȡ���ݵ�URL�����ߡ�JSON���ݡ�
                 * @name omCombo#dataSource
                 * @type Array[JSON],URL
                 * @default ��
                 * @example
                 * dataSource : '/operamasks-ui/getCountryNameServlet.json' 
                 * ����
                 * dataSource : [{"value":"001","text":"����"},{"value":"002","text":"����"}]
                 */
                /**
                 * ��input���ֵΪ��ʱ��input���������ʾ��Ϣ����input��õ��������input���ֵ��Ϊ��ʱ�����ʾ��Ϣ���Զ���ʧ��
                 * @name omCombo#emptyText
                 * @default ��
                 * @type String
                 * @example
                 * emptyText : '������ֵ'
                 */
                /**
                 * combo����ĳ�ʼֵ��<b>ע�⣺���������value���Ե�ֵ��lazyLoad���Խ��ᱻǿ��ת��Ϊfalse</b>
                 * @name omCombo#value
                 * @default ��
                 * @type String
                 * @example
                 * value : '����'
                 */
                /**
                 * ������������ݵ�function�����ô�����ʱ��ʾ�û�Ҫ�Լ��ӹܴ�records�����������ʾ���̣��û��õ����е�recordsȻ���Լ����������������ݣ���󷵻�һ��JQueryԪ�ؼ��ϣ��������ÿ��Ԫ�ر�ʾһ��option�������¼�ѡ��ʱ������������ϵ�Ԫ�ؼ�ѭ��������
                 * @name omCombo#listProvider
                 * @type Function
                 * @default ��
                 * @returns {jQuery Array} Ӧ�÷���һ��jQuery���飬�����ÿ��Ԫ�ر�ʾ���������һ��option������ʾ��������������һ��table��tabody�е�ÿ��tr��ʾһ��option�����Է���container.find('tbody tr')����
                 * @example
                 * listProvider:function(container,records){ 
                 *      $('&lt;table&gt;').appendTo(container);
                 *      records.each(function(){ 
                 *          $('&lt;tr&gt;&lt;td&gt;'+this.text+'&lt;td&gt;&lt;/tr&gt;').appendTo(container); 
                 *      }); 
                 *      $('&lt;/table>').appendTo(container);
                 *      return container.find('tbody tr'); //tbody��ÿ��tr��ʾһ��option����thead�е�tr��ʾ��ͷ������option
                 *  } 
                 */
                 /**
                 * ��JSON������ĸ��ֶ���Ϊ��ʾ��input������֡�����ָ��ΪJSON��һ�����ԣ�Ҳ����ָ��һ��function���Լ�������ʾʲô���ֵ�input��<b>ע�⣺�����������ѡ��һ��option���ֱ����ʾ��input�������ֻ����ʾ��ͨ�ַ���������ʹ��html</b>
                 * @name omCombo#inputField
                 * @type String or Function
                 * @default 'text'
                 * @example
                 * //��JSON�����userName����ֵ��Ϊ��ʾ������������
                 * inputField:'userName'
                 * 
                 * //�Զ���һ��Function��������ʲô��Ϊ��ʾ������������
                 * inputField:function(data,index){ 
                 *      return data.text+'('+data.value+')';
                 * } 
                 */
                 /**
                 * omCombo�����������ݷ����仯ʱ�Ļص�������
                 * @event
                 * @param target ��ǰ��������
                 * @param newValue ѡ�����ֵ
                 * @param oldValue ԭ����ֵ
                 * @param event jQuery.Event����
                 * @name omCombo#onValueChange
                 * @type Function
                 * @example
                 * onValueChange:function(target,newValue,oldValue,event){ 
                 *      //do something
                 *  } 
                 */
                 /**
                 * ��Ajax��ʽ���������б��е����ݳ���ʱ�Ļص��������������������һЩ�������������Ի��ķ�ʽ��ʾ�û���
                 * @event
                 * @param xmlHttpRequest XMLHttpRequest����
                 * @param textStatus  ��������
                 * @param errorThrown  ������쳣����
                 * @param event jQuery.Event����
                 * @name omCombo#onError
                 * @type Function
                 * @example
                 * onError:function(xmlHttpRequest, textStatus, errorThrown, event){ 
                 *      alert('An error occurred while load records from URL "'+url+'",the error message is:'+errorThrown.message);
                 *  } 
                 */
                 /**
                 * Ajax��Ӧ����ʱִ�еķ�����
                 * @event
                 * @param data Ajax���󷵻ص�����
                 * @param textStatus ��Ӧ��״̬
                 * @param event jQuery.Event����
                 * @name omCombo#onSuccess
                 * @type Function
                 * @example
                 * onSuccess:function(data, textStatus, event){
                 *     if(data.length==0){
                 *          $('#txt').omSuggestion('showMessage','û�����ݣ�');
                 *     } 
                 * }
                 */
        },
        _init:function(){
            var options = this.options,
                inputEl = this.element,
                source = options.dataSource;
            
            if (!options.inputField) {
                options.inputField = options.optionField;
            }
            //������lazyLoad=false�����������valueʱ�޷���ʾ��ȷ��fieldText
            if (typeof options.value !== 'undefined') {
                options.lazyLoad = false;
            }
            
            if (options.width != 'auto') {
                var span = inputEl.parent().width(options.width);
                inputEl.width(span.innerWidth() - inputEl.next().outerWidth() - inputEl.outerWidth() + inputEl.width());
            }
            /*if (!options.listAutoWidth) {
                this.dropList.width(inputEl.parent().width());
            }*/
            
            if (options.multi) {
                options.editable = this.options.editable = false;
            }
            
            this._refeshEmptyText(options.emptyText);
            
            options.disabled ? inputEl.attr('disabled', true) : inputEl.removeAttr('disabled');
            (options.readOnly || !options.editable) ? inputEl.attr('readonly', 'readOnly') : inputEl.removeAttr('readonly');
            
            if (!options.lazyLoad) {
                //load data immediately
                this._toggleLoading('add');
                if(source && typeof source == 'string'){
                    this._ajaxLoad(source);
                }else if(source && typeof source == 'object'){
                    this._loadData(source);
                    this._toggleLoading('remove');
                }else{
                    //neither records nor remote url was found
                    this.dataHasLoaded = true;
                    this._toggleLoading('remove');
                }
                
            } else {
                this.dataHasLoaded = false;
            }
            var unusable = options.disabled || options.readOnly;
            
            if (unusable) {
                this.expandTrigger.addClass('om-state-disabled');
            } else {
                this._bindEvent();
            }
        },
        _create:function(){
            var inputEl = this.element;
            inputEl.attr('autocomplete', 'off');
            var span = $('<span class="om-combo om-widget om-state-default"></span>').insertAfter(inputEl).wrapInner(inputEl);
            this.expandTrigger = $('<span class="om-combo-trigger"></span>').appendTo(span);
            this.dropList = $($('<div class="om-widget"><div class="om-widget-content om-droplist"></div></div>').css({position:'absolute', zIndex:2000}).appendTo(document.body).children()[0]).hide();
        },
        /**
         * ���¼���������������ݣ�һ�����ڼ���combo���ܡ�
         * @name omCombo#setData
         * @function
         * @param arg records��JSON���飩��url
         * @example
         * //��һ���̶���JSON���������¼���combo�������б�
         * $('#productCombo').omCombo('setData',[
         *      {"text":'Apusic Server',"value":"aas"},
         *      {"text":'Apusic OperaMasks SDK',"value":"aom"},
         *      {"text":'Apusic OperaMasks Studio',"value":"studio"}
         * ]);
         * 
         * //ͨ��һ��url������Ajax�������¼���combo�������б�
         * $('#cityCombo').omCombo('setData',"../data/cityData.do?province="+$('#cityCombo').omCombo('value'));
         */
        setData:function(param){
            var self = this;
            var inputEl = self.element;
            self.options.value = '';
            inputEl.val('');
            self._toggleLoading('add');
            if (typeof param === 'string') {
                self._ajaxLoad(param);
            } else {
                self._loadData(param);
                self._toggleLoading('remove');
            }
        },
        /**
         * ��ȡcombo������Դ������һ��JSON���顣<b>ע�⣺����������������鲻�ǵ�ͬ�ģ�������һһ��Ӧ�Ĺ�ϵ:ǰ�߾�����ʽ������ת��ɺ���</b>
         * @name omCombo#getData
         * @function
         * @returns ���combo�������ݣ��򷵻�combo������Դ(һ�������м�¼��ɵ�JSON����)�����򷵻�null
         * @example
         * //��ȡcombo������Դ
         * var store = $('#productCombo').omCombo('getData');
         * 
         */
        getData:function(){
            //����Ѿ�����dataSource��ֱ��ȡ��
            var returnValue = this.options.dataSource;
            return (typeof returnValue == 'object') ? returnValue : null;
        },
        /**
         * �õ�������combo��valueֵ��
         * @function
         * @name omCombo#value
         * @param v ���õ�ֵ�������ñ�ʾ��ȡֵ
         * @returns ���û�в���ʱ��ʾgetValue()����combo��valueֵ������в���ʱ��ʾsetValue(newValue)����jQuery����
         * 
         */
         value:function(v){
             if (typeof v === 'undefined') {
                 var value = $(this.element).attr(_valueKey);
                 return value ? value : '';
             } else {
                 this._setValue(v+'');
                 return this;
             }
         },
        /**
         * ���������
         * @name omCombo#disable
         * @function
         * @example
         * $('#mycombo').omCombo('disable');
         */
        disable:function(){
            var input=this.element;
            //distroy event listening
            input.attr('disabled', true).unbind();
            this.options.disabled = true;
            this.expandTrigger.addClass('om-state-disabled').unbind();
        },
        /**
         * ���������
         * @name omCombo#enable
         * @function
         * @example
         * $('#mycombo').omCombo('enable');
         */
        enable:function(){
            var input=this.element;
            input.removeAttr('disabled').unbind();
            this.options.disabled = false;
            this.expandTrigger.removeClass('om-state-disabled').unbind();
            //rebuild event listening
            this._bindEvent();
        },
        destroy:function(){
        	var $input = this.element;
        	$(document).unbind('mousedown.omCombo',this.globalEvent);
        	$input.parent().after($input).remove();
        	this.dropList.parent().remove();
        },
        //private
        _bindEvent:function(){
            var self = this;
            var options = this.options;
            var input = this.element;
            var span = input.parent('span');
            var dropList = this.dropList;
            var expandTrigger = this.expandTrigger;
            var emptyText = options.emptyText;
            var isFocus = false;
            span.mouseenter(function(){   
               if(!options.disabled){
                   span.addClass("om-state-hover");
               }
            }).mouseleave(function(){      
                span.removeClass("om-state-hover");
            });
            input.focus(function(){
                if(isFocus) 
                    return;
                isFocus = true;
                $('.om-droplist').hide(); //hide all other dropLists
                span.addClass('om-state-focus');
                //input.addClass('om-span-field-focus');
                //input.parent('span').
                //expandTrigger.addClass('om-state-hover');
                self._refeshEmptyText(emptyText);
                if (!self.dataHasLoaded) {
                    if(!expandTrigger.hasClass('om-loading')){
                        self._toggleLoading('add');
                        if (typeof(options.dataSource) == 'object') {
                            self._loadData(options.dataSource);
                            self._toggleLoading('remove');
                        } else if (typeof(options.dataSource) == 'string') {
                            self._ajaxLoad(options.dataSource);
                        } else {
                            //neither records nor remote url was found
                            self.dataHasLoaded = true;
                            self._toggleLoading('remove');
                        }
                    }
                }
                if (!options.disabled && !options.readOnly) {
                    self._showDropList();
                }
            }).blur(function(e){
                isFocus = false;
                span.removeClass('om-state-focus');
                input.removeClass('om-combo-focus');
                //expandTrigger.removeClass('om-trigger-hover');
                if (!options.disabled && !options.readOnly && !options.multi) {
                    if (self.hasManualInput) {
                        //������ֹ������ֵ����blurʱ����Ƿ��ǺϷ���ֵ���������Ҫ������Ϸ������벢��ԭ������ǰ��ֵ
                        self.hasManualInput = false;
                        var text = input.val();
                        if (text !== '') {
                            var allInputText = $.data(input, 'allInputText');
                            var allValues = $.data(input, 'allValues');
                            var index = allInputText.indexOf(text);
                            if (index > -1) {
                                self._setValue(allValues[index]);
                            } else { //��������ֵ��data���治���ڣ�������key��vlueΪͬһ�����ֵ
                                input.attr(_valueKey,input.val());
                            }
                        }else{
                        	input.attr(_valueKey , '');
                    	}
                    }
                    self._refeshEmptyText(emptyText);
                }
            }).keyup(function(e){
                var key = e.keyCode,
                    value = $.om.keyCode;
                switch (key) {
                    case value.DOWN:
                        self._selectNext();
                        break;
                    case value.UP: 
                        self._selectPrev();
                        break;
                    case value.ENTER: 
                        self._backfill(self.dropList.find('.om-state-hover'));
                        break;
                    case value.ESCAPE: 
                        dropList.hide();
                        break;
                    case value.TAB:
                        //only trigger the blur event
                        break;
                    default:
                        //fiter����
                        self.hasManualInput = true;
                        if (!options.disabled && !options.readOnly && options.editable && options.autoFilter) {
                            if (window._omcomboFilterTimer) {
                                clearTimeout(window._omcomboFilterTimer);
                            }
                            window._omcomboFilterTimer = setTimeout(function(){
                                if($(document).attr('activeElement').id == input.attr('id')){//�������ڵ�ǰ������ʱ�����ʾ�����򣬷�������
                                    dropList.show();
                                }
                                self._doFilter(input);
                            }, options.filterDelay);
                        }
                }
            });
            span.mousedown(function(e){
                e.stopPropagation(); //document��mousedown����������������Ҫ��ֹð��
            });
            dropList.mousedown(function(e){
                e.stopPropagation(); //document��mousedown����������������Ҫ��ֹð��
            });
            expandTrigger.click(function(){
                !expandTrigger.hasClass('om-loading') && input.focus();
            }).mousedown(function(){
                !expandTrigger.hasClass('om-loading') && span.addClass('om-state-active');
            }).mouseup(function(){
                !expandTrigger.hasClass('om-loading') && span.removeClass('om-state-active');
            });
            $(document).bind('mousedown.omCombo',this.globalEvent=function(){
                dropList.hide();
            });
        },
        _showDropList:function(){
            var inputEl = this.element,
            	allItems = this._getAllOptionsBeforeFiltered().removeClass('om-helper-hidden om-state-hover');
            if(allItems.size()<=0){ //���������û������
                return;
            }
            var options = this.options,
             	dropList = this.dropList.scrollTop(0).css('height','auto'),
            	valuedItem,
            	nowValue = inputEl.attr(_valueKey),
            	$listRows = dropList.find('.om-combo-list-row');
            $listRows.removeClass('om-combo-selected');
            if (nowValue !== undefined && nowValue !== '') {
                var allValues = $.data(inputEl, 'allValues');
                if (options.multi) {
                    var selectedValues = nowValue.split(options.multiSeparator);
                    for (var i=0; i<selectedValues.length; i++) {
                        var index = allValues.indexOf(selectedValues[i]);
                        if (index > -1) {
                            $(dropList.find('.om-combo-list-row').get(index)).addClass('om-combo-selected');
                        }
                    }
                    valueItem = selectedValues[0];
                } else {
                    var index = allValues?allValues.indexOf(nowValue):-1;
                    if (index > -1) {
                        valuedItem = $(dropList.find('.om-combo-list-row').get(index)).addClass('om-combo-selected');
                    }
                }
            }
            var dropListContainer = dropList.parent(), span = inputEl.parent();
            if (!options.listAutoWidth) {
                dropListContainer.width(span.outerWidth());
            }else{
            	if($.browser.msie&&($.browser.version == "7.0")&&!$.support.style){
            		dropListContainer.width(dropList.show().outerWidth());
            	}else{
            		dropListContainer.width(dropList.outerWidth());
            	}
            }
            if (options.listMaxHeight != 'auto' && dropList.show().height() > options.listMaxHeight) {
                dropList.height(options.listMaxHeight).css('overflow-y','auto');
            }
            var inputPos = span.offset();
            dropListContainer.css({
                'left': inputPos.left,
                'top': inputPos.top + span.outerHeight()
            });
            dropList.show();
            if (valuedItem) { //�Զ���������������������
                dropList.scrollTop($(valuedItem).offset().top - dropList.offset().top);
            }
        },
        _toggleLoading:function(type){
            if(!this.options.disabled){
                if (type == 'add') {
                    this.expandTrigger.removeClass('om-icon-carat-1-s').addClass('om-loading');
                } else if (type == 'remove') {
                    this.expandTrigger.removeClass('om-loading').addClass('om-icon-carat-1-s');
                }
            }
        },
        _ajaxLoad:function(url){
            var self=this;
            var options = this.options;
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'json',
                success: function(data, textStatus){
                    self.dataHasLoaded = true;
                    var onSuccess = options.onSuccess;
                    if (onSuccess && self._trigger("onSuccess", null, data, textStatus) === false) {
                        options.dataSource = data;
                        return;
                    }
                    self._loadData(data);
                    self._toggleLoading('remove');
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    self.dataHasLoaded = true; // ��������Ϊtrue��������lazyLoadΪtrue��ʱ���������ѭ��
                    if (options.onError) {
                        self._toggleLoading('remove');
                        self._trigger("onError", null, XMLHttpRequest, textStatus, errorThrown);
                    } else {
                        self._toggleLoading('remove');
                        throw new Error('An error occurred while load records from URL "' + url + '",the error message is:' + errorThrown.message);
                    }
                }
            });
        },
        _loadData:function(records){
            var options = this.options,
                inputEl = this.element;
            options.dataSource = records;
            this.dataHasLoaded = true;
            //build all inputText
            var inputField = options.inputField;
            var allInputText = [];
            if (typeof inputField === 'string') {
                $(records).each(function(){
                    allInputText.push(this[inputField]);
                });
            } else {
                $(records).each(function(index){
                    allInputText.push(inputField(this, index));
                });
            }
            $.data(inputEl, 'allInputText', allInputText);
            //build all value
            var valueField = options.valueField;
            var allValues = [];
            if (typeof valueField === 'string') {
                $(records).each(function(){
                    allValues.push('' + this[valueField]);
                });
            } else {
                $(records).each(function(index){
                    allValues.push('' + valueField(this, index));
                });
            }
            $.data(inputEl, 'allValues', allValues);
            //build dropList
            var dropList = this.dropList.empty();
            if (options.listProvider) {
                var selectableOptions = options.listProvider(dropList, records);
                if (selectableOptions) {
                    selectableOptions.each(function(){
                        $(this).addClass('om-combo-list-row');
                    });
                }
            } else {
                var optionField = options.optionField;
                var innerHtml = '';
                var self = this;
                if (typeof optionField === 'string') {
                    $(records).each(function(index){
                        innerHtml += self._wrapText(this[options.optionField]);
                    });
                } else {
                    $(records).each(function(index){
                        innerHtml += self._wrapText(options.optionField(this, index));
                    });
                }
                if (innerHtml) {
                    $(innerHtml).appendTo(dropList);
                    dropList.show().css('height','auto');
                    if (options.listMaxHeight != 'auto' && dropList.height() > options.listMaxHeight) {
                        dropList.height(options.listMaxHeight).css('overflow-y','auto');
                    }
                    dropList.hide();
                    if(inputEl.parent().hasClass('om-state-hover')){
                        self._showDropList();
                    }
                }
            }
           
            if (options.value) {
                this._setValue('' + options.value);
            }
            this._bindEventsToList();
        },
        _bindEventsToList:function(){
            var items = this._getAllOptionsBeforeFiltered();
            var self = this;
            items.hover(function(){
                items.removeClass('om-state-hover');
                $(this).addClass('om-state-hover');
            }, function(){
                $(this).removeClass('om-state-hover');
            }).mousedown(function(){
                self._backfill(this);
            });
        },
        _wrapText:function(text) {
            return '<div class="om-combo-list-row">' + text + '</div>';
        },
        _setValue:function(value){
            var input = this.element;
            var valueChange = true ;
            var oldValue = input.attr(_valueKey);
            var options = this.options;
            if(value == oldValue){
                valueChange = false ;
            }
            var allValues = $.data(input, 'allValues');
            
            var inputText = [], values=[];
            if (options.multi) {
                values = value.split(options.multiSeparator);
            } else {
                values.push(value);
            }
            for (var i=0; i<values.length; i++) {
                var index = allValues?allValues.indexOf(values[i]):-1;
                if (index > -1) {
                    inputText.push($.data(input, 'allInputText')[index]);
                } else {
                    input.attr(_valueKey, '').val('');
                    value = '';
                }
            }
            input.attr(_valueKey, value);
            if (options.multi) {
                input.val(inputText.join(this.options.multiSeparator));
            } else {
                input.val(inputText.join(''));
            }
            var options = this.options;
            options.value = value;
            // trigger onValueChange event
            if (options.onValueChange && valueChange) {
            	this._trigger("onValueChange",null,input,value,oldValue);
            }
            //refresh the emptyText
            this._refeshEmptyText(options.emptyText);
        },
        
        _findHighlightItem : function() {
            var dropList = this.dropList;
            var hoverItem = dropList.find('.om-state-hover');
            
            // only one item hover
            if (hoverItem.length > 0) {
                return hoverItem;
            }
            var selectedItems = dropList.find('.om-combo-selected');
            return selectedItems.length > 0 ? selectedItems[0] : selectedItems;
        },
        
        _selectPrev:function(){
            var highLightItem = this._findHighlightItem();
            var all = this._getAllOptionsAfterFiltered();
            var nowIndex = all.index(highLightItem);
            var currentItem = $(all[nowIndex]);
            if (nowIndex === 0) {
                nowIndex = all.length;
            } else if (nowIndex == -1) {
                nowIndex = all.length;
            }
            var preNeighborItem = $(all[nowIndex - 1]);
            this._highLisghtAndScrollTo(currentItem,preNeighborItem);
        },
        _selectNext:function(){
            var dropList = this.dropList;
            if (dropList.css('display') == 'none') {
                this._showDropList();
                return;
            }
            var all = this._getAllOptionsAfterFiltered();
            var nowIndex = all.index(this._findHighlightItem());
            var currentItem = $(all[nowIndex]);
            if (nowIndex == all.length - 1) {
                nowIndex = -1;
            }
            var nextNeighbor = $(all[nowIndex + 1]);
            this._highLisghtAndScrollTo(currentItem,nextNeighbor);
        },
        _highLisghtAndScrollTo: function(currentItem, targetItem){
            var dropList = this.dropList;
            currentItem.removeClass('om-state-hover');
            targetItem.addClass('om-state-hover');
            if (targetItem.position().top <= 0) {
                dropList.scrollTop(dropList.scrollTop() + targetItem.position().top);
            } else if (targetItem.position().top + targetItem.outerHeight() > dropList.height()) {
                dropList.scrollTop(dropList.scrollTop() + targetItem.position().top + targetItem.outerHeight() - dropList.height());
            }
        },
        _backfill:function(source){
            var inputEl = this.element;
            var dropList = this.dropList;
            var options = this.options;
            var enableMulti = options.multi;
            
            if (enableMulti) {
                $(source).toggleClass('om-combo-selected').removeClass('om-state-hover');
            } else {
                this._getAllOptionsBeforeFiltered().removeClass('om-combo-selected');
                $(source).addClass('om-combo-selected');
            }
            
            if (dropList.css('display') == 'none') {
                return;
            }
            var value = [];
            var selectedIndexs = dropList.find('.om-combo-selected');
            if (selectedIndexs.length > 0) {
                for (var i=0; i<selectedIndexs.length; i++) {
                    var nowIndex = $(selectedIndexs[i]).index();
                    if (nowIndex > -1) {
                        value.push($.data(inputEl, 'allValues')[nowIndex]);
                    }
                }
                this._setValue(value.join(enableMulti ? options.multiSeparator : ''));
            }
            if (!enableMulti) {
                dropList.hide();
            }
        },
        _getAllOptionsBeforeFiltered:function(){
            return this.dropList.find('.om-combo-list-row');
        },
        _getAllOptionsAfterFiltered:function(){
            var dropList=this.dropList;
            return dropList.find('.om-combo-list-row').not(dropList.find('.om-helper-hidden'));
        },
        _doFilter:function(){
            var inputEl = this.element;
            var options = this.options;
            var records = options.dataSource;
            var filterStrategy = options.filterStrategy;
            var text = inputEl.val();
            var items = this._getAllOptionsBeforeFiltered();
            var allInputText = $.data(inputEl, 'allInputText');
            var self = this;
            var needShow=false;
            $(records).each(function(index){
                if (self._filetrPass(filterStrategy, text, records[index], allInputText[index])) {
                    $(items.get(index)).removeClass('om-helper-hidden');
                    needShow=true;
                } else {
                    $(items.get(index)).addClass('om-helper-hidden');
                }
            });
            var dropList = this.dropList.css('height','auto');
            //���˺����¼���������ĸ߶ȣ����Ƿ���Ҫ���ֹ�����
            if (options.listMaxHeight != 'auto' && dropList.height() > options.listMaxHeight) {
                dropList.height(options.listMaxHeight).css('overflow-y','auto');
            }
            if(!needShow){
                dropList.hide();
            }
        },
        _filetrPass:function(filterStrategy,text,record,inputText){
            if (text === '') {
                return true;
            }
            if (typeof filterStrategy === 'function') {
                return filterStrategy(text, record);
            } else {
                if (filterStrategy === 'first') {
                    return inputText.indexOf(text) === 0;
                } else if (filterStrategy === 'anywhere') {
                    return inputText.indexOf(text) > -1;
                } else if (filterStrategy === 'last') {
                    var i = inputText.lastIndexOf(text);
                    return i > -1 && i + text.length == inputText.length;
                } else {
                    return false;
                }
            }
        },
        _refeshEmptyText: function(emptyText){
            var inputEl = this.element;
            if(!emptyText)
                return;
            if (inputEl.val() === '') {
                inputEl.val(emptyText).addClass('om-empty-text');
            } else {
                if(inputEl.val() === emptyText){
                    inputEl.val('');
                }
                inputEl.removeClass('om-empty-text');
            }
        }
	});
})(jQuery);/*
 * $Id: om-dialog.js,v 1.32 2012/04/28 06:21:22 linxiaomin Exp $
 * operamasks-ui omDialog 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 *  om-button.js
 *  om-draggable.js
 *  om-mouse.js
 *  om-position.js
 *  om-resizable.js
 */
(function( $, undefined ) {

var uiDialogClasses =
		'om-dialog ' +
		'om-widget ' +
		'om-widget-content ' +
		'om-corner-all ',
	sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},
	// support for jQuery 1.3.2 - handle common attrFn methods for dialog
	attrFn = $.attrFn || {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true,
		click: true
	};

	/**
     * @name omDialog
     * @class �Ի�����������Է���html��<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>������Զ��尴ť</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#dialog').omDialog({
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;div id="dialog"/>
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
$.omWidget("om.omDialog", {
	options: /** @lends omDialog#*/ {
	    /**
         * �Ի��򴴽���ɺ��Ƿ��Զ��򿪡�
         * @type Boolean
         * @default true
         * @example
         *   $("#select").omDialog({autoOpen : true});
         */
		autoOpen: true,
		
		/**
         * �Ի����еİ�ť����������ΪJSON���顣ÿ��JSON������� <code>text</code> ����(���ð�ť����)
         * �� <code>click</code> �������ð�ť����ʱ�Ļص�������
         * @type Array
         * @default []
         *  @example
         *   $("#select").omDialog({buttons : [{
         *      text : "ȷ��", 
         *      click : function () {...}
         *  }, {
         *      text : "ȡ��", 
         *      click : function () {...}
         *  }]);
         */
		buttons: {},
		
		/**
		 * ���� Esc ��ʱ�Ƿ�رնԻ���
		 * @type Boolean
		 * @default true
		 * @example
         *   $("#select").omDialog({closeOnEscape : true});
		 */
		closeOnEscape: true,
		closeText: 'close',
		
		/**
		 * �Ի������ʽ��
		 * @type String
		 * @default ��
		 * @example
         *   $("#select").omDialog({dialogClass : 'class1'});
		 */
		dialogClass: '',
		
		/**
		 * ����Ƿ���϶���
		 * @type Boolean
		 * @default true
		 * @example
         *   $("#select").omDialog({draggable : true});
		 */
		draggable: true,
		
		hide: null,
		
		/**
		 * ����ĸ߶ȡ�
		 * @type Number
		 * @default 'auto'
		 * @example
         *   $("#select").omDialog({height : 200});
		 */
		height: 'auto',
		
		/**
		 * �ɸı��Сʱ������߶ȡ�
		 * @type Number
		 * @default ��
		 * @example
         *   $("#select").omDialog({maxHeight : 500});
		 */
		maxHeight: false,
		
		/**
		 * �ɸı��Сʱ�������ȡ�
		 * @type Number
		 * @default ��
		 * @example
         *   $("#select").omDialog({maxWidth : 500});
		 */
		maxWidth: false,
		
		/**
		 * �ɸı��Сʱ�����С�߶ȡ�
		 * @type Number
		 * @default 150
		 * @example
         *   $("#select").omDialog({minHeight : 150});
		 */
		minHeight: 150,
		
		/**
		 * �ɸı��Сʱ�����С��ȡ�
		 * @type Number
		 * @default 150
		 * @example
         *   $("#select").omDialog({minWidth : 150});
		 */
		minWidth: 150,
		
		/**
		 * �Ƿ�ģ̬���ڡ�
		 * @type Boolean
		 * @default false
		 * @example
         *   $("#select").omDialog({modal : true});
		 */
		modal: false,
		position: {
			my: 'center',
			at: 'center',
			collision: 'fit',
			// ensure that the titlebar is never outside the document
			using: function(pos) {
				var topOffset = $(this).css(pos).offset().top;
				if (topOffset < 0) {
					$(this).css('top', pos.top - topOffset);
				}
			}
		},
		
		/**
		 * �Ƿ�ɸı��С��
		 * @type Boolean
		 * @default true
		 * @example
         *   $("#select").omDialog({resizable : true});
		 */
		resizable: true,
		show: null,
		
		stack: true,
		
		/**
		 * �Ի���ı��⡣
		 * @type String
		 * @default ��
		 */
		title: '',
		
		/**
		 * ����Ŀ�ȡ�
		 * @type Number
		 * @default 300
		 * @example
         *   $("#select").omDialog({width : 300});
		 */
		width: 300,
		zIndex: 1000
		
		/**
         * �Ի����ʱ�����¼���
         * @event
         * @param event jQuery.Event����
         * @name omDialog#onOpen
         * @type Function
         * @example
         *   $("#select").omDialog({onOpen : function(event) {doSomething...}});
         */
		
		/**
         * �Ի���ر�ʱ�����¼���
         * @event
         * @param event jQuery.Event����
         * @name omDialog#onClose
         * @type Function
         * @example
         *   $("#select").omDialog({onClose : function(event) {doSomething...}});
         */
		
		/**
         * �Ի���ر�ǰ�����¼���
         * @event
         * @param event jQuery.Event����
         * @name omDialog#onBeforeClose
         * @type Function
         * @example
         *   $("#select").omDialog({onBeforeClose : function(event) {doSomething...}});
         */
	},

	_create: function() {
		this.originalTitle = this.element.attr('title');
		// #5742 - .attr() might return a DOMElement
		if ( typeof this.originalTitle !== "string" ) {
			this.originalTitle = "";
		}


		this.options.title = this.options.title || this.originalTitle;
		var self = this;
	    self.element.parent().bind("om-remove.omDialog", (self.__removeBind = function() {
	        self.element.remove();
	    }));
	    var options = self.options,

			title = options.title || '&#160;',
			titleId = $.om.omDialog.getTitleId(self.element),

			uiDialog = (self.uiDialog = $('<div></div>'))
				.appendTo(document.body)
				.hide()
				.addClass(uiDialogClasses + options.dialogClass)
				.css({
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(event) {
					if (options.closeOnEscape && event.keyCode &&
						event.keyCode === $.om.keyCode.ESCAPE) {
						
						self.close(event);
						event.preventDefault();
					}
				})
				.attr({
					role: 'dialog',
					'aria-labelledby': titleId
				})
				.mousedown(function(event) {
					self.moveToTop(false, event);
				}),

			uiDialogContent = self.element
				.show()
				.removeAttr('title')
				.addClass(
					'om-dialog-content ' +
					'om-widget-content')
				.appendTo(uiDialog),

			uiDialogTitlebar = (self.uiDialogTitlebar = $('<div></div>'))
				.addClass(
					'om-dialog-titlebar ' +
					'om-widget-header ' +
					'om-corner-all ' +
					'om-helper-clearfix'
				)
				.prependTo(uiDialog),

			uiDialogTitlebarClose = $('<a href="#"></a>')
				.addClass(
					'om-dialog-titlebar-close ' +
					'om-corner-all'
				)
				.attr('role', 'button')
				.hover(
					function() {
						uiDialogTitlebarClose.addClass('om-state-hover');
					},
					function() {
						uiDialogTitlebarClose.removeClass('om-state-hover');
					}
				)
				.focus(function() {
					uiDialogTitlebarClose.addClass('om-state-focus');
				})
				.blur(function() {
					uiDialogTitlebarClose.removeClass('om-state-focus');
				})
				.click(function(event) {
					self.close(event);
					return false;
				})
				.appendTo(uiDialogTitlebar),

			uiDialogTitlebarCloseText = (self.uiDialogTitlebarCloseText = $('<span></span>'))
				.addClass('om-icon-closethick')
				.text(options.closeText)
				.appendTo(uiDialogTitlebarClose),

			uiDialogTitle = $('<span></span>')
				.addClass('om-dialog-title')
				.attr('id', titleId)
				.html(title)
				.prependTo(uiDialogTitlebar);

		uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();

		if (options.draggable && $.om.omDraggable) {
			self._makeDraggable();
		}
		if (options.resizable && $.fn.omResizable) {
			self._makeResizable();
		}

		self._createButtons(options.buttons);
		self._isOpen = false;

		if ($.fn.bgiframe) {
			uiDialog.bgiframe();
		}
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	destroy: function() {
		var self = this;
		
		if (self.overlay) {
			self.overlay.destroy();
		}
		self.uiDialog.hide();
		self.element
			.unbind('.dialog')
			.removeData('dialog')
			.removeClass('om-dialog-content om-widget-content')
			.hide().appendTo('body');
		self.uiDialog.remove();

		if (self.originalTitle) {
			self.element.attr('title', self.originalTitle);
		}

		return self;
	},

	widget: function() {
		return this.uiDialog;
	},

	/**
     * �رնԻ���.
     * @name omDialog#close
     * @function
     * @returns ֧����ʽ����������JQuery����
     * @example
     * var store = $("#select").omDialog('close');
     * 
     */
	close: function(event) {
		var self = this,
			maxZ, thisZ,
			options = this.options,
			onBeforeClose = options.onBeforeClose,
			onClose = options.onClose;
		
		if (onBeforeClose && false === self._trigger("onBeforeClose",event)) {
			return;
		}

		if (self.overlay) {
			self.overlay.destroy();
		}
		self.uiDialog.unbind('keypress.om-dialog');

		self._isOpen = false;

		if (self.options.hide) {
			self.uiDialog.hide(self.options.hide, function() {
                onClose && self._trigger("onClose",event);
			});
		} else {
			self.uiDialog.hide();
			onClose && self._trigger("onClose",event);
		}

		$.om.omDialog.overlay.resize();

		// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
		if (self.options.modal) {
			maxZ = 0;
			$('.om-dialog').each(function() {
				if (this !== self.uiDialog[0]) {
					thisZ = $(this).css('z-index');
					if(!isNaN(thisZ)) {
						maxZ = Math.max(maxZ, thisZ);
					}
				}
			});
			$.om.omDialog.maxZ = maxZ;
		}

		return self;
	},

	/**
     * �ж϶Ի����Ƿ��Ѵ򿪡�
     * @name omDialog#isOpen
     * @function
     * @returns ����Ի����Ѵ򿪷���true�����򷵻�false
     * @example
     * var isOpen = $("#select").omDialog('isOpen');
     * 
     */
	isOpen: function() {
		return this._isOpen;
	},

	// the force parameter allows us to move modal dialogs to their correct
	// position on open
	moveToTop: function(force, event) {
		var self = this,
			options = self.options,
			saveScroll;

		if ((options.modal && !force) ||
			(!options.stack && !options.modal)) {
			return self._trigger('onFocus', event);
		}

		if (options.zIndex > $.om.omDialog.maxZ) {
			$.om.omDialog.maxZ = options.zIndex;
		}
		if (self.overlay) {
			$.om.omDialog.maxZ += 1;
			self.overlay.$el.css('z-index', $.om.omDialog.overlay.maxZ = $.om.omDialog.maxZ);
		}

		//Save and then restore scroll since Opera 9.5+ resets when parent z-Index is changed.
		//  http://ui.jquery.com/bugs/ticket/3193
		saveScroll = { scrollTop: self.element.scrollTop(), scrollLeft: self.element.scrollLeft() };
		$.om.omDialog.maxZ += 1;
		self.uiDialog.css('z-index', $.om.omDialog.maxZ);
		self.element.attr(saveScroll);
		self._trigger('onFocus', event);

		return self;
	},

	/**
     * �򿪶Ի���
     * @name omDialog#open
     * @function
     * @returns ֧����ʽ����������JQuery����
     * @example
     * var store = $("#select").omDialog('open');
     * 
     */
	open: function() {
		if (this._isOpen) { return; }

		var self = this,
			options = self.options,
			uiDialog = self.uiDialog;

		self.overlay = options.modal ? new $.om.omDialog.overlay(self) : null;
		self._size();
		self._position(options.position);
		uiDialog.show(options.show);
		self.moveToTop(true);

		// prevent tabbing out of modal dialogs
		if (options.modal) {
			uiDialog.bind('keypress.om-dialog', function(event) {
				if (event.keyCode !== $.om.keyCode.TAB) {
					return;
				}

				var tabbables = $(':tabbable', this),
					first = tabbables.filter(':first'),
					last  = tabbables.filter(':last');

				if (event.target === last[0] && !event.shiftKey) {
					first.focus(1);
					return false;
				} else if (event.target === first[0] && event.shiftKey) {
					last.focus(1);
					return false;
				}
			});
		}

		// set focus to the first tabbable element in the content area or the first button
		// if there are no tabbable elements, set focus on the dialog itself
		$(self.element.find(':tabbable').get().concat(
			uiDialog.find('.om-dialog-buttonpane :tabbable').get().concat(
				uiDialog.get()))).eq(0).focus();

		self._isOpen = true;
		var onOpen = options.onOpen;
		if(onOpen){
		    self._trigger("onOpen");
		}
		return self;
	},

	_createButtons: function(buttons) {
		var self = this,
			hasButtons = false,
			uiDialogButtonPane = $('<div></div>')
				.addClass(
					'om-dialog-buttonpane ' +
					'om-widget-content ' +
					'om-helper-clearfix'
				),
			uiButtonSet = $( "<div></div>" )
				.addClass( "om-dialog-buttonset" )
				.appendTo( uiDialogButtonPane );

		// if we already have a button pane, remove it
		self.uiDialog.find('.om-dialog-buttonpane').remove();

		if (typeof buttons === 'object' && buttons !== null) {
			$.each(buttons, function() {
				return !(hasButtons = true);
			});
		}
		if (hasButtons) {
			$.each(buttons, function(name, props) {
				props = $.isFunction( props ) ?
					{ click: props, text: name } :
					props;
				var button = $('<button type="button"></button>')
					.click(function() {
						props.click.apply(self.element[0], arguments);
					})
					.appendTo(uiButtonSet);
				// can't use .attr( props, true ) with jQuery 1.3.2.
				$.each( props, function( key, value ) {
					if ( key === "click" ) {
						return;
					}
					if ( key in attrFn ) {
						button[ key ]( value );
					} else {
						button.attr( key, value );
					}
				});
				if ($.fn.omButton) {
					button.omButton();
				}
			});
			uiDialogButtonPane.appendTo(self.uiDialog);
		}
	},

	_makeDraggable: function() {
		var self = this,
			options = self.options,
			doc = $(document),
			heightBeforeDrag;

		function filteredUi(ui) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		self.uiDialog.omDraggable({
			cancel: '.om-dialog-content, .om-dialog-titlebar-close',
			handle: '.om-dialog-titlebar',
			containment: 'document',
			cursor: 'move',
			onStart: function(ui, event) {
				heightBeforeDrag = options.height === "auto" ? "auto" : $(this).height();
				$(this).height($(this).height()).addClass("om-dialog-dragging");
				self._trigger('onDragStart', filteredUi(ui), event);
			},
			onDrag: function(ui, event) {
				self._trigger('onDrag', filteredUi(ui), event);
			},
			onStop: function(ui, event) {
				options.position = [ui.position.left - doc.scrollLeft(),
					ui.position.top - doc.scrollTop()];
				$(this).removeClass("om-dialog-dragging").height(heightBeforeDrag);
				self._trigger('onDragStop', filteredUi(ui), event);
				$.om.omDialog.overlay.resize();
			}
		});
	},

	_makeResizable: function(handles) {
		handles = (handles === undefined ? this.options.resizable : handles);
		var self = this,
			options = self.options,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = self.uiDialog.css('position'),
			resizeHandles = (typeof handles === 'string' ?
				handles	:
				'n,e,s,w,se,sw,ne,nw'
			);

		function filteredUi(ui) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		self.uiDialog.omResizable({
			cancel: '.om-dialog-content',
			containment: 'document',
			alsoResize: self.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: self._minHeight(),
			handles: resizeHandles,
			start: function(event, ui) {
				$(this).addClass("om-dialog-resizing");
				self._trigger('onResizeStart', event, filteredUi(ui));
			},
			resize: function(event, ui) {
				self._trigger('onResize', event, filteredUi(ui));
			},
			stop: function(event, ui) {
				$(this).removeClass("om-dialog-resizing");
				options.height = $(this).height();
				options.width = $(this).width();
				self._trigger('onResizeStop', event, filteredUi(ui));
				$.om.omDialog.overlay.resize();
			}
		})
		.css('position', position)
		.find('.om-resizable-se').addClass('om-icon om-icon-grip-diagonal-se');
	},

	_minHeight: function() {
		var options = this.options;

		if (options.height === 'auto') {
			return options.minHeight;
		} else {
			return Math.min(options.minHeight, options.height);
		}
	},

	_position: function(position) {
		var myAt = [],
			offset = [0, 0],
			isVisible;

		if (position) {
			// deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
	//		if (typeof position == 'string' || $.isArray(position)) {
	//			myAt = $.isArray(position) ? position : position.split(' ');

			if (typeof position === 'string' || (typeof position === 'object' && '0' in position)) {
				myAt = position.split ? position.split(' ') : [position[0], position[1]];
				if (myAt.length === 1) {
					myAt[1] = myAt[0];
				}

				$.each(['left', 'top'], function(i, offsetPosition) {
					if (+myAt[i] === myAt[i]) {
						offset[i] = myAt[i];
						myAt[i] = offsetPosition;
					}
				});

				position = {
					my: myAt.join(" "),
					at: myAt.join(" "),
					offset: offset.join(" ")
				};
			} 

			position = $.extend({}, $.om.omDialog.prototype.options.position, position);
		} else {
			position = $.om.omDialog.prototype.options.position;
		}

		// need to show the dialog to get the actual offset in the position plugin
		isVisible = this.uiDialog.is(':visible');
		if (!isVisible) {
			this.uiDialog.show();
		}
		this.uiDialog
			// workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
			.css({ top: 0, left: 0 })
			.position($.extend({ of: window }, position));
		if (!isVisible) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var self = this,
			resizableOptions = {},
			resize = false;

		$.each( options, function( key, value ) {
			self._setOption( key, value );
			
			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
		}
		if ( this.uiDialog.is( ":data(resizable)" ) ) {
			this.uiDialog.omResizable( "option", resizableOptions );
		}
	},

	_setOption: function(key, value){
		var self = this,
			uiDialog = self.uiDialog;

		switch (key) {
			case "buttons":
				self._createButtons(value);
				break;
			case "closeText":
				// ensure that we always pass a string
				self.uiDialogTitlebarCloseText.text("" + value);
				break;
			case "dialogClass":
				uiDialog
					.removeClass(self.options.dialogClass)
					.addClass(uiDialogClasses + value);
				break;
			case "disabled":
				if (value) {
					uiDialog.addClass('om-dialog-disabled');
				} else {
					uiDialog.removeClass('om-dialog-disabled');
				}
				break;
			case "draggable":
				var isDraggable = uiDialog.is( ":data(draggable)" );
				if ( isDraggable && !value ) {
					uiDialog.omDraggable( "destroy" );
				}
				
				if ( !isDraggable && value ) {
					self._makeDraggable();
				}
				break;
			case "position":
				self._position(value);
				break;
			case "resizable":
				// currently resizable, becoming non-resizable
				var isResizable = uiDialog.is( ":data(resizable)" );
				if (isResizable && !value) {
					uiDialog.omResizable('destroy');
				}

				// currently resizable, changing handles
				if (isResizable && typeof value === 'string') {
					uiDialog.omResizable('option', 'handles', value);
				}

				// currently non-resizable, becoming resizable
				if (!isResizable && value !== false) {
					self._makeResizable(value);
				}
				break;
			case "title":
				// convert whatever was passed in o a string, for html() to not throw up
				$(".om-dialog-title", self.uiDialogTitlebar).html("" + (value || '&#160;'));
				break;
		}

		$.OMWidget.prototype._setOption.apply(self, arguments);
	},

	_size: function() {
		/* If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		 * divs will both have width and height set, so we need to reset them
		 */
		var options = this.options,
			nonContentHeight,
			minContentHeight,
			isVisible = this.uiDialog.is( ":visible" );

		// reset content sizing
		this.element.show().css({
			width: 'auto',
			minHeight: 0,
			height: 0
		});

		if (options.minWidth > options.width) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: 'auto',
				width: options.width
			})
			.height();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		
		if ( options.height === "auto" ) {
			// only needed for IE6 support
			if ( $.support.minHeight ) {
				this.element.css({
					minHeight: minContentHeight,
					height: "auto"
				});
			} else {
				this.uiDialog.show();
				var autoHeight = this.element.css( "height", "auto" ).height();
				if ( !isVisible ) {
					this.uiDialog.hide();
				}
				this.element.height( Math.max( autoHeight, minContentHeight ) );
			}
		} else {
			this.element.height( Math.max( options.height - nonContentHeight, 0 ) );
		}

		if (this.uiDialog.is(':data(resizable)')) {
			this.uiDialog.omResizable('option', 'minHeight', this._minHeight());
		}
	}
});

$.extend($.om.omDialog, {
	version: "1.2",

	uuid: 0,
	maxZ: 0,

	getTitleId: function($el) {
		var id = $el.attr('id');
		if (!id) {
			this.uuid += 1;
			id = this.uuid;
		}
		return 'ui-dialog-title-' + id;
	},

	overlay: function(dialog) {
		this.$el = $.om.omDialog.overlay.create(dialog);
	}
});

$.extend($.om.omDialog.overlay, {
	instances: [],
	// reuse old instances due to IE memory leak with alpha transparency (see #5185)
	oldInstances: [],
	maxZ: 0,
	events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function(event) { return event + '.dialog-overlay'; }).join(' '),
	create: function(dialog) {
		if (this.instances.length === 0) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				// handle $(el).dialog().dialog('close') (see #4065)
				if ($.om.omDialog.overlay.instances.length) {
					$(document).bind($.om.omDialog.overlay.events, function(event) {
						// stop events if the z-index of the target is < the z-index of the overlay
						// we cannot return true when we don't want to cancel the event (#3523)
						if ($(event.target).zIndex() < $.om.omDialog.overlay.maxZ) {
							return false;
						}
					});
				}
			}, 1);

			// allow closing by pressing the escape key
			$(document).bind('keydown.dialog-overlay', function(event) {
				if (dialog.options.closeOnEscape && event.keyCode &&
					event.keyCode === $.om.keyCode.ESCAPE) {
					
					dialog.close(event);
					event.preventDefault();
				}
			});

			// handle window resize
			$(window).bind('resize.dialog-overlay', $.om.omDialog.overlay.resize);
		}

		var $el = (this.oldInstances.pop() || $('<div></div>').addClass('om-widget-overlay'))
			.appendTo(document.body)
			.css({
				width: this.width(),
				height: this.height()
			});

		if ($.fn.bgiframe) {
			$el.bgiframe();
		}

		this.instances.push($el);
		return $el;
	},

	destroy: function($el) {
	    $el.parent().unbind(this.__removeBind);
		var indexOf = $.inArray($el, this.instances);
		if (indexOf != -1){
			this.oldInstances.push(this.instances.splice(indexOf, 1)[0]);
		}

		if (this.instances.length === 0) {
			$([document, window]).unbind('.dialog-overlay');
		}

		$el.remove();
		
		// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
		var maxZ = 0;
		$.each(this.instances, function() {
			maxZ = Math.max(maxZ, this.css('z-index'));
		});
		this.maxZ = maxZ;
	},

	height: function() {
		var scrollHeight,
			offsetHeight;
		// handle IE 6
		if ($.browser.msie && $.browser.version < 7) {
			scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);

			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).height() + 'px';
		}
	},

	width: function() {
		var scrollWidth,
			offsetWidth;
		// handle IE
		if ( $.browser.msie ) {
			scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);

			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).width() + 'px';
		}
	},

	resize: function() {
		/* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
		var $overlays = $([]);
		$.each($.om.omDialog.overlay.instances, function() {
			$overlays = $overlays.add(this);
		});

		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: $.om.omDialog.overlay.width(),
			height: $.om.omDialog.overlay.height()
		});
	}
});

$.extend($.om.omDialog.overlay.prototype, {
	destroy: function() {
		$.om.omDialog.overlay.destroy(this.$el);
	}
});

}(jQuery));
/*
 * $Id: om-fileupload.js,v 1.29 2012/05/08 06:49:11 linxiaomin Exp $
 * operamasks-ui omFileUpload 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 */
    /** 
     * @name omFileUpload
     * @class �ļ��ϴ�.<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     * 		<li>֧�������ϴ��ļ��Ĵ�С������</li>
     * 		<li>֧�������ϴ��ļ�</li>
     * 		<li>���ý�����չʾ�ļ��ϴ�����</li>
     * 		<li>֧��ѡ�У��ϴ��ɹ����ϴ�ʧ�ܵȶ��ֻص��¼�</li>
     * 		<li>���Զ����ϴ���ť�ı���ͼƬ������</li>
     * </ol>
     * <b>ʾ����</b><br/>
     * <pre>
     * <b>//ע�⣺�����swf����ָ���˴����ϴ���swf�ļ�λ�ã��������á����λ���������HTMLҳ��·���ġ�</b>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#file_upload').omFileUpload({
     *         action : '/operamasks-ui/omFileUpload.do',
     *         onComplete : function(ID,fileObj,response,data,event){
     *             alert('�ļ�'+fileObj.name+'�ϴ����');
     *         }
     *     });
     * });
     * &lt;/script&gt;
     * 
     * <b>//ע�⣺input��id���Ա�������</b>
     * &lt;input id="file_upload" name="file_upload" type="file" /&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();

(function($){
    // �����ϴ����id���ļ��ڶ����е�index�����ļ�ID
    function _findIDByIndex(uploadId,index){
        var queueId = uploadId + 'Queue';
        var queueSize = $('#' + queueId + ' .om-fileupload-queueitem').length;
        if(index == null || isNaN(index) || index < 0 || index >= queueSize){
            return false;
        }
        var item = $('#' + queueId + ' .om-fileupload-queueitem:eq('+index+')');
        return item.attr('id').replace(uploadId,'');                
    };
    
    $.omWidget('om.omFileUpload', {
        options : /** @lends omFileUpload#*/{
            /**
             * ���ô����ϴ���swf�ļ���λ�á�
             * @default '/operamasks-ui/ui/om-fileupload.swf'
             * @type String
             * @example
             * $('#file_upload').omFileUpload({swf : 'om-fileupload.swf'});
             */
            swf : '/operamasks-ui/ui/om-fileupload.swf',
            /**
             * �����ļ��ϴ��ķ���˵�ַ��
             * @default ��
             * @type String
             * @example
             * $('#file_upload').omFileUpload({action : '/operamasks-ui/omFileUpload'});
             */
            action : '',
            /**
             * �����ϴ�������˵ĸ������ݡ�ʹ��������Ե�ʱ������method����Ϊ'GET'��
             * @default ��
             * @type Object
             * @example
             * $('#file_upload').omFileUpload({method:'GET', actionData : {'name':'operamasks','age':'5'}});
             */
            actionData : {},
            /**
             * �����ϴ���ť�ĸ߶ȡ� 
             * @default 30
             * @type Number
             * @example
             * $('#file_upload').omFileUpload({height : 50});
             */         
            height : 30,
            /**
             * �����ϴ���ť�Ŀ�ȡ� 
             * @default 120
             * @type Number
             * @example
             * $('#file_upload').omFileUpload({width : 150});
             */         
            width : 120,
            /**
             * �ϴ���ť�����֡� 
             * @default 'ѡ���ļ�'
             * @type String
             * @example
             * $('#file_upload').omFileUpload({buttonText: 'ѡ��ͼƬ'});
             */         
            // buttonText : $.om.lang.omFileUpload.selectFileText,
            
            /**
             * �ϴ���ť�ı���ͼƬ��
             * @default null(swf����ͼƬ)
             * @type String
             * @example
             * $('#file_upload').omFileUpload({buttonImg: 'btn.jpg'});
             */
            buttonImg : null,
            
            /**
             * �Ƿ����������ϴ��ļ���
             * @default false
             * @type Boolean
             * @example
             * $('#file_upload').omFileUpload({multi: true});
             */         
            multi : false,
            
            /**
             * �Ƿ���ѡ�����ļ����Զ�ִ���ϴ��� 
             * @default false
             * @type Boolean
             * @example
             * $('#file_upload').omFileUpload({autoUpload: true});
             */         
            autoUpload : false,
            fileDataName : 'Filedata',
            /**
             * �ļ��ϴ��ı��ύ��ʽ�� 
             * @default 'POST'
             * @type String
             * @example
             * $('#file_upload').omFileUpload({method: 'GET'});
             */             
            method : 'POST',
            /**
             * �����ϴ��ļ�������������ơ�
             * @default 999
             * @type Number
             * @example
             * $('#file_upload').omFileUpload({queueSizeLimit : 5});
             */         
            queueSizeLimit : 999,
            /**
             * �ļ��ϴ���ɺ��Ƿ��Զ��Ƴ��ϴ���״̬��ʾ���������false���ļ��ϴ������Ҫ�����ʾ��Ĺرհ�ť���йرա�
             * @default true
             * @type Boolean
             * @example
             * $('#file_upload').omFileUpload({removeCompleted : false});
             */         
            removeCompleted : true,
            /**
             * �ϴ��ļ����������ƣ�������Ա����fileDesc����һ��ʹ�á� 
             * @default '*.*'
             * @type String
             * @example
             * $('#file_upload').omFileUpload({fileExt : '*.jpg;*.png;*.gif',fileDesc:'Image Files'});
             */         
            fileExt : '*.*',
            /**
             * ��ѡ���ļ��ĵ��������С��ļ����͡�����������ʾ�����֡�
             * @default null
             * @type String
             * @example
             * $('#file_upload').omFileUpload({fileExt : '*.jpg;*.png;*.gif',fileDesc:'Image Files'});
             */         
            fileDesc : null,
            /**
             * �ϴ��ļ���������ơ� 
             * @default null(�޴�С����)
             * @type Number
             * @example
             * $('#file_upload').omFileUpload({sizeLimit : 1024});
             */         
            sizeLimit : null,
            /**
             * ѡ���ϴ��ļ��󴥷���
             * @event
             * @param ID �ļ�ID
             * @param fileObj ��װ���ļ���Ϣ��Object���󣬰���������ԣ�name(�ļ���)��size(�ļ���С)��creationDate(�ļ�����ʱ��)��modificationDate(�ļ�����޸�ʱ��)��type(�ļ�����)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onSelect
             * @example
             * $('#file_upload').omFileUpload({onSelect:function(ID,fileObj,event){alert('��ѡ�����ļ���'+fileObj.name);}});
             */         
            onSelect : function() {},
            /**
             * �����ϴ����ļ������������ƺ󴥷���
             * @event
             * @param queueSizeLimit �����ϴ��ļ��������������
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onQueueFull
             * @example
             * $('#file_upload').omFileUpload({onSelect:function(queueSizeLimit,event){alert('�����ϴ��ļ����������ܳ�����'+queueSizeLimit);}});
             */             
            onQueueFull : function() {},
            /**
             * ѡ���ϴ��ļ��󴥷���
             * @event
             * @param ID �ļ�ID
             * @param fileObj ��װ���ļ�����Ϣ��Object���󣬰���������ԣ�name(�ļ���)��size(�ļ���С)��creationDate(�ļ�����ʱ��)��modificationDate(�ļ�����޸�ʱ��)��type(�ļ�����)
             * @param data ��װ���ļ��ϴ���Ϣ��Object���󣬰����������ԣ�fileCount(�ļ��ϴ�������ʣ���ļ�������)��speed(�ļ��ϴ���ƽ���ٶ� KB/s)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onCancel
             * @example
             * $('#file_upload').omFileUpload({onCalcel:function(ID,fileObj,data,event){alert('ȡ���ϴ���'+fileObj.name);}});
             */         
            onCancel : function() {},
            /**
             * �ļ��ϴ�����󴥷���
             * @event
             * @param ID �ļ�ID
             * @param fileObj ��װ���ļ�����Ϣ��Object���󣬰���������ԣ�name(�ļ���)��size(�ļ���С)��creationDate(�ļ�����ʱ��)��modificationDate(�ļ�����޸�ʱ��)��type(�ļ�����)
             * @param errorObj ��װ�˷��صĳ�����Ϣ��Object���󣬰����������ԣ�type('HTTP'��'IO'��'Security')��info(���صĴ�����Ϣ����)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onError
             * @example
             * $('#file_upload').omFileUpload({onError:function(ID,fileObj,errorObj,event){alert('�ļ�'+fileObj.name+'�ϴ�ʧ�ܡ��������ͣ�'+errorObj.type+'��ԭ��'+errorObj.info);}});
             */             
            onError : function() {},
            /**
             * ÿ�θ����ļ����ϴ����Ⱥ󴥷���
             * @event
             * @param ID �ļ�ID
             * @param fileObj ��װ���ļ�����Ϣ��Object���󣬰���������ԣ�name(�ļ���)��size(�ļ���С)��creationDate(�ļ�����ʱ��)��modificationDate(�ļ�����޸�ʱ��)��type(�ļ�����)
             * @param data ��װ���ļ��ϴ���Ϣ��Object���󣬰����������ԣ�fileCount(�ļ��ϴ�������ʣ���ļ�������)��speed(�ļ��ϴ���ƽ���ٶ� KB/s)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onProgress
             * @example
             * $('#file_upload').omFileUpload({onProgress:function(ID,fileObj,data,event){alert(fileObj.name+'�ϴ�ƽ���ٶȣ�'+data.speed);}});
             */             
            onProgress : function() {},
            /**
             * ÿ���ļ�����ϴ��󴥷���
             * @event
             * @param ID �ļ�ID
             * @param fileObj ��װ���ļ�����Ϣ��Object���󣬰���������ԣ�name(�ļ���)��size(�ļ���С)��creationDate(�ļ�����ʱ��)��modificationDate(�ļ�����޸�ʱ��)��type(�ļ�����)
             * @param response ����˷��ص�����
             * @param data ��װ���ļ��ϴ���Ϣ��Object���󣬰����������ԣ�fileCount(�ļ��ϴ�������ʣ���ļ�������)��speed(�ļ��ϴ���ƽ���ٶ� KB/s)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onComplete
             * @example
             * $('#file_upload').omFileUpload({onComplete:function(ID,fileObj,response,data,event){alert(fileObj.name+'�ϴ����');}});
             */             
            onComplete : function() {},
            /**
             * �����ļ��ϴ���󴥷���
             * @event
             * @param data ��װ���ļ��ϴ���Ϣ��Object���󣬰����������ԣ�fileCount(�ļ��ϴ�������ʣ���ļ�������)��speed(�ļ��ϴ���ƽ���ٶ� KB/s)
             * @param event jQuery.Event����
             * @type Function
             * @default emptyFn
             * @name omFileUpload#onAllComplete
             * @example
             * $('#file_upload').omFileUpload({onAllComplete:function(data,event){alert('�����ļ��ϴ����');}});
             */             
            onAllComplete : function() {}
        },
    
    
        /**
         * �ϴ��ļ������������index�������ϴ���������������ļ���
         * @name omFileUpload#upload
         * @function
         * @param index �ļ����ϴ������е���������0��ʼ
         * @example
         * $('#file_upload').omFileUpload('upload'); // �ϴ������е������ļ�
         * $('#file_upload').omFileUpload('upload',1); // �ϴ������еĵ�2���ļ�
         */                 
        upload:function(index) {
            var element = this.element;
            var id = element.attr('id'),
            fileId = null,
            queueId = element.attr('id') + 'Queue',
            uploaderId = element.attr('id') + 'Uploader';
            if(typeof(index) != 'undefined'){
                if((fileId = _findIDByIndex(id,index)) === false) return;
            }
            document.getElementById(uploaderId).startFileUpload(fileId, false);
        },
        /**
         * ȡ���ϴ��ļ������������index������ȡ����������������ļ���
         * @name omFileUpload#cancel
         * @function
         * @param index �ļ����ϴ������е���������0��ʼ
         * @example
         * $('#file_upload').omFileUpload('cancel'); // ȡ���ϴ������е������ļ�
         * $('#file_upload').omFileUpload('cancel',1); // ȡ���ϴ������еĵ�2���ļ�
         */                 
        cancel:function(index) {
            var element = this.element;
            var id = element.attr('id'),
            fileId = null,
            queueId = element.attr('id') + 'Queue',
            uploaderId = element.attr('id') + 'Uploader';
            if(typeof(index) != 'undefined'){
                // ���Ӷ�index����ΪID������Ĵ���
                if(isNaN(index)){
                    fileId = index;
                } else{
                    if((fileId = _findIDByIndex(element.attr('id'),index)) === false) return;
                }
                document.getElementById(uploaderId).cancelFileUpload(fileId, true, true, false);
            } else{
                // cancel all
                document.getElementById(uploaderId).clearFileUploadQueue(false);
            }
        },
        
        _setOption : function(key, value) {
            var uploader = document.getElementById(this.element.attr('id') + 'Uploader');
            if (key == 'actionData') {
                var actionDataString = '';
                for (var name in value) {
                    actionDataString += '&' + name + '=' + value[name];
                }
                
                var cookieArray = document.cookie.split(';')
                for (var i = 0; i < cookieArray.length; i++){
                    if (cookieArray[i] !== '') {
                        actionDataString += '&' + cookieArray[i];
                    }
                }
                
                value = encodeURI(actionDataString.substr(1));
                uploader.updateSettings(key, value);
                return;
            }
            var dynOpts = ['buttonImg','buttonText','fileDesc','fileExt','height','action','sizeLimit','width'];
            if($.inArray(key, dynOpts) != -1){
                uploader.updateSettings(key, value);
            }
        }, 
        
        _create : function() {
        	var self = this;
            var element = this.element;
            var settings = $.extend({}, this.options);
            // �������ԣ�������
            settings.wmode = 'opaque'; // The wmode of the flash file
            settings.expressInstall = null;
            settings.displayData = 'percentage';
            settings.folder = ''; // The path to the upload folder
            settings.simUploadLimit = 1; // The number of simultaneous uploads allowed
            settings.scriptAccess = 'sameDomain'; // Set to "always" to allow script access across domains
            settings.queueID = false; // The optional ID of the queue container
            settings.onInit = function(){}; // Function to run when omFileUpload is initialized
            settings.onSelectOnce = function(){}; // Function to run once when files are added to the queue
            settings.onClearQueue = function(){}; // Function to run when the queue is manually cleared
            settings.id = this.element.attr('id');
            
            $(element).data('settings',settings);
            var pagePath = location.pathname;
            pagePath = pagePath.split('/');
            pagePath.pop();
            pagePath = pagePath.join('/') + '/';
            var data = {};
            data.omFileUploadID = settings.id;
            
            data.pagepath = pagePath;
            if (settings.buttonImg) data.buttonImg = escape(settings.buttonImg);
            data.buttonText = encodeURI($.om.lang._get(settings,"omFileUpload","buttonText"));
            if (settings.rollover) data.rollover = true;
            data.action = settings.action;
            data.folder = escape(settings.folder);
            
            var actionDataString = '';
            var cookieArray = document.cookie.split(';')
            for (var i = 0; i < cookieArray.length; i++){
                actionDataString += '&' + cookieArray[i];
            }
            if (settings.actionData) {
                for (var name in settings.actionData) {
                    actionDataString += '&' + name + '=' + settings.actionData[name];
                }
            }
            data.actionData = escape(encodeURI(actionDataString.substr(1)));
            data.width = settings.width;
            data.height = settings.height;
            data.wmode = settings.wmode;
            data.method = settings.method;
            data.queueSizeLimit = settings.queueSizeLimit;
            data.simUploadLimit = settings.simUploadLimit;
            if (settings.hideButton) data.hideButton = true;
            if (settings.fileDesc) data.fileDesc = settings.fileDesc;
            if (settings.fileExt) data.fileExt = settings.fileExt;
            if (settings.multi) data.multi = true;
            if (settings.autoUpload) data.autoUpload = true;
            if (settings.sizeLimit) data.sizeLimit = settings.sizeLimit;
            if (settings.checkScript) data.checkScript = settings.checkScript;
            if (settings.fileDataName) data.fileDataName = settings.fileDataName;
            if (settings.queueID) data.queueID = settings.queueID;
            if (settings.onInit() !== false) {
                element.css('display','none');
                element.after('<div id="' + element.attr('id') + 'Uploader"></div>');
                swfobject.embedSWF(settings.swf, settings.id + 'Uploader', settings.width, settings.height, '9.0.24', settings.expressInstall, data, {'quality':'high','wmode':settings.wmode,'allowScriptAccess':settings.scriptAccess},{},function(event) {
                    if (typeof(settings.onSWFReady) == 'function' && event.success) settings.onSWFReady();
                });
                if (settings.queueID == false) {
                    $("#" + element.attr('id') + "Uploader").after('<div id="' + element.attr('id') + 'Queue" class="om-fileupload-queue"></div>');
                } else {
                    $("#" + settings.queueID).addClass('om-fileupload-queue');
                }
            }
            if (typeof(settings.onOpen) == 'function') {
                element.bind("omFileUploadOpen", settings.onOpen);
            }
            element.bind("omFileUploadSelect", {'action': settings.onSelect, 'queueID': settings.queueID}, function(event, ID, fileObj) {
                if (self._trigger("onSelect",event,ID,fileObj) !== false) {
                    var byteSize = Math.round(fileObj.size / 1024 * 100) * .01;
                    var suffix = 'KB';
                    if (byteSize > 1000) {
                        byteSize = Math.round(byteSize *.001 * 100) * .01;
                        suffix = 'MB';
                    }
                    var sizeParts = byteSize.toString().split('.');
                    if (sizeParts.length > 1) {
                        byteSize = sizeParts[0] + '.' + sizeParts[1].substr(0,2);
                    } else {
                        byteSize = sizeParts[0];
                    }
                    if (fileObj.name.length > 20) {
                        fileName = fileObj.name.substr(0,20) + '...';
                    } else {
                        fileName = fileObj.name;
                    }
                    queue = '#' + $(this).attr('id') + 'Queue';
                    if (event.data.queueID) {
                        queue = '#' + event.data.queueID;
                    }
                    $(queue).append('<div id="' + $(this).attr('id') + ID + '" class="om-fileupload-queueitem">\
                            <div class="cancel" onclick="$(\'#' + $(this).attr('id') + '\').omFileUpload(\'cancel\',\'' + ID + '\')">\
                            </div>\
                            <span class="fileName">' + fileName + ' (' + byteSize + suffix + ')</span><span class="percentage"></span>\
                            <div class="om-fileupload-progress">\
                                <div id="' + $(this).attr('id') + ID + 'ProgressBar" class="om-fileupload-progressbar"><!--Progress Bar--></div>\
                            </div>\
                        </div>');
                }
            });
            element.bind("omFileUploadSelectOnce", {'action': settings.onSelectOnce}, function(event, data) {
            	self._trigger("onSelectOnce",event,data);
                if (settings.autoUpload) {
                    $(this).omFileUpload('upload');
                }
            });
            element.bind("omFileUploadQueueFull", {'action': settings.onQueueFull}, function(event, queueSizeLimit) {
                if (self._trigger("onQueueFull",event,queueSizeLimit) !== false) {
                    alert($.om.lang.omFileUpload.queueSizeLimitMsg + queueSizeLimit + '.');
                }
            });
            element.bind("omFileUploadCancel", {'action': settings.onCancel}, function(event, ID, fileObj, data, remove, clearFast) {
                if (self._trigger("onCancel",event,ID,fileObj,data) !== false) {
                    if (remove) { 
                        var fadeSpeed = (clearFast == true) ? 0 : 250;
                        $("#" + $(this).attr('id') + ID).fadeOut(fadeSpeed, function() { $(this).remove() });
                    }
                }
            });
            element.bind("omFileUploadClearQueue", {'action': settings.onClearQueue}, function(event, clearFast) {
                var queueID = (settings.queueID) ? settings.queueID : $(this).attr('id') + 'Queue';
                if (clearFast) {
                    $("#" + queueID).find('.om-fileupload-queueitem').remove();
                }
                if (self._trigger("onClearQueue",event,clearFast) !== false) {
                    $("#" + queueID).find('.om-fileupload-queueitem').each(function() {
                        var index = $('.om-fileupload-queueitem').index(this);
                        $(this).delay(index * 100).fadeOut(250, function() { $(this).remove() });
                    });
                }
            });
            var errorArray = [];
            element.bind("omFileUploadError", {'action': settings.onError}, function(event, ID, fileObj, errorObj) {
                if (self._trigger("onError",event,ID,fileObj,errorObj) !== false) {
                    var fileArray = new Array(ID, fileObj, errorObj);
                    errorArray.push(fileArray);
                    $("#" + $(this).attr('id') + ID).find('.percentage').text(" - " + errorObj.type + " Error");
                    $("#" + $(this).attr('id') + ID).find('.om-fileupload-progress').hide();
                    $("#" + $(this).attr('id') + ID).addClass('om-fileupload-error');
                }
            });
            if (typeof(settings.onUpload) == 'function') {
                element.bind("omFileUploadUpload", settings.onUpload);
            }
            element.bind("omFileUploadProgress", {'action': settings.onProgress, 'toDisplay': settings.displayData}, function(event, ID, fileObj, data) {
                if (self._trigger("onProgress",event,ID,fileObj,data) !== false) {
                    $("#" + $(this).attr('id') + ID + "ProgressBar").animate({'width': data.percentage + '%'},250,function() {
                        if (data.percentage == 100) {
                            $(this).closest('.om-fileupload-progress').fadeOut(250,function() {$(this).remove()});
                        }
                    });
                    if (event.data.toDisplay == 'percentage') displayData = ' - ' + data.percentage + '%';
                    if (event.data.toDisplay == 'speed') displayData = ' - ' + data.speed + 'KB/s';
                    if (event.data.toDisplay == null) displayData = ' ';
                    $("#" + $(this).attr('id') + ID).find('.percentage').text(displayData);
                }
            });
            element.bind("omFileUploadComplete", {'action': settings.onComplete}, function(event, ID, fileObj, response, data) {
                if (self._trigger("onComplete",event,ID,fileObj,unescape(response),data) !== false) {
                    $("#" + $(this).attr('id') + ID).find('.percentage').text(' - Completed');
                    if (settings.removeCompleted) {
                        $("#" + $(event.target).attr('id') + ID).fadeOut(250,function() {$(this).remove()});
                    }
                    $("#" + $(event.target).attr('id') + ID).addClass('completed');
                }
            });
            if (typeof(settings.onAllComplete) == 'function') {
                element.bind("omFileUploadAllComplete", {'action': settings.onAllComplete}, function(event, data) {
                    if (self._trigger("onAllComplete",event,data) !== false) {
                        errorArray = [];
                    }
                });
            }
        }
    });
    
    $.om.lang.omFileUpload = {
        queueSizeLimitMsg:'�ļ��ϴ������������������ܳ���',
        buttonText:'ѡ���ļ�'
    };
})(jQuery);/*
 * $Id: om-grid-roweditor.js,v 1.17 2012/05/07 09:36:42 chentianzhen Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-grid.js
 *  om-button.js
 */

(function($) {
	var own = Object.prototype.hasOwnProperty,
		self;
    $.omWidget.addInitListener('om.omGrid',function(){
    	self = this;
    	
    	var $elem = self.element,
    		options = self.options,
    		colModel = options.colModel,
    		$grid = $elem.closest('.om-grid'),
    		gridHeaderCols=$('.hDiv thead tr:first th', $grid),
    		editComp,//{name:{type:�������,model:�ж�Ӧmodel,instance:���ʵ��}}
    		lastValue;
    		
    	self._triggered = false;//�Ƿ��Ѿ�������һ�α༭�ˡ�
    	//��������ж����ɱ༭����ô_globalEditable=false,��ʱ������ԭ�����ж����ɱ༭���������ʱ������options.editMode=="insert",
    	//������ӽ������л��ǿ��Ա༭�ġ�
    	self._globalEditable = false;
    	
    	/**
    	 * <span style='color:red'>(�������б༭���)</span>�༭ģʽ��
    	 * ��ѡֵΪ"all","insert"��Ĭ��Ϊ"all"��"all"��ʾ�����ж��ǿɱ༭�ģ���������е��ж��ǲ��ɱ༭�ģ���ô�б༭�����Ȼ��ʧЧ��
    	 * ������������������е��ж��ǲ��ɱ༭�ģ����Ǵ˱����Զ�̬������У�������Щ�����ڳ־û�����̨֮ǰ�ǿ��Ա༭�ģ���ô��Ҫʹ��"insert"ģʽ�ˡ� 
    	 * @name omGrid#editMode
    	 * @type String
    	 * @default "all"
    	 * @example
    	 * $('.selector').omGrid({width : 600, editMode:"insert");
    	 */
    	options.editMode = options.editMode || "all";//Ĭ��Ϊallģʽ���������ж����Ա༭
    	self._allEditMode = options.editMode=="all";
    		
    	for(var i=0,len=colModel.length; i<len; i++){
    		self._globalEditable = colModel[i]["editor"]? true : false;
    		if(self._globalEditable){
    			break;
    		}
    	}
    	
    	if(!_isEditable()){
    		return ;//�������༭���ܣ��ò���κη�������ʧЧ��
    	}
		self._editComps = {};//����ÿһ�еı༭�����keyΪcolModel�е�name,valueΪ{model:ģ��,instance:���ʵ��,type:����}
		self._errorHolders = {};//  name:div   ÿ���༭��Ԫ���Ӧ�ĳ�����Ϣ����
		self._colWidthResize;//���grid�ɱ༭�����϶��������ı��п�ʱ����ǰ�������ڱ༭״̬�������ô�ֵΪtrue,��������ʾ�༭��ʱ�ɴ�����Ҫ���¼����������Ŀ��
		
		options._onRefreshCallbacks.push(_onRefresh);//ֻ������ˢ�º�ſ��Խ��г�ʼ��
		options._omResizableCallbacks.push(_onResizable);
		
        this.tbody.delegate('tr.om-grid-row','dblclick',editRenderer); 
        this.tbody.delegate('tr.om-grid-row','click',function(event){
        	if(self._triggered && self._editView.editing){
        		if(self._validator && self._validator.valid()){
        			editRenderer.call(this);
        		}else{
        			editRenderer.call(this);
        		}
        	}
        });
        
        var btnScrollTimer;
        $elem.parent().scroll(function(){
        	if(self._triggered){
        		if(btnScrollTimer){
        			clearTimeout(btnScrollTimer);
        		}
        		btnScrollTimer = setTimeout(function(){
    				var pos = _getEditBtnPosition();
            		self._editView.editBtn.animate({"left":pos.left,"top":pos.top},self._editView.editing?"fast":0);
            		btnScrollTimer = null;
    			} , 300);
        	}
        });

      //����б༭����Ľӿ�
     	$.extend($["om"]["omGrid"].prototype , {
     		/** <span style='color:red'>(�������б༭���)��</span>ȡ���༭״̬�������ǰĳ�������ڱ༭״̬��ȡ���˴ε��б༭���൱�ڵ�����б༭���ġ�ȡ������ť��
     		 * @function 
     		 * @name omGrid#cancleEdit
     		 * @returns jQuery����
     		 * @example
     		 * $(".selector").omGrid("cancleEdit");
     		 */
     		cancleEdit : 
     			function(cancleBtn/*�ڲ�ʹ�ã����������ť��Ҳ����ô˷������д���*/){
     				var $editView = self._editView;
			    	if(!_isEditable() || !self._triggered || (self._triggered && !$editView.editing)){
			    		return ;
			    	}
			    	$editView.view.hide();
			    	$editView.editing = false;
					_resetForm();
					cancleBtn && $(cancleBtn).blur();
        		},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>ȡ����ǰ����δ�ύ����̨�ĸı䣬Ҳ���ָ������е�ԭʼ���ݡ�
        	 * @function
        	 * @name omGrid#cancleChanges
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("cancleChanges");
        	 */
        	cancleChanges :
        		function(){       			
        			if(!_isEditable() || !_hasChange()){
        				return ;
        			}
        			self._changeData = {"update":{},"insert":{},"delete":{}};//�������
        			_resetForm();//���ñ༭�������������Ϣ
        			self.refresh();//����dataSource�е����ݽ���ˢ��
        		},	
        
        	/** <span style='color:red'>(�������б༭���)��</span>����ĳһ�н���༭״̬��������������ڱ༭״̬�У���ʲôҲ�������������������ڱ༭״̬�У���ȡ����һ�д˴α༭��Ȼ���н���༭״̬�� 
        	 * @function
        	 * @param index ����������0��ʼ 
        	 * @name omGrid#editRow
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("editRow" , 1);
        	 */
        	editRow : function(index){
        		if(!_isEditable()){
        			return ;
        		}
        		editRenderer.call(self._getTrs().eq(index)[0]);
        	},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>ɾ��ĳһ�У��������������ӵĲ�δ���浽��̨�����������ɾ�������������ԭ���ʹ��ڵģ���ֻ�����ز����б��,��������saveChanges��Ž�������ɾ����
        	 * @function
        	 * @param index ����������0��ʼ 
        	 * @name omGrid#deleteRow
        	 * @returns jQuery����
        	 * @example
        	 * $(".selector").omGrid("deleteRow" , 0);
        	 */
        	deleteRow : function(index){
        		if(!_isEditable()){
        			return ;
        		}
        		var $tr = self._getTrs().eq(index);
        		self.cancleEdit();
        		var rowId = _getRowId($tr);
        		if($tr.attr("_insert")){
        			delete self._changeData["insert"][rowId];
        			$tr.remove();
        		}else{
        			self._changeData["delete"][rowId] = self._rowIdDataMap[rowId];
        			$tr.attr("_delete", "true");
        			$tr.hide();
        		}
        	},
 
        	/** <span style='color:red'>(�������б༭���)��</span>��ȡ����δ������޸ġ����û��ָ��type,���ص������е��޸ģ���ʽΪ: {update:[],insert:[],delete:[]}�����ָ���˲�������
        	 *  ָ����"update"���򷵻� [{},{}]
        	 * @function
        	 * @param type ��ѡֵΪ��"insert","update","delete" 
        	 * @name omGrid#getChanges
        	 * @returns ��ָ�������ͣ�����[]�����򷵻�{update:[],insert:[],delete:[]}
        	 * @example
        	 * $(".selector").omGrid("getChanges" , "update");
        	 */
        	getChanges : function(type){
        		var data = {"update":[] , "insert":[] , "delete":[]},
        			reqType = type? type : "update",
        			changeData = self._changeData,
        			i;
        			
        		if(reqType === "update"){
        			var uData = changeData[reqType];
        			for(i in uData){
        				own.call(uData , i) && data[reqType].push($.extend(true , {} , self._rowIdDataMap[i] , uData[i]));
        			}
        			reqType = type? type : "insert";
        		}
        		if(reqType === "insert"){
        			var iData = changeData[reqType];
        			for(i in iData){
        				own.call(iData , i) && data[reqType].push(iData[i]);
        			}
        			reqType = type? type : "delete";
        		}
        		if(reqType === "delete"){
        			var dData = changeData[reqType];
        			for(i in dData){
        				own.call(dData , i) && data[reqType].push(dData[i]);
        			}
        		}
        		if(type){
        			return data[type];
        		}else{
        			return data;
        		}
        	},
     
    	 	/** <span style='color:red'>(�������б༭���)��</span>��ָ��λ�ö�̬����һ�С�
	    	 * @function
	    	 * @param index ����������0��ʼ����Ϊ"begin","end"�ֱ��ʾ�ڱ����ǰ���������С�
	    	 * @param rowData ��������еĳ�ʼֵ
	    	 * @name omGrid#insertRow
	    	 * @returns jQuery����
	    	 * @example
	    	 * $(".selector").omGrid("insertRow" , "end" , {id:1 , name:"�ɶ�"});
	    	 */
        	insertRow : function(index , rowData){
        		if(!_isEditable()){
        			return ;
        		}
        		if($.isPlainObject(index)){
        			rowData = index;
        			index = 0;
        		}
        		var $trs = self._getTrs();
        		index = ("begin"==index || index==undefined)? 0 : ("end"==index? $trs.length : index);
        		
        		//����������
        		var rd = {};
        		for(var i=0,len=colModel.length; i<len; i++){
        			rd[colModel[i]["name"]] = "";//Ĭ�϶�Ϊ��ֵ
            	}
        		self._changeData["insert"][self._guid] = $.extend(true , rd , rowData);
        		
        		//��������
        		var rowValues=self._buildRowCellValues(colModel,rd,index),
        			trContent = [],
        			rowClasses=options.rowClasses;
        			isRowClassesFn= (typeof rowClasses === 'function'),
        			rowCls = isRowClassesFn? rowClasses(index,rd):rowClasses[index % rowClasses.length],
        			tdTmp = "<td align='$' abbr='$' class='grid-cell-dirty $'><div align='$' class='$' style='width:$px'>$</div></td>";//tdģ��
        			    			
        		trContent.push("<tr class='om-grid-row " + rowCls + "' _grid_row_id="+(self._guid++)+" _insert='true'>");
        		$(gridHeaderCols).each(function(i){
                    var axis = $(this).attr('axis'),
                    	wrap=false,
                    	html,
                    	cols,
                    	j;
                    if(axis == 'indexCol'){
                        html="<a class='om-icon'>����</a>";
                    }else if(axis == 'checkboxCol'){
                        html = '<span class="checkbox"/>';
                    }else if(axis.substring(0,3)=='col'){
                        var colIndex=axis.substring(3);
                        html=rowValues[colIndex];
                        if(colModel[colIndex].wrap){
							wrap=true;
						} 
                    }else{
                        html='';
                    }
                    cols = [this.align , this.abbr , axis , this.align , wrap?'wrap':'', $('div',$(this)).width() , html];
                    j=0;
                    trContent.push(tdTmp.replace(/\$/g , function(){
                    	return cols[j++];
                    }));
                });
                trContent.push("</tr>");
        		
        		var $tr = $(trContent.join(" "));
        		index==0? $tr.prependTo($elem.find(">tbody")) : $trs.eq(index-1).after($tr);
        		
        		self.editRow(index);
        	},
        	
        	/** <span style='color:red'>(�������б༭���)��</span>����ͻ������ݡ�ע�⣬�˷��������ύ���󵽺�̨�����ǻ���Ϊ���е����ݸı䶼�Ѿ��ɹ��ύ����̨ȥ�ˣ���������������������ݱ�־��
        	 * һ������£������Լ��ı��淽���¼��ص��У�����getChanges������ȡ��ǰ���еĸı䣬���Լ��ύ����̨��Ȼ���ڳɹ��ص��������ٵ��ñ�������
        	 * һ�����ñ�������cancleChanges�������޷��Ե��ô˷���ǰ�����иı������õġ�
	    	 * @function
	    	 * @name omGrid#saveChanges
	    	 * @returns jQuery����
	    	 * @example
	    	 * $(".selector").omGrid("saveChanges");
	    	 */
        	saveChanges : function(){
    			if(!_isEditable() || !_hasChange()){
    				return ;
    			}
    			var changeData = self._changeData,
    				rowsData = self.pageData.data.rows,
    				uData = changeData["update"],
    				dData = changeData["delete"],
    				$trs = self.element.find("tr.om-grid-row"),
    				newRowsData = [];
    			for(var i in uData){
    				if(own.call(uData , i)){
    					$.extend(true , self._rowIdDataMap[i] , uData[i]);
    				}
    			}
    			$trs.each(function(index , tr){
    				var $tr = $(tr);
    				if($tr.attr("_delete")){
    					$tr.remove();
    				}else{
    					newRowsData.push(_getRowData(tr));
    				}
    			});
    			self.pageData.data.rows = newRowsData;
    			self._changeData = {"update":{},"insert":{},"delete":{}};//�������
    			_resetForm();//���ñ༭�������������Ϣ
    			self.refresh();//����dataSource�е����ݽ���ˢ��
        	},
        	/**
        	 * (����)��ȡ���µ���������
        	 */
        	getData : function(){
        		var result = this.pageData.data,
    				$trs = self._getTrs();
    				
        		if(_isEditable() && _hasChange()){
        			result = {total:result.total};
        			result.rows = [];
    				$trs.each(function(index , tr){
	    				result.rows.push(self._getRowData(index));
    				});
    			}
    			return result;
        	},
        	/**
        	 * (����)��ȡ���µ������ݡ����ڿ��Բ����µ������У����Դ˷���Ҫ������д��
        	 */
        	_getRowData : function(index){
        		var $tr = this._getTrs().eq(index),
        			rowId = _getRowId($tr),
        			rowData;
        		if($tr.attr("_insert")){
        			rowData = self._changeData.insert[rowId];
        		}else{
        			var origRowData = self._rowIdDataMap[rowId],
        				uData = self._changeData["update"];
        			rowData = origRowData;
        			if(uData[rowId]){
        				rowData = $.extend(true , {} , origRowData , uData[rowId]);
        			}
        		}
        		return rowData;
        	}
     	});
		
        function editRenderer(){
        	var $tr = $(this),
        	$editRow,
        	$editForm,
        	scrollLeft;
        	
        	if(!_isEditable()){
        		return ;
        	}
        		
        	//�����insertEditModeģʽ����ô���Ǹ����������ģ����򲻿ɱ༭��ֱ�ӷ���
        	if(!self._allEditMode && !$tr.attr("_insert")){
        		return ;
        	}
        	
        	//��ǰ�������ڱ༭״̬��ֱ�ӷ���
        	if(self._triggered  
        		&& self._editView.editing
        		&& _getRowId($tr) == self._editView.rowId){
				return ;        		
        	}
        	
        	_showEditView(this);
        	$editRow = self._editView.editRow;
        	$editForm = $editRow.find(">.grid-edit-form");
        	scrollLeft = $elem.parent().scrollLeft();
        	
        	$(gridHeaderCols).each(function(index){
            	var axis = $(this).attr('axis'),
					model,
					$cell = $tr.find("td:eq("+index+")"),
					name,//�༭���input������֣�����У���������
					compKey;//ָeditComps��key
            	if(axis.substring(0,3)=='col'){
                 	var colIndex=axis.substring(3);
                 	model = colModel[colIndex];
            	}else{
            		if($.isEmptyObject(self._editComps)){//��֤�ٴα༭������ʱ�����ظ���� padding-left.
            			$editRow.css("padding-left", parseInt($editRow.css("padding-left")) + $cell.outerWidth());
            		}
            		return ;
            	}
            	var editor = model.editor;
            	if(!self._triggered){
            		//����в��ɱ༭����Ĭ��type="text"
                	//�в��ɱ༭������: 
                	//(1)colModelû��editor����
                	//(2)colModel��editor���ԣ�����editor��editable���ԣ���ôeditable===false�򲻽��б༭������editableΪ�����ҷ���falseҲ�����б༭��
    				if(!editor || 
    	            	(editor && 
    	            		(editor.editable===false || 
    	                    	($.isFunction(editor.editable) && editor.editable()===false) ) ) ){
    					var renderer = editor && editor.renderer;
    	       			model.editor = editor = {};
    	       			editor.type = "text";
    	       			if(renderer){
    	       				editor.renderer = renderer;
    	       				editor.type = "custom";
    	       			}
    	       			editor.editable = false;
    	   			}else{
    	   				editor.type = editor.type || "text";
    	   				editor.editable = true;
    	   				if(editor.rules){
    	   					self._validate = true;//ֻ����Ҫ�������Ҫ���м���
    	   				}
    	   			}
    	   			compKey = model.editor.name || model.name;
    	   			editor.options = editor.options || {};
    	   			self._editComps[compKey] = {};
            	}else{
            		compKey = model.editor.name || model.name;
            	}
            	editComp = self._editComps[compKey];
	   			lastValue = _getLastValue($tr , model) || "";
	   			
	   			//�ɱ༭���ҿ�У�飬��Ӷ�Ӧ�ĳ�����Ϣ��ʾ����
	   			if(!self._triggered && editor.editable && editor.rules){
	   				self._errorHolders[compKey] = $("<div class='errorContainer' style='display:none'></div>").appendTo($elem.parent());
	   			}
	   			var $ins = editComp.instance,
	   				$wrapper,
	   				type = editor.type;
	   			if(!$ins){
	   				$wrapper = $("<div style='position:absolute'></div>").css({left:$cell.position().left+scrollLeft,top:3}).appendTo($editForm).addClass("grid-edit-wrapper"); 
	   				$ins = editComp.instance = $("<input></input>").attr({"name":compKey,"id":compKey}).appendTo($wrapper);
	   				if("text"!=type && "custom"!=type){//ʵ�������
	   					$ins[type](editor.options);
	   				}
	   				if("omCalendar"==type || "omCombo"==type){
	   					var $parent = $ins.parent();
	   					if("omCalendar"==type){
	   						$ins.val(lastValue).width($cell.outerWidth()-24);
	   					}
	   					$ins.width($cell.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
	   				}else{
	   					if("text"==type){
	   						$ins.addClass("grid-edit-text");
	   						if(!editor.editable){
	   							$ins.attr("readonly" , "readonly").addClass("readonly-text");
	   						}
	   					}
	   					if("custom"==type){
	   						$wrapper.html(editor.renderer(lastValue));
	   					}
	   					$ins.width($cell.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
	   				}
	   				editComp.model = model;
					editComp.type = type;
					editComp.id = model.name;
	   			}
   				switch(type){
   					case "omCalendar":
   						$ins = $ins.val(lastValue).omCalendar();
   						break;
   					case "omNumberField":
   						$ins.val(lastValue).trigger("blur");//���д�����
   						break;
   					case "omCombo":
   						$ins.omCombo("value" , lastValue);
   						break;
   					case "text":
   						$ins.val(lastValue);
   						break;
   					default:;
   				}
            });
            !self._triggered && self._validate && _bindValidation();
            	
            self._validator && self._validator.form();//����У��
        	self._triggered = true;
        }
    });
    
    function _getEditBtnPosition(){
		var $elem = self.element,
			$bDiv = $elem.parent(),
			ev = self._editView,
			$editView = ev.view,
			$editBtn = ev.editBtn,
			$editRow = ev.editRow,
			pos = {};
			
		pos.top = $editRow.height();
		if($elem.width() < $bDiv.width()){
			pos.left = $editBtn.parent().width()/2 - $editBtn.width()/2;
		}else{
			pos.left = $bDiv.scrollLeft() + $bDiv.width()/2 - $editBtn.width()/2;
		}
		return pos;
    }
    
    function _onRefresh(){
    	if(_isEditable()){
    		this._changeData = {"delete":{},"insert":{},"update":{}}; //���ݸı��ڲ�������Ҫ���³�ʼ��   
    		_buildRowIdDataMap(this);
    		if(self._triggered){
				_resetForm();
				self._editView.view.hide();
				self._editView.editing = false;
				self.hDiv.scrollLeft(0);
				self.element.parent().scrollLeft(0);
    		}
    	}
	}
    
    function _isEditable(){
    	return !self._allEditMode || self._globalEditable;
    }
    
	//����rowId��ԭ�������ݵ�һһӳ�䡣
	function _buildRowIdDataMap(){
		var rowsData = self.getData().rows;
    	self._rowIdDataMap = {};
    	self._getTrs().each(function(index , tr){
    		//�е�������ԭ�����ݵ�ӳ�䣬����ͨ��rowId��ȡԭ���е����ݡ�
    		self._rowIdDataMap[_getRowId(tr)] = rowsData[index];
    	});
	}
	
	//����У�����ͬʱ���������Ϣ
	function _resetForm(){
		if(self._validator){
			self._validator.resetForm();
			//��մ�����Ϣ
			$.each(self._errorHolders,function(name , errorHolder){
    			errorHolder.empty();
			});
		}
	}
	
	function _hasChange(){
		var changeData = self._changeData;
		return !($.isEmptyObject(changeData["update"]) && $.isEmptyObject(changeData["insert"]) && $.isEmptyObject(changeData["delete"]));
	} 
	
    //��ʾ�ɱ༭����ͼ
	function _showEditView(tr){
		var $elem = self.element,
			$editView = $elem.next(".grid-edit-view"),
			$editBtn,
			$editRow,
			position = $(tr).position();
		if($editView.length == 0){
			$editView = $("<div class='grid-edit-view'><div class='body-wrapper'><div class='grid-edit-row'><form class='grid-edit-form'></form></div>"
					+"<div class='gird-edit-btn'><input type='button' class='ok' value='����'/><input type='button' class='cancle' value='ȡ��'/></div></div></div>")
				.width($elem.outerWidth())
				.insertAfter($elem);
			$editBtn = $editView.find(".gird-edit-btn"),
			$editRow = $editBtn.prev(".grid-edit-row"),
				pos;
			self._editView = {view:$editView , editRow:$editRow , editBtn:$editBtn};//���л���
			pos = _getEditBtnPosition();
			$editBtn.css({"left": pos.left,"top":pos.top});
			//�󶨰�ť���¼�
			var $okBtn = $editBtn.find("input.ok").omButton(),
				$cancleBtn = $editBtn.find("input.cancle").omButton();
			$okBtn.click(function(){
				//�����ٴν���У�飬��Ҫ�������û�����Լ�������Щ�༭�������ֵ�ǲ��ᴥ��У���
				if(self._validator && !self._validator.form()){
					return ;
				}
				//���ڱհ���ԭ�����ﲻ����ֱ��ʹ��tr,��Ȼ��Զ����ָ��ͬһ��tr
				 _saveEditValue($elem.find("tr[_grid_row_id='"+self._editView.rowId+"']"));
				 $editView.hide();
				 self._editView.editing = false;
				 $okBtn.blur();
			});
			$cancleBtn.click(function(){
				self.cancleEdit(this);
			});
		}
		self._editView.rowId = _getRowId(tr);//��ǰ���ڱ༭���е�id
		if(self._editView.editing){//�����ǰ���ڱ༭����ô����Ҫ���ж�����
			$editView.animate({"top":position.top}, "fast");
		}else{
			$editView.css({"top":position.top});
			self._editView.editing = true;
			$editView.show();
			if(self._colWidthResize){
				//���¼�������༭����Ŀ��
				var scrollLeft = $elem.parent().scrollLeft();
				$editBtn = $editView.find(".gird-edit-btn");
				$editView.width($elem.outerWidth());
				self.hDiv.find("th[axis^=col]").each(function(index , th){
					var id = $(th).attr("abbr"),
						$th = $(th);
					$.each(self._editComps , function(name , comp){
						var $ins = comp.instance,
							type = comp.type;
						if(id == comp.id){
							$ins.closest("div.grid-edit-wrapper").width($th.outerWidth()).css("left" , $th.position().left + scrollLeft);
							//�ı�༭����������Ŀ��
							if("omCalendar"==type || "omCombo"==type){
								var $parent = $ins.parent();
								if("omCalendar"==type){
			   						$ins.width($th.outerWidth()-24);
			   					}
			   					$ins.width($th.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
							}else{
								$ins.width($th.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
							}
						}
					});
				});
				var pos = _getEditBtnPosition();
				$editBtn.css({"left":pos.left,"top":pos.top});
				self._colWidthResize = false;
			}
		}
	}
	
	function _onResizable($th , differWidth){
    	//������Ǵ��ڱ༭״̬�����ڱ༭��������״̬�ģ���ʱ���������༭�����Ⱥܿ��ܻ��Ǵ���ģ����ԷǱ༭״̬��ʲôҲ������������ʾ�༭��ʱ��������
    	if(!_isEditable() || !this._triggered || !this._editView.editing){
    		this._colWidthResize = true;
    		return ;
    	}
    	var ev = self._editView;
    		$editView = ev.view,
    		$editBtn = ev.editBtn;
		$editView.width(self.element.outerWidth());
		
		var $ths = self.hDiv.find("th"),
			first = true;
		self.hDiv.find("th:gt("+($ths.index($th)-1)+")").each(function(index , th){
			var id = $(th).attr("abbr"),
				$th = $(th);
			$.each(self._editComps , function(name , comp){
				var $ins = comp.instance,
					type = comp.type;
				if(id == comp.id){
					if(!first){
						$ins.closest("div.grid-edit-wrapper").css("left" , "+="+differWidth);
					}
					if(first){
						//�ı�༭����������Ŀ��
						if("omCalendar"==type || "omCombo"==type){
							var $parent = $ins.parent();
							if("omCalendar"==type){
		   						$ins.width($th.outerWidth()-24);
		   					}
		   					$ins.width($th.outerWidth(true) - ($parent.outerWidth(true) - $ins.width()));
						}else{
							$ins.width($th.outerWidth(true) - ($ins.outerWidth(true) - $ins.width()));
						}
					}
					first = false;
				}
			});
		});
		var pos = _getEditBtnPosition();
		$editBtn.animate({"left":pos.left,"top":pos.top},"fast");
    }
	
	function _saveEditValue(tr){
		var $tr = $(tr),
			$editRow = self._editView.editRow,
			comps = self._editComps,
			rowId = _getRowId($tr),
			index = self._getTrs().index($tr),
			rowData = self._getRowData(index);
			
		$.each(comps , function(name , comp){
			var key = comp.model.name,
				newValue = _getCompValue($tr , comp),
				originalValue,
				html,
				updateRowData;
				
			if($tr.attr("_insert")){
				self._changeData.insert[rowId][key] = newValue;
			}else{
				originalValue = _getRowData(tr)[key];
				updateRowData = self._changeData.update[rowId];
				if(newValue == originalValue){
					_toggleDirtyFlag($tr , comp.model , false);
					updateRowData && delete updateRowData[key];
					$.isEmptyObject(updateRowData) && delete self._changeData.update[rowId];
				}else{
					_toggleDirtyFlag($tr , comp.model , true);
					updateRowData = self._changeData.update[rowId] = updateRowData || {};
					updateRowData[key] = newValue;
				}
			}
			//���»ر��
			if(comp.model.renderer){
				html = comp.model.renderer(newValue , rowData ,index);
			}else{
				html = newValue? newValue : "";
			}
			$tr.find("td[abbr='"+key+"'] >div").html(html);
		});
	}
	
	//�������ı�־��ʽ��show=true��ʾ��ʾ�����ѱ�������ʽ
	function _toggleDirtyFlag($tr , model , show){
		$tr.find("td[abbr='"+model.name+"']").toggleClass("grid-cell-dirty" , show);
	}
	
	function _getRowId(tr){
		return $(tr).attr("_grid_row_id");
	}
	
	//��ȡ�༭�����ж�Ӧ�������ֵ
	function _getCompValue($tr , comp){
		var value,
			rowData = _getRowData($tr);
		switch(comp.type){
		case "omCalendar":
			value = comp.instance.val();
		case "omNumberField":
			value = comp.instance.val();
			break;
		case "omCombo":
			value = comp.instance.omCombo("value");
			break;
		case "text":
			value = comp.instance.val();
			break;
		default:
			break;	
		}
		return value;
	}
	
	//��ȡĳ�����µ�ֵ������������ģ���������߻�ȡ��������¹��ˣ��Ӹ�����߻�ȡ����ֵ
	function _getLastValue($tr , model){
		var value,
			name = model.name;
		if($tr.attr("_insert")){
			//�����Ļ���insert����õ����µ�ֵ
			value = _getRowData($tr)[name];
		}else{
			var updateData = self._changeData.update[_getRowId($tr)];
			if(updateData && updateData[name] != null){//�����ݱ����¹���
				value = updateData[name];//����ֵ
			}else{//��ȡԭʼֵ
				value = _getRowData($tr)[name];
			}
		}
		return value;
	}
	
	//��ȡԭʼ�����ݣ����������ӽ�ȥ�ģ���ȡ��������ӽ�ȥ��������
	function _getRowData(tr){
		var rowId = _getRowId(tr);
		return $(tr).attr("_insert")?self._changeData.insert[rowId] : self._rowIdDataMap[rowId];
	}
	
	function _bindValidation(){
		var $editForm = self._editView.editRow.find(">.grid-edit-form"),
			valiCfg = {},
			rules = valiCfg.rules = {},
			messages = valiCfg.messages = {},
			colModel = self.options.colModel;
		$.each(colModel , function(index , model){
			var customRules = model.editor.rules;
			if(customRules){
				var r = rules[model.editor.name || model.name] = {},
					msg = messages[model.editor.name || model.name] = {};
				if(customRules.length>0 && !$.isArray(customRules[0])){
					var temp = [];
					temp.push(customRules);//��װ��[[],[]]����ͳһ��ʽ
					customRules = temp;
				}
				for(var i=0,len=customRules.length; i<len; i++){
					var name = customRules[i][0];//��������
					r[name]  = customRules[i][1] == undefined? true : customRules[i][1]; //û�ж���ֵ��ͳһ�� true
					if(customRules[i][2]){
						msg[name] = customRules[i][2];
					}
				}
			}
		});	
		
		$.extend(valiCfg , {
			onkeyup : function(element){
				this.element(element);
			},
			//���븲�Ǵ˷�������Ȼ��Ĭ�����ɴ�����Ϣ��������������Ϣ�Ĳ����Ѿ���showErrows�����ˣ����Դ˷���ʲôҲ����
			errorPlacement : function(error, element){
			},
			showErrors : function(errorMap, errorList){
				if(errorList && errorList.length > 0){
		        	$.each(errorList,function(index,obj){
		        		var $elem = $(obj.element),
		        			name = $elem.attr("name");
		        		var errorHolder = self._errorHolders[name];
		        		if(errorHolder){
		        			var docPos = $elem.offset(),
		        				tablePos = self.element.offset();
		        			errorHolder.css({left:docPos.left-tablePos.left+$elem.outerWidth(),top:docPos.top-tablePos.top+$elem.outerHeight()}).html(obj.message);
		        			if($elem.is(":focus")){
		        				errorHolder.show();
		        			}
		        		}
	 	            });
		    	}else{
		    		$.each(this.currentElements , function(index , elem){
		    			var errorHolder = self._errorHolders[$(elem).attr("name")];
		    			errorHolder && errorHolder.empty().hide();
		    		});
		    	}
		    	//����"����"��ť��״̬
		    	var $okBtn = self._editView.editBtn.find("input.ok"),
		    		correct = true;
		    	$.each(self._errorHolders,function(name , errorHolder){
		    		if(!errorHolder.is(":empty")){
		    			return correct = false;
		    		}
		    	});
		    	correct ? $okBtn.omButton("enable"): $okBtn.omButton("disable");
		    	this.defaultShowErrors();
			}
		});
		self._validator = $editForm.validate(valiCfg);
		
		//������¼�
		$.each(self._editComps , function(name , comp){
			var editor = comp.model.editor;
			if(editor.editable && editor.rules){
				var key = editor.name || comp.model.name,
					errorHolder = self._errorHolders[key];
				comp.instance.mouseover(function(){
					if(errorHolder && !errorHolder.is(":empty")){
						errorHolder.show();
					}
				})
				.mouseout(function(){
					errorHolder && errorHolder.hide();
				});
			}
		}); 
	}
})(jQuery);/*
 * $Id: om-grid-rowexpander.js,v 1.5 2012/03/15 06:14:47 linxiaomin Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-grid.js
 */

(function($) {
    $.omWidget.addInitListener('om.omGrid',function(){
        var self=this,
            rowDetailsProvider=self.options.rowDetailsProvider; //��Ⱦ�������function
        if(!rowDetailsProvider){
            return;
        }
        $('tr th:eq(0)',self.thead).before('<th align="center" axis="expenderCol" class="expenderCol"><div style="text-align: center; width: 14px;"></div></th>');
        //�������п��
        var autoExpandColIndex = -1,
            cm=self.options.colModel,
            allColsWidth=0;
        for(var i=0,len=cm.length;i<len;i++){
            if(cm[i].width=='autoExpand'){
                autoExpandColIndex = i;
            }else{
                allColsWidth+=cm[i].width;
            }
        }
        if(autoExpandColIndex != -1){ //˵����ĳ��Ҫ�Զ�����
            var toBeExpandedTh = self.thead.find('th[axis="col'+autoExpandColIndex+'"]>div');
            toBeExpandedTh.width(toBeExpandedTh.width()-self.thead.find('th[axis="expenderCol"]').width());
        }else if(self.options.autoFit){
            var percent=self.thead.find('th[axis="expenderCol"]').width()/allColsWidth,
                toFixedThs=tr.find('th[axis^="col"]>div');
            toFixedThs.each(function(index){
                $(this).css('width',parseInt($(this).width()-cm[index].width*percent));
            });
        }
        var colCount=$('tr th',self.thead).size();//�ܹ�����
        self.tbody.delegate('tr td.expenderCol>div','click',function(event){
            var _this=$(this),
                thisRow=_this.closest('tr'),
                nextTr=thisRow.next('tr');
            if(nextTr.hasClass('rowExpand-rowDetails')){ //�Ѿ�������ˣ�ֱ����ʾ/����
                nextTr.toggle();
            }else{ //û�й���������첢��ʾ
                var rowIndex=thisRow.index('tr.om-grid-row'),
                    rowData=self._getRowData(rowIndex),
                    rowDetails=rowDetailsProvider?rowDetailsProvider(rowData,rowIndex):'&#160;';
                thisRow.after('<tr class="rowExpand-rowDetails"><td colspan="'+(colCount-1)+'"><div class="rowExpand-rowDetails-content">'+rowDetails+'</div></td></tr>');
            }
            if(_this.hasClass('rowExpand-expanded')){
                _this.removeClass('rowExpand-expanded').parent().attr('rowspan',1);
            }else{
                _this.addClass('rowExpand-expanded').parent().attr('rowspan',2);
            }
            return false; //������onRowSelect��onRowClick�¼�
        });
    });
})(jQuery);/*
 * $Id: om-grid-sort.js,v 1.3 2012/03/15 06:14:47 linxiaomin Exp $
 * operamasks-ui omGrid 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 * 
 * Depends:
 *  om-grid.js
 */

(function($) {
	/**
	 * ��ҳ������ť��ʽ�����
	 */
	var pagerNvg = [
		{cls:"pFirst" , type:"first"},
		{cls:"pPrev" , type:"prev"},
		{cls:"pNext" , type:"next"},
		{cls:"pLast" , type:"last"},
		{cls:"pReload" , type:"reload"}
	];	
	function needChange(self , type){
		var oldPage = self._oldPage,
		    nowPage = self.pageData.nowPage;
		if("input" === type){
			return oldPage != $('.pControl input', self.element.closest('.om-grid')).val();
		}else if("reload" === type){
			return true;
		}else{
			return oldPage != nowPage;
		}
	}
	
    /**
     * ���omGrid������״̬���������ڵ�һ���Ͻ����˽������У��Ժ�ÿ��ȡ��ʱ���ǰ������������������ȡ�������Ҫ����������������ñ��������ɣ����ú��ٴ�ȡ��ʱ�͸���δ���й�����һ����<br/>
     * <b>ע�⣺�˷������������״̬����������ȡ����</b>
     * @function
     * @example
     *  $('.selector').omGrid('clearSort');
     */
    $['om']['omGrid'].prototype.clearSort=function(){
        var extraData=this.options.extraData;
        extraData.sortBy = undefined;
        extraData.sortDir = undefined;
        $('tr:first th[axis^="col"]',this.thead).removeClass('asc desc');
    }
    $.omWidget.addInitListener('om.omGrid',function(){
        var self=this,
            cm=this.options.colModel,
            tds=$('tr:first th[axis^="col"]',this.thead),
            $pDiv = this.pDiv;
        $(tds).each(function(index){
            var sortFn=cm[index].sort;
            if(sortFn){
                var _this=$(this).click(function(){
                    var sortCol = cm[index].name;
                    var removeClass = _this.hasClass('asc')?'asc'
                                    : _this.hasClass('desc')?'desc'
                                    : null;
                    var sortDir=(removeClass=='asc'?'desc':'asc');
                    tds.removeClass('asc desc');
                    _this.addClass(sortDir);
                    switch(sortFn){
                        case 'serverSide':
                            var extraData=self.options.extraData;
                            extraData.sortBy=sortCol;
                            extraData.sortDir=sortDir;
                            self.reload();
                            return;
                        case 'clientSide':
                            sortFn=function(obj1,obj2){
                                var v1=obj1[sortCol],v2=obj2[sortCol];
                                return v1==v2?0:v1>v2?1:-1;
                            };
                            break;
                        default:
                            // do nothing,keep sortFn==cm[index].sort
                    }
                    var datas = self.pageData.data;
                    if(removeClass==null){//��δ��������������
                        datas.rows=datas.rows.sort(sortFn);
                    }else{//�����ɽ��򣬻���������ֻ��Ҫ��ת���ݼ���
                        datas.rows=datas.rows.reverse();
                    }
                    self.refresh();
                });
                _this.children().first().append('<img class="om-grid-sortIcon" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="></img>');
            }
        });
        //������ҳ����ť���¼������Ϊ�ͻ�������ÿ�ζ�Ҫ����������״̬
        for(var i=0,len=pagerNvg.length; i<len; i++){
        	(function(i){
        		$pDiv.find("."+pagerNvg[i].cls).click(function(){
					var change = needChange(self , pagerNvg[i].type);
					tds.each(function(index){
						var $headerCol = $(this);
						if(change && ($headerCol.hasClass('asc') || $headerCol.hasClass('desc')) &&  "serverSide" !== cm[index].sort){
							$headerCol.removeClass('asc desc');
						}
					});
				});	 
        	})(i);
		}
        $('.pControl input', $pDiv).keydown(function(e){
        	var change = needChange(self , "input");
        	if (e.keyCode == $.om.keyCode.ENTER) {
        		tds.each(function(index){
					var $headerCol = $(this);
					if(change && ($headerCol.hasClass('asc') || $headerCol.hasClass('desc')) &&  "serverSide" !== cm[index].sort){
						$headerCol.removeClass('asc desc');
					}
				});
        	}
        });
    });
})(jQuery);/*
 * $Id: om-itemselector.js,v 1.9 2012/03/20 02:41:56 linxiaomin Exp $
 * operamasks-ui omCombo 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 *  om-mouse.js
 *  om-sortable.js
 */
;(function($) {
    /**
     * @name omItemSelector
     * @class �������������������ѡ�б�򣬿��Դ���߽�һЩitem�Ƶ��ұߣ�Ҳ���Դ��ұ߽�һЩitem�Ƶ���ߡ�<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ�ñ�������Դ��Ҳ����ʹ��Զ������Դ</li>
     *      <li>֧������϶��������</li>
     *      <li>�������õġ����ơ������ơ���ȫ�����ơ���ȫ�����ơ������ơ������ơ����ö������õס�����</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#itemselector').omItemSelector({
     *         dataSource:[
     *                  {text:'Java',value:'1'},
     *                  {text:'JavaScript',value:'2'},
     *                  {text:'C',value:'3'},
     *                  {text:'PHP',value:'4'},
     *                  {text:'ASP',value:'5'}
     *         ],
     *         width:250,
     *         height:200
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;div id="itemselector"/>
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omItemSelector', {
        options: /** @lends omItemSelector#*/{
             /**
              * �����ȡ�
              * @type String
              * @default '250px'
              * @example
              * width : '300px'
              */
             width : '250px',
             /**
              * ����߶ȡ�
              * @type String
              * @default '200px'
              * @example
              * height : '300px'
              */
            height : '200px',
            /**
              * ����Դ���ԣ���������Ϊ����̨��ȡ���ݵ�URL�����ߡ�JSON���ݡ�
              * @type Array[JSON],URL
              * @default []
              * @example
              * dataSource : '/data/items.json' 
              * ����
              * dataSource : [{"value":"001","text":"����"},{"value":"002","text":"����"}]
              * ������������(���ַǱ�׼��itemDataһ��Ҫ���clientFormatterʹ��)
              * dataSource : [{"value":"001","name":"����"},{"value":"002","name":"����"}]
              */
            dataSource : [],
            /**
              * ��ʼֵ����dataSource:[{text:'abc',value:1},{text:'def',value:2},{text:'xyz',value:3}]��value:[2]���������ʾ1��3�������ұ���ʾ��2����
              * @type Array[JSON]
              * @default []
              * @example
              * value : [1,3]
              */
            value : [],
            /**
              * ÿ��dataSource��ÿ��item�����ʾ���б��С�Ĭ�Ͻ���ʾitem���ݵ�text����ֵ��
              * @type Function
              * @default ��
              * @example
              * //����{text:'�й�',value:'zh_CN'}����ʾ��'�й�(zh_CN)'����
              * clientFormatter  : function(itemData,index){
              *     return itemData.text+'('+itemData.value)+')';//����һ��html����
              * }
              * 
              * //����{name:'����',role:'����',value:'PM'}����ʾ�ɺ�ɫ��'����(����)'����
              * //����{name:'����',role:'��ͨԱ��',value:'EMP'}����ʾ�ɺ�ɫ��'����'����
              * clientFormatter  : function(itemData,index){
              *     if(itemData.role=='����'){
              *         return '&lt;font color="red">'+itemData.name+'('+itemData.value)+')&lt;/font>';
              *     }else{
              *         return itemData.name;
              *     }
              * }
              */
            clientFormatter : false,
            /**
              * ��߿�ѡ��ı��⡣
              * @name omItemSelector#availableTitle
              * @type String
              * @default '��ѡ��'
              * @example
              * availableTitle : '�ɼ�����û���'
              */
            //availableTitle : $.om.lang.omItemSelector.availableTitle,
            /**
              * �ұ���ѡ��ı��⡣
              * @name omItemSelector#selectedTitle
              * @type String
              * @default '��ѡ��'
              * @example
              * selectedTitle : '�Ѽ�����û���'
              */
            //selectedTitle : $.om.lang.omItemSelector.selectedTitle,
            /**
              * �Ƿ��Զ�������Ϊtrue��ÿ�ν�item���ƻ�����ʱ�����item�������򣨰���dataSource������Դ��˳�򣩡�<b>ע�⣺���ô˹��ܺ��޷�ʹ���϶������ܣ�Ҳ������ʾ�����ơ������ơ����ö������õס��⼸����ť��</b>
              * @type Boolean
              * @default false
              * @example
              * autoSort : true
              */
            autoSort : false,
            /**
              * ��Ajax���ص�ԭʼ���ݵĽ���Ԥ����ĺ��������в���data�Ƿ��������ص����ݡ�
              * @type Function
              * @field
              * @default ��
              * @example
              * preProcess  : function(data){
              *     return data;//���ﷵ�ش���������
              * }
              */
            preProcess : function(data){
                return data;
            },
            /**
              * ��������ʾ��Щ����ͼ�ꡣ��ͼ�����ŷֱ��ǣ�<ul>
              *     <li>0�����¿հ�����</li>
              *     <li>1����ȫ�����ơ�ͼ��</li>
              *     <li>2�������ơ�ͼ��</li>
              *     <li>3�������ơ�ͼ��</li>
              *     <li>4����ȫ�����ơ�ͼ��</li>
              *     <li>5�����ö���ͼ��</li>
              *     <li>6�������ơ�ͼ��</li>
              *     <li>7�������ơ�ͼ��</li>
              *     <li>8�����õס�ͼ��</li>
              * </ul>�����磺<br/><ul>
              *     <li>[2,3]��ʾ����ʾ�����ơ�ͼ��͡����ơ�ͼ�꣬�ҡ����ơ�ͼ����ǰ�����ơ�ͼ���ں�</li>
              *     <li>[3,2]��ʾ����ʾ�����ơ�ͼ��͡����ơ�ͼ�꣬�ҡ����ơ�ͼ����ǰ�����ơ�ͼ���ں�</li>
              *     <li>[1,2,3,4,5,6,7,8]��ʾ��ʾ����ͼ�꣬�Ұ�������ű�ʾ��˳��</li>
              *     <li>[1,2,3,4,0,5,6,7,8]��ʾ��ʾ����ͼ�꣬�Ұ�������ű�ʾ��˳�����С�ȫ�����ơ��͡��ö���֮���и��հ�����</li>
              *     <li>[1,0,2,0,3,0,4]��ʾ��ʾ��ȫ�����ơ��������ơ��������ơ�����ȫ�����ơ�4��ͼ�꣬����������֮�䶼�и��հ�����</li>
              * </ul>
              * @type Arrat[Number]
              * @default [1,2,3,4]
              * @example
              * toolbarIcons : [1,2,0,3,5,6,7,8]
              */
            toolbarIcons : false,
            /**
             * ��Ajax��ʽ�������ݳ���ʱ�Ļص��������������������һЩ�������������Ի��ķ�ʽ��ʾ�û���
             * @event
             * @param xmlHttpRequest XMLHttpRequest����
             * @param textStatus  ��������
             * @param errorThrown  ������쳣����
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onError:function(xmlHttpRequest, textStatus, errorThrown,event){ 
             *      alert('ȡ������');
             *  } 
             */
            onError : jQuery.noop,
            /**
             * ��Ajax��ʽ�������ݳɹ�ʱ�Ļص��������˷�������Ⱦ��ѡ��item֮ǰִ�С�
             * @event
             * @param data Ajax���󷵻ص�����
             * @param textStatus ��Ӧ��״̬
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onSuccess:function(data, textStatus, event){
             *     if(data.length==0){
             *          alert('û�����ݣ�');
             *     } 
             * }
             */
            onSuccess : jQuery.noop,
            /**
             * ����߽�item�Ƶ��ұ�֮ǰִ�еĶ������������false����item��������ƶ����û�����������¼��н���һЩ�������õĴ�����������˷���Ȼ��return selectedItems.length &lt; 3����ʵ�֡����ֻ��ѡ��3��item���Ĺ���
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onBeforeItemSelect:function(itemDatas,event){
             *     alert('�������뵽:'+itemDatas.length+'��Ⱥ��');
             * }
             */
            onBeforeItemSelect : jQuery.noop,
            /**
             * ���ұ߽�item�Ƶ����֮ǰִ�еĶ������������false����item��������ƶ����û�����������¼��н���һЩ�������õĴ���������ʵ�֡�Ա���ǻ�����ɫ���������˳��ý�ɫ���Ĺ���
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onBeforeItemDeselect:function(itemDatas,event){
             *     $.each(itemDatas,function(index,data){
             *         if(data.text=='Ա��'){
             *             alert('Ա���ǻ�����ɫ���������˳��ý�ɫ��');
             *             return false;
             *         } 
             *     });
             * }
             */
            onBeforeItemDeselect : jQuery.noop,
            /**
             * ����߽�item�Ƶ��ұ�֮��ִ�еĶ�����
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onItemSelect:function(itemDatas,event){
             *      alert('��ո�ѡ����'+itemDatas.length+'����Ŀ');
             * }
             */
            onItemSelect : jQuery.noop,
            /**
             * ���ұ߽�item�Ƶ����֮��ִ�еĶ�����
             * @event
             * @param itemDatas �����ƶ���item��Ӧ��������ɵ����飬����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemDatas��[{text:'A',value:0}]���ƶ�BʱitemDatas��[{text:'B',value:1}]��ͬʱ�ƶ�A��BʱitemDatas��[{text:'A',value:0},{text:'B',value:1}]
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onItemDeselect :function(itemDatas,event){
             *      alert('��ո�ȥ����'+itemDatas.length+'����Ŀ');
             * }
             */
            onItemDeselect  : jQuery.noop,
            /**
             * �ı�����֮��ִ�еĶ�����
             * @event
             * @param itemData �����ƶ���item��Ӧ�����ݣ�����dataSource��[{text:'A',value:0},{text:'B',value:1}]�����ƶ�AʱitemData��{text:'A',value:0}���ƶ�BʱitemData��{text:'B',value:1}
             * @param oldIndex ԭ������ţ���0��ʼ��
             * @param newIndex �µ���ţ���0��ʼ��
             * @param event jQuery.Event����
             * @type Function
             * @example
             * onSort :function(itemData,oldIndex,newIndex,event){
             *      alert('��ոս���'+itemData.text+'�ӵ�'+(oldIndex+1)+'���Ƶ��˵�'+(newIndex+1)+'��');
             * }
             */
            onSort  : jQuery.noop
        },
        _create:function(){
            this.element.addClass('om-itemselector om-widget').html('<table style="height:100%;width:100%" cellpadding="0" cellspacing="0"><tr><td class="om-itemselector-leftpanel"></td><td class="om-itemselector-toolbar"></td><td class="om-itemselector-rightpanel"></td></tr></table>');
            var tds=$('td',this.element);
            this.leftPanel=$('<fieldset><legend class="om-itemselector-title"><span></span></legend><div class="om-itemselector-items"><dl></dl></div></fieldset>').appendTo(tds.eq(0));
            this.toolbar=$('<div></div>').appendTo(tds.eq(1));
            this.rightPanel=this.leftPanel.clone().appendTo(tds.eq(2));
        },
        _init:function(){
            var op=this.options,
                dataSource=op.dataSource;
            $('>legend>span',this.leftPanel).html($.om.lang._get(op,"omItemSelector","availableTitle"));
            $('>legend>span',this.rightPanel).html($.om.lang._get(op,"omItemSelector","selectedTitle"));
            this.element.css({width:op.width,height:op.height});
            this._buildToolbar();
            this._resizeFieldSet(); //��������fieldset��С
            this._bindEvents();
            if(typeof dataSource ==='string'){
                var self=this;
                $.ajax({
                    url: dataSource,
                    method: 'GET',
                    dataType: 'json',
                    success: function(data, textStatus){
                        if (self._trigger("onSuccess",null,data,textStatus) === false) {
                            return;
                        }
                        data=op.preProcess(data);
                        op.dataSource=data;
                        self._buildList();
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                    	self._trigger("onError",null,XMLHttpRequest, textStatus, errorThrown);
                    }
                });
            }else{
                this._buildList();
            }
        },
        _buildToolbar:function(){
            var op=this.options,
                toolbarIcons=op.toolbarIcons,
                autoSort=op.autoSort,
                html='',
                ALL_ICONS=['space','addAll','add','remove','removeAll','moveTop','moveUp','moveDown','moveBottom'];
            if(!jQuery.isArray(toolbarIcons)){
                toolbarIcons=[1,2,3,4];
            }
            $.each(toolbarIcons,function(index,data){
                var icon=ALL_ICONS[data],title;
                if(!icon || (autoSort&&data>3) ){
                    //toolbar��Ų��Բ���ʾͼ�꣬autoSort=trueʱ����ʾ����ͼ��
                }else{
                    html+='<div class="om-icon om-itemselector-tbar-'+icon+'"'+' title="'+($.om.lang._get({},"omItemSelector",icon+'IconTip') || '')+'"></div>';
                }
            });
            this.toolbar.html(html);
        },
        _resizeFieldSet:function(){
            var lp=this.leftPanel,
                rp=this.rightPanel,
                leftItemsContainer=$('.om-itemselector-items',lp),
                rightItemsContainer=$('.om-itemselector-items',rp),
                H=lp.parent().innerHeight()-leftItemsContainer.offset().top+lp.offset().top,
                W=($('tr',this.element).innerWidth()-this.toolbar.outerWidth())/2,
                innerW=lp.outerWidth(W).innerWidth();
            leftItemsContainer.outerHeight(H).width(innerW);
            rightItemsContainer.outerHeight(H).width(innerW);
        },
        _buildList:function(){
            var op=this.options;
                dataSource = op.dataSource,
                value = op.value,
                fmt=op.clientFormatter,
                leftHtml='',
                rightHtml='',
                // {text:'abc',value:2}��value�Ƿ���value:[0,2,4]������������
                inArray=function(data,valueArr){
                    for(var i=0,len=valueArr.length;i<len;i++){
                        if(data.value===valueArr[i]){
                            return true;
                        }
                    }
                    return false;
                },
                buildHtml=fmt?function(index,data){
                    return '<dt _index="'+index+'">'+fmt(data,index)+'</dt>';
                }:function(index,data){
                    return '<dt _index="'+index+'">'+data.text+'</dt>';
                };
            if($.isArray(dataSource) && jQuery.isArray(value)){
                $.each(dataSource,function(index,data){
                    if(inArray(data,value)){//��value�У�Ҫ�ŵ��ұ�
                        rightHtml+=buildHtml(index,data);
                    }else{//����value��,�ŵ����
                        leftHtml+=buildHtml(index,data);
                    }
                });
            }
            $('.om-itemselector-items>dl',this.leftPanel).html(leftHtml);
            $('.om-itemselector-items>dl',this.rightPanel).html(rightHtml);
            this._makeDraggable();
        },
        _makeDraggable:function(){
            var self=this,
                autoSort=this.options.autoSort,
                allItems=$('.om-itemselector-items>dl',this.element);
            allItems.attr('onselectstart',"javascript:return false;");//��ֹѡ������϶�����
            if(!autoSort){
                allItems.sortable({
                    placeholder:'om-itemselector-placeholder',
                    start:function(ui,event){
                        $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                        ui.item.addClass('om-state-highlight');
                        ui.item.oldIndex = ui.item.index(); 
                    },
                    stop:function(ui,event){
                    	self._trigger("onSort",null,self.options.dataSource[ui.item.attr('_index')],ui.item.oldIndex,ui.item.index());
                    }
                }).disableSelection();
            }
        },
        _bindEvents:function(){
            var self=this,
                toolbar=this.toolbar,
                op=this.options;
            this.leftPanel.delegate('.om-itemselector-items>dl>dt','click.omItemSelector',function(){
                $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                $(this).addClass('om-state-highlight');
            });
            this.rightPanel.delegate('.om-itemselector-items>dl>dt','click',function(){
                $('.om-itemselector-items>dl>dt',self.element).removeClass('om-state-highlight');
                $(this).addClass('om-state-highlight');
            });
            //˫��
            this.leftPanel.delegate('.om-itemselector-items>dl>dt','dblclick',function(){
                self._moveItemsToTarget('.om-state-highlight',true);
            });
            this.rightPanel.delegate('.om-itemselector-items>dl>dt','dblclick',function(){
                self._moveItemsToTarget('.om-state-highlight',false);
            });
            //����
            $('.om-itemselector-tbar-add',toolbar).click(function(){
                self._moveItemsToTarget('.om-state-highlight',true);
            });
            //����
            $('.om-itemselector-tbar-remove',toolbar).click(function(){
                self._moveItemsToTarget('.om-state-highlight',false);
            });
            //ȫ������
            $('.om-itemselector-tbar-addAll',toolbar).click(function(){
                self._moveItemsToTarget('',true);
            });
            //ȫ������
            $('.om-itemselector-tbar-removeAll',toolbar).click(function(){
                self._moveItemsToTarget('',false);
            });
            //autoSort=falseʱ�ſ�������
            if(!op.autoSort){
                var selector='.om-itemselector-items>dl>dt.om-state-highlight:first';
                //�ö�
                $('.om-itemselector-tbar-moveTop',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==0)
                        return;
                    selectedItems.prependTo($('.om-itemselector-items>dl',panel));
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,0);
                });
                //�õ�
                $('.om-itemselector-tbar-moveBottom',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index(),
                        newIndex=selectedItems.siblings().size();
                    if(selectedItems.size()==0 || oldIndex==newIndex)
                        return;
                    selectedItems.appendTo($('.om-itemselector-items>dl',panel));
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,newIndex);
                });
                //����
                $('.om-itemselector-tbar-moveUp',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==0)
                        return;
                    selectedItems.insertBefore(selectedItems.prev());
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,oldIndex-1);
                });
                //����
                $('.om-itemselector-tbar-moveDown',toolbar).click(function(){
                    var panel=self.rightPanel,
                        selectedItems=$(selector,panel);
                    if(selectedItems.size()==0){
                        panel=self.leftPanel;
                        selectedItems=$(selector,panel);
                    }
                    var oldIndex=selectedItems.index();
                    if(selectedItems.size()==0 || oldIndex==selectedItems.siblings().size())
                        return;
                    selectedItems.insertAfter(selectedItems.next());
                    self._trigger("onSort",null,op.dataSource[selectedItems.attr('_index')],oldIndex,oldIndex+1);
                });
            }
        },
        _moveItemsToTarget:function(selector,isLeftToRight){
            var formPanel=isLeftToRight?this.leftPanel:this.rightPanel,
                selectedItems=$('.om-itemselector-items>dl>dt'+selector,formPanel);
            if(selectedItems.size()==0)
                return;
            var toPanel=isLeftToRight?this.rightPanel:this.leftPanel,
                op=this.options,
                itemData=[];
            selectedItems.each(function(){
                itemData.push(op.dataSource[$(this).attr('_index')]);
            });
            //�ȴ���onBeforeItemSelect��onBeforeItemDeselect�¼���Ȼ���ƶ�������onItemSelect��onItemDeselect�¼�
            if(isLeftToRight){
                if(this._trigger("onBeforeItemSelect",null,itemData)===false){
                    return;
                }
                selectedItems.appendTo($('.om-itemselector-items>dl',toPanel));
                this._trigger("onItemSelect",null,itemData);
            }else{
                if(this._trigger("onBeforeItemDeselect",null,itemData)===false){
                    return;
                }
                selectedItems.appendTo($('.om-itemselector-items>dl',toPanel));
                this._trigger("onItemDeselect",null,itemData);
            }
            //�������autoSort=true���Զ�����
            if(op.autoSort){
                var result=$('.om-itemselector-items>dl>dt',toPanel).sort(function(a,b){
                    return $(a).attr('_index')-$(b).attr('_index');
                });
                selectedItems.parent().append(result);
            }
        },
        
        /**
         * �õ������������valueֵ��
         * @function
         * @name omItemSelector#value
         * @param v ���õ�ֵ�������ñ�ʾ��ȡֵ
         * @returns ���û�в���ʱ��ʾgetValue()����combo��valueֵ������dataSource:[{text:'abc',value:true},{text:'def',value:2},{text:'xyz',value:'x'}]ѡ���˵�2���͵���������getValue����[2,'x']������в���ʱ��ʾsetValue(newValue)����jQuery����
         * 
         */
        value:function(newValue){
            if(arguments.length==0){ //getValue
                var op=this.options,
                    selectedItems=$('.om-itemselector-items>dl>dt',this.rightPanel),
                    returnValue=[];
                selectedItems.each(function(){
                    returnValue.push(op.dataSource[$(this).attr('_index')].value);
                });
                return returnValue;
            }else{ //setValue
                if($.isArray(newValue)){
                    this.options.value=newValue;
                    this._buildList();
                }
            }
        }
    });
    
    $.om.lang.omItemSelector = {
        availableTitle:'��ѡ��',
        selectedTitle:'��ѡ��',
        addIconTip:'����',
        removeIconTip:'����',
        addAllIconTip:'ȫ������',
        removeAllIconTip:'ȫ������',
        moveUpIconTip:'����',
        moveDownIconTip:'����',
        moveTopIconTip:'�ö�',
        moveBottomIconTip:'�õ�'
    };
})(jQuery);/*
 * $Id: om-menu.js,v 1.37 2012/05/08 06:27:13 luoyegang Exp $
 * operamasks-ui om-menu.js 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *	om-core.js
 */
;(function($){
    /**
     * @name omMenu
     * @class menu�����menu���֧������������֯��ʽ���ֱ�Ϊҳ��domԪ�ء�json���ݡ�urlȡֵ��<br/>
     *        ������json��ʽΪ{id:"",label:"",icon:"img/abc.png",seperator:true,disabled:true,children:[{},{}]},���е�id��label�������ã�<br/>
     *        seperatorΪ�ָ��ߣ��������Ϊtrue������ڵ�ǰmenuItem��������һ���ָ��ߡ�<br/><br/>
     *        ���Ĭ�ϻᴦ�������Ϊ�����оٵ�6������id��label��icon��seperator��disabled��children��<br/>
     *        ������Զ�����ĳ�����ԣ�����url��ϵͳ���ᴦ�������ڵ����ʱ�򽻸�onSelect��������ͨ��item.url��ȡurl������
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>֧��icon�Զ���</li>
     *      <li>�����¼�������ƣ���������json���ԣ��¼�ִ��ʱ��ȡ���ݽ��д���</li>
     *      <li>֧�ֶ�̬�ı�menuItem��disabled����</li>
     *      <li>֧���Ҽ��˵�������ָ��λ�ã��Զ���λ</li>
     *      <li>֧�ֲ˵����飬ʹ��showSeparator��������</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *      //menu����
     *      $('#contextMenu').omMenu({
     *          contextMenu : true,
     *          dataSource : '../../omMenu.json'
     *      });
     *      //��ʾmenu�˵�
     *      $('#contextMenu_test').bind('contextmenu',function(e){
     *           $('#contextMenu').omMenu('show',e);
     *      });
     * });
     * &lt;/script&gt;
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omMenu', {
        options: /**@lends omMenu# */{
            /**
             * �Ƿ�Ϊ�Ҽ��˵�
             * @type Boolean 
             * @default false
             * @example
             * $("#menu_1").omMenu({contextMenu:true});
             */
            contextMenu : false,
            
            /**
             * ����ȣ����menuItem���ֳ��ȳ���������ȣ��������أ�����ƶ����������ȫ����ʾ
             * @type Number 
             * @default 200
             * @example
             * $("#menu_1").omMenu({maxWidth:150});
             */
            maxWidth : 200,
            
            /**
             * ��С��ȣ����menuItem���ֳ�������minWidth����ʹ�ÿհ���䡣
             * @type Number 
             * @default 100
             * @example
             * $("#menu_1").omMenu({minWidth:50});
             */
            minWidth : 100,
            
            /**
             * ����Դ����������Ϊjson���ݣ�Ҳ������url�������������Ϊlocal��Ĭ��ʹ��ҳ���domԪ������Menu
             * @type String 
             * @default local
             * @example
             * $("#menu_1").omMenu({dataSource:'menuData.json'});
             */
            dataSource : 'local'
            
            /**
             * �����ѡ��menu��ʱ�򴥷����¼���item������ǰmenuItem���������ݡ�
             * @name omMenu#onSelect
             * @event
             * @param item ��ǰmenuItem����������
             * @param event jQuery.Event����
             * @type Function
             * @default ��
             * @example
             * $("#menu_1").omMenu({
             *         onSelect:function(item,event){
             *            location.href = item.url;
             *         }
             * });
             */
        },
        
        /**
         * ��ʾmenu��menu�����Լ���ʾ���������show����������ʾ
         * @name omMenu#show
         * @function
         * @param triggerEle ������ʾ�¼��Ķ���������button�����ľ���button����
         * @example
         * //ͨ�����button��ʾmenu
         *  $('#btn').click(function(){
         *     $('#menu_simple').omMenu('show',this);
         *});
         */
        show : function(triggerEle){
            var self = this, options = self.options , top , left, element = self.element;
            var offSet = $(triggerEle).offset();
            if( options.contextMenu ){
                top = triggerEle.pageY;
                left = triggerEle.pageX;
                triggerEle.preventDefault();
                triggerEle.stopPropagation();
                triggerEle.cancelBubble=true; //IE
            }else{
                var buttomWidth = parseInt($(triggerEle).css('borderBottomWidth').replace('px',''));
                top = offSet.top +  $(triggerEle).height() + (buttomWidth != 'NaN'?buttomWidth:0) + 1; //1px��Ϊ���ھ���
                left = offSet.left +  1;
            }
            var parent = element.parent();
            while(parent.css('position') == 'static' && parent[0].nodeName != 'BODY'){
                parent = parent.parent();
            }
            top -= parent.offset().top;
            left -=parent.offset().left;
            
            if((left + element.outerWidth()) > document.documentElement.clientWidth){ //���ұ߾�����̵�ʱ��Ὣ��ʾ����������
                left = left - element.outerWidth() - 20;
            }
            $(element).css({"top":top,'left':left}).show();
            $(element).children("ul.om-menu").show();
            $(element).children("ul.om-menu").children().each(function(index,li){
                if($(li).find("span:first").hasClass('om-menu-item-sep')){
                    $(li).find("span:first").width('98%'); //�ָ������
                }else{
                    var width = $(element).width()*0.7;
                    if($(li).find("span:first").width() > width){
                        $(li).find("span:first").width($(li).attr('aria-haspopup')?width-15:width); //ȥ��icon��padding
                    }
                }
            });
        },
        
        /**
         * ����menu������֮������menu��ǰ��״̬��
         * @name omMenu#hide
         * @function
         * @example
         * //����hide����
         *  $('#btn').click(function(){
         *     $('#menu_simple').omMenu('hide');
         *});
         */
        hide : function(){
            this._hide();
        },
        
        /**
         * ��ĳ��menuitem����Ϊdisabled������֮��menuitem�����ᴥ���¼���������Ӳ˵������ܴ��Ӳ˵���������menuItem��
         * @name omMenu#disableItem
         * @function
         * @param itemId menuItem��ID
         * @example
         * //����disableItem����
         *  $('#btn').click(function(){
         *     $('#menu_simple').omMenu('disableItem','001');
         *});
         */
        disableItem : function(itemId){
            this.element.find("#"+itemId)
                        .addClass("om-state-disabled")
                        .unbind(".menuItem");
        },
        /**
         * ��ĳ��menuitem����Ϊenable��
         * @name omMenu#enableItem
         * @function
         * @param itemId menuItem��ID
         * @example
         * //����enableItem����
         *  $('#btn').click(function(){
         *     $('#menu_simple').omMenu('enableItem','001');
         *});
         */
        enableItem : function(itemId){
            var self = this , element = self.element;
            var cli = element.find("#"+itemId);
                cli.removeClass("om-state-disabled");
                self._bindLiEvent(cli);
        },
        destroy : function(){
        	var $doc = $(document),
        		handler;
        	while(handler = this.globalEvent.pop()){
        		$doc.unbind(".omMenu" , handler);
        	}
        },
        _create:function(){
            // omMenu �� options ������֧�ֲ���ȫ�棬ʵ����Ҳ�޶���Ҫ
            var self = this , options = self.options , 
                $ele = self.element,
                source = options.dataSource;
            $ele.addClass('om-menu-container om-menu-content om-corner-all');
            $ele.css('position','absolute');
            if(source) {
                if(source != 'local'){
                     if(typeof source == 'string'){
                         self._ajaxLoad($ele,source);
                     }else if(typeof source == 'object'){
                         $ele.append(self._appendNodes.apply(self, [source]));
                         self._bindEvent();
                     }
                }else{
                    var firstMenu = $ele.children("ul").addClass("om-menu");
                    self._parseDomMenu(firstMenu);
                    self._bindEvent();
                }
             }
        },
        
        _init : function(){
            var opts = this.options, 
                $ele = this.element;
            $ele.css({"minWidth" : opts.minWidth,"maxWidth" : opts.maxWidth-10});
            if($.browser.msie && $.browser.version == '6.0') {
                $ele.css("width", opts.minWidth + 30);
            }
            if($.browser.msie && $.browser.version == '7.0') {
                $ele.css("width", opts.maxWidth - 10);
            }
        },
        
        _ajaxLoad : function(target,source){
             var self = this ;
             $.ajax({
                 url : source,
                 method: 'POST',
                 dataType: 'json',
                 success: function(data){
                     target.append(self._appendNodes.apply(self, [data]));
                     self._bindEvent();
                 }
             });
        },
        _appendNodes : function(source,index){
            var self = this , menuHtml = [];
            var ulClass = (index == undefined)?"om-menu":"om-menu-content";
            var display = (index == undefined)?"block":"none";
            var imgClass = (index == undefined)?"om-menu-icon" : "om-menu-icon om-menu-icon-child";
            menuHtml.push("<ul class=\""+ulClass+" om-corner-all\" style=\"display:"+display+";\">");
            var childrenHtml = [];
            $(source).each(function(index , item){
                    if(item.children != null){
                        if(item.disabled === true || item.disabled == "true"){
                            childrenHtml.push("<li id=\""+item.id+"\" aria-haspopup=\"true\"  class=\"om-state-disabled\">");
                        }else{
                            childrenHtml.push("<li id=\""+item.id+"\"  aria-haspopup=\"true\">");
                        }
                        childrenHtml.push("<a href=\"javascript:void(0)\" class=\"om-corner-all om-menu-indicator\">");
                        item.icon?childrenHtml.push("<img class=\""+imgClass+"\" src=\""+item.icon+"\">"):null;
                        item.icon?childrenHtml.push("<span>"+item.label+"</span>"):childrenHtml.push("<span style=\"margin-left:2em;\">"+item.label+"</span>");
                        childrenHtml.push("<span class=\"ui-icon-span\" role=\"popup\"></span>");
                        childrenHtml.push("</a>");
                        childrenHtml.push(self._appendNodes(item.children,index++));
                        childrenHtml.push("</li>");
                    }else{
                        if(item.disabled === true || item.disabled == "true"){
                            childrenHtml.push("<li id=\""+item.id+"\"  class=\"om-state-disabled\">");
                        }else{
                            childrenHtml.push("<li id=\""+item.id+"\" >");
                        }
                        childrenHtml.push("<a href=\"javascript:void(0)\" class=\"om-corner-all om-menu-indicator\">");
                        item.icon?childrenHtml.push("<img class=\""+imgClass+"\" src=\""+item.icon+"\">"):null;
                        item.icon?childrenHtml.push("<span>"+item.label+"</span>"):childrenHtml.push("<span style=\"margin-left:2em;\">"+item.label+"</span>");
                        childrenHtml.push("</a>");
                        childrenHtml.push("</li>");
                    }
                    if(item.seperator == "true" || item.seperator == true){
                        childrenHtml.push("<li class=\"om-menu-sep-li\"  ><span class=\"om-menu-item-sep\">&nbsp;</span></li>");
                    }
                    var li = $(self.element).attr('id') + "_"+item.id;
                    $(self.element).data(li , item);
            });
            menuHtml.push(childrenHtml.join(""));
            menuHtml.push("</ul>");
            return menuHtml.join("");
        },
        
        //����ҳ���дdom�ڵ�����
        _parseDomMenu : function(element){
            if(element.parent().attr("aria-haspopup") == "true"){ //�ж��Ƿ�Ϊ��һ֡
                element.addClass("om-menu-content om-corner-all");
            }
            element.css('display','none');
            var lis = element.children();
            for(var i=0;i<lis.length;i++){
                var li = $(lis[i]) , liCul = li.children("ul");
                if(liCul.length > 0){
                    li.attr("aria-haspopup","true");
                    li.find("span[role='popup']").addClass("ui-icon-span");
                    this._parseDomMenu(liCul);
                }
                li.find("a").addClass("om-corner-all om-menu-indicator");
                li.find("img").addClass("om-menu-icon");
            }
        },
        _showChildren : function(li){
            var self = this;
            if(li && li.length > 0){
                var li_child_ul = li.children("ul").eq(0);
                li_child_ul.css({"minWidth":this.options.minWidth, "top":li.position().top });
                var left = li.width();
                if((2*left + li.offset().left) > document.documentElement.clientWidth){ //���ұ߾�����̵�ʱ��Ὣ��ʾ����������
                    left = - left;
                }
                
                li_child_ul.css("left",left);
                li_child_ul.show();
                
                li_child_ul.children().each(function(index,li){
                    if($(li).find("span:first").hasClass('om-menu-item-sep')){
                        $(li).find("span:first").width('98%'); //�ָ������
                    }else{
                        if(li_child_ul.width() > self.options.maxWidth){
                            li_child_ul.width(self.options.maxWidth);
                            width = self.options.maxWidth * 0.6;
                        }else{
                            li_child_ul.width(li_child_ul.width() + 10);
                            width = li_child_ul.width() * 0.6;
                        }
                        $(li).find("span:first").width(width);
                    }
                });
            }
        },
        _hideChildren : function(li){
            li.children("ul").eq(0).hide();
        },
        
        _bindLiEvent : function(li){
            var self = this, element = self.element, options = self.options ;
            $(li).bind("mouseenter.menuItem",function(){
                var self_li = $(this);
                self_li.addClass("om-menu-item-hover");
                if(self_li.attr("aria-haspopup")){
                    setTimeout(function(){
                        self._showChildren(self_li);
                    },200);
                }
            }).bind("mouseleave.menuItem",function(){
                var self_li = $(this);
                self_li.removeClass("om-menu-item-hover");
                setTimeout(function(){
                    self_li.children("ul").hide();
                },200);
            }).bind("mousedown.menuItem",function(event){
                var item = $(element).data($(element).attr("id")+"_"+this.id);
                if(options.onSelect){
                	self._trigger("onSelect",event,item);
                    event.preventDefault();
                    event.stopPropagation();
                    event.cancelBubble=true; //IE
                }
            });
        },
        
        _bindEvent : function(){
            var self = this , element = self.element, options = self.options ,
            	uls = element.find("ul"),
            	lis = element.find("li"),
            	$doc = $(document),
            	tempEvent;
            for(var i=0 ; i<lis.length ; i++){
                if(!$(lis[i]).hasClass("om-state-disabled")){
                   self._bindLiEvent(lis[i]);
                }
            };
            for(var j=0 ; j<uls.length ; j++){
                $(uls[j]).bind("mouseleave.menuContainer",function(){
                    var ul = $(this);
                    if(ul.parent().attr("aria-haspopup") == "true"){
                        ul.hide();
                    }
                });
            };
            this.globalEvent = [];
            $doc.bind('mousedown.omMenu',tempEvent=function(){
                self._hide();
            });
            this.globalEvent.push(tempEvent);
            $doc.bind('keyup.omMenu' , tempEvent=function(e){
                var key = e.keyCode,
                    keyEnum = $.om.keyCode;
                switch (key) {
                case keyEnum.DOWN: //down
                    self._selectNext();
                    break;
                case keyEnum.UP: //up
                    self._selectPrev();
                    break;
                case keyEnum.LEFT: //left
                    self._hideRight();
                    break;
                case keyEnum.RIGHT: //right
                    self._showRight();
                    break;
                case keyEnum.ENTER: //enter �����ڵ�ǰmenu���Ǵ򿪵�menuǰ����
                    if(element.css("display") == "block")
                        self._backfill(element);
                    break;
                case keyEnum.ESCAPE: //esc
                    self._hide();
                    break;
                default:
                   null;
                }
            });
            this.globalEvent.push(tempEvent);
            $doc.bind('keydown.omMenu' , tempEvent=function(e){//fixed AOM-430
            	if(e.keyCode >= 37 && e.keyCode <= 40){
            		e.preventDefault();
            	}
            });
            this.globalEvent.push(tempEvent);
        },
        
        _hide : function(){
            var self = this , element = self.element;
            element.find("ul").css("left","none");
            element.find("li.om-menu-item-hover").each(function(index,item){
                $(item).removeClass("om-menu-item-hover");
            });
            element.hide();
        },
        /**
         * �ų����ָ����ĸ��ţ��ҵ���һ��menuItem
         * ����li
         * @param liMenuItem
         */
        _findNext : function(liMenuItem){
            var next,
                oldItem = liMenuItem;
            while( (next=liMenuItem.next("li")).length !== 0 ){
            	if(!next.hasClass("om-menu-sep-li") && !next.hasClass("om-state-disabled")){
            		return next;
            	}
            	liMenuItem = next;
            }
            //���û�У�����ϵ�������һ��
            var item = oldItem.parent().find("li:first");
            while(item.length !== 0 && item != oldItem){
            	if(!item.hasClass("om-menu-sep-li") && !item.hasClass("om-state-disabled")){
            		return item;
            	}
            	item = item.next("li");
            }
        },
        /**
         * �ų����ָ����ĸ��ţ��ҵ�ǰһ��menuItem
         * ����li
         * @param liMenuItem
         */
        _findPrev : function(liMenuItem){
            var prev,
            	oldItem = liMenuItem;
            while( (prev=liMenuItem.prev("li")).length !== 0 ){
            	if(!prev.hasClass("om-menu-sep-li") && !prev.hasClass("om-state-disabled")){
            		return prev;
            	}
            	liMenuItem = prev;
            }
            //���û�У��������������һ��
            var ulChildren = oldItem.parent().children();
            var item =ulChildren.eq(ulChildren.length - 1);
            while(item.length !== 0 && item != oldItem){
            	if(!item.hasClass("om-menu-sep-li") && !item.hasClass("om-state-disabled")){
            		return item;
            	}
            	item = item.prev("li");
            }
        },
        _selectNext : function(){
            var self = this , element = self.element ,curLi;
            var menuItemHover = element.find("li.om-menu-item-hover");
            var hoverLast = menuItemHover.eq(menuItemHover.length-1);
            if(menuItemHover.length == 0){ //���û�б�ѡ�еľ�ѡ�е�һ��
                curLi = element.find("li").eq(0);
                while(curLi.hasClass('om-state-disabled')){
                    curLi = curLi.next('li');
                }
                curLi.addClass("om-menu-item-hover");
            }else{
                curLi = self._findNext(hoverLast);
                if(curLi.length <= 0) return;
                curLi.addClass("om-menu-item-hover");
                hoverLast.removeClass("om-menu-item-hover");
            }
            this._hideChildren(hoverLast);
            this._showChildren(curLi);
        },
        _selectPrev : function(){
            var self = this , element = self.element,curLi;
            var menuItemHover = element.find("li.om-menu-item-hover");
            var hoverLast = menuItemHover.eq(menuItemHover.length-1);
                curLi = element.find("ul.om-menu > li");
            if(menuItemHover.length == 0){ //���û�б�ѡ�еľ�ѡ�����һ��
                var lastLi = curLi.eq(curLi.length-1) , i=1;
                while(lastLi.hasClass('om-state-disabled')){
                    lastLi = curLi.eq(curLi.length-(i++));
                }
                (curLi = lastLi).addClass("om-menu-item-hover");
            }else{
                curLi = self._findPrev(hoverLast);
                if(curLi.length <= 0) return;
                curLi.addClass("om-menu-item-hover");
                hoverLast.removeClass("om-menu-item-hover");
            }
            this._hideChildren(hoverLast);
            this._showChildren(curLi);
        },
        _hideRight : function(){
            var self = this , element = self.element;
            var currentA = element.find("li.om-menu-item-hover") , 
                hoverLast = currentA.eq(currentA.length - 1);
            hoverLast.removeClass("om-menu-item-hover");
            self._hideChildren(hoverLast);
        },
        _showRight : function(){
            var self = this , element = self.element,curLi;
            var parentA = element.find("li.om-menu-item-hover") , 
                parentLi = parentA.eq(parentA.length - 1);
            if(parentLi.attr("aria-haspopup") == "true"){
                curLi = parentLi.children("ul").find("li").eq(0);
                curLi.addClass("om-menu-item-hover");
            }
            self._showChildren(curLi);
        },
        _backfill : function(element){
            var curas = element.find("li.om-menu-item-hover");
            curas.eq(curas.length - 1).mousedown();
        }
    });
})(jQuery);/*
 * $Id: om-messagebox.js,v 1.20 2012/03/01 06:11:41 wangfan Exp $
 * operamasks-ui omMessageBox 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 *  om-mouse.js
 *  om-draggable.js
 *  om-position.js
 */
 
(function( $, undefined ) {
	 var tmpl = '<div class="om-messageBox om-widget om-widget-content om-corner-all" tabindex="-1">'+
	                '<div class="om-messageBox-titlebar om-widget-header om-helper-clearfix">'+
	                    '<span class="om-messageBox-title"></span>'+
	                    '<a href="#" class="om-messageBox-titlebar-close"><span class="om-icon om-icon-closethick"></span></a>' +
	                '</div>'+
	                '<div class="om-messageBox-content om-widget-content">'+
	                    '<table><tr vailgn="top">' +
	                        '<td class="om-messageBox-imageTd"><div class="om-messageBox-image"/>&nbsp;</td>' +
	                        '<td class="om-message-content-html"></td>' +
	                    '</tr></table>'+
	                '</div>'+
	                '<div class="om-messageBox-buttonpane om-widget-content om-helper-clearfix">'+
	                    '<div class="om-messageBox-buttonset"></div>'+
	                '</div>'+
	            '</div>';
	var _height = function(){
        // handle IE 6
        if ($.browser.msie && $.browser.version < 7) {
            var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
                offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
            return (scrollHeight < offsetHeight) ?  $(window).height() : scrollHeight;
        // handle "good" browsers
        } else {
            return $(document).height();
        }
	};
	var _width = function() {
        // handle IE
        if ( $.browser.msie ) {
            var scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
                offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
            return (scrollWidth < offsetWidth) ? $(window).width() : scrollWidth;
        // handle "good" browsers
        } else {
            return $(document).width();
        }
    };
	var close = function(messageBox, mask, handler, value){
	    if (messageBox.hasClass('om-messageBox-waiting')) {
	        return;
	    }
	    handler ? handler(value) : jQuery.noop();
	    messageBox.remove();
	    mask.remove();
	};
    var _show = function(config){
        var onClose = config.onClose;
        var messageBox = $(tmpl).appendTo(document.body).css('z-index', 1500).position({
            of:window,
            collision: 'fit'
        }).omDraggable({
            containment: 'document',
            cursor:'move',
            handle: '.om-messageBox-titlebar'
        }).hide().keydown(function(event){
            if (event.keyCode && event.keyCode === $.om.keyCode.ESCAPE) {
                close(messageBox, mask, null, false);
                event.preventDefault();
            }
        });
        var mask = $('<div class="om-widget-overlay"/>').appendTo(document.body).show().css({height:_height(),width:_width()});
        var closeBut = messageBox.find('span.om-messageBox-title').html(config.title).next().hover(function(){
            $(this).addClass('om-state-hover');
        }, function(){
            $(this).removeClass('om-state-hover');
        }).focus(function(){
            $(this).addClass('om-state-focus');
        }).blur(function(){
            $(this).removeClass('om-state-focus');
        }).click(function(event){
            close(messageBox, mask, null, false);
            return false;
        }).bind('mousedown mouseup', function(){
            $(this).toggleClass('om-state-mousedown');
        });
        messageBox.find('div.om-messageBox-image').addClass('om-messageBox-image-' + config.type);
        var content = config.content;
        if (config.type == 'prompt') {
            content = content || '';
            content += '<br/><input id="om-messageBox-prompt-input" type="text"/>';
        }
        messageBox.find('td.om-message-content-html').html(content);
        var buttonSet = messageBox.find('div.om-messageBox-buttonset');
        switch (config.type) {
            case 'confirm':
                buttonSet.html('<button>ȷ��</button><button>ȡ��</button>').children().first().click(function(){
                    close(messageBox, mask, onClose, true);
                }).next().click(function(){
                    close(messageBox, mask, onClose, false);
                });
                break;
            case 'prompt':
                buttonSet.html('<button>ȷ��</button><button>ȡ��</button>').children().first().click(function(){
                    var returnValue = onClose ? onClose($('#om-messageBox-prompt-input').val()) : jQuery.noop();
                    if (returnValue !== false) {
                        messageBox.remove();
                        mask.remove();
                    }
                }).next().click(function(){
                    close(messageBox, mask, onClose, false);
                });
                break;
            case 'waiting':
                messageBox.addClass('om-messageBox-waiting');
                mask.addClass('om-messageBox-waiting');
                closeBut.hide(); //����ʾ�رհ�ť
                buttonSet.parent().hide(); //����ʾ����İ�ť���
                break;
            default:
                buttonSet.html('<button>ȷ��</button>').children().first().click(function(){
                    close(messageBox, mask, onClose, true);
                });
        }
        var buts = $('button',buttonSet);
        if($.fn.omButton){
            buts.omButton();
        }
        messageBox.show();
        var okBut = buts.first()[0];
        okBut ? okBut.focus() : messageBox.focus();
    };
     /**
      * @name omMessageBox
      * @class
      * omMessageBox�����ṩ��ʾ��Ϣ�ĵ������ڣ�������JavaScript��ʹ��alert()��confirm()��prompt()����ʱ���ֵ�������ʾ��Ϣ�ĵ������ڡ�<br/><br/>
      * <br/>
      * <h2>�������ص㣺</h2><br/>
      * <ul>
      *     <li>�нϺõ������������</li>
      *     <li>���Զ�����⡢���ݣ����ұ�������ݿ���ʹ��html����</li>
      *     <li>�������йرհ�ť��Ҳ���԰�Esc���ر�</li>
      *     <li>֧�ַḻ����ʾ��ͼ�겻ͬ��</li>
      *     <li>���Լ����ر��¼�</li>
      * </ul>
      * <br/>
      * <h2>�ṩ�����¹��߷�����</h2><br/>
      * <ul>
      *     <li>
      *         <b>$.omMessageBox.alert(config)</b><br/>
      *         ����һ��Alert��ʾ������һ����ȷ������ť������config�����������<br/>
      *         <ul style="margin-left:40px">
      *             <li>type��alert��ʾ�����ͣ����Ͳ�ͬʱ����������ߵ�ͼ��᲻ͬ��String���ͣ���ѡ��ֵ��'alert'��'success'��'error'��'question'��'warning'��Ĭ��ֵΪ'alert'��</li>
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'��ʾ'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪtrue����ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.alert({
      *                 type:'error',
      *                 title:'ʧ��',
      *                 content:'����ɾ��&lt;font color="red">admin&lt;/font>�û�',
      *                 onClose:function(value){
      *                     alert('do something');
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.confirm(config)</b><br/>
      *         ����һ��Confirm��ʾ���С�ȷ�����͡�ȡ������ť������config�����������<br/>
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'ȷ��'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪtrue�������ȡ������ť��ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.confirm({
      *                 title:'ȷ��ɾ��',
      *                 content:'ɾ���û��������еķ����ͻ�����ͬʱɾ�������ɻָ�������ȷ��Ҫ��������',
      *                 onClose:function(value){
      *                     alert(value?'��ʼɾ������':'��ɾ����');
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.prompt(config)</b><br/>
      *         ����һ��Prompt��ʾ����һ�������͡�ȷ�����͡�ȡ������ť������config�����������
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'������'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪ�û����������������ַ�����һ�����ַ������������ȡ������ť��ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��<b>ע�⣺�ڴ˷����з���false������ֹ�������ڹرա�</b></li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.prompt({
      *                 title:'��Ʒ����',
      *                 content:'��������Ҫ�������Ʒ�����������������ֻ�ܹ���12ǧ�ˣ���',
      *                 onClose:function(value){
      *                     if(value===false){ //����ȡ����ESC
      *                         alert('ȡ������');
      *                         return;
      *                     }
      *                     if(value==''){
      *                         alert('��������Ϊ��');
      *                         return false; //���رյ�������
      *                     }
      *                     if(value-0+'' !== value){
      *                         alert('ֻ����������');
      *                         return false;  //���رյ�������
      *     `               }
      *                     if(value&lt;0 || value&gt;12){
      *                         alert('������0-12֮������֣��ɴ�С����');
      *                         return false; //���رյ�������
      *                     }else{
      *                         alert('��ʼ����'+value+'ǧ����Ʒ');
      *                     }
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.waiting(config | 'close')</b><br/>
      *         ����һ��Prompt��ʾ����һ�������͡�ȷ�����͡�ȡ������ť������ʾ����û�йرհ�ť��Ҳ�����԰�ESC�رա����������'close'ʱ��ʾ�ر��ϴε�����Waiting��ʾ���ڡ������configʱ��ʾҪ����һ��Waiting��ʾ���ڣ�����config�����������
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'���Ժ�'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             //������ʾ
      *             $.omMessageBox.waiting({
      *                 title:'���Ժ�',
      *                 content:'���������ڴ��������������Ժ�...',
      *             });
      * 
      *             //�ر���ʾ
      *             $.omMessageBox.waiting('close');
      *         </pre>
      *     </li>
      * </ul>
      */
    $.omMessageBox = {
        alert: function(config){
            config = config || {};
            config.title = config.title || '��ʾ';
            config.type = config.type || 'alert';
            _show(config);
        },
        confirm: function(config){
            config = config || {};
            config.title = config.title || 'ȷ��';
            config.type = 'confirm';
            _show(config);
        },
        prompt: function(config){
            config = config || {};
            config.title = config.title || '������';
            config.type = 'prompt';
            _show(config);
        },
        waiting: function(config){
            if (config === 'close') {
                $('.om-messageBox-waiting').remove();
                return;
            }
            config = config || {};
            config.title = config.title || '��ȴ�';
            config.type = 'waiting';
            _show(config);
        }
    };
}(jQuery));/*
 * $Id: om-messagetip.js,v 1.9 2012/03/01 06:11:41 wangfan Exp $
 * operamasks-ui omMessageBox 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
 
(function( $, undefined ) {
     /**
      * @name omMessageTip
      * @class
      * omMessageTip�������½ǵ�����ʾ���ڣ���QQ����һ������<br/><br/>
      * <br/>
      * <h2>�������ص㣺</h2><br/>
      * <ul>
      *     <li>���ж��û���������ģ̬������ʾ��</li>
      *     <li>�нϺõ������������</li>
      *     <li>���Զ�����⡢���ݣ����ұ�������ݿ���ʹ��html����</li>
      *     <li>֧�ַḻ����ʾ��ͼ�겻ͬ��</li>
      *     <li>���Լ����ر��¼�</li>
      *     <li>������ʾ�͹ر���ʾʱ�м򵥶���</li>
      *     <li>�����������򵥵���ʾ���ܺͶ�ʱ��ʧ���ܣ����ɸı���ʾ���ڴ�С�������϶���ʾ����λ�ã�</li>
      * </ul>
      * <br/>
      * ������ǳ�����������Ҳ���٣������Ҫ�ж��û���������ʹ��omDialog��omMessageBox�����������Ҳ���ܷ�html���룬����нϸ��ӵ�������ʹ��omDialog�����
      * <br/>
      * <h2>�ṩ�����¹��߷�����</h2><br/>
      * <ul>
      *     <li>
      *         <b>$.omMessageTip.show(config)</b><br/>
      *         �ӵ�ǰҳ�����½ǵ���һ�����ж���ʾ����������ʾ���Թرա�����config�����������<br/>
      *         <ul style="margin-left:40px">
      *             <li>type����ʾ�����ͣ����Ͳ�ͬʱ����������ߵ�ͼ��᲻ͬ��String���ͣ���ѡ��ֵ��'alert'��'success'��'error'��'question'��'warning'��'waiting'��Ĭ��ֵΪ'alert'��</li>
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'��ʾ'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ���޲λص�������Function���͡�</li>
      *             <li>timeout���������ڳ�����ʱ�䣬��λΪ���룬���ڵ����󾭹���ô����ʱ����Զ��رգ������onClose�ص����������Զ�����������Int���͡�Ĭ��ֵΪ����󣨼����Զ��رգ�</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageTip.show({
      *                 type:'warning',
      *                 title:'����',
      *                 content:'��ѡ����Ҫɾ���ļ�¼������ѡ��һ�����������'
      *             });
      *             $.omMessageTip.show({
      *                 type:'error',
      *                 title:'���ݷǷ�',
      *                 content:'&lt;font color="red">123456&lt;/font>������Ч�������ַ��',
      *                 onClose:function(){
      *                     $('#emial').focus();
      *                 }
      *             });
      *         </pre>
      *     </li>
      * </ul>
      */
    $.omMessageTip = {
        show: function(config){
            config = $.extend({
                title : '����',
                content : '&#160;',
                type : 'alert'
            },config);
            var html = '<div class="om-messageTip om-widget om-corner-all" tabindex="-1">'+
                    '<div class="om-widget-header om-helper-clearfix">'+
                        '<span class="om-messageTip-title">'+config.title+'</span>'+
                        '<a href="#" class="om-messageTip-titlebar-close"><span class="om-icon-closethick"></span></a>' +
                    '</div>'+
                    '<div class="om-messageTip-content om-widget-content">'+
                        '<div class="om-messageTip-image om-messageTip-image-'+config.type+'"></div>' +
                        '<div class="om-messageTip-content-body">'+config.content+'</div>' +
                    '</div>'+
                '</div>';
            var messageTip = $(html).appendTo(document.body).css('z-index', 3000).hide();
            var result = {d:messageTip,l:config.onClose};
            messageTip.find('a.om-messageTip-titlebar-close')
                .bind('mouseenter mouseleave',function(){
                    $(this).toggleClass('om-state-hover');
                })
                .bind('focus blur',function(){
                    $(this).toggleClass('om-state-focus');
                })
                .bind('mousedown mouseup', function(){
                    $(this).toggleClass('om-state-mousedown');
                })
                .click(function(event){
                    $.omMessageTip._close(result);
                    return false;
                });
            messageTip.slideDown('slow');
            if(config.timeout){ //��ʱ�ر�
                setTimeout(function(){
                    $.omMessageTip._close(result);
                },config.timeout);
            }
            return messageTip;
        },
        _close : function(result){
            result.d.slideUp('slow');
            if(result.l){
                result.l(); //����onClose�ص�����
            }
            setTimeout(function(){
                result.d.remove();
            },1000);
        }
    };
}(jQuery));/*
 * $Id: om-numberfield.js,v 1.69 2012/03/15 06:14:47 linxiaomin Exp $
 * operamasks-ui omNumberField 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
(function($) {
    
    // ����С������
    var fixPrecision = function(value, c, p) {
        var v = value.indexOf(".");       
        if (isNaN(value) && value != ".") {
            for (; isNaN(value);) {
                value = value.substring(0, value.length - 1);
            }
        }
        if(!p.allowNegative && value.indexOf("-")!= -1){
        	var array=value.split("-");
        	value=array.join("");
        }
        if(!p.allowDecimals&&v!=-1 || value[value.length-1]==='.'){
            return value.substring(0, v);
         }
        if(v!=-1){
            value=value.substring(0,v+p.decimalPrecision+1);
        }
        return value.length > 0 ? parseFloat(value) : "";
    };

    /** 
     * @name omNumberField
     * @class ��������������ֻ���������֣��ַ��Զ����˵���<br/>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     * @example
     * $('numberFielddiv').omNumberField({decimalPrecision:3});
     */
    $.omWidget("om.omNumberField", {
        options: /** @lends omNumberField.prototype */ 
        {
            /**
             * �Ƿ���������С����
             * @default true
             * @type Boolean
             * @example
             * $('#input').omNumberField({allowDecimals:true});
             */
            allowDecimals: true,  //�Ƿ���������С��
            /**
             * �Ƿ��������븺����
             * @default true
             * @type Boolean
             * @example
             * $('#input').omNumberField({allowNegative:true});
             */
            allowNegative: true,  //�Ƿ��������븺��
            /**
             * ��ȷ��С�����λ��
             * @default 2
             * @type Number
             * @example
             * $('#input').omNumberField({decimalPrecision:2});
             */
            decimalPrecision: 2, //��ȷ��С�����λ
            /**
             * �Ƿ���������
             * @default false
             * @type Boolean
             * @example
             * $('#input').omNumberField({disabled:true});
             */
            disabled: false,
            /**
             * �������ʧȥ����ʱ�����ķ�����
             * @event
             * @param value ��ǰ������ֵ
             * @param event jQuery.Event����
             * @default emptyFn
             * @example
             * $('#input').omNumberField({onBlur:function(value,event){alert('now the value is'+value);}});
             */
            onBlur: function(value){},
            /**
             * �Ƿ�ֻ����
             * @default false
             * @type Boolean
             * @example
             * $('#input').omNumberField({readOnly:true});
             */
            readOnly: false            
        },

        _create : function() {
            // ����������ַ�
            var options = this.options,
            	self = this;
            this.element.addClass("om-numberfield om-widget om-state-default om-state-nobg")
            			.css("ime-mode" , "disabled");
			
            this.element.keypress(function(e) {
                if (e.which == null && (e.charCode != null || e.keyCode != null)) {
                    e.which = e.charCode != null ? e.charCode : e.keyCode;
                }
                var k = e.which;
                if (k === 8 || (k == 46 && e.button == -1) || k === 0) {
                    return;
                }
                var character = String.fromCharCode(k);
                $.data(this,"character",character);
                var allowed = $.data(this, "allowed");
                if (allowed.indexOf(character) === -1||($(this).val().indexOf("-") !== -1 && character == "-")
                        || ($(this).val().indexOf(".") !== -1 && character == ".")) {
                    e.preventDefault();
                }
            }).focus(function(){
            	$(this).addClass('om-state-focus');
            }).blur(function(e){
                $(this).removeClass('om-state-focus');
            	var character = $.data(this,"character");
                this.value=fixPrecision(this.value, character, options);
                self._trigger("onBlur",e,this.value);
            }).keydown(function(e){
            	self._checkLast(this);
            	
            	//Chrome����֧��css����ime-mode,�޷���ֹƴ�����룬����ʹ�����뷨ʱ���¼���e.which===229�����.
            	if(229 === e.which){
            		e.preventDefault();
            	}
            }).keyup(function(e){//��Chrome�������뷨�£�����  �������ַ����ᴥ��input���keypress�¼�
            	self._checkLast(this);
            }).bind('cut paste',function(e){
            	return false;
            });
        },
		
        _init : function() {
            var $ele = this.element,
                opts = this.options;
            
            if (typeof opts.disabled !== "boolean") {
                opts.disabled = $ele.attr("disabled");
            }

            if (opts.readOnly) {
                $ele.attr("readonly","readonly");
            }

            var character = $.data($ele[0], "character");
            
            this._buildAllowChars();
            
            if (opts.disabled) {
                this.disable();
            } else {
                this.enable();
            }
        },
        
		_checkLast : function(self){
			var v = self.value,
        		len = v.length;
        	if(v && $.data(self,"allowed").indexOf(v.charAt(len-1))===-1
        		|| v.indexOf('.') != v.lastIndexOf('.')
        		|| v.indexOf('-') != v.lastIndexOf('-')){
        		self.value = v = v.substring(0 , (len--)-1);
        	}
		},
		
        _buildAllowChars : function() {
            var allowed = "0123456789";

            // ����������ַ�
            if (this.options.allowDecimals) {
                allowed = allowed + ".";
            }
            if (this.options.allowNegative) {
                allowed = allowed + "-";
            }
            if (this.options.readOnly) {
                allowed = "";
            }
            $.data(this.element[0], "allowed", allowed);
        },
        /**
         * ���������
         * @name omNumberField#disable
         * @function
         * @example
         * $('#input').omNumberField("disable")
         */
        disable : function() {
            this.element.attr("disabled", true)
                    .addClass("om-numberfield-disabled");
        },
        /**
         * ���������
         * @name omNumberField#enable
         * @function
         * @example
         * $('#input').omNumberField("enable")
         */
        enable : function() {
            this.element.attr("disabled", false)
                    .removeClass("om-numberfield-disabled");
        }
    });
})(jQuery);/*
 * $Id: om-progressbar.js,v 1.14 2012/03/15 06:14:47 linxiaomin Exp $
 * operamasks-ui omProgressbar 1.2
 *
 * Copyright 2012, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
/** 
 * @name omProgressbar
 * @class ������һ����������������ɵĽ��������<br/>
 * <b>ʾ����</b><br/>
 * <pre>
 * &lt;script type="text/javascript" &gt;
 * $(document).ready(function() {
 *     $('#selector').omProgressbar({
 *         value : 30
 *     });
 * });
 * &lt;/script&gt;
 * 
 * &lt;div id="selector" /&gt;
 * </pre>
 * @constructor
 * @description ���캯��. 
 * @param p ��׼config����{}
 * @example
 * $('#selector').omProgressbar();
 */
;(function($) {
	
$.omWidget("om.omProgressbar", {
		
	options: /**@lends omProgressbar#*/{
		/**
         * ����ֵ��Ĭ��ֵΪ0�����ֵΪ100
         * @type Number
         * @default 0
         * @example
         * $("#selector").omProgressbar({value:50});
         */
		value: 0,
		
		/**
         * ��ʾ���ݣ�Ĭ�ϵ����ݸ�ʽΪ{value}%���統����ֵΪ30ʱ����ʾ���ı�Ϊ30%; ����֧�ַ����Զ�����ʾ���ݣ�
         * �����ṩһ������Ϊ��ǰ�Ľ���ֵ������ֵΪ��ʾ���ݡ�
         * @type String, Function
         * @default "{value}%"
         * @example
         * $("#selector").omProgressbar({text: "�����{value}%"});
         */
		text: "{value}%",
		/**
         * ���ý������Ŀ��,��λΪ����,Ĭ��ֵΪ"auto"����Ӧ��ȡ�
         * @type Number,String
         * @default auto
         * @example
         * $("#selector").omProgressbar({width: 300});
         */
		width: "auto",
		
		max: 100
	},

	min: 0,

	_create: function() {
	    var $ele = this.element;
		$ele.addClass( "om-progressbar om-widget om-widget-content om-corner-all" );
        this.textDiv = $("<div class='om-progressbar-text'></div>").appendTo($ele);
		this.valueDiv = $( "<div class='om-progressbar-value om-widget-header om-corner-left'></div>" )
			.appendTo( $ele );
	},
	
	_init : function() {
	    var width = this.element.width();
	    if( typeof(this.options.width) == "number" ){
            width = this.options.width;
            this.element.width(width);
        }
	    
	    this.textDiv.width(Math.floor(width));
	    this.oldValue = this._value();
        this._refreshValue();
	}, 
	/**
     * ��ȡ�������ý���ֵ��û�д������ʱ���÷���Ϊ��ȡ��ǰ����ֵ����֮�������õ�ǰ����ֵ��
     * @name omProgressbar#value
     * @param newValue Number���� ���ý���ֵ
     * @function
     * @example
     * $("#selector").omProgressbar('value', '30');
     * 
     */
	value: function( newValue ) {
		if ( newValue === undefined ) {
			return this._value();
		}

		this.options.value = newValue;
        this._refreshValue();
	},

	_value: function() {
		var val = this.options.value;
		// normalize invalid value
		if ( typeof val !== "number" ) {
			val = 0;
		}
		return Math.min( this.options.max, Math.max( this.min, val ) );
	},

	_percentage: function() {
		return 100 * this._value() / this.options.max;
	},

	_refreshValue: function() {
		var self = this, value = self.value(), onChange = self.options.onChange;
		var percentage = self._percentage();
		var text = self.options.text, label = "";

		self.valueDiv
			.toggle( value > self.min )
			.toggleClass( "om-corner-right", value === self.options.max )
			.width( percentage.toFixed(0) + "%" );
		
		if(typeof(text) == "function"){
			label = text.call(value,value);
		}else if(typeof(text) == "string"){
			label = text.replace("{value}", value);
		}
		self.textDiv.html(label);
		
		if ( self.oldValue !== value ) {
			onChange && self._trigger("onChange",null,value,self.oldValue);
			self.oldValue = value;
		}
	}
});
/**
 * ����ֵ�ı䴥���¼���
 * @event
 * @name omProgressbar#onChange
 * @param newValue �ı�����ֵ
 * @param oldValue �ı�ǰ����ֵ
 * @param event jQuery.Event����
 * @example
 *  $("#selector").omProgressbar({
 *      onChange: function(newValue, oldValue, event){ ... }
 *  });
 */
})(jQuery);/*
 * $Id: om-slider.js,v 1.35 2012/04/11 01:54:33 licongping Exp $
 * operamasks-ui omSlider 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 * om-core.js
 */
    /** 
     * @name omSlider
     * @class ����չʾҳ���ж��HTMLԪ�صĻ�����.<br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     * 		<li>�Ի������ķ�ʽչʾҳ���еĶ��Ԫ�أ�Ԫ�ص�HTML�ṹ����</li>
     * 		<li>���ÿ��Ƶ�����</li>
     * 		<li>���ö����л��Ķ���Ч��</li>
     * 		<li>���Զ��嵼���������ݺ���ʽ</li>
     * </ol>
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#slider').omSlider({
     *         animSpeed : 100,
     *         effect : 'slide-v',
     *         onBeforeSlide : function(index,event){
     *             // do something
     *         }
     *     });
     * });
     * &lt;/script&gt;
     * 
     * &lt;div id="slider" class="slider-demo"&gt;
     *	&lt;img src="images/turtle.jpg" /&gt;
     *	&lt;a href="#"&gt;&lt;img src="images/rabbit.jpg" /&gt;&lt;/a&gt;
     *	&lt;img src="images/penguin.jpg" /&gt;
     *	&lt;img src="images/lizard.jpg" /&gt;
     *	&lt;img src="images/crocodile.jpg" /&gt;
	 * &lt;/div&gt;
	 * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
(function($) {
    $.omWidget('om.omSlider', {
        options : /**@lends omSlider#*/{
            /**
             * ��������Ƿ��Զ��л���
             * @default true
             * @type Boolean
             * @example
             * $('#slider').omSlider({autoPlay : false});
             */
            autoPlay : true,
            /**
             * �Զ��л����ʱ�䣬ֻ�е�autoPlayΪtrue��ʱ��������Բ���Ч��
             * @default 5000
             * @type Number
             * @example
             * $('#slider').omSlider({interval: 1000});//����slider�Զ��л��ļ��ʱ��Ϊ1��
             */
            interval : 5000,
            /**
             * �����Ƿ���Ҫ��ʾ�����л���һ������һ�����ķ��򵼺�������Ϊtrueʱ������ƶ���slider�����ʱ������һ����������һ������һ���Ĺ���������
             * @default false
             * @type Boolean
             * @example
             * $('#slider').omSlider({directionNav : true});
             */
            directionNav: false,
            /**
             * ���õ�����ƶ���slider�����ʱ���Ƿ���ͣ�Զ��л���
             * @default true
             * @type Boolean
             * @example
             * $('#slider').omSlider({pauseOnHover : false});
             */
            pauseOnHover: true,
            /**
             * �����Ƿ���Ҫ��������������ֵΪString��ʱ���ʾʹ�����õĵ��������ͣ�
             * ������ֵΪSelector��ʱ���ʾʹ���Զ���ĵ�������������ֵ����Ϊtrue��ʱ��Ĭ��ʹ�����õ�"classical"��������
             * ���õĵ��������Ͱ���"classical"��"dot"��
             * @default true
             * @type Boolean,String,Selector
             * @example
             * $('#slider').omSlider({controlNav : false});//��ʹ�õ�����
             * $('#slider').omSlider({controlNav : 'dot'});//ʹ�����õķ��Ϊ'dot'�ĵ�����
             * $('#slider').omSlider({controlNav : 'div#my-nav'});//ʹ��ҳ����idΪ'my-nav'��div��Ϊ������
             */
            controlNav: true,
            /**
             * ���õ�����ѡ�е�ʱ�����õ�class��ʽ��ͬʱ���������õ��������Զ��嵼������
             * @default 'nav-selected'
             * @type String
             * @example
             * $('#slider').omSlider({activeNavCls: 'my-nav-selected'});
             */
            activeNavCls: 'nav-selected',

            /**
             * ��������л��Ķ���Ч����
             * ���õĶ���Ч������'fade'(���뵭��)��'slide-v'(��ֱ����)��'slide-h'(ˮƽ����)��'random'(�������)��
             * ����Ϊtrueʹ��Ĭ��'fade'����Ч��������Ϊfalse��ʹ�ö���Ч����
             * @default 'fade'
             * @type String,Boolean
             * @example
             * $('#slider').omSlider({effect : false});
             * //ʹ�ô�ֱ�����Ķ���Ч����
             * $('#slider').omSlider({effect : 'slide-v'});
             */
            effect : 'fade',
            /**
             * ����ִ�е��ٶȡ���λ���룬ֵԽС����ִ�е��ٶ�Խ�졣
             * @default 400
             * @type Number
             * @example
             * $('#slider').omSlider({animSpeed : 100});
             */
            animSpeed : 400,
            /**
             * �����ʼ��ʱĬ�ϼ��������index��index��0��ʼ���㣬0��ʾ��һ����塣�������2��ҳ����ʾ��Ĭ����ʾ��3����塣
             * @default 0
             * @type Number
             * @example
             * $('#slider').omSlider({startSlide : 2});
             */
            startSlide: 0,
            /**
             * ����ƶ�������������󴥷��л��������ӳ�ʱ�䡣��λΪ���롣
             * @default 200
             * @type Number
             * @example
             * $('#slider').omSlider({delay : 100});
             */
            delay: 200,
            /**
             * ����л�ǰ�����¼����¼��Ĵ���������false����ֹ�л�������
             * @event
             * @type Function
             * @default emptyFn
             * @param index ��������
             * @param event jQuery.Event����
             * @name omSlider#onBeforeSlide
             * @example
             * $('#slider').omSlider({onBeforeSlide : function(index,event){if(index==2) return false;}});// ��ֹslider�л������������
             */
            onBeforeSlide:function(index){},
            /**
             * ����л��󴥷��¼���
             * @event
             * @type Function
             * @default emptyFn
             * @param index ��������
             * @param event jQuery.Event����
             * @name omSlider#onAfterSlide
             * @example
             * $('#slider').omSlider({onAfterSlide : function(index,event){alert(index + ' slide complete');});
             */
            onAfterSlide:function(index){}
        }, 
        
        /**
         * �л���ָ��index����塣
         * @name omSlider#slideTo
         * @function
         * @param index ��������
         * @example
         * //�л������������
         * $('#slider').omSlider('slideTo', 2);
         */
        slideTo : function(index) {
            opts = this.element.data('omSlider:opts');
            this._slideTo(this.element,index);
        },
        /**
         * �л�����һ����塣
         * @name omSlider#next
         * @function
         * @example
         * $('#slider').omSlider('next');
         */         
        next : function(){
            opts = this.element.data('omSlider:opts');
            this._next(this.element);
        },
        /**
         * �л�����һ����塣
         * @name omSlider#prev
         * @function
         * @example
         * $('#slider').omSlider('prev');
         */         
        prev : function(){
            opts = this.element.data('omSlider:opts');
            this._prev(this.element);
        },
        destroy : function(){
        	var slider = this.element,
        		opts = this.options,
        		vars = this._getSliderVars(slider);
        	clearTimeout(vars.slideTimer);
        	clearInterval(vars.autoPlayTimer);
        	if(vars.customNav){
        		$(opts.controlNav).children().unbind('.omSlider').removeData('sid').removeClass(opts.activeNavCls);       			
        	}
        },
        /**
         * ��ȡslider�б���ı���
         */
        _getSliderVars : function(slider){
            return slider.data('omSlider:vars');
        }, 
        
        _runSlideEffect : function(slider, index, effect){
            var _self = this,
            	vars = this._getSliderVars(slider),
                $container = slider.find('ul.om-slider-content:first'),
                $item = $container.children(),opts = this.options,
                top = 0,
                left = 0;
            var effectnow = effect ? effect : opts.effect;
            if(opts.effect == 'random'){
                $container.addClass('om-slider-effect-'+ effectnow);
            }
            $container.stop();
            if(effectnow == 'slide-v' || effectnow == 'slide-h'){
                var slideV = (effectnow == 'slide-v');
                if(opts.effect == 'random'){
                    var cur = 0;
                    $item.each(function(n){
                        if(n !== vars.currentSlide){
                            cur -= ( slideV? $(this).height() : $(this).width() );
                        }else{
                            return false;
                        }
                    });
                    $container.css(slideV? "top":"left" , cur);
                }
                $item.each(function(n){
                    if(n == index) return false;
                    slideV? top -= $(this).height() : left -= $(this).width();
                });
            } else{
                return false;
            }
            vars.running = true;
            $container.animate({top:top,left:left},opts.animSpeed,function(){
                vars.running = false;
                _self._trigger("onAfterSlide",null,index);
            });
        },
        
        _runFadeEffect : function(slider,index){
            var _self = this,
            	vars = this._getSliderVars(slider),
                items = slider.find('ul.om-slider-content:first').children(),
                opts = this.options;
            items.each(function(n){
                var $child = $(this);
                if(n == index){
                    vars.running = true;
                    $child.fadeIn(opts.animSpeed,function(){
                        vars.running = false;
                        _self._trigger("onAfterSlide",null,index);
                    });
                } else if(n == vars.currentSlide){
                    $child.fadeOut(opts.animSpeed);
                }
            });
        }, 
        
        _runNoEffect : function(slider,index){
            var _self = this,
            	vars = this._getSliderVars(slider),
            	opts = this.options,
                items = slider.find('ul.om-slider-content:first').children();
            items.each(function(n){
                var $child = $(this);
                if(n == index){
                    $child.show();
                    _self._trigger("onAfterSlide",null,index);
                } else if(n == vars.currentSlide){
                    $child.hide();
                }
            });
        },
        
        /**
         * �л�������
         */
        _toggleControlNav : function(slider, index){
            var vars = this._getSliderVars(slider);
            var opts = this.options;
            var parent = slider;
            // ������Զ��嵼��������controlNav��λ����slider���棬���Դ�body������controlNav
            if(vars.customNav){
                parent = $('body');
            }
            var navItems = parent.find(vars.controlNav).children();
            navItems.each(function(n){
                $(this).toggleClass(opts.activeNavCls,n==index);
            });
        },
        
        /**
         * �л���ָ����壬index��0��ʼ
         */
        _slideTo : function(slider, index){
            var vars = this._getSliderVars(slider),
            $container = slider.find('ul.om-slider-content:first');
            var opts = this.options, self = this;
            if(isNaN(index) || index < 0 || index >= vars.totalSlides){
                return;
            }
            if (this._trigger("onBeforeSlide",null,index) === false) {
                return false;
            }
            if(opts.effect == 'random'){
                var array=['fade','slide-h','slide-v'];
                var effect = array[Math.floor(Math.random()*3)];
                $container.removeClass().addClass('om-slider-content');
                $container.removeAttr('style');
                $container.find('li').removeAttr('style');
                if(effect == 'slide-h' || effect == 'slide-v'){
                    self._runSlideEffect(slider, index, effect);
                } else {
                    self._runFadeEffect(slider, index);
                }
            }else if(opts.effect == 'slide-h' || opts.effect == 'slide-v'){
                self._runSlideEffect(slider, index);
            } else if(opts.effect == 'fade' || opts.effect === true){
                self._runFadeEffect(slider, index);
            } else{
                self._runNoEffect(slider, index);
            }
            
            if(vars.controlNav){
                self._toggleControlNav(slider, index);
            }
            vars.currentSlide = index;
            return slider;
        },
        
        _next : function(slider){
            var vars = this._getSliderVars(slider),
                next_index = 0;
            if(vars.currentSlide+2 <= vars.totalSlides){
                next_index = vars.currentSlide + 1;
            }
            return this._slideTo(slider,next_index);
        }, 
        _prev : function(slider){
            var vars = this._getSliderVars(slider),
                index = vars.totalSlides - 1;
            if(vars.currentSlide != 0){
                index = vars.currentSlide - 1;
            }
            return this._slideTo(slider,index);
        }, 
        _processDirectionNav : function(slider){
            var vars = this._getSliderVars(slider),
                directionNav = $('<div class="om-slider-directionNav">').appendTo(slider),
                self = this;
            $('<a class="om-slider-prevNav"></a>').appendTo(directionNav).click(function(){
                if(vars.running)return false;
                self._prev(slider);
            });
            $('<a class="om-slider-nextNav"></a>').appendTo(directionNav).click(function(){
                if(vars.running)return false;
                self._next(slider);
            });
            slider.hover(function(){
                directionNav.show();
            },function(){
                directionNav.hide();
            });
        }, 
        _processControlNav : function(slider){
            var vars = this._getSliderVars(slider),
            	opts = this.options,
            	self = this,
            	n;
            if(opts.controlNav === true || opts.controlNav === 'classical'){
                var $nav = $('<ul class="om-slider-nav-classical"></ul>');
                vars.controlNav = '.om-slider-nav-classical';
                for(n=0;n<vars.totalSlides;n++){
                    var $navItem = $('<li>'+(n+1)+'</li>');
                    $navItem.data('sid',n);
                    var hTimer = 0;
                    $navItem.click(function(){
                        //if(vars.running)return false;
                        self._slideTo(slider,$(this).data('sid'));
                    });
                    $navItem.hover(function(){
                        if(vars.running || vars.stop)return false;
                        var _self = $(this);
                        if(_self.hasClass(opts.activeNavCls))return false;
                        //vars.slideTimer:�����������
                        vars.slideTimer = hTimer = setTimeout(function(){self._slideTo(slider,_self.data('sid'));},opts.delay);
                    },function(){
                        clearTimeout(hTimer);
                    });
                    $nav.append($navItem);
                }
                slider.append($nav);
            } else if(opts.controlNav === 'dot'){
                var $nav = $('<div class="om-slider-nav-dot"></div>');
                vars.controlNav = '.om-slider-nav-dot';
                for(n=0;n<vars.totalSlides;n++){
                    var $navItem = $('<a href="javascript:void(0)">'+(n+1)+'</a>');
                    $navItem.data('sid',n);
                    var hTimer = 0;
                    $navItem.click(function(){
                        //if(vars.running)return false;
                        self._slideTo(slider,$(this).data('sid'));
                    });                 
                    $navItem.hover(function(){
                        if(vars.running || vars.stop)return false;
                        var _self = $(this);
                        if(_self.hasClass(opts.activeNavCls))return false;
                        vars.slideTimer = hTimer = setTimeout(function(){self._slideTo(slider,_self.data('sid'));},opts.delay);
                    },function(){
                        clearTimeout(hTimer);
                    });
                    $nav.append($navItem);
                }
                //$nav.insertAfter(slider);
                $nav.appendTo(slider).css({marginLeft:-1*$nav.width()/2});
            } else{
                if($(opts.controlNav).length > 0){
                    vars.controlNav = opts.controlNav;
                    vars.customNav = true;
                    var $nav = $(opts.controlNav);
                    $nav.children().each(function(n){
                        var $navItem = $(this);
                        $navItem.data('sid',n);
                        var hTimer = 0;
                        $navItem.bind("click.omSlider" , function(){
                            //if(vars.running)return false;
                            self._slideTo(slider,$(this).data('sid'));
                        });
                        $navItem.bind("mouseover.omSlider" , function(){
                        	if(vars.running || vars.stop)return false;
                            var _self = $(this);
                            if(_self.hasClass(opts.activeNavCls))return false;
                            vars.slideTimer = hTimer = setTimeout(function(){self._slideTo(slider,_self.data('sid'));},opts.delay);
                        }).bind("mouseout.omSlider" , function(){
                        	clearTimeout(hTimer);
                        });
                    });
                }
            }
        }, 
        
        _create : function() {
            var timer = 0;
            var $this = this.element;
            var self = this;
            var opts = this.options;
            var vars = {
                currentSlide: 0,
                totalSlides: 0,
                running: false,
                paused: false,
                stop: false,
                controlNav: '.om-slider-nav-classical'
            };
            
            $this.data('omSlider',$this).data('omSlider:vars',vars).data('omSlider:opts',opts).addClass('om-slider');
            if(opts.startSlide > 0){
                vars.currentSlide = opts.startSlide; 
            }
            var kids = $this.children();
            kids.wrapAll('<ul class="om-slider-content"></ul>').wrap('<li class="om-slider-item"></li>');
            if(opts.effect == 'slide-v' || opts.effect == 'slide-h'){
                $this.find('.om-slider-content').addClass('om-slider-effect-'+opts.effect);
            }
            vars.totalSlides = kids.length;
            this._processControlNav($this);
            /**
             * �ڲ���������effect="slide-h||slide-v"��startSlide>0���������Ҫ��window.onload��ִ�С�
             */
            function _initSlider(slider, startSlide){
                if(isNaN(startSlide) || startSlide < 0 || startSlide >= vars.totalSlides){
                    return;
                }
                var $container = slider.find('ul.om-slider-content:first'),
                    $item = $container.children(),
                    top = 0,
                    left = 0;
                if(opts.effect == 'slide-h'){
                    $item.each(function(n){
                        if(n == startSlide) return false;
                        left -= $(this).width();
                    });
                    setTimeout(function(){$container.css({left:left,top:top});},0);
                } else if(opts.effect == 'slide-v'){
                    $item.each(function(n){
                        if(n == startSlide) return false;
                        top -= $(this).height();
                    });
                    // �޸�omSlider��omTabs������tab��������ʽ��Ч�����⡣ֻ��IE7������·�����
                    setTimeout(function(){$container.css({left:left,top:top});},0);
                } else{
                    $container.children().eq(startSlide).show();
                }
                
                if(vars.controlNav){
                    self._toggleControlNav(slider, startSlide);
                }
                if(opts.autoPlay){
                	//vars.autoPlayTimer:�����������
                    vars.autoPlayTimer = timer = setInterval(function(){self._next(slider);},opts.interval);
                }
                if(opts.pauseOnHover){
                    slider.hover(function(){
                        vars.paused = true;
                        clearInterval(timer);
                    },function(){
                        vars.paused = false;
                        if(opts.autoPlay){
                            vars.autoPlayTimer = timer = setInterval(function(){self._next(slider);},opts.interval);
                        }
                    });
                }
                if(opts.directionNav){
                    self._processDirectionNav(slider);
                }
            }
            
            if(opts.startSlide > 0 && (opts.effect == 'slide-h' || opts.effect == 'slide-v')){
                // ���ǵ�slide�Ķ���Ч�����������startSlide>0��Ҫ����startSlideǰ������Ĵ�С��
                // �������������img��ǩ�Ļ�ֻ����ͼƬ�������(��window.onload�¼�)���ܻ�����Ĵ�С��
                $(window).load(function(){
                    _initSlider($this,opts.startSlide);
                });
            } else{
                _initSlider($this,opts.startSlide);
            } 
        }
        
    });
})(jQuery);/*
 * $Id: om-suggestion.js,v 1.85 2012/03/15 07:16:12 wangfan Exp $
 * operamasks-ui omSuggestion 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
;(function($){
    var suggestionRowClass='om-suggestion-list-row';
    var suggestionHighLightClass='om-state-hover';
    /**
     * @name omSuggestion
     * @class 
     * &nbsp;&nbsp;&nbsp;&nbsp;Ajax��ʾ�����������google��ҳ���������ܣ��������ͬʱ��������������õ���ʾ���û����Դ�����ѡ��һ������<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;���ù�����ӵ�һ��input������ϣ��������û��������ͬʱ���Կ��ٵز��Һ�ѡ����Ҫ�����ݡ��������õ����㲢�����ַ�ʱ��������Ὣ�û������������Ajax��ʽ���͵����������д���������������󷵻�һ�����ݼ����ͻ��˽����ݼ���ʾ��һ����ѡ�б��û����Դӿ�ѡ�б��кܷ����ѡ���Լ���Ҫ���ҵĶ�����<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;Ŀǰ�������Ҫ���ڴ�Զ��URLȡ�����ݣ�����Ǳ������ݵĻ�������ʹ��omCombo�������Ҳ�б�����߹��˵Ĺ��ܣ���һ�����ڴӴ��������н��в��ҵĳ��ϣ���ٶ�������google������taobao��Ʒ�������ʼ�ϵͳ���������ռ��ˡ�<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;������пͻ��˻���Ĺ��ܣ�������a��ʼAjax���ң�������b�������������ab���ٴ�Ajax���ң���ɾ��b�������������a����������Ajax���ң���Ϊ�������Ѿ���key=a�Ļ������ݣ���ֱ�Ӹ��ݻ����������ع���ѡ�б��������Ajax����ӷ�����ȡ�����������Ҫ������Խ�cacheSize�������0�����Ҫ���������Ե���clearCache()������<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;ʵ��Ӧ����һ�㶼Ҫ���ƿ�ѡ�б���м�¼����Ŀ����ٶ�������google������taobao��Ʒ�����Ŀ�ѡ�б��м�¼����Ϊ10���е������Ŀ�ѡ�б��м�¼��Ϊ8�������Ҫ�ɷ��������п��ƣ���������������ʱ�벻Ҫ���ص�̫�ࣨ��������ݿ��в�ѯʱһ��ʹ��TOP-N��ѯ����<br/><br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ����ͨ���飬Ҳ��ʹ��JSON����</li>
     *      <li>֧���������ͼ��̲���</li>
     *      <li>֧�����ݵĿͻ��˻���</li>
     *      <li>�ṩ�ḻ���¼�</li>
     *      <li>�û��ɶ������ݵ���ʾЧ��</li>
     *      <li>�û��ɶ�������ķ����봦��</li>
     *      <li>֧�ֿ�����������</li>
     * </ol><br/>
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#input1').omSuggestion({
     *         dataSource:'/suggestion.json',
     *         minChars :3,
     *         listMaxHeight:40
     *     });
     * });
     * &lt;/script>
     * 
     * &lt;input id="input1"/>
     * </pre>
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����
     */
    $.omWidget('om.omSuggestion', {
        options:/** @lends omSuggestion#*/{
            /**
             * �Ƿ���������������ã��򲻿������룬form�ύʱҲ��������������
             * @type Boolean
             * @default false
             */
            disabled : false,
            /**
             * ����Ƿ�ֻ���������ֻ�����򲻿������룬form�ύʱ���������������
             * @type Boolean
             * @default false
             */
            readOnly : false,
            /**
             * ����������ַ������ڵ���minCharsʱ���ŷ�������<b>ע�⣺���Ҫҳ��һ��ʾ��Ϳ�ʼ��ʾ���������0��</b>
             * @type Number
             * @default 1
             */
            minChars : 1,
            /**
             * ����������ӳ�ʱ�䣨��λ�Ǻ��룩���������300����������ʱÿ��100ms����һ���ַ������������1234ʱ��ֻ����4������ɺ�300ms�Ž���һ����ʾ��<b>ע�⣺���������ֵ���0�����򲻻��ӳ�</b>
             * @type Number
             * @default 500
             */
            delay : 500,
            /**
             * ���ػ������Ŀ��������ÿһ������ֵ���л��棬��������д����������е�����ֵ�����ٷ���ajax����ȡ����<br/>
             * <b>ע�⣺������ֵ����Ϊ�Ǹ�����������cacheSize:0���û���</b>
             * @type Number
             * @default 10
             */
            cacheSize : 10,
            /**
             * Ajax����ʱ�ķ�ʽ��ȡֵGET'��'POST'��
             * @type String
             * @default 'GET'
             */
            method : 'GET',
            /**
             * ����������߶ȣ���λ��px����<b>ע�⣺��������������ƣ�������Ե���Сֵ��31�����С�����ֵʱ����������ֱ������</b>
             * @type Number
             * @default 300
             */
            listMaxHeight : 300,
            /**
             * ����Ajax����ʱ��������ֵ�Ĳ�����������url��'fetchData.jsp?type=book'��queryName��'q'����ǰ�����ֵ��'abc'�������շ��������url��'fetchData.jsp?type=book&q=abc'��
             * @type String
             * @default 'key'
             */
            queryName : 'key',
            /**
             * Ajax�����Ƿ���Ҫ���򣨴ӱ�ҳ�����ڵ���վ����ĵط�ȡ������<b>ע�⣺��������ʱ��̨�����߼�Ҫ�������⴦��������ο�jQuery��JSONP���֪ʶ��</b>
             * @type Boolean
             * @default false
             */
            crossDomain : false,
            /**
             * ���ݳɹ���Ӧ�󴥷��¼���<br/>
             * һ��Ajax����ɹ�����������Ҳ����ʱ�������ִ��onSuccess�¼��ļ����������������false����ʾ���������û�м��������߼���û�з���false��ִ�д�preProcessԤ�������������ʼˢ�²���ʾ������
             * @param text ������ֵ
             * @param data ���������ص�����
             * @name omSuggestion#preProcess
             * @type Function
             * @default ��
             * @example
             * preProcess:function(text,data){
             *      $(data).each(function(){
             *         this.sex = this.sex==0?'��':'Ů';
             *     });
             * }
             */
            preProcess : function(text,data){
                return data;
            },
            /**
             * Ajax�����URL·�������е������ɴ�URL���������������뷵��һ��JSON���顣<br/>
             * ��̨���Է������ָ�ʽ�����ݣ�
             * <ul>
             * <li><b>��ͨ���飨��['a','b','c']�������Բ�����clientFormatter���ԣ�Ҳ��������������ԡ�</b></li>
             * <li><b>����ͨ���飨��{"valueField":"text","data":[{"name":'����',"sex":"��"},{"name":'����',"sex":"Ů"},{"name":'����',"sex":"��"}]}��������valueField��ʾ����ʱ��data��ÿ��JSON������ĸ��ֶλ������������ͨ����ʱ��������clientFormatter���������������������JSON������ʾ���������</b></li>
             * @name omSuggestion#dataSource
             * @type URL
             * @default ��
             * @example
             * dataSource:'/operamasks-ui/getData.json'
             */
            /**
             * ��������ÿ����ʾ���ݵ�ת��������dataSource���и�ʽ����<b>ע�⣺���dataSource���ص��Ƿ���ͨ����(�����뿴dataSource���Ե�����)һ��ҪдclientFormatter���Խ��и�ʽ��</b>����<br/>
             * @name omSuggestion#clientFormatter
             * @type Function
             * @default ��
             * @example
             * //���ڷ���ͨrecordһ��Ҫд�������
             * clientFormatter:function(data,index){
             *         return '&lt;b>'+data.text+'&lt;/b>(���ҵ�'+data.count+'����¼)';
             * }
             * 
             * //������ͨ��recordҲ����д�������
             * clientFormatter:function(data,index){
             *         return '&lt;span style="color:red">'+data+'&lt;/span>;
             * }
             */
            /**
             * ������Ŀ�ȡ�����Ϊ���֡�<b>������ʱĬ���������һ����</b>
             * @name omSuggestion#listWidth
             * @type Number
             * @default ��
             */
            /**
             * ����Ajax����֮ǰ�����¼���<b>ע�⣺return false������ֹ�����͡��޷���ֵ��return true��������������</b>
             * @event
             * @param text ������ﵱǰ�ı�
             * @param event jQuery.Event����
             * @example
             * $('#inputID').omSuggestion({
             *         onBeforeSuggest:function(text,event){
             *                 if(text=='����������'){
             *                         return false;//����ǲ��������ﲻ������ʾ
             *                 }else{
             *                         return true;
             *                 } 
             *         }
             * });
             */
            onBeforeSuggest : function(text,event){/*do nothing*/},
            /**
             * Ajax�����ͺ���Ӧ����ǰ�����¼���
             * @event
             * @param text ������ﵱǰ�ı�
             * @param event jQuery.Event����
             * @example
             * $('#inputID').omSuggestion({
             *         onSuggesting:function(text,event){
             *                 $('#inputID').omSuggestion('showMessage','���ڼ���...'); 
             *         }
             * });
             */
            onSuggesting : function(text,event){/*do nothing*/},
            /**
             * Ajax��Ӧ����ʱ�����¼���
             * @event
             * @param data Ajax���󷵻ص�����
             * @param textStatus ��Ӧ��״̬
             * @param event jQuery.Event����
             * @example
             * $('#inputID').omSuggestion({
             *         onSuccess:function(data, textStatus, event){
             *                 if(data.length==0){
             *                         $('#txt').omSuggestion('showMessage','����ʾ���ݣ�');
             *                 } 
             *         }
             * });
             */
            onSuccess : function(data, textStatus, event){/*do nothing*/},
            /**
             * Ajax�������ʱ�����¼���
             * @event
             * @param xmlHttpRequest XMLHttpRequest����
             * @param textStatus  ��������
             * @param errorThrown  ������쳣����
             * @param event jQuery.Event����
             * @example
             * $('#inputID').omSuggestion({
             *         onError:function(xmlHttpRequest, textStatus, errorThrown, event){
             *                 $('#txt').omSuggestion('showMessage','�������ԭ��'+errorThrown.message); 
             *         }
             * });
             */
            onError : function(xmlHttpRequest, textStatus, errorThrown, event){/*do nothing*/},
            /**
             * ѡ����������һ���󴥷��¼���
             * @event
             * @param text ������ﵱǰ�ı�
             * @param rowData �м�¼����Ajax���󷵻ص������е�һ��
             * @param index ��ǰ�����������������е���������һ����0���ڶ�����1...��
             * @param event jQuery.Event����
             * @example
             * $('#inputID').omSuggestion({
             *         onSelect:function(rowData,text,index,event){
             *                 $('#searchbut').click(); //ѡ������Զ��������ѯ����ť
             *         }
             * });
             */
            onSelect : function(rowData,text,index,event){/*do nothing*/}
        },
        _create:function(){
            this.element.addClass('om-suggestion om-widget om-state-default om-state-nobg');
            this.dropList = $('<div class="om-widget"><div class="om-widget-content om-droplist"></div></div>').css({position:'absolute', zIndex:2000}).appendTo(document.body).children().first().hide();
        },
        _init:function(){
            var self = this,
				options = this.options,
				inputEl = this.element.attr('autocomplete', 'off'),
				dropList = this.dropList;
            //�Ƿ�����ֵ����
            if(options.minChars<0){
                options.minChars=0;
            }
            if(options.cacheSize<0){
                options.cacheSize=0;
            }
            if(options.delay<0){
                options.delay=0;
            }
            //��������
            options.disabled?this.disable():this.enable();
            options.readOnly?inputEl.attr('readonly', 'readonly'):inputEl.removeAttr('readonly');
            //�󶨰����¼�
            inputEl.focus(function(){      
                $(this).addClass("om-state-focus");
            }).blur(function(){      
                $(this).removeClass("om-state-focus");
            }).keydown(function(e){
                if(e.keyCode == $.om.keyCode.TAB){
                    dropList.hide();
                }
            }).keyup(function(e){
                var key = e.keyCode,
                    keyEnum = $.om.keyCode;
                switch (key) {
                    case keyEnum.DOWN: //down
                        if (dropList.css('display') !== 'none') {
                            self._selectNext();
                        } else {
                            if (dropList.find('.' + suggestionRowClass).size() > 0) {
                                dropList.show();
                            }
                        }
                        break;
                    case keyEnum.UP: //up
                        if (dropList.css('display') !== 'none') {
                            self._selectPrev();
                        } else {
                            if (dropList.find('.' + suggestionRowClass).size() > 0) {
                                dropList.show();
                            }
                        }
                        break;
                    case keyEnum.ENTER: //enter
                        if (dropList.css('display') === 'none'){
                            return;
                        }
                        dropList.hide();
                        //trigger onSelect handler
                        self._triggerOnSelect();
                        return false;
                    case keyEnum.ESCAPE: //esc
                        dropList.hide();
                        break;
                    case keyEnum.TAB: //tab
                        //only trigger the blur event
                        break;
                    default:
                        if (options.disabled || options.readOnly) {
                            return false;
                        }
                        if (options.delay > 0) {
                            var delayTimer = $.data(inputEl, 'delayTimer');
                            if (delayTimer) {
                                clearTimeout(delayTimer);
                            }
                            delayTimer = setTimeout(function(){
                                self._suggest();
                            }, options.delay);
                            $.data(inputEl, 'delayTimer', delayTimer);
                        } else {
                            self._suggest();
                        }
                }
            }).mousedown(function(e){
                e.stopPropagation();
            });
            dropList.mousedown(function(e){
                e.stopPropagation();
            });
            $(document).bind('mousedown.omSuggestion',this.globalEvent=function(){
                dropList.hide();
            });
        },
        /**
         * �����������صĻ������ݡ�ÿ����ʾ�󶼻Ὣ��������棨�������ĿΪconfig�����õ�cacheSize�����´�����Ҫ����ͬ���ݽ�����ʾʱ��ֱ�Ӵӻ����ȡ�����������󵽷������������Ҫ���Ի�����ӷ�����������ʾ����Ե��ô˷���������档
         * @name omSuggestion#clearCache
         * @function
         * @returns ��
         * @example
         * $('#txt').omSuggestion('clearCache');
         */
        clearCache:function(){
            $.removeData(this.element,'cache');
        },
        /**
         * ������������ʾһ����ʾ��Ϣ���������Ķ���������ͨ����ݼ������ѡ��������
         * @name omSuggestion#showMessage
         * @function
         * @param message Ҫ��ʾ���������е���Ϣ
         * @example
         * $('#txt').omSuggestion('showMessage','�������ݳ���');
         */
        showMessage: function(message){
            var inputEl = this.element;
            var dropList = this.dropList.empty().css('height','auto');
            $('<div>' + message + '<div>').appendTo(dropList);
            dropList.parent().css('left', inputEl.offset().left).css('top',inputEl.offset().top+inputEl.outerHeight());
            var listWidth = this.options.listWidth;
            if (!listWidth) {//û�ж���
                dropList.parent().width(inputEl.outerWidth());
            } else if (listWidth !== 'auto') {
                dropList.parent().width(listWidth);
            }
            dropList.show();
            var listMaxHeight = this.options.listMaxHeight;
            if(listMaxHeight !== 'auto'){
                if(dropList.height() > listMaxHeight){
                    dropList.height(listMaxHeight).css('overflow','auto');
                }
            }
            return this;
        },
        /**
         * ���������
         * @name omSuggestion#disable
         * @function
         * @example
         * $('#myinput').omSuggestion('disable');
         */
        disable:function(){
            this.options.disabled=true;
            return this.element.attr('disabled', 'disabled').addClass('om-state-disabled');
        },
        /**
         * ���������
         * @name omSuggestion#enable
         * @function
         * @example
         * $('#myinput').omSuggestion('enable');
         */
        enable:function(){
            this.options.disabled=false;
            return this.element.removeAttr('disabled').removeClass('om-state-disabled');
        },
        /**
         * �����µ������ַ���µ�ַ��ʾ�����ĸı���ߵ�ַ�ĸı䡣
         * @name omSuggestion#setData
         * @function
         * @param dataSource
         * @example
         * $('#country').change(function() {
         *   var v = $('#country').val();
         *   $('#txt').omSuggestion("setData","../../../advancedSuggestion.json?contry="+v+"&province=hunan");
         * });
         */
        setData:function(dataSource){
            var options = this.options;
            if(dataSource){
                options.dataSource = dataSource;
            }
			if(options.cacheSize > 0){
			    this.clearCache(); //��ջ���
			}
        },
        /**
         * ��ȡ��ǰ�������е����ݣ��������˷��ص����ݣ���
         * @name omSuggestion#getData
         * @function
         * @return Array[Json]
         * @example
         * $('#txt').omSuggestion("getData");
         */
        getData:function(){
            var returnValue = $.data(this.element, 'records');
            return returnValue || null;
        },
        /**
         * ��ȡ��ǰ�����������
         * @name omSuggestion#getDropList
         * @function
         * @return jQuery Element
         * @example
         * $('#txt').omSuggestion("getDropList").addClass('myselfClass');
         */
        getDropList:function(){
            return this.dropList;
        },
        destroy:function(){
        	$(document).unbind('mousedown.omSuggestion',this.globalEvent);
        	this.dropList.parent().remove();
        },
        _clear:function(){
            this.element.val('');
            return this.dropList.find('.'+suggestionRowClass).removeClass(suggestionHighLightClass);
        },
        _selectNext:function(){
            var dropList = this.dropList,
                index = dropList.find('.' + suggestionHighLightClass).index(),
                all = this._clear();
            index += 1;
            if (index >= all.size()) {
                index = 0;
            }
            this._scrollToAndSelect(all,index,dropList);
        },
        _selectPrev:function(){
            var dropList = this.dropList,
                index = dropList.find('.' + suggestionHighLightClass).index(),
                all = this._clear();
            index-=1;
            if(index<0){
                index=all.size()-1;
            }
            this._scrollToAndSelect(all,index,dropList);
        },
        _scrollToAndSelect:function(all,index,dropList){
        	if(all.size()<1){
        		return;
        	}
            var target = $(all.get(index)).addClass(suggestionHighLightClass);
            var targetTop = target.position().top;
            if (targetTop <= 0) {
                //��Ҫ���Ϲ���������
                dropList.scrollTop(dropList.scrollTop() + targetTop);
            } else {
                //��Ҫ���¹���������
                var offset = targetTop + target.outerHeight() - dropList.height();
                if (offset > 0) {
                    dropList.scrollTop(dropList.scrollTop() + offset);
                }
            }
            this._select(index);
        },
        _select:function(index){
            var inputEl = this.element;
            var records=$.data(inputEl, 'records');
            var rowData,text;
            if(records.valueField){
                rowData=records.data[index];
                text=rowData[records.valueField];
            }else{
                rowData=records[index];
                text=rowData;
            }
            inputEl.val(text);
            $.data(inputEl, 'lastStr', text);
        },
        _suggest:function(){
            var inputEl = this.element;
            var text = inputEl.val();
            var last = $.data(inputEl, 'lastStr');
            if (last && last === text) {
                return;
            }
            $.data(inputEl, 'lastStr', text);
            var options = this.options;
            var cache = $.data(inputEl, 'cache');
            if (text.length > 0 && text.length >= options.minChars) {
                if (cache) {
                    var data = cache[text];
                    if (data) {//�л���
                        $.data(inputEl, 'records', data);
                        this._buildDropList(data, text);
                        return;
                    }
                }
                //�޻���
                if (options.onBeforeSuggest) {
                    if (this._trigger("onBeforeSuggest",null,text) === false) {
                    	this.dropList.empty().hide();
                        return;
                    }
                }
                var self = this;
                var requestOption = {
                    url: options.dataSource,
                    type: options.method,
                    dataType: options.crossDomain ? 'jsonp':'json',
                    data: {},
                    success: function(data, textStatus){
                        var onSuccess = options.onSuccess;
                        if (onSuccess && self._trigger("onSuccess",null,data, textStatus) === false) {
                            return;
                        }
                        var preProcess = options.preProcess;
                        if(preProcess){
                            data = preProcess(text,data);
                        }
                        //�����preProcess��û�з���ֵ
                        if(typeof data === 'undefined'){
                            data=[];
                        }
                        //cache data
                        if (options.cacheSize > 0) {
                            var cache = $.data(inputEl, 'cache') ||
                            {
                                ___keys: []
                            };
                            var keys = cache.___keys;
                            if (keys.length == options.cacheSize) {
                                //cache������ȥ��һ��
                                var k = keys[0];
                                cache.___keys = keys.slice(1);
                                cache[k] = undefined;
                            }
                            cache[text] = data;
                            cache.___keys.push(text);
                            $.data(inputEl, 'cache', cache);
                        }
                        $.data(inputEl, 'records', data);
                        //buildDropList
                        self._buildDropList(data, text);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        var onError = options.onError;
                        if (onError) {
                            self._trigger("onError",null,XMLHttpRequest, textStatus, errorThrown);
                        }
                    }
                };
                requestOption.data[options.queryName]=text;
                $.ajax(requestOption);
                var onSuggesting = options.onSuggesting;
                if (onSuggesting) {
                    self._trigger("onSuggesting",null,text);
                }
            } else {
            	this.dropList.empty().hide();
            }
        },
        _buildDropList:function(records,text){
            var inputEl = this.element;
            var dropList = this.dropList.empty().css('height','auto');
            var isSimple = records.valueField ? false : true;
            var clientFormatter = this.options.clientFormatter;
            var self = this;
            if (isSimple) {
                if (clientFormatter) {
                    $(records).each(function(index){
                        self._addRow(clientFormatter(this, index), dropList);
                    });
                } else {
                    $(records).each(function(index){
                        self._addRow(this, dropList);
                    });
                }
            } else {
                if (clientFormatter) {
                    $(records.data).each(function(index){
                        self._addRow(clientFormatter(this, index), dropList);
                    });
                }
            }
            var all = dropList.find('.' + suggestionRowClass);
            if (all.size() > 0) {
                dropList.parent().css('left', parseInt(inputEl.offset().left)).css('top',inputEl.offset().top+inputEl.outerHeight());
                var listWidth = this.options.listWidth;
                if (!listWidth) {//û�ж���
                    dropList.parent().width(inputEl.outerWidth());
                } else if (listWidth !== 'auto') {
                    dropList.parent().width(listWidth);
                }
                all.mouseover(function(){
                    all.removeClass(suggestionHighLightClass);
                    $(this).addClass(suggestionHighLightClass);
                }).mousedown(function(){
                    var index = dropList.find('.' + suggestionHighLightClass).index();
                    self._select(index);
                    dropList.hide();
                    //trigger onSelect handler
                    self._triggerOnSelect();
                });
                dropList.show();
                var listMaxHeight = this.options.listMaxHeight;
                if(listMaxHeight !== 'auto'){
                    if(dropList.height() > listMaxHeight){
                        dropList.height(listMaxHeight).css('overflow','auto');
                    }
                }
                dropList.scrollTop(0);
            }
        },
        _addRow: function(html,dropList){
            $('<div class="' + suggestionRowClass + '">' + html + '</div>').appendTo(dropList);
        },
        _triggerOnSelect: function(){
            var onSelect=this.options.onSelect;
            if(onSelect){
                var index = this.dropList.find('.' + suggestionHighLightClass).index();
                if(index<0){
                    return;
                }
                var records=$.data(this.element, 'records'),
                    rowData,
                    text;
                if(records.valueField){
                    rowData=records.data[index];
                    text=rowData[records.valueField];
                }else{
                    rowData=records[index];
                    text=rowData;
                }
                this._trigger("onSelect",null,rowData,text,index);
            }
        }
    });
    
})(jQuery);
/*
 * $Id: om-tabs.js,v 1.86 2012/05/08 01:26:58 chentianzhen Exp $
 * operamasks-ui omTabs 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-panel.js
 */
/**
 * $.fn.omTabs
 * ������html�ṹת���һ��tabҳǩ���֡�
 *      <div id="make-tab">
 *          <ul>
 *              <li>
 *                  <a href="#tab1"></a>
 *              </li>
 *              <li>
 *                  <a href="#tab2"></a>
 *              </li>
 *              <li>
 *                  <a href="#tab3"></a>
 *              </li>
 *          </ul>
 *          <div id="tab1">
 *              this is tab1 content
 *          </div>
 *          <div id="tab2">
 *              this is tab2 content
 *          </div>
 *          <div id="tab3">
 *              this is tab3 content
 *          </div>
 *      </div>
 *          ......//some other stuff
 *      
 *  ���յ�dom�ṹ������ʾ��
 * 
 *      <div id="make-tab" class="om-tabs">
 *          <div class="om-tabs-headers">
 *              <ul>
 *                  <li>
 *                      <a href="#tab1"></a>
 *                  </li>
 *                  <li>
 *                      <a href="#tab2"></a>
 *                  </li>
 *                  <li>
 *                      <a href="#tab3"></a>
 *                  </li>
 *              </ul>
 *          </div>
 *          <div class="om-tabs-panels">
 *              <div id="tab1">
 *                  this is tab1 content
 *              </div>
 *              <div id="tab2">
 *                  this is tab2 content
 *              </div>
 *              <div id="tab3">
 *                  this is tab3 content
 *              </div>
 *          </div>
 *      
 *      </div>
 * 
 */
(function(){
    var tabIdPrefix = 'om-tabs-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1) + '-',
        id = 0;
    /**
     * class OmPanel�� ��targetָ���ĵط�����config����һ��Panel�� ������$.fn.omPanel��װ����
     * param target domԪ�أ�һ��ָ��һ��div��
     * param config ����Panel����Ҫ����������������content���ԣ���ʹ����Ϊ���ݽ��ᱻ���ݸ� $.fn.omPanel��
     * return ԭ�ȵ�target
     */
    function OmPanel (target, config) {
        if ( config.content ) {
            $(target).html(config.content);
        }
        return $(target).omPanel(config);
//      return target;
    }

    
    
    /**
     * @name omTabs
     * @class ҳǩ���������ͨ���򵥵�����չʾ��ҳǩ��Ϣ��ͬʱ����ṩ�ḻ���¼�֧�֣�����ѡ��ҳǩ���ر�ҳǩ�����ҳǩ�ȵȡ�<br/>
     * ֧�ָ���ҳǩ��ajax��ʽ�������ݣ�֧�������أ�֧��ҳǩ������<br/>
     * <b>ʹ�÷�ʽ��</b><br/><br/>
     * ҳ���ϵ�html�������
     * <pre>
     * &lt;script type="text/javascript" >
     * $(document).ready(function() {
     *     $('#make-tab').omTabs({});
     * });
     * &lt;/script>
     * 
     *      &lt;div id="make-tab"&gt;
     *          &lt;ul&gt;
     *              &lt;li&gt;
     *                  &lt;a href="#tab1"&gt;Title1&lt;/a&gt;
     *              &lt;/li&gt;
     *              &lt;li&gt;
     *                  &lt;a href="#tab2"&gt;Title2&lt;/a&gt;
     *              &lt;/li&gt;
     *              &lt;li&gt;
     *                  &lt;a href="#tab3"&gt;Title3&lt;/a&gt;
     *              &lt;/li&gt;
     *          &lt;/ul&gt;
     *          &lt;div id="tab1"&gt;
     *              this is tab1 content
     *          &lt;/div&gt;
     *          &lt;div id="tab2"&gt;
     *              this is tab2 content
     *          &lt;/div&gt;
     *          &lt;div id="tab3"&gt;
     *              this is tab3 content
     *          &lt;/div&gt;
     *      &lt;/div&gt;
     * </pre>
     * @constructor
     * @description ���캯��
     * @param p ��׼config����{width:500, height:300}
     * @example
     * $('#make-tab').omTabs({width:500, height:300});
     */    
    $.omWidget('om.omTabs', {
        options : /** @lends omTabs#*/ {
            /**
             * ҳǩ���ֵĿ�ȣ���ȡֵΪ'auto'(Ĭ���������������)������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С(width:100%)��Ҳ����ֱ������width��С����λ�����أ���
             * @default 'auto'
             * @type Number,String
             * @example
             * $('#make-tab').omTabs({width: 500});
             */
            width : 'auto',
            /**
             * ҳǩ���ֵĸ߶ȣ���ȡֵΪ'auto'(Ĭ���������������)������ȡֵΪ'fit'����ʾ��Ӧ�������Ĵ�С(height:100%)��Ҳ����ֱ������height��С����λ�����أ���
             * @default 'auto'
             * @type Number,String
             * @example
             * $('#make-tab').omTabs({height: 200});
             */
            height : 'auto',
            /**
             * �Ƿ���ʾҳǩ�������ı߿�
             * @default true
             * @type Boolean
             * @example
             * $('#make-tab').omTabs({border: false});//����ʾҳǩ�������ı߿�
             */
            border : true,
            /**
             * ����ҳǩͷ���Ŀ�ȡ�
             * @default auto
             * @type Number,String
             * @example
             * $('#make-tab').omTabs({tabWidth: 'auto'});
             */
            tabWidth : 'auto',
            /**
             * ����ҳǩͷ���ĸ߶ȣ���ȡֵΪ'auto'��Ĭ��Ϊ25���ء�
             * @default 25
             * @type Number,String
             * @example
             * $('#make-tab').omTabs({tabHeight: 'auto'});
             */
            tabHeight : 25,
            // TODO: ��ʱ������
            /*
             * �Ƿ��������� 
             * @name omTabs#disabled
             * @default false
             * @type Boolean
             * @example
             * $('#make-tab').omTabs({disabled : true});//��ʼ��ʱ�������
             */
            disabled : false,
            /**
             * ��ҳǩ����������ʱ�Ƿ�������ҹ�����ͷ��
             * @default true
             * @type Boolean
             * @example
             * //��ҳǩ��Ŀ�϶�ʱ����ʾ������ͷ�������ʲ���δ��ʾ��ҳǩ
             * $('#make-tab').omTabs({scrollable: false});
             */
            scrollable : true,
            /**
             * ҳǩ�Ƿ�ɹرգ���������Ϊtrueʱ������ҳǩ�����Թرա�������ֵΪ����ʱ��ֻ��������ָ����index��ҳǩ���Թرգ�index��0��ʼ��
             * @default false
             * @type Boolean,Array
             * @example
             * //ҳǩ�ɹر�
             * $('#make-tab').omTabs({closable : true});
             * 
             * //ֻ�е�һ���͵�����ҳǩ���Թر�
             * $('#make-tab').omTabs({closable : [0,2]);
             */
            closable : false,
            
            //  ��ʱ������
            //  ҳǩͷ����λ�ã���Ϊtop��left //TODO 'left'
            // @default 'top'
            // @type String
            // @example
            // $('#make-tab').omTabs({position : 'left'});//ҳǩͷ������������
            //
            position : 'top',
            /**
             * ҳǩ�л���ģʽ����Ϊclick(������л�)��mouseover(��껬���л�)��<b>ע�⣺��������autoPlay����ʱ����Ȼ������Զ��л�����ʱ�Կ���ʹ�����������껮�����л�ҳǩ</b>
             * @default 'click'
             * @type String
             * @example
             * $('#make-tab').omTabs({switchMode : 'mouseover'});//��껮���л�ҳǩ
             */
            switchMode : 'click',
            /**
             * �Ƿ��Զ�ѭ���л�ҳǩ��
             * @default false
             * @type Boolean
             * @example
             * $('#make-tab').omTabs({autoPlay:true});//�Զ��л�ҳǩ
             */
            autoPlay : false,
            /**
             * �Զ��л�ҳǩ��ʱ��������λΪ���롣 �������� switchMode Ϊautoʱ����Ч��
             * @default 1000
             * @type Number
             * @example
             * $('#make-tab').omTabs({autoPlay:true, interval : 2000});//�Զ��л�ҳǩʱ��ʱ����Ϊ2s
             */
            interval : 1000,
            /**
             * ��ʼ��ʱ������ҳǩ����������0��ʼ����������tabId��
             * @default 0
             * @type Number,String
             * @example
             * $('#make-tab').omTabs({active : 1});//��ʼ��ʱ����ڶ���ҳǩ
             * $('#make-tab').omTabs({active : 'tab-1'});//��ʼ��ʱ����IdΪ'tab-1'��ҳǩ
             */
            active : 0,
            /**
             * �Ƿ������أ���������Ϊtrueʱ��ֻ����ҳǩ������ѡ��ʱ�ų��Լ���ҳǩ��������
             * @default false
             * @type Boolean
             * @example
             * $('#make-tab').omTabs({lazyLoad : true});
             */
            lazyLoad : false,
            /**
             * ��ҳǩ��ѡ��֮ǰִ�еķ�����
             * @event
             * @param n ѡ��ҳǩ����������0��ʼ����.
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onBeforeActivate : function(n,event) {
             *          alert('tab ' + n + ' will be activated!');
             *      }
             *  });
             */
            onBeforeActivate : function(n,event) {
            },
            /**
             * ��ҳǩ��ѡ�к�ִ�еķ�����
             * @event
             * @param n ѡ��ҳǩ����������0��ʼ����.
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onActivate : function(n,event) {
             *          alert('tab ' + n + ' has been activated!');
             *      }
             *  });
             */
            onActivate : function(n,event) {
            },
            /**
             * ��ҳǩ���ر�֮ǰִ�еķ�����
             * @event
             * @param n ���ر�ҳǩ����������0��ʼ������
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onBeforeClose : function(n,event) {
             *          alert('tab ' + n + ' will be closed!');
             *      }
             *  });
             */
            onBeforeClose : function(n,event) {
            },
            /**
             * ��ҳǩ���ر�֮��ִ�еķ�����
             * @event
             * @param n ���ر�ҳǩ����������0��ʼ������
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onClose : function(n,event) {
             *          alert('tab ' + n + ' has been closed!');
             *      }
             *  });
             */
            onClose : function(n,event) {
            },
            /**
             * ���ر�����ҳǩ֮ǰִ�еķ�����
             * @event
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onBeforeCloseAll : function(event) {
             *          alert('all tabs will be closed !');
             *      }
             *  });
             */
            onBeforeCloseAll : function(event) {
            },
            /**
             * ���ر�����ҳǩ֮��ִ�еķ�����
             * @event
             * @param event jQuery.Event����
             * @default emptyFn 
             * @example
             *  $('#make-tab').omTabs({
             *      onCloseAll : function(event) {
             *          alert('tabs are all closed now !');
             *      }
             *  });
             */
            onCloseAll : function() {
            },
            /**
             * ����ҳǩ�����֮��ִ�еķ�����
             * @event
             * @default emptyFn 
             * @param config ���������������ڵ���add����ҳǩʱ�������������������ܲ�����(ʹ��Ĭ��ֵ)���˴���config����������������
             * @param event jQuery.Event����
             * @example
             *  $('#make-tab').omTabs({
             *      onAdd : function(config,event) {
             *          console.dir(config);
             *          alert('you have added a tab at position:' + config.index );
             *      }
             *  });
             */
            onAdd : function(config/*title, content, url, closable , index*/,event) {
            },
            /**
             * ����ҳǩ�����֮ǰִ�еķ�����
             * @event
             * @default emptyFn 
             * @param config ���������������ڵ���add����ҳǩʱ�������������������ܲ�����(ʹ��Ĭ��ֵ)���˴���config����������������
             * @param event jQuery.Event����
             * @example
             *  $('#make-tab').omTabs({
             *      onBeforeAdd : function(config,event) {
             *          console.dir(config);
             *          alert('you will add a tab at position:' + index );
             *      }
             *  });
             */
            onBeforeAdd : function(config/*title, content, url, closable , index*/,event) {
            },
            /**
             * ��ҳǩʹ��ajax��ʽ�������ݣ�������ɺ�ִ�еķ�����
             * @event
             * @default emptyFn
             * @param tabId �ռ�����ɵ�ҳǩ��tabId
             * @param event jQuery.Event����
             * @example
             *  $('#make-tab').omTabs({
             *      onLoadComplete : function(tabId,event) {
             *          alert(tabId + 'has just been loaded!' );
             *      }
             *  });
             */
            onLoadComplete : function(tabId,event) {
            }
        },
        
        /**
         * ��index������һ��tabҳǩ������Ϊjson��ʽ������� ���ø÷����ᴥ�� add�¼���
         * �����������
         * <ol>
         * <li>index������ҳǩ��λ�ã���0��ʼ����,Ĭ����ĩβ����ҳǩ����������Ϊ'last'</li>
         * <li>title������ҳǩ�ı��⣬Ĭ��ֵΪ 'New Title' + ȫ��Ψһ�ַ���</li>
         * <li>content������ҳǩ�����ݣ�Ĭ��ֵΪ 'New Content' + ȫ��Ψһ�ַ���</li>
         * <li>url������ҳǩ������ԴΪurl�����ͬʱ������content��url��������ʹ��url</li>
         * <li>tabId������tabId����ΪΨһ��ʶ������ͨ���˱�ʶΨһȷ��һ��tabҳǩ��tabId�����ظ�</li>
         * <li>closable����������ҳǩ�Ƿ�ɹرա�</li>
         * </ol>
         * @name omTabs#add
         * @function
         * @param Object {index,title,content,url,colsable,tabId}
         * @example
         * //�ڵ�һ��ҳǩ��λ������һ��ҳǩ,��ҳǩ��������Զ������
         * $('#make-tab').omTabs('add', {
         *     index : 0,
         *     title : 'New Tab1',
         *     content : 'New Content1',
         *     closable : false
         * });
         */
        // TODO: index param should support 'first'
        add : function(config /*title, content, url, closable , index,tabId*/) {
            this._add(config /*title, content, url, closable , index,tabId*/);
        },
        
        /**
         * �ر��ض���ҳǩ�����nָ��ǰҳǩ�����ѡ����һҳǩ�������ǰҳǩ����ĩβ��ҳǩ�����ѡ�е�һ��ҳǩ�����Կ���ÿ�ر�һ��ҳǩ�ͻ�ֱ𴥷�һ��close�¼���activate�¼���
         * @name omTabs#close
         * @function
         * @param n Ҫ�رյ�ҳǩ��λ�ã���0��ʼ�����������߸�ҳǩ��tabId(һ��ȫ��Ψһ���ַ���)�� ���δָ���ò�������Ĭ�Ϲرյ�ǰҳǩ��
         * @example
         * //�رյ�һ��ҳǩ
         * $('#make-tab').omTabs('close', 0);
         */
        close : function(n) {
            this._close(n);
        },
        /**
         * �ر�����ҳǩ�����ڸò���ֻ��ע��ɾ������ҳǩ�����ֻ�ᴥ�� onCloseAll�¼����������������ÿ��ҳǩ��onClose�¼���
         * @name omTabs#closeAll
         * @function
         * @example
         * //�ر�����ҳǩ
         * $('#make-tab').omTabs('closeAll');
         */
        closeAll : function() {
            this._closeAll();
        },
    
        /**
         * ѡ���ض���ҳǩ������activate�¼���
         * @name omTabs#activate
         * @function
         * @param n ��Ϊҳǩ����������0��ʼ������������ҳǩ��tabId
         * @example
         * //�����һ��ҳǩ
         * $('#make-tab').omTabs('activate', 0);
         */
        activate : function(n) {
            this._activate(n);
        },
        /**
         * ҳǩ������tabId��ת�������������е�һ��ֵ����ȡ��һ��ֵ��
         * @name omTabs#getAlter
         * @function
         * @param id ��ʶ��
         * @returns ���idΪ���֣����ʾҳǩ����������������ҳǩ��tabId�����idΪ�ַ��������ʾ��ҳǩ��tabId����������ҳǩ��������
         *          ����������Ϸ�����id��ΪtabIdʱ�Ҳ�������ͳһ����null��
         * @example
         * //��ȡ��һ��ҳǩ��tabId
         * var tabId = $('#make-tab').omTabs('getAlter', 0);
         */
        getAlter : function(id) {
            return this._getAlter(id);
        },
        /**
         * ���ص�ǰѡ�е�ҳǩ��tabId��
         * @name omTabs#getActivated
         * @function
         * @returns ��ǰѡ��ҳǩ��tabId
         * @example
         * //��ȡ��ǰѡ��ҳǩ��tabId
         * var activatedTabId = $('#make-tab').omTabs('getActivated');
         */
        getActivated : function() {
            return this._getActivated();
        },
        /**
         * �������ҳǩ����Ŀ��
         * @name omTabs#getLength
         * @function
         * @returns ҳǩ����Ŀ
         * @example
         * //��ȡҳǩ������
         * var total = $('#make-tab').omTabs('getLength');
         */
        getLength : function() {
            return this._getLength();
        },
        /**(deprecated��������reload����)
         * ���õ�n��ҳǩ������Դ����Ϊ��ͨ�ı�����url��ע��÷���ֻ�ǻ�����һ����ǰҳǩ�Ƿ��ѱ����صı�ǣ���������ʵ�ʼ������ݣ�
         * �ڷ������ص�����£���Ҫ�ֶ��������ݡ��������ص�����£���ҳǩ�����ѡ��ʱ�����Ƿ��Ѿ����صı�ǣ��Ӷ��������¼������ݡ�
         * @deprecated
         * @name omTabs#setDataSource
         * @function
         * @param index ������ҳǩ������(��0��ʼ����)
         * @param content �����˸��������ʾ����ԴΪ��ͨ�ı���
         * @param url �����˸����Ա�ʾ����Դ��Զ��url�����ͬʱ������content��url��������ʹ��url��
         * @example
         * //���õ�һ��ҳǩ������ԴΪԶ������
         *  $('#make-tab').omTabs('setDataSource', {
         *      index : 0,
         *      url : './ajax/content1.html'
         *  });
         */
        setDataSource : function(config /*content, url, index*/) {
            if (config.index === undefined || (  !config.url && !config.content )) {
                return;
            }
            this._setDataSource(config /*content, url, index*/);
        },
        /**
         * �����µ�����Դ���¼���ĳ��ҳǩ�����ݡ�
         * @name omTabs#reload
         * @function
         * @param index ҳǩ������
         * @param url ҳǩΪԶ��ȡ��ʱ��url�����������ȼ�����content
         * @param content ҳǩ���ı�����
         * @example
         * //���¼��ص�һ��ҳǩ������
         * $('#make-tab').omTabs('reload', 0 , "./getData.html");
         */
        reload : function(index , url , content) {
            this._reload(index , url , content);
        },
        /**
         * ��������²��֣���Ҫ������ˢ��ҳǩ������ͷ��
         * ����б�Ҫʹ��ҳǩ������ͷ����ˢ�¹�����ͷ��״̬�����û��Ҫʹ��ҳǩ������ͷ���򽫴��ڵ�ɾ����
         * @name omTabs#doLayout
         * @function
         * @example
         * //��������²��֣�����б�Ҫʹ��ҳǩ������ͷ����ˢ�¹�����ͷ��״̬��
         */
        doLayout : function() {
            this._doLayout();
        },
        
        _create : function() {
            var $self = this.element;
            $.data($self, 'omtabs', {});
            $.data($self, 'omtabs').omtabs = this._makeSketch();
            $.data($self, 'omtabs').items = this._collectItems();
            $.data($self, 'omtabs').history = [];//ҳǩ���ʵ���ʷ��¼
        }, 
        
        _init : function() {
            this._render();
            this._afterRender();
            this._buildEvent();
        },
        
        _makeSketch : function() {
	        var $self = this.element,
	        	$tabs = $self.find('>ul').wrap('<div class="om-tabs-headers om-helper-reset om-helper-clearfix om-widget-header om-corner-all"></div>').parent().parent()
	        			.addClass('om-tabs om-widget om-widget-content om-corner-all').append('<div class="om-tabs-panels om-widget-content om-corner-bottom"></div>');
	        //now we have a sketch, which contains the headers and panels
	        return $tabs;
    	},
    	
    	_collectItems : function() {
	        var _self = this,
	        	$self = this.element,
	        	options = this.options,
	        	items = [],
	        	loadInfo = [];
	        $self.find('>div.om-tabs-headers a').each(function(){
	            var href  = this.getAttribute('href', 2);
	            var hrefBase = href.split( "#" )[ 0 ],
	                baseEl;
	            if ( hrefBase && ( hrefBase === location.toString().split( "#" )[ 0 ] ||
	                    ( baseEl = $( "base" )[ 0 ]) && hrefBase === baseEl.href ) ) {
	                href = this.hash;
	                this.href = href;
	            }
	            var anchor = $(this);
	            var tabId = anchor.attr('tabId') || anchor.attr('id') || tabIdPrefix + id++ ;
	            anchor.attr('tabId', tabId);
	            var cfg = {
	                    tabId : tabId,
	                    title : anchor.text(),
	                    _closeMode : "visibility",
	                    header : false,
	                    closed : true,//��ȫ������.
	                    onSuccess : function(data, textStatus, xmlHttpRequest){
	        				_self._trigger("onLoadComplete",null,cfg.tabId);
	        				
			        	},
			        	onError : function(xmlHttpRequest, textStatus, errorThrown){
			        		_self._trigger("onLoadComplete",null,cfg.tabId);
			        	}
	            };

	            var target = $('>' + href, $self)[0];
	            
	            // ���ǵ�tab DOM�ṹ�������������
	            // ���磬��anchor��href='#tab-3'�����û�������tabs����дid=tab-3��DOM����ʱ��Ӧ�ð�#tab-3��Ϊurl����load
	            // http://jira.apusic.net/browse/AOM-204
	            if (!target && href.indexOf('#') != 0) {
	                //�����url�������Ƿ������أ���ֱ�ӽ���panelȥ����
	                if(options.lazyLoad === false){
	                	cfg.url = href;
	                }else{
	                	loadInfo.push({
	                		tabId: tabId,
	                		url: href,
	                		loaded: false  
	                	});
	                }
	            }
	            var item = new OmPanel(target || $('<div></div>')[0], cfg);
	            items.push(item);
	        });
	        
	        if(loadInfo.length > 0){
            	//һ���洢��loadInfo�У���ʾ��tab��û�н��м���(������������)��һ��tab�������ˣ���Ӧ��Ҫɾ����loadInfo��Ϣ
            	$.data($self , "omtabs").loadInfo = loadInfo;
            }
	        // tems ��panel�ļ���.ÿһ��itemͨ�� $(item).omPanel('panel')֮���ܻ�ȡ����Ӧ��panel����
	        return items;
    	},
    	
    	_render : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items;
	        // �Բ��Ϸ���ֵ����
	        if(typeof options.active == 'number'){
	        	if (options.active < 0) {
	        		options.active = 0;
	        	}
	        	if (options.active > items.length - 1) {
	        		options.active = items.length - 1;
	        	}
	        }
	        if (options.width == 'fit') {
	        	$omtabs.outerWidth($omtabs.parent().innerWidth());
	        } else if (options.width != 'auto') {
	            $omtabs.css('width', options.width);
	            // ���IE7�£�tabs��table>tr>td��ul��table�Ŀ�ȳſ������
	//            omtabs.children(':first').css('width',options.width);
	            var isPercent = isNaN(options.width) && options.width.indexOf('%') != -1;
	            $omtabs.children(':first').css('width',isPercent?'100%':options.width);
	        }
	        if (options.height == 'fit') {
	        	$omtabs.outerHeight($omtabs.parent().innerHeight());
	        } else if (options.height != 'auto') {
	            $omtabs.css('height', options.height);
	        }
	        this._renderHeader();
	        this._renderBody();
    	},
    	
		_renderHeader : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs;
	        var $headers = $omtabs.find('>div.om-tabs-headers');
	        var $lis = $headers.find('ul li');
	        $lis.addClass('om-state-default om-corner-top');
	        $lis.each(function(n){
	            //$('a.om-icon-close', $(this)).remove(); ��ʱȥ��
	            
	            var $innera = $(this).find('a:first');
	            if ($.browser.msie && parseInt($.browser.version) == 7 ) {
	                $innera.attr('hideFocus', 'true');
	            }
	            if (!$innera.hasClass('om-tabs-inner')) {
	                $innera.addClass('om-tabs-inner');
	            }
	            if (n === options.active || options.active === $innera.attr('tabId')) {
	                $(this).addClass('om-tabs-activated om-state-active');
	                options.activeTabId = $innera.attr('tabId');
	                options.active = n;
	                var i=0,
	                	his;
	                while(his=data.history[i]){
	                	if(options.activeTabId != his){ //��ֹ�������initʱ�����ظ�����ʷ��¼����active����ȷ
	                		data.history.push(options.activeTabId);
	                		break;
	                	}
	                }
	            } else {
	            	$(this).removeClass('om-tabs-activated om-state-active');
	            }
	            //tab width and height. by default, tabWidth=auto tabHeight=25, accept 'auto'
	            $innera.css({
	                'width' : options.tabWidth,
	                'height' : options.tabHeight
	            });
	            if (options.closable===true || ($.isArray(options.closable) && -1 !== $.inArray(n,options.closable))) {
	            	if($innera.next('.om-icon-close').length <= 0){
	            		$('<a class="om-icon om-icon-close"></a>').insertAfter($innera);
	            	}
	            }else{
	            	$innera.next().remove();
	            }
	        });
	        var aHeight = $lis.find('a.om-tabs-inner').height();
	        $lis.parent().css({
	            'height' : ++ aHeight ,
	            'line-height' : aHeight + 'px'
	        });
	        $headers.height(aHeight + 2);
	        this._checkScroller() && this._enableScroller();
    	},
    	
		_renderBody : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items,
	        	$panels = $omtabs.find('>div.om-tabs-panels');
	        //detach all sub divs
	        $panels.children().detach();
	        if (options.height !== 'auto') {
	            var omtabsHeight = $omtabs.innerHeight(),
	                headersHeight = $omtabs.find('>div.om-tabs-headers').outerHeight();
	            $panels.css('height', omtabsHeight - headersHeight);
	        }
	        options.border ? $omtabs.removeClass('om-tabs-noborder') : $omtabs.addClass('om-tabs-noborder');
	        var i = items.length;
	        while( i-- ) {
				items[i].addClass("om-state-nobd").parent().prependTo($panels);
	        }
    	},
    	
    	_afterRender : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            items = data.items,
	            $omtabs = data.omtabs;
	        var i = items.length;
	        $self.children().each(function(){
	            if (!$(this).hasClass('om-tabs-headers') &&
	                    !$(this).hasClass('om-tabs-panels') ) {
	                $(this).remove();
	            }
	        });
	        if (!options.lazyLoad) {
	            $(items).omPanel('reload');
	        }
	        while( i -- ) {
	            var $target = $(items[i]);
	            if (i == options.active) {
	                $target.omPanel('open');
	            } else {
	                $target.omPanel('close');
	            }
	        }
	        $omtabs.css('height',$omtabs.height());
	    	$omtabs.css('height',options.height);
    	},
    	
		_buildEvent : function() {
	        var that = this,
	        	$self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            $closeIcon = $omtabs.find('>div.om-tabs-headers a.om-icon-close');
	        //close icon
	        $closeIcon.unbind('click.omtabs');
	        $closeIcon.bind('click.omtabs', function(e){
	            var tabid = $(e.target).prev().attr('tabId');
	            that._close(tabid);
	            return false;
	        });
	        // tab click
	        var $tabInner = $omtabs.find('>div.om-tabs-headers a.om-tabs-inner'); 
	        if (options.switchMode.indexOf('mouseover') != -1) {
	        	$tabInner.bind('mouseover.omtabs', function() {
	                 var tabId = $(this).attr('tabId'), timer = $.data($self, 'activateTimer');
	                (typeof timer !=='undefined') && clearTimeout(timer);
	                timer = setTimeout(function(){
	                    that._activate(tabId);
	                    return false;
	                },500);
	                $.data($self, 'activateTimer', timer);
	            });
	        } else if (options.switchMode.indexOf('click') != -1 ) {
	        	$tabInner.bind('click.omtabs', function(){
	                that._activate($(this).attr('tabId'));
	            });
	        }
	        $tabInner.bind('click.omtabs',function(){
	        	return false;
	        });
	        if (options.autoPlay != false ) {
	            options.autoInterId = setInterval(function(){
	                $self.omTabs('activate', 'next');
	            }, options.interval);
	        } else {
	            clearInterval(options.autoInterId);
	        }
	        //tab hover
	        if ( options.switchMode.indexOf("mouseover") == -1 ) {
	            var $lis = $omtabs.find('>div.om-tabs-headers li');
	            var addState = function( state, $el ) {
	                if ( $el.is( ":not(.om-state-disabled)" ) ) {
	                    $el.addClass( "om-state-" + state );
	                }
	            };
	            var removeState = function( state, $el ) {
	                $el.removeClass( "om-state-" + state );
	            };
	            $lis.bind( "mouseover.omtabs" , function() {
	                addState( "hover", $( this ) );
	            });
	            $lis.bind( "mouseout.omtabs", function() {
	                removeState( "hover", $( this ) );
	            });
	        }
	        //scroller click
	        $omtabs.find('>div.om-tabs-headers >span').bind('click.omtabs', function(e) {
	            if ($(this).hasClass('om-tabs-scroll-disabled')) {
	                return false;
	            }
	            var dist = $(this).parent().find('ul').children(':last').outerWidth(true);
	            if ($(this).hasClass('om-tabs-scroll-left')) {
	                that._scroll(dist, that._scrollCbFn());
	            }
	            if ($(this).hasClass('om-tabs-scroll-right')) {
	                that._scroll(- dist, that._scrollCbFn());
	            }
	            return false;
	        });
		},
		
    	//remove every events.
		_purgeEvent : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs;
	        var $headers = $omtabs.find('>div.om-tabs-headers');
	
	        $headers.children().unbind('.omtabs');
	        $headers.find('>ul >li >a').unbind('.omtabs');
	        if (options.autoInterId) {
	            clearInterval(options.autoInterId);
	        }
    	},
    	
	    /**
	     * ѡ���ض���ҳǩ
	     * n ��Ϊҳǩ����������0��ʼ������������ҳǩ��tabId TODO n ��Ҫ֧��first  �� last ��ʾѡ�е�һ�������һ��
	     */
     	_activate : function(n) {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items,
	            url;
	        var $ul = $omtabs.find('>div.om-tabs-headers ul');
	        if ( options.activeTabId == n || options.active == n ) {
	            return false;
	        }
	        n = n || 0;
	        var $anchor , tid = n;
	        if ( n == 'next' ) {
	            n = (options.active + 1) % items.length ;
	        } else if ( n == 'prev' ) {
	            n = (options.active - 1) % items.length ;
	        } 
	        if (typeof n == 'number') {
	            tid = this._getAlter(n);
	        } else if (typeof n == 'string') {
	            n = this._getAlter(n);
	        }
	        if (options.onBeforeActivate && this._trigger("onBeforeActivate",null,n) == false) {
	            return false;
	        }
	        $anchor = $ul.find('li a[tabId=' + tid + ']');
	        $anchor.parent().siblings().removeClass('om-tabs-activated om-state-active');
	        $anchor.parent().addClass('om-tabs-activated om-state-active');
	        options.activeTabId = tid;
	        options.active = n;
	        var i = items.length;
	        // ��֤�л����ʱ����ʾ�����أ���ֹҳ�涶��������
	        for(i=items.length;i--;i>=0){
	        	var $target = items[i];
	        	if ($target.omPanel('option' , 'tabId')== tid) {
	        		$target.omPanel('open');
	        		if(url=this._getUnloadedUrl(tid)){
	        			$target.omPanel("reload" , url);
	        			this._removeLoadInfo(tid);
	        		}
	        	}
	        }
	        for(i=items.length;i--;i>=0){
	        	var $target = items[i];
	        	if ($target.omPanel('option' , 'tabId') != tid) {
	        		$target.omPanel('close');
	        	}
	        }
	        //��ѡ����һ����δ��ȫ��ʾ��ҳǩ,��Ҫ����������ȫ��ʾ����
	        if (this._checkScroller()) {
	            //stop every animation.
	            $ul.stop(true, true);
	            $self.clearQueue();
	            var $lScroller = $ul.prev();
	            var $rScroller = $ul.next();
	            var lBorder = $anchor.parent().offset().left;
	            var rBorder = lBorder + $anchor.parent().outerWidth(true);
	            var lDiff = $lScroller.offset().left + $lScroller.outerWidth(true) + 4 - lBorder ;
	            var rDiff = $rScroller.offset().left - rBorder ;
	            if (lDiff >= 0) {
	                this._scroll(lDiff, this._scrollCbFn());
	            } else if (rDiff <= 0) {
	                this._scroll(rDiff, this._scrollCbFn());
	            } else {
	                this._scrollCbFn()();
	            }
	        }
	        var his = data.history,
	        	index = data.history.length;
	        while(his[--index] && tid !== his[index]){};
	        index==-1 ? his.push(tid) : his.push(his.splice(index , 1)[0]);
	        options.onActivate && this._trigger("onActivate",null,n);
    	},
    
		/**
    	 * �����Ӧ��tab�Ѿ����ع��ˣ�����null,���򷵻�ָ��tab��url
    	 */
		_getUnloadedUrl : function(tid){
    		var loadInfo = $.data(this.element, 'omtabs').loadInfo, 
    			len,
    			info;
    		if(loadInfo){
    			len = loadInfo.length;
    			while(info=loadInfo[--len]){
    				if(info.tabId === tid && info.loaded === false){
    					return info.url;
    				}
    			}
    		}
    	 	return null;
		},
		
		/**
		 * �Ѷ�Ӧ��tab��loadInfo��Ϣɾ����
		 */
		_removeLoadInfo : function(tid){
			var loadInfo = $.data(this.element, 'omtabs').loadInfo, 
    			len,
    			info;
    		if(loadInfo){
    			len = loadInfo.length;
    			while(info=loadInfo[--len]){
    				if(info.tabId === tid){
    					loadInfo.splice(len , 1);
    					break;
    				}
    			}
    		}
		},
		
		/**
		 * ��Ӷ�Ӧ��tab��loadInfo��Ϣ
		 */
		_addLoadInfo : function(tabId , url){
			$.data(this.element, 'omtabs').loadInfo.push({
				tabId : tabId , 
				loaded: false , 
				url : url
			});
		},
    
	    /**
	     * ҳǩ������tabId��ת������
	     * ��������idΪ���֣����ʾҳǩ����������������ҳǩ��tabId�����idΪ�ַ��������ʾ��ҳǩ��tabId����������ҳǩ��������
	     */
		_getAlter : function(id) {
	        var $self = this.element,
	        	$omtabs = $.data($self, 'omtabs').omtabs,
	            rt;
	        if (typeof id == 'number'){
	            rt = $omtabs.find('>div.om-tabs-headers li:nth-child(' + ++id + ') a.om-tabs-inner').attr('tabId');
	        } else if (typeof id == 'string') {
	            $omtabs.find('>div.om-tabs-headers li a.om-tabs-inner').each(function(i){
	                if ($(this).attr('tabId') == id ) {
	                    rt = i;
	                    return false;
	                }
	            });
	        }
	        return rt===undefined? null : rt;//����Ҳ���Ҫ����null,������undefined,��Դ��om-core.js�ж��ڷ���undefined�����ջ᷵�����ʵ��
    	},
    	
	    /**
	     * ���ص�ǰѡ�е�ҳǩ��tabId
	     */
    	_getActivated : function() {
			return this.options.activeTabId;
    	},
    	
	    /**
	     * ����һ��tab��ҳǩ������.���һ������isAjaxָʾ��ds�Ƿ�Ϊһ��URL
	     */
    	_add : function(config/*title, content, url, closable , index,tabId*/) {
	        var _self = this,
	        	$self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items;
	        var $ul = $omtabs.find('>div.om-tabs-headers ul');
	        var tabId = config.tabId?config.tabId:tabIdPrefix + id++;
	        //��������
	        config.index = config.index || 'last';
	        if (config.index == 'last' || config.index > items.length - 1) {
	            config.index = items.length;
	        }
	        config.title = config.title || 'New Title ' + tabId;
	        config.url = $.trim(config.url);
	        config.content = $.trim(config.content);
	        if (config.url) {
	            config.content = undefined;
	        } else {
	            config.url = undefined;
	            config.content = config.content || 'New Content ' + tabId;
	        }
	        if (options.onBeforeAdd && _self._trigger("onBeforeAdd",null,config/*title, content, url, closable , index*/) == false) {
	            return false;
	        }
	        var $nHeader=$('<li class="om-state-default om-corner-top"> </li>');
	        var $anchor = $('<a class="om-tabs-inner"></a>').html(config.title).attr({
	                href : '#' + tabId,
	                tabId : tabId
	            }).css({
	                width : options.tabWidth,
	                height : options.tabHeight
	            }).appendTo($nHeader);
	        if ($.browser.msie && parseInt($.browser.version) == 7) {
	            $anchor.attr('hideFocus','true');
	        }
	        if ((config.closable === true) || 
	                (config.closable == undefined && options.closable)) {
	            $anchor.after('<a class="om-icon om-icon-close"></a>');
	        }
			var cfg = {
	            tabId : tabId,
	            title : $anchor.text(),
	            _closeMode : "visibility",
	            header : false,
	            closed : true,
                onSuccess : function(data, textStatus, xmlHttpRequest){
    				_self._trigger("onLoadComplete",null,tabId);
	        	},
	        	onError : function(xmlHttpRequest, textStatus, errorThrown){
	        		_self._trigger("onLoadComplete",null,tabId);
	        	}
	        };
	        if(config.url){
	        	cfg.url = config.url;
	        }
	        $.extend(cfg, config);
	        var $nPanel = new OmPanel($('<div>'+(config.content || '')+'</div>')[0],cfg);
	        if (config.index == items.length) {
	            items[config.index] = $nPanel;
	            $nHeader.appendTo($ul);
	        } else {
	            //insert at index
	            items.splice(config.index, 0, $nPanel);
	            $ul.children().eq(config.index).before($nHeader);
	        }
	        //om-tabs����Ӻܶ��ҳǩ�󣬵�ҳǩͷ�Ŀ�ȳ���5000px��ʱ����ֻ��С�����������п���Զ�����
            if($ul.innerWidth()-$nHeader.position().left<500){
                $ul.width($ul.width()+500);
            }
	        //every time we add or close an tab, check if scroller is needed.
	        this._checkScroller() && this._enableScroller();
	        this._renderBody();
	        this._purgeEvent();
	        this._buildEvent();
	        this._trigger("onAdd",null,cfg);
	        this._activate(config.index);
    	},
    	
	    /**
	     * ��index����ҳǩ�رգ����indexָ��ǰҳǩ���򼤻���һҳǩ�������ǰҳǩ�����һ��ҳǩ���򼤻��һ��ҳǩ
	     * index :ҳǩ��λ�ã���Ϊ���֣�tabId�ȡ� TODO index��Ҫ֧��prev��  next�� first�� last
	     */
    	_close : function(index) {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items,
	        	$headers = $omtabs.find('>div.om-tabs-headers'),
	        	$panels = $omtabs.find('>div.om-tabs-panels'),
	        	omtabsHeight = $omtabs.height(),
	        	tabId = index,//���رյ�tab��id
	        	his = data.history;//ҳǩ����ʷ��¼
	        index = (index === undefined ? options.active:index);
	        if (typeof index == 'string') {
	            //index is a tabid
	            index = this._getAlter(index);
	        }else{
	        	tabId = this._getAlter(index);
	        }
	        if (options.onBeforeClose && this._trigger("onBeforeClose",null,index) == false) {
	            return false;
	        }
	        //����ɾ��loadInfo���б�Ҫ�ģ���ΪҲ���tab������û�м��������ȴ�������ص�
	        this._removeLoadInfo(this._getAlter(index));
	        $headers.find('li').eq(index).remove();
	        $panels.children().find(">.om-panel-body").eq(index).remove();
	        items.splice(index, 1);
	        //in case of all tabs are closed, set body height
	        if ($panels.children().length == 0) {
	            $panels.css({height : omtabsHeight - $headers.outerHeight()});
	        }
	        var len = his.length;
	        while(his[--len] && tabId === his[len]){
	        	his.splice(len , 1);
	        	break;
	        }
	        options.onClose && this._trigger("onClose",null,index);
	        if (items.length == 0) {
	            options.active = -1;
	            options.activeTabId = null;
	            return ;
	        } else if (index == options.active) {
	            options.active = -1;
	            this._activate(his.length>0? his.pop() : 0);
	        } else {
	            index < options.active && options.active --;
	            this._checkScroller() && this._enableScroller();
	        }
    	},
    	
	    /**
	     * �ر�����ҳǩ���ò����ᴥ�� closeAll�¼�
	     */
     	_closeAll : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs,
	            items = data.items,
	        	$headers = $omtabs.find('>div.om-tabs-headers'),
	        	$panels = $omtabs.find('>div.om-tabs-panels'),
	        	omtabsHeight = $omtabs.height();
	        
	        if (options.onBeforeCloseAll && this._trigger("onBeforeCloseAll") == false) {
	            return false;
	        }
	        for(var i=0,len=items.length; i<len; i++){
	        	this._removeLoadInfo(items[i].omPanel("option" , "tabId"));
	        }
	        $headers.find('li').remove();
	        $panels.children().remove();
	        items.splice(0,items.length);
	        $panels.css({height : omtabsHeight - $headers.outerHeight()});
	        options.active = -1;
	        options.activeTabId = null;
	        data.history = [];
	        options.onCloseAll && this._trigger("onCloseAll");
    	},
    	
	    /**
	     * ���tabҳǩ�ܿ�Ƚϴ�����ʾscroll������true������ɾ��scroll������false��
	     */
     	_checkScroller : function() {
	        var $self = this.element,
	        	data = $.data($self, 'omtabs'),
	            options = this.options,
	            $omtabs = data.omtabs;
	        if (!options.scrollable) {
	            return false;
	        }
	        var $ul = $omtabs.find('>div.om-tabs-headers ul');
	        var totalWidth = 0, flag = false;
	        if ($ul.hasClass('om-tabs-scrollable')) {
	            //�ȼٶ�û�����ҹ����� ,���������Ƿ񳬹�.
	            flag = true;
	            $ul.removeClass('om-tabs-scrollable');
	        }
	        totalWidth += parseInt($ul.css('paddingLeft')) + parseInt($ul.css('paddingRight'));
	        if (flag == true) {
	            //���¼��Ϲ����� .
	            flag = false;
	            $ul.addClass('om-tabs-scrollable');
	        }
	        $ul.children().each(function() {
	            //����һ��liռ�õ��ܿ��
	            totalWidth += $(this).outerWidth(true);//sub element's width
	        });
	        if (totalWidth > $ul.parent().innerWidth()) {
	            if (!$ul.hasClass('om-tabs-scrollable')) {
	                var $leftScr = $('<span></span>').insertBefore($ul).addClass('om-tabs-scroll-left');
	                var $rightScr = $('<span></span>').insertAfter($ul).addClass('om-tabs-scroll-right');
	                var mgn = ($ul.height() - $leftScr.height())/2;
	                $leftScr.add($rightScr).css({ // scroller in vertical center.
	                    'marginTop' : mgn,
	                    'marginBottom' : mgn
	                });
	                $ul.addClass('om-tabs-scrollable');
	            }
	            return true;
	        } else {
	            $ul.siblings().remove();
	            $ul.removeClass('om-tabs-scrollable');
	            return false;
	        }
    	},
    	
	    /**
	     * һ�����֮����Ҫִ�лص�_enableScroller���ù�������״̬���ְ�װ�ɷ�����
	     */
    	_scrollCbFn : function() {
    		var that = this;
	        return function(){
	            that._enableScroller();
	        };
    	},
    	
	    /**
	     * ����ҳǩ��λ�ã�����scroller��״̬��
	     * �����ұߵ�ҳǩ��ס����ұ��أ����ұߵ�scrollerӦ�ý��ã���ʾ���������ҹ����ˡ�
	     * ������ߵ�ҳǩ��ס�������أ�����ߵ�scrollerӦ�ý��ã���ʾ��������������ˡ�
	     */
     	_enableScroller : function() {
	        var $self = this.element,
	        	$omtabs = $.data($self, 'omtabs').omtabs,
	       		$headers = $omtabs.find('>div.om-tabs-headers'),
	        	$ul = $headers.children('ul'),
	        	$lScroller = $ul.prev(),
	        	$rScroller = $ul.next(),
	        	$li = $ul.children(':last'),
	        	lBorder = $headers.offset().left,
	            rBorder = $rScroller.offset().left,
	            ulLeft = $ul.offset().left,
	            ulRight = $li.offset().left + $li.outerWidth(true);
	        if (ulLeft < lBorder) {
	            $lScroller.removeClass('om-tabs-scroll-disabled');
	        } else {
	            $lScroller.addClass('om-tabs-scroll-disabled');
	            //_scroll(self, lBorder - ulLeft);
	        }
	        if (ulRight > rBorder) {
	            $rScroller.removeClass('om-tabs-scroll-disabled');
	        } else {
	            $rScroller.addClass('om-tabs-scroll-disabled');
	            //_scroll(self, rBorder - ulRight);
	        }
    	},
    	
	    /**
	     * ��ҳǩͷ�����ұ߻���distance�ľ��롣��distanceΪ����ʱ����ʾ����߻�����fnΪ�ص�����
	     */
     	_scroll : function(distance, fn) {
	        var $self = this.element,
	        	$omtabs = $.data($self, 'omtabs').omtabs,
	        	$ul = $omtabs.find('>div.om-tabs-headers ul'),
	        	$li = $ul.children(':last');
	        if (distance == 0) {
	            return;
	        }
	        var scrOffset = distance > 0 ? $ul.prev().offset() : $ul.next().offset();
	        var queuedFn = function(next) {
	            if (distance > 0 && $ul.prev().hasClass('.om-tabs-scroll-disabled') ||
	                    distance < 0 && $ul.next().hasClass('.om-tabs-scroll-disabled')){
	                $ul.stop(true, true);
	                $self.clearQueue();
	                return;
	            }
	            var flag = false;
	            //fix distance.
	            distance = (distance > 0) ? '+=' + Math.min(scrOffset.left - $ul.offset().left, distance) : 
	                '-=' + Math.min($li.offset().left + $li.outerWidth(true) - scrOffset.left, Math.abs(distance));
	            $.data($self, 'omtabs').isScrolling = true;
	            $ul.animate({
	                left : distance + 'px'
	            },'normal', 'swing', function() {
	                !!fn && fn();
	                $.data($self, 'omtabs').isScrolling = false;
	                next();
	            });
	        };
	        $self.queue(queuedFn);
	        if( $self.queue().length == 1 && 
	                !$.data($self, 'omtabs').isScrolling){
	            $self.dequeue(); //start queue
	        }
    	},
    	
	    /**
	     * ��õ�ǰ����ҳǩ����Ŀ
	     */
	    _getLength : function() {
	        return $.data(this.element, 'omtabs').items.length;
	    },
	    
	    /**
	     * ���¼���omTabs����
	     */
	    _doLayout : function() {
	        this._checkScroller() && this._enableScroller();
	    },
	    
	    /**
	     * ���õ�config.index��ҳǩ������Դ�����������cofnig.url��������ԴΪԶ�����ݣ����������config.content����ԴΪ��ͨ�ı���
	     */
	    _setDataSource : function(config /*content, url, index*/) {
	        var $self = this.element,
	        	items = $.data($self, 'omtabs').items,
	        	options = this.options,
	        	tabId = this._getAlter(config.index);
	        config.url = $.trim(config.url);
	        config.content = $.trim(config.content);
	        if(config.url){
	        	if(options.lazyLoad !== false){
	        		this._addLoadInfo(tabId , config.url);
	        		items[config.index].omPanel("option" , "url" , config.url);	       
	        	}else{
	        		this._removeLoadInfo(tabId);
					items[config.index].omPanel("reload" , config.url);					 		
	        	}
	        }else{
	        	items[config.index].html(config.content);
	        }
	    },
	    
	    /**
	     * ���¼��ص�n��ҳǩ������
	     */
	    _reload : function(index , url , content) {
	    	var $self = this.element,
	        	items = $.data($self, 'omtabs').items,
	        	tabId = this._getAlter(index);
	        if(url){
	        	this._removeLoadInfo(tabId);
	        	items[index].omPanel("reload" , url);	
	        }else if(content){
	        	items[index].html(content);
	        }else{//ֻ��������
	        	//case1:���һ��ҳǩ��δ���ع�����omPanel�в����ᱣ����url,������������ٴ�һ��url��omPanel��
	        	//case2:ҳǩ����Ѿ����ع��ˣ���ô����omPanel��url������null,�⽫���������¼��ء�
	        	items[index].omPanel("reload" , this._getUnloadedUrl(tabId));
	        	this._removeLoadInfo(tabId);
	        }
	    }
    });
})(jQuery);/*
 * $Id: om-tooltip.js,v 1.12 2012/03/20 06:40:32 luoyegang Exp $
 * operamasks-ui omTooltip 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
;(function($) {
    /**
     * @name omTooltip
     * @class ��ʾ�������ĳ�����ӡ�������������Ҫ����������ʾ��ʱ�����ʹ�ñ������
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>��ʾ���ݶ����������������֣�html��ҳ��dom�ڵ㻹�������첽���ص�����</li>
     *      <li>�첽�������ݵ�ʱ��֧��������</li>
     *      <li>����޶Ƚ�Լ��Դ��ֻ����Ҫʹ�õ�ʱ�����ҳ�����domԪ��</li>
     *      <li>֧�����б�׼htmlԪ��</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" &gt;
     * $(document).ready(function() {
     *     $('#tip').omTooltip({
     *         trackMouse : true,
     *         html : '&lt;div style="color:red;"&gt;��ӭʹ��omTooltip���&lt;/div&gt;'
     *     });
     * });
     * &lt;/script&gt;
     * 
     * &lt;input id="tip" type="submit" /&gt;
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param p ��׼config����{}
     */
    $.omWidget('om.omTooltip', {
        options: /**@lends omTooltip# */{
            /**
             * ��ʾ��Ŀ�ȡ�
             * @type Number 
             * @default 'auto' 
             * @example
             * $("#tip").omTooltip({width: 100}); 
             */
            width : 'auto',
            /**
             * ��С��ȣ�����ʾ���ݺ��ٵ�ʱ��Ϊ����ʽ������ʾָ���Ŀ�ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({minWidth: 100}); 
             */
            minWidth : null,
            /**
             * ����ȣ�����Ҫ���������Զ���Ӧ��ȶ��ֲ�����Ϊ����̫�������̫������������ʹ��maxWidht����һ������ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({maxWidth: 200}); 
             */
            maxWidth : null,
            /**
             * ��ʾ��ĸ߶ȡ�
             * @type Number 
             * @default 'auto' 
             * @example
             * $("#tip").omTooltip({height: 100}); 
             */
            height : 'auto',
            /**
             * ���߶ȣ��߶�Ĭ������Ӧ�����ﵽ���߶�֮����������� ��
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({maxHeight: 100}); 
             */
            maxHeight : null,
            /**
             * ��С�߶ȡ�
             * @type Number 
             * @default null 
             * @example
             * $("#tip").omTooltip({minHeight: 100}); 
             */
            minHeight : null,
            /**
             * �������Ŀ������֮�󵯳���ʾ����ӳ�ʱ��(ms) ��ͬʱҲ�������ӳٵ��¼���
             * @type Number 
             * @default 300 
             * @example
             * $("#tip").omTooltip({delay: 300}); 
             */
            delay : 300,
            /**
             * �Ƿ���ʾanchor��Ĭ�ϲ���ʾ�����trackMouseΪtrue������ʾ�����Ͻǣ���������棬
             * �����region����ȷ������ͷ�ķ�����Զָ����ʾ��Ŀ�ꡣ
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({anchor: false}); 
             */
            anchor : false,
            /**
             * ��ʾ���Ƿ��������ƶ�,Ĭ�ϲ���������ƶ�������Ϊtrue���������ƶ���
             * ��region���ȼ��͡�
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({trackMouse: false}); 
             */
            trackMouse : false,
            /**
             * ��ʾ��ʾ��Ĵ�����ʽ,��ѡֵ��mouseover��click 
             * @type String 
             * @default 'mouseover' 
             * @example
             * $("#tip").omTooltip({showOn: click}); 
             */
            showOn : "mouseover",
            /**
             * ajax��ʽ��ʾ���ݵ�ʱ���Ƿ��ӳټ���ҳ�棬����������url����Ч 
             * @type Boolean 
             * @default false 
             * @example
             * $("#tip").omTooltip({url:'a.html',lazyLoad: true}); 
             */
            lazyLoad : false,
            /**
             * ajax�������ݵ�url��ַ,���ص����ݸ�ʽdataTypeΪhtml
             * @type String 
             * @default null 
             * @example
             * $("#tip").omTooltip({url:'a.html'}); 
             */
            url : null,
            /**
             * ��ʾ����ʾ��ָ��λ�õ�ƫ���,��ʾ�������ֻ�׼λ�ã�һ����꣬����Ŀ������,
             *  ��һ������Ϊtopƫ��ֵ���ڶ���Ϊleftƫ��ֵ��
             * @type Object 
             * @default [5,5] 
             * @example
             * $("#tip").omTooltip({offset:[10,15]}); 
             */
            offset : [5,5],
            /**
             * anchorƫ�ƶ�(px),
             * ������anchorΪtop��button��ʱ��ƫ�ƶ�ָ���������ߵľ��룻
             * Ϊleft��right��ʱ��ƫ�ƶ�ָ��������ϵľ���
             * @type Number
             * @default 0
             * @example
             * $("#tip").omTooltip({anchorOffset:10}); 
             */
            anchorOffset : 0,
            /**
             * ��ʾ����ʾ������,������ʾ����ʾ��������������ã�
             * �������ĵ�ǰλ��Ϊ��׼����ʾ����������ƶ���
             * �������������Ŀ��Ϊ��׼����ʾ,��ѡֵ��left��right��top��bottom��
             * ����ѡ����left������ʾ����Զ������Ŀ�����ߣ��������Ŀ�ꡣ
             * @type String
             * @default null
             * @example
             * $("#tip").omTooltip({region:'bottom'}); 
             */
            region : null,
            /**
             * ��ʾ�����ʾ�����ݣ�������html����ͨ�ַ�,���ȼ���contentEL���Ըߡ�
             * @type String
             * @default null
             * @example
             * $("#tip").omTooltip({html:'&lt;span style="color:red;"&gt;����omTooltip&lt;/span&gt;'}); 
             */
            html : null,
            /**
             * jqueryѡ���������Ի�ȡҳ���domԪ����Ϊ��ʾ���ݣ���ʽΪ#ID��.className��tagName�ȣ����ȼ���html���Ե͡�
             * @type selector
             * @default null
             * @example
             * $("#tip").omTooltip({contentEL:'#aa'}); 
             */
            contentEL : null
            
        },
        _create:function(){
            this.tipContent = $('<div class="tip-body"></div>');
            this.tipAnchor = $('<div class="tip-anchor"></div>');
            this.regionMap = {'right':'left','top':'bottom','left':'right','bottom':'top'};
            this.tip = $('<div class="tip"></div>').append(this.tipContent);
        },
        /**
         * ��ʼ����������Ҫ���ø߿���������
         */
        _init:function(){
            var self = this , options = self.options;
            
            this.tipContent.empty();
            this.tip.find('div.tip-anchor').remove();
            
            if(options.anchor){
                self.tip.append(self.tipAnchor);
            }
            self.adjustWidth = 6 ; //����߿�
            self.adjustHeight =  6 ;
            if(options.width != 'auto'){
                this.tip.css('width',options.width-self.adjustWidth);
            }else{
                this.tip.css('width','auto');
            }
            if(options.height != 'auto'){
                this.tip.css('height',options.height - self.adjustHeight);
            }else{
                this.tip.css('height','auto');
            }
            if(options.minWidth) {
                this.tip.css('minWidth',options.minWidth - self.adjustWidth);
            }
            if(options.maxWidth){
                this.tip.css('maxWidth',options.maxWidth - self.adjustWidth);
            }
            if(options.maxHeight){
                this.tip.css('maxHeight',options.maxHeight - self.adjustHeight);
            }
            if(options.minHeight){
                this.tip.css('minHeight',options.minHeight - self.adjustHeight);
            }
            /**
             * ���ݼ��ص����ȼ�Ϊurl��html��contentEl��ǰ�߻Ḳ�Ǻ���
             */
            if(options.url && !options.lazyLoad){ //�����ajax��ʽ���Ҳ���������ģʽ���棬��ʼ�������ʱ�����������
                self._ajaxLoad(options.url);
            }else if(options.html){
                this.tip.find('.tip-body').append(options.html);
            }else{
                this.tip.find('.tip-body').append($(options.contentEL).html());
            }
            this._bindEvent();
        },
        /**
         * ajax�����첽�������ݣ����ص����ݸ�ʽΪhtml��
         * @param url
         */
        _ajaxLoad:function(url){
            var self = this;
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'html',
                success: function(data, textStatus){
                    self.tip.find('.tip-body').append(data);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    self.tip.find('.tip-body').append($.om.lang.omTooltip.FailedToLoad);
                }
            });
        },
        /**
         * ����ʾ����¼���ͬʱ�������õ�delay�������ӳ���ʾ���ӳ����ش���
         * ��������뿪��Ŀ�����򣬵��ǻ�ͣ������ʾ���ڵ�ʱ��������
         */
        _bindEvent : function(){
            var self = this , options = self.options , element = self.element;
            if(options.showOn == 'mouseover'){ //mouseover��ʱ����ʾ
                element.bind('mouseover',function(e){
                    if(self.showTime)clearTimeout(self.showTime); 
                    self.showTime = setTimeout(function(){
                        self.show(e);
                    },options.delay);
                });
            }else if(options.showOn == 'click'){ //click��ʱ����ʾ
                self.showTime = element.bind('click',function(e){
                    setTimeout(function(){
                        self.show(e);
                    },options.delay);
                });
            }
            if(options.trackMouse){
                element.bind('mousemove',function(e){
                    self._adjustPosition(e);
                });
            }
            element.bind('mouseleave',function(){
                if(self.showTime)clearTimeout(self.showTime); 
                self.hideTime = setTimeout(function(){ self.hide(); }, options.delay);
            });
            self.tip.bind('mouseover',function(){
                if(self.hideTime){clearTimeout(self.hideTime);}
            }).bind('mouseleave',function(){
                setTimeout(function(){ self.hide(); }, options.delay);
            });
        },
        /**
         * ��ʾ��������ֻ������ʾ��ʱ�����ӵ�dom����
         * �ڶ�����ʾ�Ѿ�����dom����ֻ��Ҫ�ı���ʾ״̬��
         * @name omTooltip#show
         * @function
         * @example
         * $('#mytip').omTooltip('show');
         */
        show : function(e){
            var self = this ,options = self.options;
            if($(document.body).find(self.tip).length <= 0){ //���û��д��dom���������
                if(options.url && options.lazyLoad){
                    self._ajaxLoad(options.url);
                }
                self.tip.appendTo(document.body).fadeIn();
                self._adjustPosition(e);
            }else{
                self._adjustPosition(e);
                self.tip.fadeIn();
            }
        },
        /**
         * ������ʾ���λ�ã����������event��trackMouseΪtrue��������event���������λ��
         * ��Ϊ��ʾ��Ļ���λ�ã��ٸ������õ�offset�ȼ������յ���ʾ��λ��
         * ���û�д���event����trackMouseΪfalse������ʾ����Ŀ��λ��Ϊ����λ�ã��ٸ���offset
         * region�Ȳ������������������λ�á�
         * ��������������Ŀ�ȶ���ʾ�����������region������right����������ұ��Ѿ�û���㹻�Ŀռ�
         * ������ʾ����Ὣ��ʾ����ʾ����ߣ�region������bottom��ʱ��ͬ��
         * @param event
         */
        _adjustPosition : function(event){
            var self = this , options = self.options , 
            element = self.element , top ,left,
            offSet = $(element).offset();
           if(event && !options.region){
                top = event.pageY + options.offset[0]; 
                left = event.pageX + options.offset[1]; 
                //anchor��������ľ��룬ʹ���û����õ�ƫ�Ƽ�ȥtip�ĸ߶Ⱥ͵��ڸ߶�
                self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left':'-9px'}).addClass('tip-anchor-left');
           }else{
               var bottomWidth = parseInt($(element).css('borderBottomWidth').replace('px',''));
               top = offSet.top +  $(element).height() + (isNaN(bottomWidth)?0:bottomWidth) +options.offset[0]; //1px��Ϊ���ھ���
               left = offSet.left +options.offset[1];
               //-----------����region������ʾ�̶�λ��--------------
               if(options.region == 'right'){ //offset������ƫ right��ΪĬ������
                   left = offSet.left + options.offset[1] + $(element).width() + self.adjustWidth; //Ԫ�ص�offset�����ƶ�$(element).widht()�ľ���
                   top = top - self.element.height() + self.adjustHeight + options.offset[0]; 
                   self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left':'-9px'}); //Ҫ��ȥ����ĸ߶�,ȥ��3px��radius
               }else if(options.region == 'left'){ //offset������ƫ
                   left = offSet.left - self.tip.width() - self.adjustWidth - options.offset[1] - 2; //����Ļ���Ҫ��ȥtip����Ŀ��
                   top = top - self.element.height() - self.adjustHeight - options.offset[0];
                   self.tip.find('.tip-anchor').css({'top':options.anchorOffset+3,'left': self.tip.outerWidth()-2}); //��anchor�����ƶ�tip�Ŀ��
               }else if(options.region == 'top'){ //offset������ƫ
                   top = top - (self.element.height() + self.tip.height() + self.adjustHeight + 2) - options.offset[0];
                   left = left + options.offset[1];
                   self.tip.find('.tip-anchor').css({'top':self.tip.outerHeight()-3, 'left':options.anchorOffset+3}); //25+4
               }else if(options.region == 'bottom'){ //offset������ƫ
                   top = top + options.offset[0];
                   left = left + options.offset[1];
                   self.tip.find('.tip-anchor').css({'top': -9, 'left':options.anchorOffset + 3});
               }
               self.tip.find('.tip-anchor').addClass('tip-anchor-'+self.regionMap[options.region]);
           }
           if((left + self.tip.width()) > document.documentElement.clientWidth){ //���ұ߾�����̵�ʱ��Ὣ��ʾ����������
               left = left - self.tip.width() - 20;
           }
           if((top + self.tip.height()) > document.documentElement.clientHeight){ //���±߾�����̵�ʱ��Ὣ��ʾ��������ϱ�
               top = top - (self.element.height() + self.tip.height()) - 20;
           }
           self.tip.css({'top':top - $(document).scrollTop(),'left':left - $(document).scrollLeft()});
        },
        /**
         * ���������
         * @name omTooltip#hide
         * @function
         * @example
         * $('#mytip').omTooltip('hide');
         */
        hide : function(){
            this.tip.hide();
        },
        destroy : function(){
        	clearTimeout(this.showTime);
        	clearTimeout(this.hideTime);
        	this.tip.remove();
        }
    });
    $.om.lang.omTooltip = {
            FailedToLoad : '������ʾ��Ϣ����'
    };
})(jQuery);/*
 * $Id: om-tree.js,v 1.108 2012/05/07 07:49:55 wangfan Exp $
 * operamasks-ui omTree 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 */
/**
     * @name omTree
     * @class �������<br/><br/>
     * treenode ֧������json��ʽ��<br/>
     * ��һ��Ϊ��<br/>
     * <pre>
     * {
     *     text:'node1', // ���ڵ���ʾ�ı�������
     *     expanded:true, // �Ƿ�Ĭ��չ�����Ǳ��룬Ĭ��ֵ��false
     *     classes:'folder', // ���ڵ���ʽ���Ǳ��裬Ĭ����folder��file������û��Զ���Ϊ����������ʾ�û��Զ�����ʽ
     *     children:childrenDataArray, //�ӽڵ㣬�Ǳ��衣������ʱ����û��������� 
     *     hasChildren: false // �Ƿ����ӽڵ㣬�Ǳ��裬���ֵΪtrue��ʾҪ�����ش�ʱ����û��children����
     * } 
     * </pre>
     * �ڶ���Ϊ��<br/>
     * <pre>
     * {
     *     id:'n1', //���ڵ�ı�ʶ������
     *     pid: 'n0' //���ڵ�id���Ǳ��裬���û�����øýڵ��Ϊ���ڵ�
     *     text:'node1', // ���ڵ���ʾ�ı�������
     *     expanded:true, // �Ƿ�Ĭ��չ�����Ǳ��룬Ĭ��ֵ��false
     *     classes:'folder' // ���ڵ���ʽ���Ǳ��裬Ĭ����folder��file������û��Զ���Ϊ����������ʾ�û��Զ�����ʽ
     * } 
     * </pre>
     * ע�⣺���ʹ�õڶ���json��ʽ����Ҫ��simpleDataModel����ֵ����Ϊtrue��
     * omTreeΪÿ���ڵ��Զ����ɵ�Ψһ��ʶnid�����ɹ���ΪtreeId+ "_" + ���������û���omTree��ҳ���ϱ���
     * ʹ�ô��ֹ��������������nid������Ҫ�û����г�ʼ���������ڲ�������
     * <br/>
     * <b>�ص㣺</b><br/>
     * <ol>
     *      <li>����ʹ�ñ�������Դ��Ҳ����ʹ��Զ������Դ</li>
     *      <li>֧�����ݵĻ����أ���ʼȡ��ʱ��ȡ�ӽڵ����ݣ���һ��չ��ʱ�ſ�ʼ���̨ȡ����</li>
     *      <li>�ṩ�ḻ���¼�</li>
     * </ol>
     * 
     * <b>ʾ����</b><br/>
     * <pre>
     * &lt;script type="text/javascript" >
     * var data = 
     *       [{
     *           "text": "1. Review of existing structures",
     *           "children":[{
     *               "text": "1.1 jQuery core"
     *           }]
     *       }, {
     *           "text": "2. Wrapper plugins",
     *           "expanded": true,
     *           "children":[{
     *               "text":"2.1 wrapper tips",
     *               "expanded": true,
     *               "children": [{
     *                   "text":"2.1.1 wrapper loader tips"
     *               },{
     *                   "text":"2.1.2 wrapper runder tips"
     *               }]
     *           },{
     *               "text":"2.2 tree nodes"
     *           }]
     *       }, {
     *           "text": "3. Summary"
     *       }, {
     *           "text": "4. Questions and answers"
     *       }];
     *   $(document).ready(function(){
     *       $("#mytree").omTree({
     *           dataSource : data
     *       });
     *   });
     * &lt;/script>
     * 
     * &lt;ul id="mytree"/>
     * </pre>
     * 
     * @constructor
     * @description ���캯��. 
     * @param options ��׼options����{}
     */
;(function($) {
    /**
     * treenode: { text:'node1', expanded:true}
     */
    
    var CLASSES =  {
            open: "open",
            closed: "closed",
            expandable: "expandable",
            expandableHitarea: "expandable-hitarea",
            lastExpandableHitarea: "lastExpandable-hitarea",
            collapsable: "collapsable",
            collapsableHitarea: "collapsable-hitarea",
            lastCollapsableHitarea: "lastCollapsable-hitarea",
            lastCollapsable: "lastCollapsable",
            lastExpandable: "lastExpandable",
            last: "last",
            hitarea: "hitarea"
        };
    
    $.omWidget("om.omTree", {
        _swapClass: function(target, c1, c2) {
            var c1Elements = target.filter('.' + c1);
            target.filter('.' + c2).removeClass(c2).addClass(c1);
            c1Elements.removeClass(c1).addClass(c2);
        },
        
        /**
         * target: treenode LI DOM 
         */
        _getParentNode :function (target){
            if(target){
                var $pnode = $(target).parent().parent();
                if($pnode && $pnode.hasClass("om-tree-node")) {
                    return $pnode;
                }
            }
            return null;
        },
        
        _setParentCheckbox: function (node){
            var pnode = this._getParentNode(node);
            if (pnode){
                var checkbox = pnode.find(">ul >li >div.tree-checkbox");
                var allChild = checkbox.length;
                var full_len = checkbox.filter(".checkbox_full").length;
                var part_len = checkbox.filter(".checkbox_part").length;
                var pnode_checkbox = pnode.find(">div.tree-checkbox"); 
                pnode_checkbox.removeClass("checkbox_full checkbox_part");
                if(full_len == allChild) {
                    pnode_checkbox.addClass("checkbox_full");
                } else if(full_len > 0 || part_len > 0) {
                    pnode_checkbox.addClass("checkbox_part");
                }
                this._setParentCheckbox(pnode);
            }
        },
        
        _setChildCheckbox : function (node, checked){
            var childck = node.find(">ul").find('.tree-checkbox');
            childck.removeClass("checkbox_part checkbox_full");
            if(checked) {
                childck.addClass("checkbox_full");
            }
        },
        
        // target equal the li elements
        _applyEvents: function(target) {
            var self = this,
                options = self.options,
                onClick = options.onClick,
                onDblClick = options.onDblClick,
                onRightClick = options.onRightClick,
                onDrag =options.onDrag,
                onSelect = options.onSelect,
                onDrop = options.onDrop;
            target.find("span a").bind("click",function(e){
            	var node = self.element.data("nodes")[$(this).parent().parent().attr("id")];
           	    onClick && self._trigger("onClick",e,node);
                self.select(node);
                return false;
            }).bind("dblclick", function(e){
            	var nDom = $(this).parent().parent();
                var node = self.element.data("nodes")[nDom.attr("id")];
                if(nDom.hasClass("hasChildren")){
                	nDom.find("span.folder")
            		.removeClass("folder").addClass("placeholder");
            	}
                if ( nDom.has("ul").length >0 && $(e.target, this) )
                    self.toggler(nDom);
                nDom.find("span.placeholder").removeClass("placeholder").addClass("folder");
                onDblClick && self._trigger("onDblClick",e,node);
            }).bind("contextmenu", function(e){
                     var node = self.element.data("nodes")[$(this).parent().parent().attr("id")];
                     onRightClick && self._trigger("onRightClick",e,node);
            }).bind("mouseover mouseout", function(e){
                      if(e.type == "mouseover"){
                          $(this).addClass("hover");
                      }
                      else if(e.type == "mouseout"){
                          $(this).removeClass("hover");
                      }
                      return false;
            });
            self._bindHitEvent(target);
			
			 target.find("div.tree-checkbox").click(function(e){
                var node = $(this).parent();
                var nodedata = self.findByNId(node.attr("id"));
                self._toggleCheck(node, self.isCheck(nodedata));
            });
            if (self.options.draggable) {
                target.omDraggable({
                    revert: "invalid",
                    onStart: function(ui,e) {
                    	var node = self.findByNId(ui.helper.attr("id"));
                        onDrag && self._trigger("onDrag",e,node);
                    }
                });
                target
                .find(">span")
                .omDroppable({
                    accept : "li.om-tree-node",
                    hoverClass : "treenode-droppable",
                    onDrop : function(source, event) {
                        var pnode,bnode,$item = source;
                        var $drop = this.parent();
                        var $list = $drop.find(">ul");
                        $item.css("left", "");
                        $item.css("top", "");
                        var drop = self.findByNId($drop.attr("id"));
                        var dragnode = self.findByNId($item.attr("id"));
                        if($drop.has("ul").length > 0){
                           pnode = drop;
                        }else{
                           bnode = drop; 
                           dragnode.pid = drop.pid;
                        }
                        var node = self.findByNId($item.parent().find("li").attr("id"));
                        self.remove(dragnode);
                        self.insert(dragnode, pnode, bnode, true);
                        onDrop && self._trigger("onDrop",event,node);
                    }
                });
            }
            target.bind("mousedown", function(e){
                e.stopPropagation();                
            });
        },
        _bindHitEvent: function(target){
        	var self=this;
        	target.find("div.hitarea").click(function() {
                var node = $(this).parent();
                if(node.hasClass("hasChildren")){
            		node.find("span.folder")
            		.removeClass("folder").addClass("placeholder");
            	}
                self.toggler(node);
                node.find("span.placeholder").removeClass("placeholder").addClass("folder");
            });
        },
        options: /** @lends omTree#*/{
            /* �ݲ�֧��
             * ����ʼ״̬ʱչ���Ĳ㼶.
             * @type Number
             * @default 0
             * @example
             * $("#mytree").omTree({initExpandLevel:2});
             */
            initExpandLevel: 0,
            /**
             * ����Դ���ԣ���������Ϊ��̨��ȡ���ݵ�URL������dataSource : 'treedata.json'
             * Ҳ��������Ϊ��̬���ݣ����ݱ���ΪJSON��ʽ���飬����dataSource : [{"text":"iPhone"},{"text":"iPad"}]��
             * ����֧������JSON��ʽ����һ��Ϊ
             * <pre>
             * {
             *     text: 'node1', // ���ڵ���ʾ�ı�������
             *     expanded: true, // �Ƿ�Ĭ��չ��
             *     classes: 'folder', // ���ڵ���ʽ���Ǳ��裬Ĭ����folder��file���û����Զ��ƴ���ʽ
             *     hasChildren: false // ���ڵ������ص�����£��ýڵ���չ��ʱ�Զ����̨ȡ��
             * }
             * </pre>
             * �ڶ���Ϊ��
             * <pre>
             * {
             *     id:'n1', //���ڵ�ı�ʶ������
             *     pid: 'n0' //���ڵ�id���Ǳ��裬���û�����øýڵ��Ϊ���ڵ�
             *     text: 'node1', // ���ڵ���ʾ�ı�������
             *     expanded: true, // �Ƿ�Ĭ��չ��
             *     classes: 'folder' // ���ڵ���ʽ���Ǳ��裬Ĭ����folder��file���û����Զ��ƴ���ʽ
             * }
             * </pre>
             *  ע�⣺���ʹ�õڶ���json��ʽ����Ҫ��simpleDataModel����ֵ����Ϊtrue��
             * @name omTree#dataSource
             * @type String,Array[JSON]
             * @default ��
             * @example
             * dataSource : 'treedata.json'
             * ����
             * dataSource : [{"text":"iPhone"},{"text":"iPad"}]
             */
            /* �ݲ�֧��
             * ��껮��ĳ���ڵ�ʱ�Ƿ������
             * @type Boolean
             * @default false
             * @example
             * $("#mytree").omTree({lineHover:false});
             */
            lineHover: false,
            /**
             * ���ڵ��Ƿ���ʾͼ�ꡣ
             * @type Boolean
             * @default true
             * @example
             * $("#mytree").omTree({showIcon:false});
             */
            showIcon: true,
            /* �ݲ�֧��
             * ���ڵ�֮���Ƿ���ʾ���ߡ�
             * @type Boolean
             * @default true
             * @example
             * $("#mytree").omTree({showLine:true});
             */
            showLine: true,
            /**
             * �Ƿ���ʾcheckbox��
             * @type Boolean
             * @default false
             * @example
             * $("#mytree").omTree({showCheckbox:false});
             */
            showCheckbox: false,
            /**
             * �Ƿ���ѡ�У���������showCheckboxΪtrue��ʱ����Ч��
             * @type Boolean
             * @default true
             * @example
             * $("#mytree").omTree({cascadeCheck:true});
             */
            cascadeCheck: true,
            /**
             * ���ڵ��Ƿ����ק��
             * @type Boolean
             * @default false
             * @example
             * $("#mytree").omTree({draggable:true});
             */
            draggable: false,
            /*
             * �ݲ�֧�֣�ͨ�������������ڵ㣬�÷����ᱻÿ�����ڵ���ã�������Ϊfalse���ýڵ�ᱻ���˵���
             * @type function
             * @default null
             * @example
             * ��Ҷ�ӽڵ���˵�
             * fucntion fn(node){
             *   if(node.children){
             *      return true;
             *   }
             *   retrun false;
             * } 
             * $("#mytree").omTree({filter:fn});
             */
            filter: null,
            // before refresh the node ,you can change the node
            // nodeFomatter:null,
            nodeCount:0,
            /**
             * ����Դ�Ƿ�Ϊ������ģ�͡�
             * @type Boolean
             * @default false
             * @example
             * $("#mytree").omTree({simpleDataModel:true});
             */
            simpleDataModel: false
        },
        _create: function() {
            this.element.data("nodes", [])
                    .data("selected", "").data("init_dataSource", [])
                    .addClass("om-tree om-widget");
        },
       
        updateNode: function(target) {
            var self = this, options = self.options;
            // prepare branches and find all tree items with child lists
            var branches = target.find("li");
            //.prepareBranches(options);
            
            //self._applyClasses(branches);
            self._applyEvents(branches);
            
            if(options.control) {
                self._treeController(self, options.control);
            }
        },
        
        
        
        // handle toggle event
        // change the target to the treenode (li dom)
        toggler: function(target) {
            var self = this,
                options = self.options;
            var nid = target.attr("id");
            var node = self.findByNId(nid);
            var hidden = target.hasClass(CLASSES.expandable);
            
            if ( hidden ) {
                var onBeforeExpand = options.onBeforeExpand;
                if(onBeforeExpand && false === self._trigger("onBeforeExpand",null,node)){
                    return self;
                }
            } else {
                var onBeforeCollapse = options.onBeforeCollapse;
                if(onBeforeCollapse && false === self._trigger("onBeforeCollapse",null,node)){
                    return self;
                }
            }
            
            // swap classes for hitarea
            var hitarea = target.find( target.find(">.hitarea") );
            self._swapClass(hitarea, CLASSES.collapsableHitarea, CLASSES.expandableHitarea);
            self._swapClass(hitarea, CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea);
            
            // swap classes for li
            self._swapClass(target, CLASSES.collapsable, CLASSES.expandable);
            self._swapClass(target, CLASSES.lastCollapsable, CLASSES.lastExpandable);
            
            // find child lists
            target.find( ">ul" )
                .each(function(){
                    if ( hidden ) {
                        $(this).show();
                        var onExpand = options.onExpand;
                        onExpand && self._trigger("onExpand",null,node);
                    } else {
                        $(this).hide();
                        var onCollapse = options.onCollapse;
                        onCollapse && self._trigger("onCollapse",null,node);
                    }
                });
        },
        
        _init: function() {
            var self = this, options = self.options,
                target = self.element,
                source = options.dataSource;
            target.empty();
            if(source) {
                if(typeof source == 'string'){
                    self._ajaxLoad(target, source);
                }else if(typeof source == 'object'){
                	if(options.simpleDataModel){
                		source = self._transformToNodes(source);
                	}
                	target.data("init_dataSource", source);
                    self._appendNodes.apply(self, [target, source]);
                    self.updateNode(target);
                }
            }
        },
        
        _ajaxLoad:function(target, url){
            var self = this,
                options = this.options,
                onBeforeLoad = options.onBeforeLoad,
                onSuccess = options.onSuccess,
                onError = options.onError;
            onBeforeLoad && self._trigger("onBeforeLoad",null,self.findByNId(target.parent().attr("id")));
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'json',
                cache: false,
                success: function(data){
                	if(options.simpleDataModel){
                		data = self._transformToNodes(data);
                	}
                	target.data("init_dataSource", data);
                    self._appendNodes.apply(self, [target, data]);
                    self.updateNode(target);
                    onSuccess && self._trigger("onSuccess",null,data);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    onError && self._trigger("onError",null,XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },
        /* -------------------- check and select node ------------------- */
        /**
         * ��ָ���ڵ�ǰ�Ĺ�ѡ������Ϊ����ѡ״̬���÷���ֻ��������showCheckboxΪtrueʱ����Ч��
         * @name omTree#check
         * @function
         * @param target ָ���ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @example
         * //��target�ڵ�Ĺ�ѡ״̬����Ϊ����ѡ״̬
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('check',target);
         */  
        check: function(target) {
            this._toggleCheck($("#" + target.nid), false);
        },
        /**
         * ��ָ���ڵ�ǰ�Ĺ�ѡ������Ϊδ����ѡ״̬���÷���ֻ��������showCheckboxΪtrueʱ����Ч��
         * @name omTree#uncheck
         * @function
         * @param target ָ���ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @example
         * //��target�ڵ�Ĺ�ѡ״̬����Ϊ������ѡ״̬
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('uncheck',target);
         */  
        uncheck: function(target) {
            this._toggleCheck($("#" + target.nid), true);
        },
        
        // target equal le elem
        _toggleCheck: function(target, checked) {
            var checkbox_item = target.find(">div.tree-checkbox"), self = this,
            options = self.options,
            onCheck = options.onCheck;
            if(checked) {
                checkbox_item
                    .removeClass("checkbox_part checkbox_full");
            } else {
                checkbox_item
                    .removeClass("checkbox_part")
                    .addClass("checkbox_full");
            }
            if(self.options.cascadeCheck) {
                self._setChildCheckbox(target, !checked);
                self._setParentCheckbox(target);
            }
            onCheck && self._trigger("onCheck",null,self.findByNId(target.attr("id")));
        },
        /**
         * �����нڵ�Ĺ�ѡ������Ϊ����ѡ״̬���÷���ֻ��������showCheckboxΪtrueʱ����Ч��
         * @name omTree#checkAll
         * @function
         * @param checked ָ����ѡ��Ĺ�ѡ״̬��checkedΪtrueΪ����ѡ״̬��ΪfalseΪδ����ѡ״̬
         * @example
         * //�����нڵ�Ĺ�ѡ������Ϊ����ѡ״̬
         * $('#myTree').omTree('checkAll',true);
         */  
        checkAll: function(checked) {
            if(checked) {
                this.element
                    .find(".tree-checkbox")
                    .removeClass("checkbox_part")
                    .addClass("checkbox_full");
            } else {
                this.element
                    .find(".tree-checkbox")
                    .removeClass("checkbox_part checkbox_full");
            }
        },
        /**
         * �ж�ָ���ڵ�Ĺ�ѡ״̬���÷���ֻ��������showCheckboxΪtrueʱ����Ч��
         * @name omTree#isCheck
         * @function
         * @param target ָ���ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @returns true or false
         * @example
         * //�ж�target�ڵ�Ĺ�ѡ״̬
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('isCheck',target);
         */  
        isCheck: function(target) {
            return $("#"+target.nid)
                       .find(">div.tree-checkbox")
                       .hasClass("checkbox_full");
        },
        /**
         * ��ȡ���б���ѡ��δ����ѡ�ڵ��JSON���ݶ��󼯺ϡ�
         * @name omTree#getChecked
         * @function
         * @param checked ָ����ѡ��Ĺ�ѡ״̬��checkedΪtrueΪ����ѡ״̬��ΪfalseΪδ����ѡ״̬��Ĭ��Ϊfalse
         * @returns JSON���ݶ��󼯺�
         * @example
         * //��ȡ���б���ѡ�ڵ��JSON���ݶ��󼯺�
         * $('#myTree').omTree('getChecked',true);
         */      
        getChecked: function(checked) {
            var self = this,
                nodes = [];
            var filter_config = checked?".checkbox_full":":not(.checkbox_full)";
            this.element
                .find(".tree-checkbox")
                .filter(filter_config).each(function(i,name){
                    nodes.push(self.element.data("nodes")[$(this).parent().attr("id")]);
                });
            return nodes;
        },
        /**
         * ��ָ���ڵ�����Ϊѡ��״̬��
         * @name omTree#select
         * @function
         * @param target ָ���ڵ��JSON���ݣ����Ҹýڵ������а�����nid���ԡ�
         * @example
         * //��target�ڵ�����Ϊѡ��״̬
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('select',target);
         */  
        select: function(target) {
            var self = this,
                options = this.options,
                onBeforeSelect = options.onBeforeSelect,
                onSelect = options.onSelect;
            if(onBeforeSelect && false === self._trigger("onBeforeSelect",null,target)) {
                return self;
            }
            var node = $("#" + target.nid);
            var a = $(" >span >a", node);
            a.addClass("selected");
            var oldSelected = self.element.data("selected");
            var curSelected = node.attr("id");
            if(oldSelected != "" && !(oldSelected == curSelected)) {
                $("#" + oldSelected + " >span >a").removeClass("selected");
            }
            self.element.data("selected", curSelected);
            onSelect && self._trigger("onSelect",null,target);
        },
        /**
         * ��ָ���ڵ�����Ϊδѡ��״̬��
         * @name omTree#unselect
         * @function
         * @param target ָ���ڵ��JSON���ݣ����Ҹýڵ������а�����nid����
         * @example
         * //��target�ڵ�����Ϊδѡ��״̬
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('unselect',target);
         */
        unselect: function(target) {
            var self = this;
            var node = $("#" + target.nid);
            var a = $(" >span >a", node);
            a.removeClass("selected");
            var oldSelected = self.element.data("selected");
            var curSelected = node.attr("id");
            if( oldSelected == curSelected) {
                self.element.data("selected", "");
            }
        },
        /**
         * ��ȡ��ѡ�еĽڵ��JSON���ݶ���
         * @name omTree#getSelected
         * @function
         * @returns JSON���ݶ���
         * @example
         * //��ȡ��ѡ�нڵ��JSON���ݶ���
         * $('#myTree').omTree('getSelected');
         */
        getSelected: function() {
            var selected = this.element.data("selected");
            return selected ? this.element.data("nodes")[selected] : null;
        },
        
        /* -------------------- find node ------------------- */
        /**
         * ���ݽڵ����ݵ����Ծ�ȷ���ҽڵ� pNode ������ӽڵ��е� JSON ���ݶ��󼯺ϡ�
         * @name omTree#findNodes
         * @function
         * @param key ���в��ҵĽڵ����ݵ���������
         * @param value ����ֵ
         * @param pNode ��ѡ��ָ���ĸ��ڵ㣬Ĭ��Ϊ�������нڵ�
         * @param deep ��ѡ���Ƿ�ݹ�����ӽڵ㣬Ĭ��Ϊ�ݹ�����ӽڵ�
         * @returns JSON���ݶ��󼯺�
         * @example
         * //�����������ڵ������ԡ�classes�����ڡ�folder���Ľڵ�
         * $('#myTree').omTree('findNodes', "classes", 'folder', "",true);
         */
        findNodes: function(key, value, pNode, deep) {
            var result = [], len;
            var data = pNode ? pNode.children :this.element.data("init_dataSource");
            deep = (deep!=false)? true : deep;
            if(data && (len = data.length) > 0) {
                for(var i = 0; i < len; i++){
                  result = this._searchNode.apply(data[i], [key, value, this._searchNode, result, false, deep]);
                }
           }
            return result.length > 0 ? result : null;
        },
        /**
         * ���ݽڵ����ݵ����Ծ�ȷ���ҽڵ� pNode ���ӽڵ������������� JSON ���ݶ���
         * ���ҵ���һ�����������Ľڵ���ֹͣ���ң����ظýڵ㡣
         * @name omTree#findNode
         * @function
         * @param key ���в��ҵĽڵ����ݵ���������
         * @param value ����ֵ
         * @param pNode ��ѡ��ָ���ĸ��ڵ㣬Ĭ��Ϊ�������нڵ�
         * @param deep ��ѡ���Ƿ�ݹ�����ӽڵ㣬Ĭ��Ϊ�ݹ��ѯ�ӽڵ�
         * @returns JSON���ݶ���
         * @example
         * //�����������ڵ��е�һ���������ԡ�classes�����ڡ�folder���Ľڵ�
         * $('#myTree').omTree('findNode', "classes", 'folder', "",true);
         */
        findNode: function(key, value, pNode, deep){
            var res, len, data = pNode ? pNode.children : this.element.data("init_dataSource");
            deep = (deep!=false)? true : deep;
            if(data && (len = data.length)> 0) {
                for(var i = 0; i < len; i++){
                  res = this._searchNode.apply(data[i], [key, value, this._searchNode, [], true, deep]);
                  if(res != null){
                      return res;
                  }
               }
           }
            return null;
        },
        /**
         * ����nid��ȷ���ҽڵ㡣���ҵ���һ�����������Ľڵ���ֹͣ���ң����ظýڵ㡣
         * @name omTree#findByNId
         * @function
         * @param nid �ڵ��Ψһ��ʶ,��ֵ���Զ����ɵģ����ɹ���ΪtreeId+ "_" + ����
         * @returns JSON���ݶ���
         * @example
         * //���ҡ�nid�����ڡ�treeId_4���Ľڵ�
         * $('#myTree').omTree('findByNId','treeId_4');
         */
        findByNId : function(nid) {
            return this.element.data("nodes")[nid]||null;
        },
        /**
         * ����ָ������fn��ȷ����ָ��pNode���ӽڵ�������������JSON���ݶ��󼯺ϣ�����fn�п��Զ��帴�ӵĲ�ѯ�߼���
         * @name omTree#findNodesBy
         * @function
         * @param fn ָ���Ĳ��Һ���������Ϊ�ڵ��JSON���ݶ��󣬺�������Ϊtrue��Ľڵ����������������֮false����������
         * @param pNode ��ѡ��ָ���ĸ��ڵ㣬Ĭ��Ϊ�������нڵ�
         * @param deep ��ѡ���Ƿ�ݹ�����ӽڵ㣬Ĭ��Ϊ�ݹ�����ӽڵ�
         * @returns JSON���ݶ��󼯺�
         * @example
         * //���ݺ���fn���ҷ������������нڵ��JSON���ݶ��󼯺�
         * $('#myTree').omTree('findNodesBy',fn);
         */
        findNodesBy: function(fn, pNode, deep){
            var res, data = pNode ? pNode.children : this.element.data("init_dataSource");
            deep = (deep!=false)? true : deep;
            var result = [];
            if(data && (len = data.length)> 0) {
             for(var i = 0; i < len; i++){
                if(fn.call(data[i], data[i]) === true){
                    result.push(data[i]);
                }
                if(deep && data[i].children){
                    res = this.findNodesBy(fn, data[i], deep);
                    if(res){
                        result = result.concat(res);
                    }
                }
              }
            }
            return result.length > 0 ? result : null;
        },
        /**
         * ����ָ������fn��ȷ����ָ��pNode���ӽڵ������������ĵ�һ���ڵ��JSON���ݶ��󣬺���fn�п��Զ��帴�ӵĲ�ѯ�߼���
         * ���ҵ���һ�����������Ľڵ���ֹͣ���ң����ظýڵ��JSON���ݶ���
         * @name omTree#findNodeBy
         * @function
         * @param fn ָ���Ĳ��Һ�����ӵ��һ������Ϊ�ڵ��JSON���ݶ��󣬺�������Ϊtrue��ýڵ����������������֮false����������
         * @param pNode ��ѡ��ָ���ĸ��ڵ㣬Ĭ��Ϊ�������нڵ�
         * @param deep ��ѡ���Ƿ�ݹ�����ӽڵ㣬Ĭ��Ϊ���ݹ�����ӽڵ�
         * @returns JSON���ݶ���
         * @example
         * //���ݺ���fn���ҷ��������ĵ�һ���ӽڵ��JSON���ݶ���
         * $('#myTree').omTree('findNodeBy',fn);
         */       
        findNodeBy: function(fn, pNode, deep){
            var res, data = pNode ? pNode.children : this.element.data("init_dataSource");
            deep = (deep!=false)? true : deep;
            if(data && (len = data.length)> 0) {
              for(var i = 0, len = data.length; i < len; i++){
                if(fn.call(data[i], data[i]) === true){
                    return data[i];
                }
                if(deep){
                    res = this.findNodeBy(fn, data[i], deep);
                    if(res != null){
                        return res;
                    }
                }
              }
            }
            return null;
         },
         
        _searchNode: function(key, value, _searchNode, result, isSingle, deep) {
            if(isSingle){
                if(this[key] == value)
                return this;
                if(this.children && this.children.length && deep) {
                    for(var i in this.children){
                        var temp=_searchNode.apply(this.children[i],[key,value,_searchNode,[],true, deep]);
                        if(temp) return temp;
                    }
                }
            }else{
                if(this[key] == value){      
                    result.push(this);
                }
                if(this.children && this.children.length && deep) {
                    $.each(this.children, _searchNode, [key, value, _searchNode, result, false, deep]);
                }
                return result;
            }
        },
        /**
         * ��ȡָ���ڵ�ĸ��ڵ㡣
         * @name omTree#getParent
         * @function
         * @param target ָ���ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @returns JSON���ݶ���
         * @example
         * //����target�ĸ��ڵ��JSON���ݶ���
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('getParent',target);
         */  
        getParent: function(target) {
            var pid = this.element.data("nodes")["pid" + target.nid];
            return pid?this.findByNId(pid):null;
        },
        /**
         * ��ȡָ���ڵ�������ӽڵ��JSON���ݶ��󼯺ϡ�
         * @name omTree#getChildren
         * @function
         * @param target ָ���ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @returns JSON���ݶ��󼯺�
         * @example
         * //����target�ĸ��ڵ��JSON���ݶ���
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('getChildren',target);
         */      
        getChildren: function(target) {
            return target.children;
        },
        /**
         * ��ȡ����dataSource��Ӧ�ľ�̬���ݡ�
         * @name omTree#getData
         * @function
         * @returns JSON���ݶ��󼯺�
         * @example
         * //��ȡdataSource��Ӧ�ľ�̬����
         * $('#myTree').omTree('getData');
         */
        getData: function() {
            return this.options.dataSource;
        },
        /**
         * ��������dataSource����Ӧ�ľ�̬���ݡ�
         * @name omTree#setData
         * @function
         * @example
         * //����dataSource��Ӧ�ľ�̬����
         * var data=[{text:'node2',children:[{text:'node21'},{text:'node22'}]},
         *             {text:'node3'}
         *      ];
         * $('#myTree').omTree('setData',data);
         * 
         * //����dataSource��Ӧ�Ķ�̬����
         * $('#myTree').omTree('setData','../../omTree.json');
         */
        setData: function(data) {
            this.options.dataSource = data;
        },
        /* -------------------- expand and collapse node ------------------- */
        /**
         * չ��ָ���ڵ㡣
         * @name omTree#expand
         * @function
         * @param target ָ���ڵ��JSON���ݶ���
         * @example
         * //��target�ڵ�չ��
         * $('#myTree').omTree('expand',target);
         */  
        expand: function(target) {
            if(target.nid) {
                this._collapseHandler(CLASSES.expandable, $("#" + target.nid));
            }
        },
        /**
         * ����ָ���ڵ㡣
         * @name omTree#collapse
         * @function
         * @param target ָ���ڵ��JSON���ݶ���
         * @example
         * //��target�ڵ�����
         * $('#myTree').omTree('collapse',target);
         */  
        collapse: function(target) {
            if(target.nid) {
                this._collapseHandler(CLASSES.collapsable, $("#" + target.nid));
            }
        },
        /**
         * չ�����е����ڵ㡣
         * @name omTree#expandAll
         * @function
         * @example
         * //�����е����ڵ�չ��
         * $('#myTree').omTree('expandAll');
         */  
        expandAll: function() {
            this._collapseHandler(CLASSES.expandable, this.element);
        },
        /**
         * �������е����ڵ㡣
         * @name omTree#collapseAll
         * @function
         * @example
         * //�����е����ڵ�����
         * $('#myTree').omTree('collapseAll');
         */
        collapseAll: function() {
            this._collapseHandler(CLASSES.collapsable, this.element);
        },
        
        // filter: the class filter by the toggler
        // elem: from witch element
        _collapseHandler: function(filter, target) {
            this.toggler( $("div." + CLASSES.hitarea, target).filter(function(){
                return filter ? $(this).parent("." + filter).length : true;
            }).parent() );
            return false;
        },
        /* -------------------- edit node ------------------- */ 
        /**
         * ˢ��ָ�����ڵ㼰���ӽڵ㡣
         * @name omTree#refresh
         * @param target ��ѡ��ָ���ڵ��JSON���ݶ��󡣲���������ˢ����������
         * @function
         * @example
         * //ˢ��������
         * $('#myTree').omTree('refresh');
         */
        refresh: function( target ) {
            var self = this, tree=self.element;
            var data = self.getData();
            	if( !target ){
            		tree.empty();
            		if(typeof data == 'string'){
                        self._ajaxLoad(tree, data);
                    }else if(typeof data == 'object'){
                       self.setData([]);
            		   for(var i = 0, len = data.length; i < len; i ++ ) {
            			  self.insert(data[i]);
            		   }
            	  }
            	} else {
            		var nextNode = $("#" + target.nid).next();
            		var pid = tree.data("nodes")["pid" + target.nid];
            		self.remove( target );
            		self.insert(target, self.findByNId(pid),self.findByNId(nextNode.attr("id")));
            	}
            
        },
        
        // ������ģ��ת��Ϊ��״�ṹ������
        _transformToNodes: function(data) {
			var i,l;
			if (!data) return [];
			var r = [];
			var tmpMap = [];
			for (i=0, l=data.length; i<l; i++) {
				tmpMap[data[i]["id"]] = data[i];
			}
			for (i=0, l=data.length; i<l; i++) {
				if (tmpMap[data[i]["pid"]]) {
					var pid = data[i]["pid"];
					if (!tmpMap[pid]["children"])
						tmpMap[pid]["children"] = [];
					//delete data[i]["pid"];
					tmpMap[pid]["children"].push(data[i]);
				} else {
					r.push(data[i]);
				}
			}
			return r;
		},
        _appendNodes: function(target, nodes, bNode, isDrop) {
            var self = this, ht=[];
            var checkable = self.options.showCheckbox;
            var treeid=self.element.attr("id")?self.element.attr("id"):("treeId"+parseInt(Math.random()*1000));
            self.element.attr("id",treeid);
            for(var i = 0, l = nodes.length; i < l; i++){
                var node = nodes[i], isLastNode = (i == (nodes.length - 1));
                var nodeClass = "om-tree-node " + (checkable?"treenode-checkable ":"")+(node.hasChildren ? "hasChildren ":"");
                var nid=treeid+"_"+(++self.options.nodeCount);
                node.nid=nid;
                var caches = self.element.data("nodes");
                caches[node.nid] = node;
                if(typeof target == "string"){
                    caches["pid"+node.nid] = target;
                    if(isLastNode){
                        target = null;
                    }
                }else{
                    caches["pid"+node.nid] = target.parent("li").attr("id");
                }
                var childHtml = [];
                if(node.children && node.children.length > 0){
                    childHtml.push((self._appendNodes(node.nid, node.children)).join(""));
                }
                var len = 0;
                if (node.children && (len=node.children.length)>0||node.hasChildren) {
                    if(node.expanded){
                        nodeClass=nodeClass+"open "+CLASSES.collapsable+" "+(isLastNode ? CLASSES.lastCollapsable:"");
                    }else{
                        nodeClass=nodeClass+CLASSES.expandable+" "+(isLastNode ? CLASSES.lastExpandable:"");
                    }
                }else{
                    nodeClass=nodeClass+(isLastNode ? CLASSES.last:"");
                }
                ht.push("<li id='", node.nid, "' class='" ,nodeClass ,"'>");
                if(node.hasChildren || len >0){
                	var classes = "";
                    $.each(nodeClass.split(" "), function() {
                        classes += this + "-hitarea ";
                    });
                	ht.push("<div class='", CLASSES.hitarea +" "+classes, "'/>");
                }
                if(checkable){
                    ht.push("<div class='tree-checkbox'/>");
                }
                var spanClass = (node.classes?node.classes:"");
                if(self.options.showIcon){
                    if(node.hasChildren || node.children && node.children.length>0){
                        spanClass = spanClass + " folder ";
                    }else{
                        spanClass = spanClass + " file ";
                    }    
                }
                ht.push("<span class='", spanClass, "'>", "<a href='#'>", node.text, "</a></span>");
                if (node.hasChildren || len>0) {
                    ht.push("<ul", " style='display:", (node.expanded ? "block": "none"),"'>");
                    ht.push(childHtml.join(''));
                    ht.push("</ul>");
                }
                ht.push("</li>");
            }
            if(bNode){
                if(isDrop){
                    $("#"+bNode.nid).after(ht.join(""));
                }else{
                    $("#"+bNode.nid).before(ht.join(""));
                }
            }else if(target){
                target.append(ht.join(""));
            }
            return ht;
        },
        /**
         * ɾ��ָ��pNode���ӽڵ��ж�Ӧ��JSON���ݶ���Ϊtarget�Ľڵ㡣
         * @name omTree#remove
         * @function
         * @param target ��Ҫ��ɾ���Ľڵ��Ӧ��JSON���ݣ����Ҹýڵ������а�����nid����
         * @param pNode ��ѡ��ָ���ĸ��ڵ��Ӧ��JSON���ݶ��󣬲����룬��Ϊ���ĸ��ڵ�
         * @example
         * //ɾ�����ֶ�ӦJSON���ݶ���Ϊtarget�Ľڵ�
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('remove',target);
         */  
        remove: function(target, pNode) {
            var flag, self = this, data=pNode ? pNode.children : self.element.data("init_dataSource");
            for(var i in data){
                if(data[i] == target){
                    var ids = [];
                    ids = self._findChildrenId(target, ids);
                    ids.push(target.nid);
                    for(var n = 0, len = ids.length; n < len ; n++){
                        delete self.element.data("nodes")[ids[n]];
                        delete self.element.data("nodes")["pid"+ids[n]];
                    }
                    if(target.nid == self.element.data("selected")){
                        this.element.data("selected",null);
                    }
                    var pre = $("#"+target.nid).prev();
                    if($("#"+target.nid).next().length<1 && pre.length > 0){
                        if(pre.hasClass(CLASSES.collapsable)){
                            pre.addClass(CLASSES.lastCollapsable);
                            pre.find("div.hitarea").first().addClass(CLASSES.lastCollapsableHitarea);
                        }else if(pre.hasClass(CLASSES.expandable)){
                            pre.addClass(CLASSES.lastExpandable);
                            pre.find("div.hitarea").first().addClass(CLASSES.lastExpandableHitarea);
                        }else{
                            pre.addClass(CLASSES.last);
                        }
                    }
                    $("#"+target.nid).remove();
                    data.splice(i, 1);
                    if(pNode&&pNode.nid&&data.length < 1){
                    	self._changeToFolderOrFile(pNode,false);
                    }
                    return true;
                }else if(data[i].children){
                    flag = self.remove(target, data[i]);
                    if(flag){
                        return true;
                    }
                }
            }
            return false;
        },
        
        _findChildrenId: function(target, ids){
            if(target.children){
                for(var i = 0, children = target.children, len = children.length; i < len; i++){
                    ids.push(children[i].nid);
                    if(children[i].children){
                        this._findChildrenId(children[i], ids);
                    }
                }
            }
            return ids;
        },
        /**
         * ��ָ��pNode���ӽڵ��в���һ��JSON���ݶ���Ϊtarget�Ľڵ㣬���ұ�����Ľڵ���ָ��bNode�ڵ�ǰ��
         * @name omTree#insert
         * @function
         * @param target ��Ҫ������Ľڵ��Ӧ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @param pNode ��ѡ��ָ���ĸ��ڵ��Ӧ��JSON���ݶ��󣬣����Ҹýڵ������а�����nid���ԣ������룬��Ϊ���ĸ��ڵ�
         * @param bNode ��ѡ��ָ��������ڵ�λ�ã������Ҹýڵ������а�����nid���ԣ������룬����pNode�ӽڵ��������ڵ�
         * @example
         * //��pNode���ӽڵ������ӦJSON���ݶ���Ϊtarget�Ľڵ�
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * $('#myTree').omTree('insert',target��pNode);
         */  

        insert : function(target, pNode, bNode, isDrop) {
        	if(!target){
        		return;
        	}
            var self = this, nodes=[], parent, otherChildren, flag = $.isArray(target);
            if(flag){
            	nodes = target;
            } else{
            	nodes.push(target);
            }
            if (bNode) { 
                pNode = pNode || self.findByNId(self.element.data("nodes")["pid" + bNode.nid]);
            }
            var index, data = pNode ? pNode.children : self.element.data("init_dataSource");
            if (pNode && (!pNode.children||pNode.children.length<1)) {
            	if(!pNode.hasChildren){           		
            		self._changeToFolderOrFile(pNode,true);
            		self._bindHitEvent($("#" + pNode.nid));
            	}
                data = pNode.children = [];
            }
            parent = pNode ? $("#" + pNode.nid).children("ul").first() : self.element;
            otherChildren = parent.find("li");
            if (bNode && ((index = $.inArray(bNode, data)) >= 0)) {
                self._appendNodes(parent, nodes, bNode, isDrop);
                data.splice(index, 0, target);
            } else {
                self._appendNodes(parent, nodes, bNode, isDrop);
                if(flag){
                    $.merge(data, target);             
                }else{
                	data.push(target);
                }
            }
            var m = parent.find("li")
                        .filter("." + CLASSES.last + ",." + CLASSES.lastCollapsable+",."+CLASSES.lastExpandable)
                        .not(parent.find("li")
                        .filter(":last-child:not(ul)"));
            m.removeClass(CLASSES.last + " " + CLASSES.lastCollapsable + " " + CLASSES.lastExpandable);
            m.find(" >div").removeClass(CLASSES.lastCollapsableHitarea+" "+CLASSES.lastExpandableHitarea);
            var tdom = parent.find("li").not(otherChildren);                        
            self._applyEvents(tdom);
        },
        
        _changeToFolderOrFile: function(node,isToFolder){
        	var nDom = $("#" + node.nid),self=this;
        	if(isToFolder){
        		var parent = $("<ul/>").css("display",  "block").appendTo(nDom);
        		nDom.addClass("open "+CLASSES.collapsable);
        		self._swapClass(nDom, CLASSES.last, CLASSES.lastCollapsable);
        		node.children = [];
        	}else{
        		nDom.find("ul").remove();
        		nDom.find("div."+CLASSES.hitarea).remove();
        		nDom.filter("."+CLASSES.lastCollapsable+",."+CLASSES.lastExpandable)
        		.removeClass(CLASSES.lastCollapsable+" "+CLASSES.lastExpandable).addClass(CLASSES.last);
        		nDom.removeClass("open "+CLASSES.collapsable+" "+CLASSES.expandable);
        	}
            if(self.options.showIcon) {
                self._swapClass(nDom.children("span"),"file","folder");
            }
        	var hitarea = nDom.filter(":has(>ul)").prepend("<div class=\"" + CLASSES.hitarea + "\"/>").find("div." + CLASSES.hitarea);
            hitarea.each(function() {
                var classes = "";
                $.each($(this).parent().attr("class").split(" "), function() {
                    classes += this + "-hitarea ";
                });
                $(this).addClass( classes );
            });
        },
        
        
        /**
         * ��ָ��pNode���ӽڵ��н�JSON���ݶ���Ϊtarget�Ľڵ��޸���JSON���ݶ���ΪnewNode��
         * @name omTree#modify
         * @function
         * @param target ��Ҫ�޸ĵĽڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @param newNode �޸ĺ�ڵ��JSON���ݶ��󣬲��Ҹýڵ������а�����nid����
         * @param pNode ��ѡ��ָ���ĸ��ڵ��Ӧ��JSON���ݶ��󣬣����Ҹýڵ������а�����nid���ԣ������룬��Ϊ���ĸ��ڵ�
         * @example
         * //��JSON���ݶ���Ϊtarget�Ľڵ��޸���JSON���ݶ���ΪnewNode
         * var target = $('#myTree').omTree("findNode", "text", "node1");
         * var newNode ={text: "node5"};
         * $('#myTree').omTree('insert',target��newNode);
         */  
        modify: function(target, newNode, pNode) {
        	if(target&&newNode){
        		var self = this, nextNode = $("#" + target.nid).next(), bNode;
                pNode = pNode || this.findByNId(self.element.data("nodes")["pid" + target.nid]);
                if(nextNode.is("ul") || nextNode.is("li"))
                    bNode = self.findByNId(nextNode.attr("id"));
                self.remove(target, pNode);
                self.insert(newNode, pNode, bNode);	
        	}
        },
        /* -------------------- disable and enable node ------------------- */
        disable: function() {
            
        },
        enable: function() {
            
        }
        
        /**
         * ���������쳣��ִ�еķ��� .������ϢΪjQuery.ajax���ص��쳣��Ϣ���ɲο�jQuery.ajax�ٷ��ĵ���
         * @event
         * @name omTree#onError
         * @param xmlHttpRequest XMLHttpRequest ����
         * @param textStatus ������Ϣ
         * @param errorThrown ����ѡ��������쳣����
         * @param event jQuery.Event����
         * @example
         *  $(".selector").omTree({
         *      onError:function(xmlHttpRequest,textStatus,errorThrown,event){
         *          alert('error occured');
         *      }
         *  });
         */
        /**
         * �������ڵ㴥���¼���
         * @event
         * @name omTree#onClick
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onClick: function(nodeData, event){ ... }
         *  });
         */
        /**
         * ˫�����ڵ㴥���¼���
         * @event
         * @name omTree#onDblClick
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onDblClick: function(nodeData, event){ ... }
         *  });
         */
        /**
         * �Ҽ����ڵ㴥���¼���
         * @event
         * @name omTree#onRightClick
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onRightClick: function(nodeData, event){ ... }
         *  });
         */
        /**
         * ���ڵ�װ��ǰ�����¼���
         * @event
         * @name omTree#onBeforeLoad
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onBeforeLoad: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ�װ�سɹ��󴥷��¼���
         * @event
         * @name omTree#onSuccess
         * @param data װ�سɹ����ȡ������json
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onSuccess: function(data,event){ ... }
         *  });
         */
        /**
         * ���ڵ��϶�ʱ�����¼������¼����϶���ʼʱ��������������ֻ����һ�Ρ�
         * @event
         * @name omTree#onDrag
         * @param nodeData ���϶������ڵ�json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onDrag: function(nodeData, event){ ... }
         *  });
         */
        /**
         * ���ڵ��϶�����ʱ�����¼���
         * @event
         * @name omTree#onDrop
         * @param nodeData ���϶������ڵ�json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onDrop: function(nodeData, event){ ... }
         *  });
         */
        /**
         * ���ڵ�չ��ǰ�����¼���
         * @event
         * @name omTree#onBeforeExpand
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onBeforeExpand: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ�����ǰ�����¼���
         * @event
         * @name omTree#onBeforeCollapse
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onBeforeCollapse: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ�չ���󴥷��¼���
         * @event
         * @name omTree#onExpand
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onExpand: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ������󴥷��¼���
         * @event
         * @name omTree#onCollapse
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onCollapse: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ�ѡ�к󴥷��¼���
         * @event
         * @name omTree#onCheck
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onCheck: function(nodeData){ ... }
         *  });
         */
        /**
         * ���ڵ�ѡ��󴥷��¼���
         * @event
         * @name omTree#onSelect
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onSelect: function(nodeData,event){ ... }
         *  });
         */
        /**
         * ���ڵ�ѡ��ǰ�����¼���
         * @event
         * @name omTree#onBeforeSelect
         * @param nodeData ���ڵ��json����
         * @param event jQuery.Event����
         * @example
         *  $("#tree").omTree({
         *      onBeforeSelect: function(nodeData,event){ ... }
         *  });
         */
    });
})(jQuery);/*
 * $Id: om-validate.js,v 1.4 2012/05/10 06:17:59 luoyegang Exp $
 * operamasks-ui validate 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 */

;(function($) {

/**
 * @class
 * <div>
 * <b>���</b><br/>
 * validate() ���Է���ض�Html Form����У��. 
 * </div>
 * <div>
 *  <pre>
 * 1����У�����ṩ�˷ḻ��У��������㳣�õ�У������
 *    ���õ�У�������
 <table border="1">
  <tr>
    <td align="center" style="font-weight: bolder;">rule����</td>
    <td align="center" style="font-weight: bolder;">˵��</td>
    <td align="center" style="font-weight: bolder;">Ĭ����ʾ</td>
  </tr>
  <tr>
    <td>required</td>
    <td>ֵ��������</td>
    <td>This field is required.</td>
  </tr>
  <tr>
    <td>min</td>
    <td>���������Сֵ</td>
    <td>$.validator.format("Please enter a value greater than or equal to {0}.")</td>
  </tr>
  <tr>
    <td>max</td>
    <td>����������ֵ</td>
    <td>$.validator.format("Please enter a value less than or equal to {0}."),</td>
  </tr>
  <tr>
    <td>minlength</td>
    <td>��������minlength���ȵ��ַ�</td>
    <td>$.validator.format("Please enter at least {0} characters.")</td>
  </tr>
  <tr>
    <td>maxlength</td>
    <td>���������maxlength���ȵ��ַ�</td>
    <td>$.validator.format("Please enter no more than {0} characters.")</td>
  </tr>
  <tr>
    <td>email</td>
    <td>�ʼ���ʽ</td>
    <td>Please enter a valid email address.</td>
  </tr>
  <tr>
    <td>url</td>
    <td>url��ַ��ʽ</td>
    <td>Please enter a valid URL.</td>
  </tr>
  <tr>
    <td>date</td>
    <td>���ڸ�ʽ</td>
    <td>Please enter a valid date.</td>
  </tr>
  <tr>
    <td>number</td>
    <td>���ָ�ʽ</td>
    <td>Please enter a valid number.</td>
  </tr>
  <tr>
    <td>rangelength</td>
    <td>�����ַ�������ĳһ����Χ����������������</td>
    <td>$.validator.format("Please enter a value between {0} and {1} characters long.")</td>
  </tr>
  <tr>
    <td>accept</td>
    <td>���Խ��ܵ��ļ���ʽ</td>
    <td>Please enter a value with a valid extension.</td>
  </tr>
  <tr>
    <td>equalTo</td>
    <td>���Ѿ��е��������Աȣ��ʺ��������룩</td>
    <td>Please enter the same value again.</td>
  </tr>
  <tr>
    <td>range</td>
    <td>�������ֵ������ĳһ����Χ��������������</td>
    <td>$.validator.format("Please enter a value between {0} and {1}.")</td>
  </tr>
  <tr>
    <td>digits</td>
    <td>������������</td>
    <td>Please enter only digits.</td>
  </tr>
</table>
 *    
 * 2���ṩ����У����Ϣչ�ַ�����������Ϣչ����У��Ԫ��β����Ҳ��������չ��������Ҫ���κ�div���棬
 *    ���ڿռ�ȽϳԽ���form����Ҳ���Բ�������ƶ�����ʾͼ��������ʾ��ʾ��Ϣ�ķ�ʽ����Щ��Ҫͨ������
 *    errorPlacement(���ƴ�����Ϣ��ʾ)��showErrors(�Զ�����Ϣ����onblur/keyup��������Ե�ǰԪ��)
 *    ֻҪ�㹻ǿ�������ж�ǿ��
 *  
 * 3���ṩ�����Ľӿ���������У����򣬵������ṩ��У��������������������ʱ��������Զ���У��
 *    ����ͨ��$.validator.addMethod("hasreg", function(value,element,params) {return true/false;},"message")�ķ�ʽʵ��
 *   </pre>
 * </div>
 * <b>���ʹ��</b><br/>
 * 1�������ṹ
 *    <pre>
 *      $("#reg").validate({
 *         onkeyup : true,
 *         rules : {
 *           password : {
                        required : true,
                        minlength : 5
             }
 *         },
 *         messages : {
 *           password : {
                        required : '�����������',
                        minlength : '���벻��С��5λ'
             }
 *         }
 *      });
 *     
 *    ������ǻ�����У��ṹ��reg����ҪУ���form��id��password����ҪУ����ֶε�name
 *    (<span style="color:red;">��������name�����򽫲���У��</span>)rules��messages�ǳɶԳ��ֵģ����ֻ������rulesû������messages��
 *    ϵͳ��ʹ��Ĭ����ʾ��Ϣ��
 * 2���Զ���У�����
 *      $.validator.addMethod("hasreg", function(value) {
 *              return value != 'admin';
 *       }, '���û��Ѿ���ע��');
 *       //ģ���û����Ƿ��Ѿ���ע�ᣬ��ʵ�ĳ���Ӧ����ʹ��ajax���̨��������Ȼ���̨���ؽ����
 *       //��Ҫע����Ǳ���ʹ��ͬ�������첽������Ч��
 *    
 *    ���ھ��Ѿ�����һ���µ�rules ��hasreg��������ʹ��ͬϵͳ���õĹ���һ��������ҪУ��
 *    ���ֶ���������hasreg:true����Ϊmessages�Ѿ����ã��ʿ��Բ�д��
 * 3���Զ�����Ϣչʾ
 *    ���Ĭ�ϵ��������ݺ�������һ��&lt;label for="username" generated="true" class="error"&gt;��������
 *    ����&lt;/label&gt;��ͬʱ��У���Ԫ����������class="error"���ԣ��������ҪһЩЧ�������дerror��ʽ��
 *    ���������ʾ��ʽ��������Ҫ�ģ������㲻ϣ��������װ�����ʾ��Ϣ������Ҫ�õ���������
 *    errorPlacement��showErrors���������������ĸ����Ժ�ǿ�Զ����ԣ������������һ����ϸ��˵����
 *    1)��errorPlacement
 *        ������Ϣչʾ������������error��element��error�����ɵĴ������elementΪ��ǰԪ�ء�
 *        errorPlacement : function(error, element) { 
 *                   if(error){    //error���ڵ�ʱ��
 *                       $('#showMsg').html(error); //showMsgΪ���Զ������Ϣ��ʾ�����id��
 *                   }
 *               }
 *     2)��showErrors
 *         ���������¼��������������ʱ�����Ὣ������Ϣ��ʾ��������������ʱ�����𽫴�����Ϣ����
 *         ����Զ����˴���չʾ��������һ���ֻ���Ĭ�ϵ���Ϊ���������this.defaultShowErrors()
 *         �Ա�Ĭ����Ϊ��Ч����Ҳ�������������ֱ���errorMap��errorList�������д���ļ��ϡ�
 *         showErrors: function(errorMap, errorList) {
 *                   if(errorList && errorList.length > 0){  //������ڴ�����Ϣ
 *                       $.each(errorList,function(index,obj){ //����������Ϣ ��indexΪ������Ϣ�������ţ�
 *                                                             //objΪ��ǰ������Ϣ����
 *                           var msg = this.message;           //��ȡ��ǰ������Ϣ�ı�
 *                           //�����дһЩ���봦����Ĵ�����Ϣ
 *                      });
 *                   }else{
 *                       //������Ϣ�Ѿ��������˴�Ҫд���ش�����Ϣ�Ĵ��룬
 *                       //ͨ��this.currentElements��ȡ��ǰ����
 *                   }
 *                   this.defaultShowErrors();  //�������Ĭ�ϵ���Ϊ�����������
 *               }
 * 4�������ύ��ʽ(ajax�ύ)
 *   ���ʹ��ajax��ʽ�ύ����������������ַ�ʽ��У���ܽ��
 *   1)��ʹ��submitHandler��������ajax�ύ��submithandler������ȫ��У��ͨ��֮���ص����õĴ��룬�˴�Ҳ���ǵ�У��ͨ��֮��
 *      ����ajax�ύ����ϸ������쿴��ajax���ύУ�顱ʾ�����롣
 *   2)��ʹ��valid����������form��submit�¼�����$('#form').valid()����true��ʱ�����ύ��
 *       //ͨ������form��submit�¼�����form����ajax�ύ��
         $('#formId').submit(function() {
             if (!$("#formId").valid()) 
                 return false;
             $(this).omAjaxSubmit({});
             return false; //�˴����뷵��false����ֹ�����form�ύ
         });
 *   
 * </pre>
 * 
 * @name validate
 * @constructor
 * @param options ��׼config����
 */
$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}

		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator);

		if ( validator.settings.onsubmit ) {

			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});

			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();

				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		var element = this[0];

		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	if ( arguments.length == 1 )
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {

	defaults: {
	    /**
	     * ��ֵ�Ե�У�������Ϣ.����Ԫ�ص�name���ԣ�ֵ�Ǵ�����Ϣ����϶���<br/>
	     * @name validate#messages
	     * @type JSON
	     * @default ��
	     * @example
	     * $(".selector").validate({
         *  rules: {
         *    name: {
         *      required: true,
         *      minlength: 2
         *    }
         *  },
         *  messages: {
         *    name: {
         *      required: "We need your email address to contact you",
         *      minlength: jQuery.format("At least {0} characters required!")
         *      //�����{0}����minlength�����2
         *    }
         *  }
         *})
	     */
		messages: {},
		/**
		 * ������Ϣ����
         * ���û������errorPlacement��������ڵ�Ԫ�س��ִ���ʱ�����ڵ�һ��Ԫ�غ�����ʾ������Ϣ��
         * ���������errorPlacement���������errorPlacement�ص��ж�����ʾλ�� <br/>
         * @name validate#groups
         * @type JSON
         * @default ��
         * @example
         * $("#myform").validate({
         *     groups: {
         *       username: "fname lname"
         *     },
         *     errorPlacement: function(error, element) {
         *        if (element.attr("name") == "fname" 
         *                    || element.attr("name") == "lname" ){
         *          error.insertAfter("#lastname");
         *        }else{
         *          error.insertAfter(element);
         *        }
         *      },
         *    }) //��fname��lname�Ĵ�����Ϣͳһ��ʾ��lastnameԪ�غ���
         */
		groups: {},
		
		/**
         * ��ֵ�Ե�У�����.����Ԫ�ص�name���ԣ�ֵ��У��������϶���ÿһ�����򶼿��԰�һ����������<br/>
         * ͨ��depends�趨��ֻ��������������Ż�ִ����֤<br/>
         * @name validate#rules
         * @type JSON
         * @default ��
         * @example
         * $(".selector").validate({
         *  rules: {
         *    contact: {
         *      required: true,
         *      email: { 
         *        depends: function(element) {
         *          return $("#contactform_email:checked")
         *          //emailУ���ǰ����contactform_email��ѡ��
         *        }
         *      }
         *    }
         *  }
         *})
         */
		rules: {},
		
		/**
         * ָ��У�������ʾ��ǩ��class���ƣ���classҲ�������У���Ԫ�����档<br/>
         * @name validate#errorClass
         * @type String
         * @default 'error'
         * @example
         * $(".selector").validate({
         *      errorClass: "invalid"
         *   })
         */
		errorClass: 'error',
		
		/**
         * ָ��У��ɹ�û���κδ����ӵ�Ԫ�ص�class����<br/>
         * @name validate#validClass
         * @type String
         * @default 'valid'
         * @example
         * $(".selector").validate({
         *      validClass: "success"
         *   })
         */
		validClass: 'valid',
		
		/**
		 * ָ��У��ɹ�û���κδ����ӵ���ʾԪ���������ʽ����<br/>
		 * ��validClass����������ֻ������ʾԪ�����棬������У��Ķ������κα䶯��
		 * @name validate#success
		 * @type String
		 * @default ��
		 * @example
		 * $(".selector").validate({
		 *      success: "valid"
		 *   })
		 */
		
		/**
         * ָ����ʾУ�������Ϣ��html��ǩ����<br/>
         * @name validate#errorElement
         * @type String
         * @default 'label'
         * @example
         * $(".selector").validate({
         *      errorElement: "em"
         *   })
         */
		errorElement: 'label',
		
		/**
         * У������ʱ���Ƿ񽫾۽�Ԫ�ء�<br/>
         * @name validate#focusInvalid
         * @type Boolean
         * @default true
         * @example
         * $(".selector").validate({
         *      focusInvalid: false
         *   })
         */
		focusInvalid: true,
		
		/**
         * ��ý����ʱ���Ƿ����������ʾ������������������Ԫ�صģ�<br/>
         * �������Ϊtrue������뽫focusInvalid����Ϊfalse������û��У��Ч����
         * @name validate#focusCleanup
         * @type Boolean
         * @default false
         * @example
         * $(".selector").validate({
         *      focusInvalid: false, //��������
         *      focusCleanup: true
         *   })
         */
		focusCleanup: false,
		
		/**
         * ����������Ϣ������������У�������ػ�����ʾ����������<br />
         * �� errorLabelContainer ���Ե��������������һ��������ߡ�
         * @name validate#errorContainer
         * @type Object
         * @default $( [] )
         * @example
         * $("#myform").validate({
         *      errorContainer: "#messageBox1, #messageBox2", 
         *      //�������ö�������������messageBox2Ԫ��û�б���װ����ֻ�Ǵ�������ʱ����ʾ�����ش�Ԫ��
         *      errorLabelContainer: "#messageBox1 ul",
         *      wrapper: "li",
         *   })
         */
		errorContainer: $( [] ),
		
		/**
         * ��ʾ������Ϣ������������У�������ػ�����ʾ����������
         * @name validate#errorLabelContainer
         * @type Object
         * @default $( [] )
         * @example
         * $("#myform").validate({
         *      errorLabelContainer: "#messageBox",
         *      wrapper: "li",
         *   })
         *   //messageBoxΪ������id
         */
		errorLabelContainer: $( [] ),
		
		/**
         * �Ƿ����ύʱУ������������Ϊfalse�����ύ��ʱ��У�����<br/>
         * ��������keyup��onblur���¼�У�鲻��Ӱ��.
         * @name validate#onsubmit
         * @type Boolean
         * @default true
         * @example
         * $(".selector").validate({
         *      onsubmit: false
         *   })
         */
		onsubmit: true,
		
		/**
         * У��ʱ����ָ����Ԫ�أ�����������ҪУ���Ԫ��id����ʽ���Ƶ�jqueryʶ���ѡ������
         * @name validate#ignore
         * @type String
         * @default ��
         * @example
         * $("#myform").validate({
         *      ignore: ".ignore" 
         *      //�˴�����������input[type='password']��#id��jquery��ѡ����
         *   })
         */
		ignore: [],
		ignoreTitle: false,
		
		onfocusin: function(element) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		
		/**
         * ��blur�¼�����ʱ�Ƿ����У�飬���û�������κ�ֵ���򽫺���У�顣
         * @name validate#onfocusout
         * @type Boolean
         * @default true
         * @example
         * $(".selector").validate({
         *      onfocusout: false
         *   })
         */
		onfocusout: function(element) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		
		/**
         * ��keyup�¼�����ʱ�Ƿ����У�顣
         * @name validate#onkeyup
         * @type Boolean
         * @default true
         * @example
         * $(".selector").validate({
         *      onkeyup: false
         *   })
         */
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		
		/**
         * ��checkbox��radio��click�¼��������Ƿ����У�顣
         * @name validate#onclick
         * @type Boolean
         * @default true
         * @example
         * $(".selector").validate({
         *      onclick: false
         *   })
         */
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function(element, errorClass, validClass) {
			if (element.type === 'radio') {
				this.findByName(element.name).addClass(errorClass).removeClass(validClass);
			} else {
				$(element).addClass(errorClass).removeClass(validClass);
			}
		},
		unhighlight: function(element, errorClass, validClass) {
			if (element.type === 'radio') {
				this.findByName(element.name).removeClass(errorClass).addClass(validClass);
			} else {
				$(element).removeClass(errorClass).addClass(validClass);
			}
		}
		
		/**
         * ���ƴ�����Ϣ��ʾ�Ļص��������÷�����������������һ�������Ǵ�����Ϣ��Ԫ�أ��ڶ����Ǵ���У������ԴԪ�ء�
         * @name validate#errorPlacement
         * @type Function
         * @default ��
         * @example
         * $("#myform").validate({
         *     errorPlacement: function(error, element) {
         *        error.appendTo( element.parent("td").next("td") );
         *      }
         *    })
         */
		
		/**
         * ���������¼��������������ʱ�����Ὣ������Ϣ��ʾ��������������ʱ�����𽫴�����Ϣ����
         * ����Զ����˴���չʾ��������һ���ֻ���Ĭ�ϵ���Ϊ���������this.defaultShowErrors()
         * �Ա�Ĭ����Ϊ��Ч����Ҳ�������������ֱ���errorMap��errorList�������д���ļ��ϡ�
         * @name validate#showErrors
         * @type Function
         * @default ��
         * @example
         * $("#myform").validate({
         * showErrors: function(errorMap, errorList) {
         *                   if(errorList && errorList.length > 0){  //������ڴ�����Ϣ
         *                       $.each(errorList,function(index,obj){ //����������Ϣ ��indexΪ������Ϣ�������ţ�
         *                                                             //objΪ��ǰ������Ϣ����
         *                           var msg = this.message;           //��ȡ��ǰ������Ϣ�ı�
         *                           //�����дһЩ���봦����Ĵ�����Ϣ
         *                      });
         *                   }else{
         *                       //������Ϣ�Ѿ��������˴�Ҫд���ش�����Ϣ�Ĵ��룬
         *                       //ͨ��this.currentElements��ȡ��ǰ����
         *                   }
         *                   this.defaultShowErrors();  //�������Ĭ�ϵ���Ϊ�����������
         *               }
         *  })
         */

		/**
         * ����У��ͨ������ύǰ�Ļص������������滻Ĭ���ύ��һ����Ajax�ύ��ʽ��Ҫʹ�õ���
         * @type Function
         * @name validate#submitHandler
         * @default ��
         * @param form ��ǰ������
         * @example
         * $(".selector").validate({
         *      submitHandler: function(form) {
         *       $(form).ajaxSubmit(); //У��ͨ��֮�����ajaxSubmit�ύ��
         *      }
         *   })
         */
         
         /**
         * ���Ʊ��ύ��У�鲻ͨ���Ļص�������
         * @type Function
         * @name validate#invalidHandler
         * @default ��
         * @param form ��ǰ������
         * @param validator ��ǰУ��������
         * @example
         * $(".selector").validate({
         *   invalidHandler: function(form, validator) {
         *     var errors = validator.numberOfInvalids();
         *     if (errors) {
         *       var message = errors == 1
         *         ? 'You missed 1 field. It has been highlighted'
         *         : 'You missed ' + errors + ' fields. They have been highlighted';
         *       $("div.error span").html(message);
         *       $("div.error").show();
         *     } else {
         *       $("div.error").hide();
         *     }
         *   }
         *})
         */   
		
		/**
         * У��ѡ�еı�
         * @name validate#validate
         * @function
         * @returns ��ǰform��У�����
         * @example
         *   $("#myform").validate({
         *      //options
         *   });
         */
		
		/**
         * �����Ƿ�ͨ��У��
         * @name validate#valid
         * @function
         * @returns Boolean
         * @example
         *   $("#myform").validate();
         *   $("a.check").click(function() {
         *     alert("Valid: " + $("#myform").valid());
         *     return false;
         *   });
         */
		
		/**
         * ���ѡ�е�Ԫ�أ���̬���ɾ��У�����ķ�������rules( "add", rules ) ��rules( "remove", [rules] )����
         * @name validate#rules
         * @function
         * @returns rules Object{Options}
         * @example
         *  $('#username').rules('add',{
         *       minlength:5,
         *       messages: {
         *           minlength: jQuery.format("Please, at least {0} characters are necessary")
         *       }
         *   });
         *   
         * $("#myinput").rules("remove", "min max"); //remove�������ö��rule���ո����
         */
		
		/**
         * ������У��
         * @name validate#form
         * @function
         * @returns Boolean
         * @example
         *  $("#myform").validate().form()
         */
		
		/**
         * У��ѡ�е�element
         * @name validate#element
         * @param element
         * @function
         * @returns Boolean
         * @example
         *  $("#myform").validate().element( "#myselect" );
         */
		
		/**
         * ���ñ������ô˷�����ȥ��������ʾ��Ϣ
         * @name validate#resetForm
         * @function
         * @returns ��
         * @example
         *  var validator = $("#myform").validate();
         *  validator.resetForm();
         */
		
		/**
		 *  ��Ӳ���ʾ��ʾ��Ϣ
		 * @name validate#showErrors
		 * @function
		 * @param Object
		 * @returns ��
		 * @example
		 * var validator = $("#myform").validate();
         * validator.showErrors({"firstname": "I know that your firstname is Pete, Pete!"});
		 */
		
		/**
		 *  ͳ��û��ͨ��У���Ԫ�ظ���
		 * @name validate#numberOfInvalids
		 * @function
		 * @returns Integer
		 * @example
		 * var validator = $("#myform").validate();
		 * return validator.numberOfInvalids();
		 */
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() == 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[0];
		},

		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		check: function( element ) {
			element = this.clean( element );

			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
				element = this.findByName( element.name ).not(this.settings.ignore)[0];
			}

			var rules = $(element).rules();
			var dependencyMismatch = false;
			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;

			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();

			return meta && meta.messages && meta.messages[method];
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},

		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		/**
         * ��ʾ������Ϣ������ǩ����.
         * @name validate#wrapper
         * @type String
         * @default ��
         * @example
         * $(".selector").validate({
         *      wrapper: "li"
         *   })
         */
		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},

		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );

				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},

		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},

		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},

		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},

		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},

		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},

		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},

		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},

	addClassRules: function(className, rules) {
		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},

	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},

	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);

		for (var method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}

		return rules;
	},

	metadataRules: function(element) {
		if (!$.metadata) return {};

		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},

	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});

		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param == "string" && {url:param} || param;

			if ( this.pending[element.name] ) {
				return "pending";
			}
			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function(response) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true;
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
			return value == target.val();
		}
	}

});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
;(function($) {
	var pendingRequests = {};
	// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function(settings, _, xhr) {
			var port = settings.port;
			if (settings.mode == "abort") {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = xhr;
			}
		});
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function(settings) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if (mode == "abort") {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				return (pendingRequests[port] = ajax.apply(this, arguments));
			}
			return ajax.apply(this, arguments);
		};
	}
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);
