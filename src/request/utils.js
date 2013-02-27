PB.overwrite(PB.Request, {
	
	builQueryString: function () {
		
		
	},
	
	parseQueryString: function () {
		
		
	}
});

PB.each({get: 'GET', post: 'POST', put: 'PUT', del: 'DELETE'}, function ( key, value ) {
	
	PB[key] = function () {
		
		// ...
	}
});
