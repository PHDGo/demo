window.onload = function(){
	init()
}

function init() {
	initMenu()
}

function initMenu() {
	var menu = document.getElementsByClassName('menu')[0],
		mainMenu = menu.getElementsByClassName('main')[0],
		mainItems = mainMenu.getElementsByClassName('main-item'),
		subMenu = menu.getElementsByClassName('sub')[0],
		subItems = subMenu.getElementsByClassName('sub-item'),
		subMenuTopLeft = {
			x: getStyles(menu, 'margin-left') + getStyles(menu, 'width'),
			y: getStyles(menu, 'margin-top')
		},
		subMenuBottomLeft = {
			x: getStyles(menu, 'margin-left') + getStyles(menu, 'width'),
			y: getStyles(menu, 'margin-top') + getStyles(menu, 'height')
		},
		inSubMenu = false,
		isFirst = true,
		mousePos = [],
		tID

	menu.addEventListener('mouseenter', menuMouseEnter, false)
	menu.addEventListener('mouseleave', menuMouseLeave, false)
	subMenu.addEventListener('mouseenter', subMenuEnter, false)

	for (var i = 0; i < mainItems.length; i++) {
		mainItems[i].addEventListener('mouseenter', itemMouseEnter, false)
	}

	function menuMouseEnter(e) {
		mainMenu.addEventListener('mousemove', menuMouseMove, false)
	}

	function subMenuLeave(e) {
		inSubMenu = false
		subMenu.removeEventListener('mouseleave', subMenuLeave, false)
	}

	function subMenuEnter(e) {
		inSubMenu = true
		subMenu.addEventListener('mouseleave', subMenuLeave, false)
	}

	function menuMouseMove(e) {
		mousePos.push(pagePos(e))
		if (mousePos.length > 2) {
			mousePos.shift()
		}
	}

	function menuMouseLeave(e) {
		mousePos = []
		isFirst = true
		mainMenu.removeEventListener('mousemove', menuMouseMove, false)
		deactivate()
	}

	function itemMouseEnter(e) {
		var	idx
		e = e || window.event
		target = e.target || e.srcElement

		if (tID) {
			clearTimeout(tID)
		}

		idx = Array.prototype.indexOf.call(mainItems, target)
		
		if (!isFirst) {
			if (goNext()) {
				tID = setTimeout(function(){
					if (inSubMenu) return
					activate(idx)
					tID = null
				}, 300)
			} else {
				activate(idx)
			}
		} else {
			activate(idx)
			isFirst = false
		}
	}

	function goNext() {
		var len = mousePos.length
		return pointInTriangle({
			lastPos: mousePos[len-2] || {x:0, y:0},
			curPos: mousePos[len-1] || {x: 0, y:0},
			topLeft: subMenuTopLeft,
			bottomLeft: subMenuBottomLeft
		})
	}

	function activate(idx) {
		deactivate()
		mainItems[idx].className += ' active'
		subMenu.className = 'sub'
		subItems[idx].className += ' active'
	}

	function deactivate() {
		for (var i = 0; i < mainItems.length; i++) {
			mainItems[i].className = 'main-item'
			subItems[i].className = 'sub-item'
		}
		subMenu.className += ' hide'
	}
	
	function pointInTriangle(opt) {
		var PA = vec(opt.curPos, opt.lastPos),
			PB = vec(opt.curPos, opt.topLeft),
			PC = vec(opt.curPos, opt.bottomLeft),
			R1 = vecProduct(PA, PB),
			R2 = vecProduct(PB, PC),
			R3 = vecProduct(PC, PA)

		return sameSymbols(R1, R2) && sameSymbols(R2, R3)

		function vec(a, b) {
			return {
				x: b.x - a.x,
				y: b.y - a.y
			}
		}
		function vecProduct(v1, v2) {
			return v1.x * v2.y - v1.y * v2.x
		}
		function sameSymbols(a, b) {
			return (a ^ b) >= 0
		}
	}
	// utils
	function getScrollOffset() {
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

	function pagePos(e) {
		var scrollLeft = getScrollOffset().left,
			scrollTop = getScrollOffset().top,
			clientLeft = document.documentElement.clientLeft || 0,
			clientTop = document.documentElement.clientTop || 0
		return {
			x: e.clientX + scrollLeft - clientLeft,
			y: e.clientY + scrollTop - clientTop
		}
	}

	function getStyles(el, prop) {
		if (window.getComputedStyle) return parseInt(window.getComputedStyle(el, null)[prop])
		else return parseInt(el.currentStyle[prop])
	}
}