(function() {
	var swiper = function(el, urls) {
		this.el = el
		this.nodeNames = ['body', 'pagination', 'left', 'right']
		this.init()
	};
	
	swiper.prototype = {
		constructor: swiper,
		init () {
			this.nodeNames.forEach((nodeName) => {
				let node = document.createElement('div'),
				node.className = nodeName
				this.el.appendChild(node)
			})
		}
	};

	window.Swiper = swiper;
})()