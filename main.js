
//
//	utils
//
function clamp(n, min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return Math.max(min, Math.min(n, max));
}

function easeInCubic(start, end, value){
	value = clamp(value, 0, 1);
	end -= start;
	return (((end * value) * value) * value) + start;
}


//
//	Panel
//
function Panel(x, y, width, height, title){
	var self = this;

	var element = self.element = document.createElement('div');
	element.className = "panel";
	document.body.appendChild(element);

	self.x = x;
	self.y = y;
	self.width = width;
	self.height = height;

	self.mousedown = false;

	element.addEventListener("mousedown", function(){
		self.mousedown = true;
	});

	element.addEventListener("mouseup", function(){
		self.mousedown = false;
		self.snap()
	});

	element.addEventListener("mouseleave", function(evt){
		self.mousedown = false;
		self.snap()
	});

	element.addEventListener("mousemove", function(evt){
		if (self.mousedown) {

			self.moveBy( evt.movementX );
		}
	});

}

Object.defineProperty(Panel.prototype, "x", {
	get: function(){
		var style = window.getComputedStyle(this.element);
		return Number(style.left.replace("px", ""));
	},

	set: function(x){
		this.element.style.left = "" + x + "px";
	}
});

Object.defineProperty(Panel.prototype, "y", {
	get: function(){
		var style = window.getComputedStyle(this.element);
		return Number(style.top.replace("px", ""));
	},

	set: function(y){
		this.element.style.top = "" + y + "px";
	}
});

Object.defineProperty(Panel.prototype, "width", {
	get: function(){
		var style = window.getComputedStyle(this.element);
		return Number(style.width.replace("px", ""));
	},

	set: function(w){
		this.element.style.width = "" + w + "px";
	}
});

Object.defineProperty(Panel.prototype, "height", {
	get: function(){
		var style = window.getComputedStyle(this.element);
		return Number(style.height.replace("px", ""));
	},

	set: function(h){
		this.element.style.height = "" + h + "px";
	}
});

Panel.prototype.moveBy = function(mx) {
	var halfScreenWidth = window.innerWidth * 0.5
	var halfPanelWidth = self.width * 0.5;

	var minX = -(self.width * 0.5);
	var maxX = window.innerWidth - halfPanelWidth;

	//	set the x position
	//
	this.x = clamp(this.x + mx, minX, maxX);
	
	//  rotate
	//
	var pivot = this.x + halfPanelWidth;
	var margin = window.innerWidth * 0.125;

	if (pivot > halfScreenWidth) {
		var magnitude = 1 - (window.innerWidth - margin - pivot) / halfScreenWidth;
		var rotY = easeInCubic(0, -90, magnitude);

	} else if (pivot < halfScreenWidth) {
		var magnitude = 1 - (pivot - margin) / halfScreenWidth;
		var rotY = easeInCubic(0, 90, magnitude);
	}

	this.element.style.transform = "rotateY(" + rotY + "deg)";
}

Panel.prototype.snap = function(){
	var self = this;

	// TODO when we have stacks, snap to nearest stack position

	// snap to center //
	var pivot = this.x + this.width * 0.5;
	var distance = Math.abs( window.innerWidth * 0.5 - pivot );
	var threshold = window.innerWidth * 0.25;

	var speed = window.innerWidth / 4000;
	var duration = distance / speed;
	var t = 0;
	var startX = this.x;
	var endX = window.innerWidth * 0.5 - this.width * 0.5;

	var now = performance.now() || Date.now();

	// TODO XXX what happens if a resize occurs during this little adventure?
	var update = function(ts){
		var dt = Math.min(ts - now, 100);
		now = ts;

		t += dt;
		var progress = t / duration;
		var x = easeInCubic( startX, endX, progress );

		self.moveBy( x - self.x );  // a `moveTo` might be more straightforward here

		if (progress < 1) {
			requestAnimationFrame( update );
		}

	}

	if (distance <= threshold) {
		requestAnimationFrame( update );
	}
}


//
//	main
//

var width = window.innerWidth * 0.5;
var height = window.innerHeight * 0.5;
var x = width - (width * 0.5);
var y = height - (height * 0.5);

p = new Panel(x, y, width, height, 'test panel');
