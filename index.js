var _ = require('underscore');
var Events = require('backbone-events').Events;
var dom = require('dom');

var HyperboneForm = function( model ){

  this.model = model;

  this.modelRefs = {};
  this.partialRefs = {};

  this.fields = [];

  _.extend(this, Events);

	return this;

};

var validElements = ["fieldset", "legend", "input", "textarea", "select", "optgroup", "option", "button", "datalist", "output"];

HyperboneForm.prototype = {

  create : function( control ){

    this.control = this.model.control(control);

    if(!control) throw Error("No such control");

    this.el = dom( document.createDocumentFragment() ).append(this.traverse( this.control, 'form' ));    

    if(!this.el.find('input[type="submit"]').length() && !this.el.find('button[type="submit"]').length() ){

      this.control.set('__hyperbone_submit', { input : {type : 'submit', name : 'submit', value : 'Submit'}});

      this.el.append( this.traverse( this.control.get('__hyperbone_submit')));

    }

    this.trigger('initialised', this.el, this.control );

    return this;

  },

  toHTML : function(){

    _.each(this.fields, function( formField ){

      var br, label, innerLabel;

      switch(formField.type){

        case "input" : 
        case "select" :
        case "textarea" :
        case "button" :
        case "output" :

          label = dom('<label></label>')
                        .text( formField.model.get('_label') || formField.name )
                        .insertAfter(formField.partial);

          formField.partial.insertAfter(label);

          br = dom('<br>')
                        .insertAfter(formField.partial);

          break;

        case "_checkboxes" :
        case "_radios" :

          formField.model.get("_children").each(function(option, index){

            label = dom('<label></label')
                      .text( (index===0 ? formField.model.get("_label") : "") )
                      .insertAfter(formField.partial[index]);

            formField.partial[index].insertAfter(label);

            innerLabel = dom('<label></label>')
                          .insertAfter( formField.partial[index] );

            innerLabel
              .append( formField.partial[index] )

            dom( document.createTextNode( " " + option.get("_label") ) ).insertAfter( formField.partial[index] );

            br = dom('<br>')
                          .insertAfter(innerLabel);

          }, this);

          break;
      }


    }, this);

    return this.el;

  },

  toBootstrap2HTML : function( inline ){

    this.el.addClass('form-horizontal');

    _.each(this.fields, function( formField ){

      var ctrlGroup, ctrls, label, innerLabel, type;

      switch(formField.type){

        case "input" : 
        case "select" :
        case "textarea" :
        case "button" :
        case "output" :

          type = formField.model.get('type');

          ctrlGroup = dom('<div></div>').addClass('control-group'); 
          label = dom('<label></label>');

          ctrls = dom('<div></div>').addClass('controls');

          ctrlGroup.insertAfter( formField.partial );

          ctrls.appendTo( ctrlGroup );

          if(type==="radio" || type==="checkbox"){

            label.appendTo( ctrls );
            label.addClass( type );
            formField.partial.appendTo( label );

            dom( document.createTextNode(' ' + formField.model.get('_label') ) ).appendTo( label );


          }else{

            label
              .text( formField.model.get('_label') )
              .addClass('control-label');

            label.appendTo( ctrlGroup );
            formField.partial.appendTo(ctrls);
            ctrls.insertAfter(label);
            

          }

          break;

        case "_checkboxes" :
        case "_radios" : 

        

          formField.model.get("_children").each(function(option, index){

            ctrlGroup = dom('<div></div>').addClass('control-group');  
            label = dom('<label></label>')
                      .text( (index===0 ? formField.model.get("_label") : "") )
                      .addClass('control-label');

            label.appendTo( ctrlGroup );

            ctrls = dom('<div></div>').addClass('controls');

            ctrlGroup.insertAfter( formField.partial[index] );
            ctrls.appendTo( ctrlGroup );

            formField.partial[index].appendTo(ctrls);


            innerLabel = dom('<label></label>')
                          .addClass( option.get('type') )
                          .insertAfter( formField.partial[index] );

            innerLabel
              .append( formField.partial[index] );

            dom( document.createTextNode( " " + option.get("_label") ) ).insertAfter( formField.partial[index] );


          }, this);


          break;
          default:
            console.log(formField);
      }


    }, this);

    return this.el;

  },

	traverse : function( node, tag ){

    var self = this;

		var frag = (tag ? dom('<'+ tag +'></' + tag + '>') :  dom( document.createDocumentFragment() ) );

		var attr = node.models || node.attributes;

		_.each(attr, function(obj,name){

      if (_.isObject(obj)){

        if ( _.indexOf(validElements, name) !== -1 ){ // recurse for recognised HTML elements

          frag.append( this.traverse(obj, name) );

        } else if (name==="_checkboxes" || name==="_radios"){ // custom handler for 'checkboxes' and 'radios'

          var fieldName = obj.get("name");

          var els = [];

          obj.get("_children").each(function(option){

            var el = dom('<input></input')
              .attr('type', (name === "_checkboxes" ? "checkbox" : "radio"))
              .attr('name', fieldName);

            _.each(option.attributes, function(o, name){

              if(name!=="_label"){
                el.attr(name, o);
              }

            });

            els.push(el);
            frag.append(el);

          });

          this.registerFormInput(name, fieldName, obj, els);

        } else if (name!=="_value"){ // recurse for any other object that doesn't require a specific tag generating.

          frag.append( this.traverse(obj) );

          if(name==="_children"){ // re-set the value here, in case the value comes before the options. 

            frag.val(node.get("_value"));

          }

        }

      } else if (name==="_text"){ // _text is a special reserved attribute

        frag.append( dom( document.createTextNode(obj) ) );

      } else if (name === "_value"){

        frag.val(node.get("_value"));

        node.on("change:_value", function(model, val){

          var oldVal = frag.val();

          if(oldVal !== val){
            frag.val(val);
            self.trigger('updated', self.el, self.control, 'change:' + node.get('name'));
          }



        });

        frag.on("change", function(e){

          var oldVal = node.get("_value");

          if(oldVal !== frag.val()){
            node.set("_value", frag.val());
            self.trigger('updated', self.el, self.control, 'change:' + node.get('name'));
          }

        });

      }else if(name!=="_label"){

        if(name==="name"){
          
          this.registerFormInput(tag, obj, node, frag);
      
        }

        frag.attr(name, obj);

      }


		}, this);

    if ((tag==="input" || tag==="button") && node.get('type') === "submit"){

      frag.on('click', function(e){

        e.preventDefault();
        self.trigger('submitted', self.el, self.control);

      })
    }

		return frag;

	},

  registerFormInput : function( type, name, model, partial ){

    this.fields.push({
      type : type,
      name : name,
      model : model,
      partial : partial 
    });

    return this;

  }


};

module.exports.HyperboneForm = HyperboneForm;