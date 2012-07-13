window.onload = function() {

	paper = Raphael(document.getElementById('paper'), 900, 540);

	// tests //
	
	w = World();
	i = Interface(w);
	
	n = Node();
	w.add(n);
	
	n.add(Branch("test.png", 121, 0.75));
	n.add(Branch("test.png", 0, 0.75));
	n.add(Branch("test.png", 60, 0.75));
	n.add(Branch("test.png", 180, 0.75));
	n.add(Branch("test.png", 350, 0.75));
	
	w.setActiveNode(n);

};


Interface = function(world) {

	// An unenforced singleton that would let us control the game.
	
	interface = {};
	
	interface.active_world = world;
	
	interface.turn_left = false;
	interface.turn_right = false;
		
	// Hotspots and handlers.
	interface.left_button = paper.rect(0, 0, paper.width*0.1, paper.height).attr({"fill": "#f00", "fill-opacity": "0", "stroke-width": "0"});
	interface.left_button.parent = interface;
	interface.left_button.mouseover(function(){ this.parent.turn_left = true; });
	interface.left_button.mouseout(function(){ this.parent.turn_left = false; });
	interface.right_button = paper.rect(paper.width*0.9, 0, paper.width*0.1, paper.height).attr({"fill": "#f00", "fill-opacity": "0", "stroke-width": "0"});
	interface.right_button.parent = interface;
	interface.right_button.mouseover(function(){ this.parent.turn_right = true; });
	interface.right_button.mouseout(function(){ this.parent.turn_right = false; });
	
	// This tick funciton will be repeated, and will handle the turning controls.
	interface.tick = function() {
		
		// If turning left or right do so, or slow down.
		if ( interface.turn_left )
			interface.active_world.turn_left();
		else if ( interface.turn_right )
			interface.active_world.turn_right();
		else
			interface.active_world.turn();
	};
	setInterval(interface.tick, 1000/60);
	
	return interface;
}


World = function() {
	
	// The world is the entire game map.
	
	var world = {};
	
	// The World will contain a lot of Nodes, naturally. One of them will be active at a time.
	world.nodes = [];
	world.add = function(node) {
		this.nodes.push(node);
	};
	world.active_node = undefined;
	world.setActiveNode = function(node) {
		for ( var i = 0; i < this.nodes.length; i++)
			this.nodes[i].exit();
		this.active_node = node;
		this.active_node.enter();
	};
	
	// And the World needs to turn!
	// Here are some of the numbers for that.
	world.turn_speed = 0;
	world.turn_speed_min = 0.01;
	world.turn_speed_max = 1;
	world.turn_speed_d = 0.005
	// Turn left, accelerate.
	world.turn_left = function(){
		if ( this.turn_speed >= 0 )
			this.turn_speed = -1*this.turn_speed_min;
		else
			if ( this.turn_speed > -1*world.turn_speed_max )
				this.turn_speed -= this.turn_speed_d;
			else
				this.turn_speed = -1*world.turn_speed_max;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	// Turn right too.
	world.turn_right = function(){
		if ( this.turn_speed <= 0 )
			this.turn_speed = world.turn_speed_min;
		else
			if ( this.turn_speed < world.turn_speed_max )
				this.turn_speed += this.turn_speed_d;
			else
				this.turn_speed = world.turn_speed_max;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	// And the World spins not entirely madly on.
	world.turn = function() {
		this.turn_speed *= 0.95;
		if ( Math.abs(this.turn_speed) <= 0.001 )
			this.turn_speed = 0;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	
	// For ease, we'll store flags for the game here.
	world.flags = {};
	
	return world;
	
}

Node = function() {
	
	// Nodes are places in the world.
	
	var node = {};
	
	// Nodes can be turned, and hence have an angle.
	node.angle = 0;
	// They also have a FoV: The angle of stuff that will be visible at once.
	// 120 degress will fill the width of the screen, 900px.
	node.fov = 120;																
	
	// Nodes will contain Branches. The same symbol may lead between two Nodes, but they're different.
	node.branches = [];
	node.add = function(branch){
		// Add reference of this node to branch.
		branch.parent_node = this;
		// Then add it.
		this.branches.push(branch);
	};
	node.remove = function(branch){
		// If argument an interfer, remove element of that index.
		if ( isInteger(branch) ) {
			this.branches[branch].element.hide();
			this.branches.remove(branch);
		// Else, remove that Branch from the list, as well as the Branch.
		} else {
			branch.element.hide();
			for ( var i = 0; i < this.branches.length; i++ )
				if ( this.branches[i] === branch )
					this.branches.remove(i);
		}
	};
	
	// Once a Nodes can be active or inactive with events either way.
	
	// If a Node is active it means it's entered, which would intiate some events.
	// This can be expanded with hooks for gameplay.
	node.enter = function(){
		// Turn branches properly.
		this.turn();
		// Show all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.show();
	};
	
	// And upon leaving, this happens. This too can be extended.
	node.exit = function(){
		// Hide all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.hide();
	};
	
	// And Nodes need to be able to turn, which will also reposition its Branches.
	node.turn = function(angle){ //sets angle and rotates every branch
		
		// Set if new angle provided.
		if ( angle !== undefined )
			this.angle = angle;
		
		// Normalize angle.
		this.angle = normalizeAngle(this.angle);
		
		// Now position the branches accordingly.
		for ( var i = 0; i < this.branches.length; i++) {
			var v = normalizeAngle( this.angle+this.branches[i].angle, this.fov*1.2 ) * paper.width/this.fov; // Normalization limit is padded.
			this.branches[i].position(v);
		}
		
	}; 
	
	return node;
	
};

Branch = function(image_path, angle, height) {
	
	// Branches are graphical entities that will fill each place in the world
	// and can be interacted on to move between Nodes or every other in-game thing.
	
	var branch = {};
	
	// For internal use, a reference to each Branch's parent Node needs to be present.
	// As already mentioned, a Branch can only be part of one Node, even if the same icon is not.
	branch.parent_node = undefined; 
	
	// Branches are positioned with an angle in the panorama and a height.
	branch.angle = angle;
	branch.height = paper.height*(1-height); // 0 meant below ground, 1 is top. Not bound!
	
	// And of course, the main thing, a Raphael graphical Element represents the Branch.
	branch.element = loadImage(image_path, 0, 0).hide(); // Those 0s will be calculated properly later.
	branch.position = function(x, y){		
		this.element.attr('x', x - this.element.attr('width')/2);
		if ( y !== undefined )
			this.element.attr('y', y - this.element.attr('height')/2);

	};
	branch.position(0, branch.height);
	
	// Branches can be interacted with. 
	// These are the default behavior, which can be expanded with hooks.
	
	branch.click = function(){};
	branch.element.click(branch.click);
	
	branch.hover = function(){};
	branch.unhover = function(){};
	branch.element.hover(branch.hover, branch.unhover);
	
	return branch;
	
};


loadImage = function(path, x, y) {
	
	// Loats a plain vanilla HTML element first to get the size of an image automatically.
	var image = new Image(); 
	image.src = path;
	
	return paper.image(path, x, y, image.width, image.height);
	
};

normalizeAngle = function(angle, limit) {
	
	// Normalize angle between 0 and 360 (exclusive, of course).
	angle %= 360;
	if ( angle < 0 )
		angle += 360;
	
	// But if a limit if provided, split values past it to negative.
	if ( limit !== undefined )
		if ( angle > limit )
			angle = angle - 360;
		
	return angle;
};

isInteger = function(value) {
    return /^[\d]+$/.test(value);
}


Array.prototype.remove = function(from, to) {
	// John Resig's Array element removal function.
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
