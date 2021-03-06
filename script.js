window.onload = function() {

	// Initialize the system.
	initialize: {

		// Create Raphael.js canvas.
		paper = Raphael(document.getElementById('paper'), 900, 540);
		
		// Create the world.
		world = World();
		
		// Create the interface for out world.
		interface = Interface(world);
	
	}
	
	// The starting branch.
	start: {
		
		// Create a node object and add it to the world.
		var node = Node();
		world.add(node);
		
		// Alias for node.
		NODE_START = node;
		
		// Assign background sound.
		node.setSound("/sounds/cicadas.ogg");

		// Event for entry.
		node.onEnter = function() {};
		
		// Event for exit.
		node.onExit = function() {};
		
		// The first torii.
		torii1: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/torii1_front.png", 0, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				NODE_MID.angle = 60;
				world.setActiveNode(NODE_MID);
			}
			
		}
		
		// The well.
		well: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/well.png", 180, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				//NODE.angle = 0;
				//world.setActiveNode(NODE);
			}
			
		}
		
		// Turn the node properly.
		node.angle = 60;
		
		// This node is the first node.
		world.setActiveNode(node);
		
	}
	
	// The middle game.
	mid: {
		
		// Create a node object and add it to the world.
		var node = Node();
		world.add(node);
		
		// Alias for node.
		NODE_MID = node;

		// Event for entry.
		node.onEnter = function() {};
		
		// Event for exit.
		node.onExit = function() {};
		
		// The first torii.
		torii1: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/torii1_front.png", 180, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				NODE_START.angle = 240;
				world.setActiveNode(NODE_START);
			}
			
		}
		
		// The second torii.
		torii2: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/torii2_front.png", 0, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				NODE_END.angle = 60;
				world.setActiveNode(NODE_END);
			}
			
		}
		
	}
	
	// The end game.
	end: {
		
		// Create a node object and add it to the world.
		var node = Node();
		world.add(node);
		
		// Alias for node.
		NODE_END = node;

		// Event for entry.
		node.onEnter = function() {};
		
		// Event for exit.
		node.onExit = function() {};
		
		// The first torii.
		torii2: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/torii2_front.png", 180, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				NODE_MID.angle = 240;
				world.setActiveNode(NODE_MID);
			}
			
		}
		
		// The second torii.
		torii3: {
			
			// Create a transient branch object and add it to the node.
			var branch = Branch("images/torii3.png", 0, 0.5);
			node.add(branch);
			
			// Event for clicking on this branch.
			branch.onClick = function() {
				//NODE.angle = 0;
				//world.setActiveNode(NODE);
			}
			
		}
		
	}

};

// Create a Interface entity. This should be a singleton.
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
	
	//interface.background = paper.rect(0, 0, paper.width, paper.height).attr('fill', "#10161B").attr('stroke-width', 0);
	//interface.background.toBack();
	
	return interface;
}

// Create a World entity. This should be a singleton.
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
		if ( this.active_node !== undefined )
			this.active_node.exit();
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
		if ( this.active_node ) {
			this.turn_speed *= 0.95;
			if ( Math.abs(this.turn_speed) <= 0.001 )
				this.turn_speed = 0;
			this.active_node.turn(this.active_node.angle+this.turn_speed);
		}
	};
	
	// For ease, we'll store flags for the game here.
	world.flags = {};
	
	return world;
	
}

// Create a Node entity.
Node = function() {
	
	// Nodes are places in the world.
	
	var node = {};
	
	// Nodes can be turned, and hence have an angle.
	node.angle = 0;
	// They also have a FoV: The angle of stuff that will be visible at once.
	// 120 degress will fill the width of the screen, 900px.
	node.fov = 120;	
	
	// Background sound for the node.
	node.sound = undefined;
	node.setSound = function(src) {
		this.sound = new buzz.sound(src, {preload: true, loop:true});
	};
	
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
	// This can be expanded with hooks for gameplay via onEnter.
	node.onEnter = function(){};
	node.enter = function(){
		// Begin playing the background sound, if any.
		if ( this.sound !== undefined )
			this.sound.play().fadeIn();
		// Turn branches properly.
		this.turn();
		// Show all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.show();
		// Execute hook.
		this.onEnter();
	};
	
	// And upon leaving, this happens. This too can be extended via onExit.
	node.onExit = function(){};
	node.exit = function(){
		// Stop playing the background sound, if any.
		if ( this.sound !== undefined )
			this.sound.fadeOut();
		// Hide all the branches.
		for ( var i = 0; i < this.branches.length; i++)
			this.branches[i].element.hide();
		// Execute hook.
		this.onExit();
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

// Create a Branch entity.
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
	branch.element.parent = branch; // Add reference to parent.
	branch.position = function(x, y){		
		this.element.attr('x', x - this.element.attr('width')/2);
		if ( y !== undefined )
			this.element.attr('y', y - this.element.attr('height')/2);

	};
	branch.position(0, branch.height);
	
	// Branches can be interacted with. 
	// These are the default behavior, which can be expanded with hooks.
	
	// Clicking is the simplest interaction. And the onClick hook is extensible.
	// Clicking will also subtly push the Branch's element.
	branch.onClick = function(){};
	branch.isHold = false;
	branch.mousedown = function(){
		// Zoom out the Branch Raphael element.
		this.scale(1/1.1, 1/1.1);
		// Set flag.
		this.parent.isHold = true;
	};
	branch.mouseup= function(){
		// Zoom in the Branch Raphael element.
		if ( this.parent.isHold )
			this.scale(1.1, 1.1);
		// Execute hook.
		this.parent.onClick();
		// Set flag.
		this.parent.isHold = false;
	};
	branch.element.mousedown(branch.mousedown);
	branch.element.mouseup(branch.mouseup);
	
	// There are also extensible hooks for onFocus, onDefocus,
	// and a repeating hook for while the onHover.
	branch.onFocus = function(){};
	branch.onDefocus = function(){};
	branch.onHover = function(){};
	branch.isHover = false;
	// Assign the onHover hook to repeat if hovering.
	setInterval(function(){ if ( branch.isHover ) branch.onHover(); }, 1000/60);
	branch.mouseover = function(){
		// Execute hook.
		this.parent.onFocus();
		// Set flag.
		this.parent.isHover = true;
	};
	branch.mouseout = function(){
		// Execute hook.
		this.parent.onDefocus();
		// If clicked, resize element.
		if ( this.parent.isHold )
			this.scale(1.1, 1.1);
		// Set flag.
		this.parent.isHover = false;
		this.parent.isHold = false;
	};
	branch.element.mouseover(branch.mouseover);
	branch.element.mouseout(branch.mouseout);
	
	return branch;
	
};


// Loads an image by specified path and coord.
loadImage = function(path, x, y) {
	
	// Loats a plain vanilla HTML element first to get the size of an image automatically.
	var image = new Image(); 
	image.src = path;
	
	return paper.image(path, x, y, image.width, image.height);
	
};

// Normalize an angle in degrees to be within 0 and 360.
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

// Checks if value is an integer.
isInteger = function(value) {
    return /^[\d]+$/.test(value);
}


// Monkey-patching a nice clean remove function to arrays.
Array.prototype.remove = function(from, to) {
	// John Resig's Array element removal function.
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};
