
describe("suite", function(){

	describe("Environment", function(){

		it("Environment", function(){

			should.exist(dom);
			should.exist(useFixture);
			should.exist(fixtures);
			should.exist(Model);
			should.exist(setValueAndTrigger);
			should.exist(require('hyperbone-form'));

		});

	});

	describe("Generating html with traverse", function(){

		var HyperboneForm = require('hyperbone-form').HyperboneForm;

		it("creates void elements", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						input : {
							type : "text",
							name : "text-test",
							value : "some text"
						}
					}
				]
			});

			var html = gen.traverse( m.get("_children") ).find('input');

			expect( html.val() ).to.equal('some text');
			expect( html.attr('name') ).to.equal('text-test');

		});

		it("doesn't add _label as an attribute", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						input : {
							type : "text",
							name : "text-test",
							_value : "some text",
							_label : "Some label"
						}
					}
				]
			});

			var html = gen.traverse( m.get("_children") ).find('input');
		
			expect( html.attr('_label') ).to.be.null;

		});

		it("creates non-void elements", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						legend : {
							_text : "Some text"
						}
					}
				]
			});

			expect(
			
				gen.traverse(
					m.get("_children")
				).find('legend').els[0].outerHTML
		
			).to.equal('<legend>Some text</legend>');

		});

		it("creates nested elements", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						fieldset : [
							{
								legend : {
									_text : "Some text"
								}
							},
							{
								input : {
									name : "text-input",
									_value : "I have some text"
								}
							}
						]
					}

				]
			});

			var html = gen.traverse( m.get("_children") ).find('fieldset')

			expect( html.find('legend').text() ).to.equal('Some text'); 
			expect( html.find('input').val() ).to.equal('I have some text');

		});

		it("supports _children for adding option elements to selects", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						select : {
							name : "select",
							_value : "1",
							_children : [
								{
									optgroup : {
										label : "Some options",
										_children : [
											{
												option : {
													_text : "Option 1",
													value : "1"
												}
											},
											{
												option : {
													_text : "Option 2",
													value : "2"
												}
											}
										]
									}
								},
								{
									option : {
											_text : "Option 3",
											value : "3"
										}
								}
							]

						}
					}

				]
			});

			var html = gen.traverse( m.get("_children") ).find('select');

			expect( html.find('option').length() ).to.equal(3);
			expect( html.find('optgroup').length() ).to.equal(1);

			expect( html.find('optgroup').find('option').length() ).to.equal(2);
			expect( html.val() ).to.equal("1");

		});

		it("correctly generates a multi select with the correct value", function(){

			var gen = new HyperboneForm();
			var m = new Model({
				_children : [
					{
						select : {
							name : "select",
							multiple : "multiple",
							_value : ["1", "2"],
							_children : [
								{
									optgroup : {
										label : "Some options",
										_children : [
											{
												option : {
													_text : "Option 1",
													value : "1"
												}
											},
											{
												option : {
													_text : "Option 2",
													value : "2"
												}
											}
										]
									}
								},
								{
									option : {
											_text : "Option 3",
											value : "3"
										}
								}
							]

						}
					}

				]
			});

			var html = gen.traverse( m.get("_children") ).find('select');

			expect( html.val() ).to.deep.equal(["1", "2"]);

		});


		it("Can generate a array of checkboxes with a single label using 'checkboxes'", function(){

			var gen = new HyperboneForm();
			var m = new Model({

				_children : [
					{
						_checkboxes : {
							_label : "An array of checkboxes",
							name : "checkboxes",
							_children : [
								{
									value : "1",
									checked : "checked",
									_label : "Option One?"
								},
								{
									value : "2",
									_label : "Option Two?"
								}
							]
						}						
					}
				]

			});

			var html = gen.traverse( m.get("_children") ).find('input');

			expect( html.at(0).attr('value') ).to.equal('1');
			expect( html.at(0).attr('name') ).to.equal('checkboxes');

			expect( html.at(1).attr('value') ).to.equal('2');
			expect( html.at(1).attr('name') ).to.equal('checkboxes');

			expect( html.at(0).val() ).to.equal( '1' );	
			expect( html.at(1).val() ).to.equal( false );
		});


		it("Can generate a array of radio buttons with a single label using 'radios'", function(){

			var gen = new HyperboneForm();
			var m = new Model({

				_children : [
					{
						_radios : {
							_label : "An array of radio buttons",
							name : "radios",
							_children : [
								{
									value : "1",
									checked : "checked",
									_label : "Option One"
								},
								{
									value : "2",
									_label : "Option Two"
								}
							]
						}						
					}
				]

			});

			var html = gen.traverse( m.get("_children") ).find('input');

			expect( html.at(0).attr('value') ).to.equal('1');
			expect( html.at(0).attr('name') ).to.equal('radios');

			expect( html.at(1).attr('value') ).to.equal('2');
			expect( html.at(1).attr('name') ).to.equal('radios');

			expect( html.at(0).val() ).to.equal( '1' );	
			expect( html.at(1).val() ).to.equal( false );

		});

		it("Can generate a huge default form with at least one of everything", function(){

			var gen = new HyperboneForm();
			var m = new Model( useFixture('/everything') );

			var html = gen.traverse( m.control("controls:test"), 'form');

			expect( html.attr('action') ).to.equal('/tasklist/create');
			expect( html.attr('method') ).to.equal('POST');

			expect( html.find('input').length() ).to.equal(8);
			expect( html.find('select').length() ).to.equal(2);
			expect( html.find('fieldset').length() ).to.equal(5);
			expect( html.find('legend').length() ).to.equal(5);
			expect( html.find('option').length() ).to.equal(11);
			expect( html.find('optgroup').length() ).to.equal(2);
			expect( html.find('textarea').length() ).to.equal(3);

		});

		it("Sets the value of attributes correctly", function(){

			var gen = new HyperboneForm();
			var m = new Model( useFixture('/everything') );

			var html = gen.traverse( m.control("controls:test"), 'form');

			expect( html.find('input').select(function(input){ return input.attr('name')==="text-input"}).val() ).to.equal("I am some text");
			expect( html.find('select').select(function(select){ return select.attr('name')==="select-input"}).val() ).to.equal("1");
			expect( html.find('select').select(function(select){ return select.attr('name')==="select-multiple-input"}).val() ).to.deep.equal(["2", "3"]);

		});

		it("Automatically adds a submit button if none is found", function(){

			var m = new Model({
				_links : {
					"controls:test" : {
						href : '#_controls/test'
					}
				},
				_controls : {
					test : {
						method : "POST",
						action : "/do-action",
						encoding: "x-form-www-url-encoding",
						_children : [
							{
								input : {
									type : "text",
									name : "name",
									value : ""
								}
							}
						]
					}
				}

			});

			var gen = new HyperboneForm( m ).create('controls:test');

			expect( gen.el.find('input[type="submit"]').length() ).to.equal(1);


		});

	});

	describe("Using controls", function(){

		var HyperboneForm = require('hyperbone-form').HyperboneForm;

		it("accepts a control as a constructor parameter and automatically generates initial HTML",function(){

			var m = new Model( useFixture('/everything'))

			var gen = new HyperboneForm( m );

			var html = gen.create('controls:test').el

			expect( html.attr('action') ).to.equal('/tasklist/create');
			expect( html.attr('method') ).to.equal('POST');

			expect( html.find('input').length() ).to.equal(8);
			expect( html.find('select').length() ).to.equal(2);
			expect( html.find('fieldset').length() ).to.equal(5);
			expect( html.find('legend').length() ).to.equal(5);
			expect( html.find('option').length() ).to.equal(11);
			expect( html.find('optgroup').length() ).to.equal(2);
			expect( html.find('textarea').length() ).to.equal(3);

		});


	});

	describe("Transformers", function(){

		var HyperboneForm = require('hyperbone-form').HyperboneForm;

		it("can transform form to standard tableless layout with line breaks and labels", function(){

			var m = new Model( useFixture('/everything') );
			var gen = new HyperboneForm( m ).create( 'controls:test' );

			var html = gen.toHTML();

			expect( html.attr('action') ).to.equal('/tasklist/create');
			expect( html.attr('method') ).to.equal('POST');

			expect( html.find('input').length() ).to.equal(8);
			expect( html.find('select').length() ).to.equal(2);
			expect( html.find('fieldset').length() ).to.equal(5);
			expect( html.find('legend').length() ).to.equal(5);
			expect( html.find('option').length() ).to.equal(11);
			expect( html.find('optgroup').length() ).to.equal(2);
			expect( html.find('textarea').length() ).to.equal(3);

			expect( html.find('label').length() ).to.equal(19); 
			expect( html.find('br').length() ).to.equal(15); 

			expect( html.find('label').first().text() ).to.equal("Free text");
			expect( html.find('label').at(3).text() ).to.equal("Checkbox options");
			expect( html.find('label').at(4).text() ).to.equal(" One");
	
		});

		it("can transform form to Bootstrap 2 Horizontal Form", function(){

			var m = new Model( useFixture('/everything') );
			var gen = new HyperboneForm( m ).create('controls:test');

			var html = gen.toBootstrap2HTML();

			expect( html.attr('action') ).to.equal('/tasklist/create');
			expect( html.attr('method') ).to.equal('POST');

			expect( html.find('input').length() ).to.equal(8);
			expect( html.find('select').length() ).to.equal(2);
			expect( html.find('fieldset').length() ).to.equal(5);
			expect( html.find('legend').length() ).to.equal(5);
			expect( html.find('option').length() ).to.equal(11);
			expect( html.find('optgroup').length() ).to.equal(2);
			expect( html.find('textarea').length() ).to.equal(3);

			expect( html.find('label.control-label').length() ).to.equal(13); 
			expect( html.find('label.checkbox').length() ).to.equal(1); 
			expect( html.find('label.radio').length() ).to.equal(1); 
			expect( html.find('div.control-group').length() ).to.equal(15); 

			expect( html.find('label').first().text() ).to.equal("Free text");
			expect( html.find('label').at(3).text() ).to.equal("Checkbox options");
			expect( html.find('label').at(4).text() ).to.equal(" One");
		});

	});

	describe("Two way binding", function(){

		var HyperboneForm = require('hyperbone-form').HyperboneForm;

		describe("input", function(){

			it("automatically updates the form value when the model changes", function(){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									input : {
										type : "text",
										_value : "lol",
										name : "text-input"
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( html.find('input[name="text-input"]').val() ).to.equal("lol");

				m.set("_children[0].fieldset[0].input._value", "rofl");

				expect( html.find('input[name="text-input"]').val() ).to.equal("rofl");


			});

			it("automatically updates the model when the form value is changed", function( done ){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									input : {
										type : "text",
										_value : "lol",
										name : "text-input"
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( m.get("_children[0].fieldset[0].input._value") ).to.equal("lol");

				setValueAndTrigger( html.find('input'), "rofl", "change");

				setTimeout(function(){

					expect( m.get("_children[0].fieldset[0].input._value") ).to.equal("rofl");
					done();

				},50);


			});
			
		});

		describe("select", function(){

			it("automatically updates the form value when the model changes", function(){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									select : {
										name : "select-input",
										_value : "1",
										_children : [
											{
												option : {
													value : "1"
												}
											},
											{
												option : {
													value : "2"
												}
											},
											{
												option : {
													value : "3"
												}
											}							
										]
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( html.find('select[name="select-input"]').val() ).to.equal("1");

				m.set("_children[0].fieldset[0].select._value", "2");

				expect( html.find('select[name="select-input"]').val() ).to.equal("2");

			});

			it("automatically updates the model when the form value is changed", function( done ){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									select : {
										name : "select-input",
										_value : "1",
										_children : [
											{
												option : {
													value : "1"
												}
											},
											{
												option : {
													value : "2"
												}
											},
											{
												option : {
													value : "3"
												}
											}							
										]
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( m.get("_children[0].fieldset[0].select._value") ).to.equal("1");

				setValueAndTrigger( html.find('select'), "2", "change");

				setTimeout(function(){

					expect( m.get("_children[0].fieldset[0].select._value") ).to.equal("2");
					done();

				},50);

			});
			
		});

		describe("textarea", function(){

			it("automatically updates the form value when the model changes", function(){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									textarea : {
										name : "select-input",
										_value : "This is some wacky shit right here"
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( html.find('textarea').val() ).to.equal("This is some wacky shit right here");

				m.set("_children[0].fieldset[0].textarea._value", "Excuse me. Have you seen Colin Baker's bottom?");

				expect( html.find('textarea').val() ).to.equal("Excuse me. Have you seen Colin Baker's bottom?");

			});

			it("automatically updates the model when the form value is changed", function( done ){

				var m = new Model({
					_children : [
						{
							fieldset : [
								{
									textarea : {
										name : "select-input",
										_value : "This is some wacky shit right here"
									}
								}
							]
						}
					]

				});

				var html = new HyperboneForm().traverse( m.get("_children") );

				expect( m.get("_children[0].fieldset[0].textarea._value") ).to.equal("This is some wacky shit right here");

				setValueAndTrigger( html.find('textarea'), "Excuse me. Have you seen Colin Baker's bottom?", "change");

				setTimeout(function(){

					expect( m.get("_children[0].fieldset[0].textarea._value") ).to.equal("Excuse me. Have you seen Colin Baker's bottom?");
					done();

				},50);

			});
			
		});


	});

	describe("Event emitting", function(){

		var HyperboneForm = require('hyperbone-form').HyperboneForm;

		it("emits an initalised event", function( done ){

			var m = new Model( useFixture('/everything'))

			new HyperboneForm( m )
				.on('initialised', function(el, control){

					// check we're getting the correct params
					expect(el.els.length).to.equal(1);
					expect(control.get('method')).to.equal('POST');

					done();

				})
				.create('controls:test');

		});

		it("emits an submitted event", function( done ){

			var m = new Model( useFixture('/everything'))

			var el = new HyperboneForm( m )
				.on('submitted', function(el, control){

					// check we're getting the correct params
					expect(el.els.length).to.equal(1);
					expect(control.get('method')).to.equal('POST');

					done();

				})
				.create('controls:test').el

			simulateClick(el.find('button[type="submit"]'));

		});

		it("emits an updated event when form field changes", function( done ){

			var m = new Model( useFixture('/everything'))

			var el = new HyperboneForm( m )
				.on('updated', function(el, control, event){

					// check we're getting the correct params
					expect(el.els.length).to.equal(1);
					expect(control.get('method')).to.equal('POST');
					expect(event).to.equal('change:text-input')

					done();

				})
				.create('controls:test').el

			setValueAndTrigger( el.find('input[name="text-input"]'), "don't care", "change");

		});


		it("emits an updated event when model changes as well", function( done ){

			var m = new Model( useFixture('/everything'))

			var gen = new HyperboneForm( m )
				.on('updated', function(el, control, event){

					// check we're getting the correct params
					expect(el.els.length).to.equal(1);
					expect(control.get('method')).to.equal('POST');
					expect(event).to.equal('change:text-input')

					done();

				})
				.create('controls:test');

			m.control('controls:test').get('_children[0].fieldset._children[1].input').set('_value', "don't care");


		});

	});

	describe("Form serialisation", function(){


	});

});