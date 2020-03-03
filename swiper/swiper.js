(function() {
	var swiper = function(el, urls, /* boolean */realLoop) {
		// common props
		this.nodeNames = ['body', 'pagination', 'left', 'right']
		this.el = el
		this.width = parseInt(getStyles(el)['width'])
		this.imgUrls = urls
		this.length = urls.length
		this.realLoop = realLoop || false
		this.imgObjs = []
		this.gallery = null
		this.pointer = 0
		this.tID = null
		// realLoop mode props
		this.lis = []
		this.isDone = true // 节流

		this.init()
		this.start()
	};
	
	swiper.prototype = {
		constructor: swiper,

		init () {
			let nodeNames = ['body', 'pagination', 'left', 'right'], fragment
			this.el.className += ' swiper-wrapper'
			// 加载图片
			this.imgUrls.forEach((url) => {
				let imgObj = new Image()
				imgObj.src = url
				imgObj.style.height = '100%'
				imgObj.style.width = '100%'
				this.imgObjs.push(imgObj)
			})
			// 在文档片段中操作，减少重排和绘制
			fragment = document.createDocumentFragment()
			nodeNames.forEach((nodeName) => {
				let node = document.createElement('div'), ul
				node.className = nodeName

				switch (nodeName) {
					case 'body':
						ul = document.createElement('ul')
						ul.className = 'clearfix'
						ul.style.width = 100 * this.length + '%'
						// 根据模式，生成画廊
						if (this.realLoop) {
							let clsNames = ['pre', 'mid', 'next'],
								pointer = this.length - 1
							clsNames.forEach((cls) => {
								let li = document.createElement('li')
								if (pointer === this.length) pointer = 0
								li.className = cls
								li.style.width = 100 / this.length + '%'
								li.appendChild(this.imgObjs[pointer++])
								this.lis.push(li)
								ul.appendChild(li)
							})
						} else {
							for (let i = 0; i < this.length; i++) {
								let li = document.createElement('li'),
									img = this.imgObjs[i]
								// li.className = 'img-item'
								li.style.width = 100 / this.length + '%'
								li.appendChild(img)
								ul.appendChild(li)
							}
						}
						node.appendChild(ul)
						this.gallery = ul
						break;
					case 'pagination':
						ul = document.createElement('ul'),
							width = this.length * 12 + 'px'
						ul.className = 'clearfix'
						for (let i = 0; i < this.length; i++) {
							let li = document.createElement('li')
							ul.appendChild(li)
						}
						node.appendChild(ul)
						// node.width = this.length * 12 + 'px'
						// node.style.left = getPos(this.el).x + (this.width) - parseInt(node.width)) / 2 + 'px'
						node.style.left = `calc(50% - ${width} / 2)`
						this.pagination = node
						break;
					case 'left':
						node.className += ' iconfont'
						node.innerHTML = '&#xe667;'
						node.style.height = '50px'
						node.addEventListener('click', () => this.pre(), false)
						break;
					case 'right':
						node.className += ' iconfont'
						node.innerHTML = '&#xe601;'
						node.style.height = '50px'
						node.addEventListener('click', () => this.next(), false)
						break;
				}

				fragment.appendChild(node)
			})
			// 根据模式，切换函数功能
			if (!this.realLoop) {
				this.__proto__.pre = this.__proto__.defaultPre
				this.__proto__.next = this.__proto__.defaultNext
				this.__proto__.switchImg = this.__proto__.defaultSwitchImg
				this.__proto__.switchPage = this.__proto__.defaultSwitchPage
			} else {
				this.__proto__.pre = this.__proto__.realPre
				this.__proto__.next = this.__proto__.realNext
				this.__proto__.switchPage = this.__proto__.realSwitchPage
			}
			this.el.appendChild(fragment)
			this.switchPage()
		},

		pre: null,
		next: null,
		switchImg: null,
		switchPage: null,

		// common functions
		start() {
			this.tID = setTimeout(() => this.next(), 3000)
		},

		// default functions
		defaultPre () {
			if (this.tID) clearTimeout(this.tID)
			if (this.pointer > 0) this.pointer--
				else this.pointer = this.length - 1
			this.switchImg()
			this.switchPage()
			this.start()
		},

		defaultNext () {
			if (this.tID) clearTimeout(this.tID)
			if (this.pointer < this.length - 1) this.pointer++
				else this.pointer = 0
			this.switchImg()
			this.switchPage()
			this.start()
		},

		defaultSwitchImg () {
			this.gallery.style.marginLeft = -this.pointer * this.width + 'px'
		},

		defaultSwitchPage () {
			let pages = this.pagination.getElementsByTagName('li'),
				len = pages.length
			for (let i = 0; i < len; i++) {
				pages[i].className = ''
			}
			pages[this.pointer].className = 'active'
		},

		// realLoop functions
		realPre () {
			if (this.isDone) {
				if (this.tID) clearTimeout(this.tID)
				this.isDone = false
				this.gallery.style.transition = 'all .2s'
				this.gallery.style.marginLeft = `0px`
				this.changePointer('-')
				this.realSwitchPage()
				setTimeout(() => {
					this.refresh()
					this.gallery.style.transition = 'all 0s'
					this.gallery.style.marginLeft = `${- this.width}px`
					this.isDone = true
					this.start()
				}, 1000)
			}
		},

		realNext () {
			if (this.isDone) {
				if (this.tID) clearTimeout(this.tID)
				this.isDone = false
				this.gallery.style.transition = 'all .2s'
				this.gallery.style.marginLeft = `${- this.width * 2}px`
				this.changePointer('+')
				this.realSwitchPage()
				setTimeout(() => {
					this.refresh()
					this.gallery.style.transition = 'all 0s'
					this.gallery.style.marginLeft = `${- this.width}px`
					this.isDone = true
					this.start()
				}, 1000)
			}
		},

		realSwitchPage () {
			let pages = this.pagination.getElementsByTagName('li'),
				len = pages.length
			for (let i = 0; i < len; i++) {
				pages[i].className = ''
			}
			pages[this.pointer].className = 'active'
		},

		refresh () {
			let rightest = this.length - 1
			
			this.lis[0].removeChild(this.lis[0].firstChild)
			this.lis[1].removeChild(this.lis[1].firstChild)
			this.lis[2].removeChild(this.lis[2].firstChild)

			if (this.pointer === 0) {
				this.lis[0].appendChild(this.imgObjs[rightest])
				this.lis[1].appendChild(this.imgObjs[0])
				this.lis[2].appendChild(this.imgObjs[1])
				return
			}

			if (this.pointer === rightest) {
				this.lis[0].appendChild(this.imgObjs[rightest - 1])
				this.lis[1].appendChild(this.imgObjs[rightest])
				this.lis[2].appendChild(this.imgObjs[0])
				return
			}

			this.lis[0].appendChild(this.imgObjs[this.pointer - 1])
			this.lis[1].appendChild(this.imgObjs[this.pointer])
			this.lis[2].appendChild(this.imgObjs[this.pointer + 1])
		},

		changePointer (sign) {
			let rightest = this.length - 1
			if (sign === '-') {
				this.pointer--
				if (this.pointer < 0) this.pointer = rightest
			}

			if (sign === '+') {
				this.pointer++
				if (this.pointer > rightest) this.pointer = 0
			}
		}
	};

	function getPos(el) {
		return {
			x: el.getBoundingClientRect().x + window.scrollX,
			y: el.getBoundingClientRect().y + window.scrollY
		}
	}

	function getStyles(el) {
		if (window.getComputedStyle) return window.getComputedStyle(el, null)
			else return el.currentStyle
	}

	window.Swiper = swiper;
})()