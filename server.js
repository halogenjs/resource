var restify = require('restify');

var server = restify.createServer({});

server.use(restify.bodyParser());

server.get('/test-one.json', function(req, res, next){

	res.send(200,{
		_links : {
			self : {
				href : "/test-one.json"
			}
		},
		name : "The resource name"
	});

});

server.get('/test-one-second.json', function(req, res, next){

	res.send(200,{
		_links : {
			self : {
				href : "/test-one.json"
			}
		},
		name : "Changed resource name"
	});

});

server.get('/test-for-404', function(req, res, next){

	res.send(404, {
		detail : "The resource cannot be found"
	});

})

server.get('build.js', restify.serveStatic({
  directory: './build'
}));



server.get('/etag-test.json', function(req, res, next){

	if (req.header('If-None-Match') == '12341234'){

		res.send(304);

	} else {

		res.setHeader('ETag', '12341234')
		res.send(200,{
			_links : {
				self : {
					href : "/etag-test.json"
				}
			},
			name : "The resource name"
		});

	}

});

server.post('/resource-with-post-endpoint', function(req, res, next){

	if(req.params.name){

		res.setHeader('Location', '/new-resource.json')
		res.send(201, { name : req.params.name, test : req.params.test });


	} else {

		res.send(406);

	}

});

server.post('/resource-with-checkbox-property', function(req, res, next){

	if(req.params.test){

		res.setHeader('Location', '/new-resource.json')
		res.send(201, { test : req.params.test });


	} else {

		res.setHeader('Location', '/new-resource.json')
		res.send(201, { test : '' });

	}

});

server.put('/put-endpoint', function(req, res, next){

	if(req.params.name && req.params.test){
		
		res.setHeader('Location', '/test-one-second.json')
		res.send(202, { name : req.params.name, test : req.params.test });


	} else {

		res.send(406);

	}

});

server.get(/.*/, restify.serveStatic({
  directory: './test'
}));

module.exports = server;