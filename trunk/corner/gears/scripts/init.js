
	var u = new Utils();
	var json = new Json(document);
	
	function init() {
		var model = new Model();
		var view = new View();
		var controller = new Controller();	
		controller.start(view, model);
	};
	