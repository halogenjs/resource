// two primary use cases:

// 1 - Load data from a server
// 2 - Add command submit support to existing models

// Questions:

// should commands be automatically intercepted? 


describe("suite", function(){

	describe("Environment", function(){

		it("Environment", function(){

			should.exist(dom);
			should.exist(Model);
			should.exist(require('hyperbone-io'));

		});

	});

	describe("Loading Hypermedia", function(){

		var HyperboneIO = require('hyperbone-io').HyperboneIO;

		it("Can load a hypermedia object from a remote service", function( done ){

			new HyperboneIO()
				.initialise('/test-one.json')
				.load(function(err, refresh, submitCommand){

					expect( refresh ).to.be.a('function');
					expect( submitCommand ).to.be.a('function');

					expect( this.get('name') ).to.equal('The resource name');
					done();

				})

		});

		it("Can reload itself using the refresh callback", function( done ){


			var loader;

			loader = new HyperboneIO()
				.initialise('/test-one.json')
				.load(function(err, refresh, submitCommand){

					expect( this.get('name') ).to.equal('The resource name');

					// hack the internal uri so that we get a different version of the same hypermedia
					loader.uri = "/test-one-second.json";

					refresh(function(err, refresh, submitCommand){

						expect( this.get('name') ).to.equal('Changed resource name');
						expect( refresh ).to.be.a('function');
						expect( submitCommand ).to.be.a('function');

						done();

					})

				});

		})

	});

});