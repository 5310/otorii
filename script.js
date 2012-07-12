window.onload = function() {

	paper = Raphael(document.getElementById('paper'), 900, 540);

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


Interface = function(world) { // There can only be one, becuase I didn't bother to make it otherwise.
	
	interface = {};
	
	interface.active_world = world;
	
	interface.turn_left = false;
	interface.turn_right = false;
		
	interface.left_button = paper.rect(0, 0, paper.width*0.1, paper.height).attr({"fill": "#f00", "fill-opacity": "0", "stroke-width": "0"});
	interface.left_button.parent = interface;
	interface.left_button.mouseover(function(){ this.parent.turn_left = true; });
	interface.left_button.mouseout(function(){ this.parent.turn_left = false; });
	interface.right_button = paper.rect(paper.width*0.9, 0, paper.width*0.1, paper.height).attr({"fill": "#f00", "fill-opacity": "0", "stroke-width": "0"});
	interface.right_button.parent = interface;
	interface.right_button.mouseover(function(){ this.parent.turn_right = true; });
	interface.right_button.mouseout(function(){ this.parent.turn_right = false; });
	
	interface.tick = function() {
		
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
	
	var world = {};
	
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
	
	world.turn_speed = 0;
	world.turn_speed_min = 0.01;
	world.turn_speed_max = 1;
	world.turn_left = function(){
		if ( this.turn_speed >= 0 )
			this.turn_speed = -1*this.turn_speed_min;
		else
			if ( this.turn_speed > -1*world.turn_speed_max )
				this.turn_speed -= 0.005;
			else
				this.turn_speed = -1*world.turn_speed_max;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	world.turn_right = function(){
		if ( this.turn_speed <= 0 )
			this.turn_speed = world.turn_speed_min;
		else
			if ( this.turn_speed < world.turn_speed_max )
				this.turn_speed += 0.005;
			else
				this.turn_speed = world.turn_speed_max;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	world.turn = function() {
		this.turn_speed *= 0.95;
		if ( Math.abs(this.turn_speed) <= 0.001 )
		this.turn_speed = 0;
		this.active_node.turn(this.active_node.angle+this.turn_speed);
	};
	
	world.flags = {};
	
	return world;
	
}

Node = function() {
	
	var node = {};
	
	node.angle = 0;
	node.pov = 120;	// 120 degress will fill the width of the screen, 900px.
	
	node.branches = [];
	node.add = function(branch){
		// Add reference of this node to branch.
		branch.parent_node = this;
		// Then add it.
		this.branches.push(branch);
	};
	
	node.enter = function(){
		
		// Turn branches properly.
		this.turn();
		
		// Show all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.show();
		
	};
	node.exit = function(){
		// Hide all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.hide();
	};
	
	node.turn = function(angle){ //sets angle and rotates every branch
		
		// Set if new angle provided.
		if ( angle !== undefined )
			this.angle = angle;
		
		// Normalize angle.
		this.angle = normalizeAngle(this.angle);
		
		// Now position the branches accordingly.
		for ( var i = 0; i < this.branches.length; i++) {
			var v = normalizeAngle( this.angle+this.branches[i].angle, this.pov*1.2 ) * paper.width/this.pov; // Normalization limit is padded.
			this.branches[i].position(v);
		}
		
	}; 
	
	return node;
	
};

Branch = function(image_path, angle, height) {
	
	var branch = {};
	
	branch.parent_node = undefined; 
	
	branch.angle = angle;
	branch.height = paper.height*(1-height); // 0 meant below ground, 1 is top. Not bound!
	
	branch.element = loadImage(image_path, 0, 0).hide(); // Those 0s will be calculated properly later.
	branch.position = function(x, y){		
		this.element.attr('x', x - this.element.attr('width')/2);
		if ( y !== undefined )
			this.element.attr('y', y - this.element.attr('height')/2);

	};
	branch.position(0, branch.height);
	
	branch.click = function(){};
	branch.element.click(branch.click);
	
	branch.hover = function(){};
	branch.unhover = function(){};
	branch.element.hover(branch.hover, branch.unhover);
	
	return branch;
	
};


loadImage = function(path, x, y) {
	
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
