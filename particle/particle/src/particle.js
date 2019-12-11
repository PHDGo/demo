(function(){
	var Particle = function({el, imgUrls, radius = 1}) {
		this.el = el;
		this.ctx = el.getContext('2d');
		this.imgUrls = imgUrls;
		this.imgObjs = [];
		this.radius = radius;
		this.totalItemCount = imgUrls.length;
		this.loadedItemCount = 0;
		this.index = 0;
		this.dots = [];
		this.initz = 300;
		this.init();
	};

	Particle.prototype = {
		constructor: Particle,
		init: function () {
			var el = this.el;
			// 初始化画布，使之居中，写法1
			// el.style.marginLeft = 'calc(50vw - ' + el.width / 2 + 'px)';
			// el.style.marginTop = 'calc(50vh - ' + el.height / 2 + 'px)';
			// 写法2
			el.style.marginLeft = `calc(50vw - ${el.width / 2}px)`;
			el.style.marginTop = `calc(50vh - ${el.height / 2}px)`;
			//限制小球半径
			if (el.width >= 500 || el.height >= 250) {
				this.radius = this.radius > 4 ? this.radius : 4;
			} else {
				this.radius = this.radius > 2 ? this.radius : 2;
			};
			/*  加载图像资源
			 *	var thisObj = this;
			 *	this.imgObjs = this.imgUrls.forEach(function(url){
			 *		thisObj.load(url);
			 *	});
			 *	或
			 */
			this.imgObjs = this.imgUrls.map(url => this.load(url));
		},
		load: function (imgUrl) {
			var	imgObj = new Image();
			addEvent(imgObj, 'load', () => this.itemLoaded());
			imgObj.src = imgUrl;
			return imgObj;
		},
		itemLoaded: function () {
			this.loadedItemCount++;
			//全部载入后开始绘制
			if (this.loadedItemCount === this.totalItemCount) {
				this.picLoop();
			}
		},
		picLoop: function () {
			this.drawPic();
			this.toParticle();
			this.combineParticle();
			this.index === this.imgObjs.length - 1 ? this.index = 0
												   : this.index++;
		},
		drawPic: function () {
			var el = this.el,
				imgObj = this.imgObjs[this.index],
				imgWidth = imgObj.width,
				imgHeight = imgObj.height;
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.ctx.drawImage(imgObj, (el.width - imgWidth) / 2, (el.height - imgHeight ) / 2, imgWidth, imgHeight);
		},
		toParticle: function() {
			var width = this.el.width,
				height = this.el.height,
				interval = this.radius * 2,
				initz = this.initz,
				imgData = this.ctx.getImageData(0, 0, width, height),
				data = imgData.data;
			this.dots = [];
			//此处为了提升性能，故不使用imgData.width和height来循环
			for (var x = 0; x < width; x += interval) {
				for (var y = 0; y < height; y += interval) {
					var i = (x + y * width) * 4;
					if (data[i+3] !== 0 && !(data[i] == 255 && data[i+1] == 255 && data[i+2] == 255)) {
						var dot = {
							x: x,
							y: y,
							z: 0,
							r: data[i],
							g: data[i+1],
							b: data[i+2],
							a: 1,
							ix: Math.random() * width,
							iy: Math.random() * height,
							iz: Math.random() * initz * 2 - initz,
							ir: 255,
							ig: 255,
							ib: 255,
							ia: 0,
							tx: Math.random() * width,
							ty: Math.random() * height,
							tz: Math.random() * initz * 2 - initz,
							tr: 255,
							tg: 255,
							tb: 255,
							ta: 0,
						};
						this.dots.push(dot);
					}
				}
			}
		},
		combineParticle: function () {
			var combine = this.dots.every(dot => {
				this.drawDot(dot);
				if (Math.abs(dot.ix - dot.x) < 0.1 && Math.abs(dot.iy - dot.y) < 0.1 && Math.abs(dot.iz - dot.z) < 0.1) {
					[dot.ix, dot.iy, dot.iz, dot.ir, dot.ig, dot.ib, dot.ia] = [dot.x, dot.y, dot.z, dot.r, dot.g, dot.b, dot.a];
					return true;
				} else {
					dot.ix += (dot.x - dot.ix) * 0.7;
					dot.iy += (dot.y - dot.iy) * 0.7;
					dot.iz += (dot.z - dot.iz) * 0.7;
					dot.ir += (dot.ir - dot.ir) * 0.3;
					dot.ig += (dot.ig - dot.ig) * 0.3;
					dot.ib += (dot.ib - dot.ib) * 0.3;
					dot.ia += (dot.ia - dot.ia) * 0.1;
					return false;
				}
			});

			if (combine === true) {
				setTimeOut(this.seperateParticle, 500);
			} else {
				requestAnimationFrame(this.combineParticle);
			};
		},
		seperateParticle: function () {
			var seperate = this.dots.every(dot => {
				if (Math.abs(dot.ix - dot.tx) < 0.1 && Math.abs(dot.iy - dot.ty) < 0.1 && Math.abs(dot.iz - dot.tz) < 0.1) {
					[dot.ix, dot.iy, dot.iz, dot.ir, dot.ig, dot.ib, dot.ia] = [dot.tx, dot.ty, dot.tz, dot.tr, dot.tg, dot.tb, dot.ta];
					return true;
				} else {  
					dot.ix += (dot.tx - dot.ix) * 0.7;
					dot.iy += (dot.ty - dot.iy) * 0.7;
					dot.iz += (dot.tz - dot.iz) * 0.7;
					dot.ir += (dot.tr - dot.ir) * 0.3;
					dot.ig += (dot.tg - dot.ig) * 0.3;
					dot.ib += (dot.tb - dot.ib) * 0.3;
					dot.ia += (dot.ta - dot.ia) * 0.1;
					return false;
				}
			});

			if (seperate = true) {
				setTimeOut(this.picLoop, 500);
			} else {
				requestAnimationFrame(this.seperateParticle);
			}
		},
		drawDot: function (dot) {
			var ctx = this.ctx,
				scale = this.initz / (this.initz + dot.iz);
			ctx.save();
			ctx.fillStyle = `rgba(${dot.ir}, ${dot.ig}, ${dot.ib}, ${dot.ia})`;
			ctx.beginPath();
			ctx.arc(dot.ix, dot.iy, this.radius * scale, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	}

	var	addEvent = (function(){
		if (window.addEventListener) {
			return function (el, type, fn) {
				el.addEventListener(type, fn, false);
			}
		} else if (window.attachEvent) {
			return function (el, type, fn) {
				el.attachEvent('on' + type, fn);
			}
		} else {
			return function (el, type, fn) {
				el['on' + type] = fn;
			}
		}
	})()

	window.Particle = Particle;
})()