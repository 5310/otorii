window.onload = function() {

	paper = Raphael(document.getElementById('paper'), 900, 540);

};


World = function() {
	
	var world = {};
	
	world.nodes = [];
	world.add = function(node){};
	world.active_node = null;
	
	world.left_element = null;
	world.turn_left = function(){};
	world.left_element.hover(world.turn_left, function(){});
	world.right_element = null;
	world.turn_right = function(){};
	world.right_element.hover(world.turn_right, function(){});
	
	world.flags = {};
	
	return world;
	
}


Node = function() {
	
	var node = {};
	
	node.angle = 0;
	
	node.branches = [];
	node.add = function(branch){};
	
	node.enter = function(){};
	node.exit = function(){};
	
	node.turn = function(){};
	node.turn_left = function(){};
	node.turn_right = function(){};
	
	return node;
	
};


Branch = function(parent_node) {
	
	var branch = {};
	
	branch.parent_node = parent_node; 
	
	branch.angle = 0;
	branch.height = 0;
	
	branch.element = null;
	
	branch.click = function(){};
	branch.element.click(branch.click);
	
	branch.hover = function(){};
	branch.unhover = function(){};
	branch.element.hover(branch.hover, branch.unhover);
	
	return branch;
	
};
