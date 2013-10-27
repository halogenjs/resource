# Hyperbone Form

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-form.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-form)
(Waiting on a pull request being accepted on a third party dependency)

## tldr; 

Generates easy to style two-way bound and evented HTML forms from a custom JSON schema. 

## Intro

[Hyperbone Model](http://github.com/green-mesa/hyperbone-model) adds to the HAL spec with a `_controls` keyword. These are JSON representations of forms for interacting with the resource.

HyperboneForm does not care about network interactions or serialisation. All it cares about is generating good HTML and then keeping that HTML synchronised with the underlying model. 

The idea is that if your server side can automatically generate the JSON for controls (from your data model), you can then automatically generate forms in the client and you don't have to faff around with HTML and binding inputs individually. All you need to worry about is where they go, and that stuff is taken care of in [Hyperbone View](http://github.com/green-mesa/hyperbone-view) (Note: Not actually taken care of by Hyperbone View yet)

## How Hyperbone Model and Hyperbone Form work together

A hypermedia document (loaded from a server) with a control might look like this:

```json
var hal = {
	"_links" : { // HAL defines hyperlinks via rel
		"self" : {
			"href" : "/link-to-me"
		},
		"controls:add-resource" : { // Hyperbone includes internal rels to controls
			"href" : "#_controls/edit/add-a-resource"
		}
	},
	"Title" : "This is the title",
	"Description" : "I am a description of a thing",
	"_controls" : {
		"edit" : {
			"add-a-resource" : { 
				"method" : "POST",
				"action" : "/link-to-me/add-resource",
				_children : [
					{
						input : {
							type : "text",
							name : "username",
							placeholder : "Enter your name",
							_label : "Your name:",
							_value : ""
						}
					},
					{
						input : {
							type : "submit",
							value : "Add yourself"
						}
					}
				]
			}
		}
	}

}

```
And the concept is that you can parse this `hal` with HyperboneModel...
```js
var model = new HyperboneModel( hal );
````
And you can access the `add-a-resource` control from the model via its rel:
```js
var control = model.control('controls:add-resource')
```
...And HyperboneForm understands the way the HyperboneModel works with controls, so all you really need to do is:
```js
var form = new HyperboneForm( model )
			.create('controls:add-resource')
			.toHTML();
// form is now a DOM fragment that can be appended into your page and used as normal. 
```
You can also subscribe to an event to find out when the user has submitted the form to deal with network/serialisation stuff.
```js
var form = new HyperboneForm( model )
            .on('submitted', function(el, control){
            	// probably want to serialise the control and so some AJAX here..
            })
			.create('controls:add-resource')
			.toHTML();
```

## Installation

  Install with [component(1)](http://component.io):

    $ component install green-mesa/hyperbone-model


## API

### new HyperboneForm( hypermediaDocument )

Create a new instead of HyperboneForm with a full hypermedia document. (see [HyperboneModel](https://github.com/green-mesa/hyperbone-model))

```js
var formGenerator = new HyperboneForm( myHypermediaDocument );
```

###.create( rel )

Pass the rel of a control to create an initial base form.

```js
var formGenerator = new HyperboneForm( myHypermediaDocument );
formGenerator.create('controls:my-control');
```

### .toHTML()

After creating the base version of the form, project onto some sort of more easily styleable layout:

```js
var formGenerator = new HyperboneForm( myHypermediaDocument );
formGenerator.create('controls:my-control');

var html = formGenerator.toHTML();
```


### .toBackbone2HTML()

After creating the base version of the form, project onto a Backbone 2 Horizontal Form layout:

```js
var formGenerator = new HyperboneForm( myHypermediaDocument );
formGenerator.create('controls:my-control');

var html = formGenerator.toBackbone2HTML();
```


## JSON Control Spec

The primary design goal is that this should be a semantic representation of a form. To this end there are some reserved attributes that attempt to normalise the differences between different kind of form elements, as well as add the all important semantic data.

In keeping with the HAL Spec, reserved attributes begin with an underscore.

__NOTE:__ `_labels` are optional. They're more likely to be a template concern and not something provided by a server but they're included here for completeness' sake. 

Reserved attributes are:

- `_children` : An array holding child nodes, i.e, select options, fieldset children etc.
- `_label` : Labels an input (and/or a group of checkboxes/radiobuttons), independently of how it will ultimately be used
- `_text` : Defines the innerText for non-void elements (legend, option, textarea, button)
- `_value` : Not the normal HTML attribute 'value'. This is the *actual* value of the form field. Works for selects, multi-selects, checkbox/radio groups.
- `_checkboxes` : Special object that defines a group of checkboxes with the same `name`. 
- `_radios` : Special object that defines a group of radio buttons with the same `name`.

All other attributes are treated as normal HTML element attributes and added to generated elements.

### Defining form elements

JSON Controls are a hierachical and ordered list of objects representing form elements, where the name of an object represents the HTML tagName, and the contents of the object represent the attributes.

```js
	tagname : {
		attribute1 : "value",
		attribute2 : "value"
	}
```
```html
<!-- raw untransformed generated html -->
<tagname attribute1="value" attribute2="value"></tagName>
```

Valid tagNames are:

- fieldset
- legend
- input
- textarea
- select
- optgroup
- option
- button
- datalist
- output

All other tagnames will generate document fragments instead of HTML Elements. 

```js
{
	input : {
		type : "checkbox",
		name : "a-checkbox",
		checked : checked
	}
},
{
	button : {
		type : "button",
		name : "the-button",
		_text : "Click me!"
	}
},

```
```html
<!-- raw untransformed generated html -->
<input type="checkbox" name="a-checkbox" checked="checked">
<button type="button" name="the-button">Click me!</button>
```

### Adding child nodes with `_children`

`select`, `datalist`, `fieldset` and `optgroup` elements usually have child elements. The reserved keyword `_children` is used for this. `_children` should always be an array:

Fieldset example:
```js
{
	fieldset : {
		_children : [
			{
				legend : {
					_text : "This is a set of fields!" // _text sets the innerHTML of this legend element.
				}
			},
			// ...
		]
	}
}
```

Select example:
```js
{
	select : {
		name : "select-one",
		_value : "a", // Note: we set the literal value of this form field with `_value`. No 'selected' or other faff required.
		_label : "Select one",
		_children : [
			{
				optgroup : {
					label : "Group 1", // note we use 'label' not '_label' here. We `label="Group 1"` on the actual element.
					_children : [
						{
							option : {
								value : "a", // again note we use 'value' not '_value'. We want `value="a"` added to the actual element
								_text : "A"
							}
						},
						{
							option : {
								value : "b", // again note we use 'value' not '_value'. We want `value="a"` added to the actual element
								_text : "B"
							}
						},
					]
				}
			},
			{
				optgroup : {
					label : "Group 2",
					_children : [
						{
							option : {
								value : "c",
								_text : "C"
							}
						},
						{
							option : {
								value : "d",
								_text : "D"
							}
						},
					]
				}
			}
		]
	}
}

```
which generates...
```html
<!-- raw untransformed generated html -->
<select name="select-one">
	<optgroup label="Group 1">
		<option value="a">A</option>
		<option value="b">B</option>
	</optgroup>
	<optgroup label="Group 1">
		<option value="c">C</option>
		<option value="d">D</option>
	</optgroup>
</select>
```


### Defining innerText

Some elements have innerText. `legend`, `textarea`, `option` and `button`. The `_text` reserved attribute is for this.

This...
```js
{
	option : {
		value : "GB",
		_text : "United Kingdom"
	}
}
```
Generates this...
```html
<!-- raw untransformed generated html -->
<option value="GB">United Kingdom</option>
```

Note that for `textarea` elements `_value` (the _actual_ value of the form field) is preferred to `_text` although they're functionally identical. 

This...
```js
{
	textarea : {
		_value : "This is my content",
		name : "big-input"
	}
}
```
Generates this...
```html
<!-- raw untransformed generated html -->
<textarea name="big-intput">This is my content</textarea>
```

### Defining labels (optional)

Because we want to preserve the semantic labels, the `_label` reserved attribute lets the JSON define an element's label independently of the HTML layout to be used.

This becomes especially useful when wishing to label both an individual checkbox input and a group of checkbox inputs separately. More on `_checkboxes` and `_radios`

```js
{
	input : {
		type : "text",
		_label  : "I'm a text box",
		name : "text-input"
	}
}
```
```html
<!-- default basic tranformation -->
<label>I'm a text box</label>
<input type="text" name="text-input">
<br>
```

### Groups of Checkboxes and Radios

Because groups of checkboxes and radio buttons is a fairly common use case for forms, two special objects have been added to make defining these groups easier.

Note that it is assumed that the `_children` of `_checkboxes` and `_radios` are inputs of the relevant type, so you only need declare the value the child input represents and a label. 

```js
{
	_checkboxes : {
		name : "group-of-checkboxes",
		_value : "a",
		_label : "I am the label for this group",
		_children : [
			{
				value : "a",
				_label : "I am the label for this checkbox"
			},
			{
				value : "b",
				_label : "And I'm the label for this checkbox"
			}
		]
	}
},
{
	_radios : {
		name : "group-of-radios",
		_value : "a",
		_label : "I am the label for this group",
		_children : [
			{
				value : "a",
				_label : "I am the label for this checkbox"
			},
			{
				value : "b",
				_label : "And I'm the label for this checkbox"
			}
		]
	}
}
```

```html
<!-- default basic transformation -->
<label>I am the label for this group</label>
<label>
	<input type="checkbox" value="a"> I am the label for this checkbox
</label>
<br>
<label></label> <!-- we don't show the group label a second time -->
<label>
	<input type="checkbox" value="b"> And I'm the label for this checkbox
</label>
<br>
```


## Testing

Install testing tools. You probably need PhantomJS on your path.

```back
  $ npm install && npm install -g grunt-cli
```

Run the tests:

```bash
  $ grunt test
```

## License

  MIT
