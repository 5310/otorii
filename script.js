window.onload = function() {

	paper = Raphael(document.getElementById('paper'), 900, 540);

};


World = function() {
	
	var world = new Object();
	
	world.nodes = [];
	world.add = function(node){};
	
	world.active_node = null;
	
	world.flags = {};
	
	return world;
	
}


Node = function() {
	
	var node = new Object();
	
	node.angle = 0;
	
	node.branches = [];
	node.add = function(branch){};
	
	node.enter = function(){};
	node.exit = function(){};
	
	return node;
	
};


Branch = function(parent_node) {
	
	var branch = new Object();
	
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
