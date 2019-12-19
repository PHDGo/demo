/*
function addEvent(el, type, fn) {
	if (window.addEventListener) {
		el.addEventListener(type, fn, false);
	} else if (document.attachEvent) {
		el.attachEvent(type, fn)
	} else {
		el['on' + type] = fn;
	}
}

function removeEvent(el, type, fn) {
	if (window.addEventListener) {
		el.removeEventListener(type, fn, false);
	} else if (document.attachEvent) {
		el.detachEvent(type, fn)
	} else {
		el['on' + type] = null;
	}
}
*/

const addEvent = (function() {
	if (window.addEventListener) {
		return function(el, type, fn) {
			el.addEventListener(type, fn, false);
		}
	} else if (document.attachEvent) {
		return function(el, type, fn) {
			el.attachEvent(type, fn);
		}
	} else {
		return function(el, type, fn) {
			el['on' + type] = fn;
		}
	}
})()

const removeEvent = (function() {
	if (window.addEventListener) {
		return function(el, type, fn) {
			el.removeEventListener(type, fn, false);
		}
	} else if (document.attachEvent) {
		return function(el, type, fn) {
			el.detachEvent(type, fn);
		}
	} else {
		return function(el, type, fn) {
			el['on' + type] = null;
		}
	}
})()

const cancleBubble = function(e) {
	var e = e || window.event;
	if (e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancleBubble = true;
	}
}

const preventDefaultEvent = function(e) {
	var e = e || window.event;
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
}

const getViewportSize = function() {
	if (window.innerWidth) {
		return {
			width: window.innerWidth,
			height: window.innerHeight
		}
	} else if (document.compatMode === 'CSS1Compat') {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		}
	} else {
		return {
			width: document.body.clientWidth,
			height: document.body.clientHeight
		}
	}
}

const getScrollOffset = function() {
	if (window.pageXOffset) {
		return {
			left: window.pageXOffset,
			top: window.pageYOffset
		}
	} else {
		return {
			left: document.body.scrollLeft + document.documentElement.scrollLeft,
			top: document.body.scrollTop + document.documentElement.scrollTop
		}
	}
}

const getStyles = function(elem, prop) {
	if (window.getComputedStyle) {
		if (prop) {
			return parseInt(window.getComputedStyle(elem, null)[prop]);
		} else {
			return window.getComputedStyle(elem, null);
		}
	} else {
		if (prop) {
			return parseInt(elem.currentStyle[prop]);
		} else {
			return elem.currentStyle;
		}
	}
}

const pagePos = function(e) {
	var sLeft = getScrollOffset().left,
		sTop = getScrollOffset().top,
		cLeft = document.documentElement.clientLeft || 0,
		cTop = document.documentElement.clientTop || 0;

	return {
		X: e.clientX + sLeft - cLeft,
		Y: e.clientY + sTop - cTop
	}
}

Element.prototype.dragNclick = function(menu, elemclick) {
	var deltaX, deltaY,
		_self = this,
		bTime = 0,
		eTime = 0,
		counter = 0,
		elemWidth = getStyles(this, 'width'),
		elemHeight = getStyles(this, 'height'),
		mWidth = getStyles(menu, 'width'),
		mHeight = getStyles(menu, 'height'),
		wWidth = getViewportSize().width,
		wHeight = getViewportSize().height;

	addEvent(this, 'mousedown', mousedownHandler);
	addEvent(document, 'contextmenu', function(e){
		e = e || window.event;
		preventDefaultEvent(e);
	});
	addEvent(document, 'mousedown', function(e){
		menu.style.display = 'none';
	});
	addEvent(menu, 'mousedown', function(e){
		e = e || window.event;
		cancleBubble(e);
	});

	function mousedownHandler(e) {
		var mLeft = pagePos(e).X,
			mTop = pagePos(e).Y;
		e = e || window.event;
		if (e.button === 0) {
			bTime = new Date().getTime();
			menu.style.display = 'none';
			deltaX = pagePos(e).X - getStyles(this, 'left');
			deltaY = pagePos(e).Y - getStyles(this, 'top');
			addEvent(document, 'mousemove', mousemoveHandler);
			addEvent(document, 'mouseup', mouseupHandler);
			preventDefaultEvent(e);
			cancleBubble(e);
		} else if (e.button === 2) {
			if (mLeft + mWidth > wWidth) {
				mLeft -= mWidth;
			};
			if (mTop + mHeight > wHeight) {
				mTop -= mHeight;
			};
			menu.style.left = mLeft + 'px';
			menu.style.top = mTop + 'px';
			menu.style.display = 'block';
			cancleBubble(e);
		}
	}

	function mousemoveHandler(e) {
		var left, top, pageX, pageY;

		e = e || window.event;
		pageX = pagePos(e).X;
		pageY = pagePos(e).Y;
		left = pageX - deltaX;
		top = pageY - deltaY;

		if (left < 0) {
			left = 0;
		} else if (left + elemWidth > wWidth) {
			left = wWidth - elemWidth;
		};
		if (top < 0) {
			top = 0;
		} else if (top + elemHeight > wHeight) {
			top = wHeight - elemHeight;
		};

		_self.style.left = left + 'px';
		_self.style.top = top + 'px';
	}

	function mouseupHandler(e) {
		var t;
		eTime = new Date().getTime();
		/*  单击
		 *	if (eTime - bTime < 300) {
		 * 		elemclick();
		 * 	}
		 */
		/*  双击
			1、300毫秒以内先后发生mousedown和mouseup，判定为一次点击；
			2、一次点击后400毫秒内若再发生一次点击，判定为一次双击
		 */  
		if (eTime - bTime < 300) {
			//计数器记录这是倒计时过程中的第一次点击或第二次点击
			counter++;
			//是第一次点击，则开启倒计时，等待下一次点击组成双击
			if (counter === 1) {
				t = setTimeout(function(){
					//时间到，重置计数器
					counter = 0;
					clearTimeout(t);
				}, 400);
			};
			//倒计时过程中发生第二次点击，判定为双击，停止倒计时并执行任务
			if (counter === 2) {
				//提前结束倒计时
				clearTimeout(t);
				elemclick();
			};
		};

		removeEvent(document, 'mousemove', mousemoveHandler);
		removeEvent(document, 'mouseup', mouseupHandler);
	}
}