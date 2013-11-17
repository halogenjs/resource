var request = require('superagent');
window.Model = require('hyperbone-model').Model;

var HyperboneIO = function( model ){

  if (model){
    this.model = model;
    this.loaded = true;
  } else {
    this.loaded = false;
  }

  this.modelPrototype = Model;

  return this;

}

HyperboneIO.prototype = {

  initialise : function( uri ){

    var self = this;

    this.uri = uri;

    return {

      withModel : function( modelPrototype ){

        self.modelPrototype = modelPrototype;
        return {
          load : load
        }
      },
      load : load

    };

    function load( callback ){

      request
        .get(self.uri)
        .set('Accept', 'application/json')
        .end(function(error, res){

          if (error){

            callback(error, res);

          } else {

            if(!self.model){

              self.model = new self.modelPrototype(res.body);
              callback.call(self.model, false, refresh, transmitCommand );

            } else {

              var attributes = self.model.parseHypermedia(res.body);
              self.model.set(attributes);
              callback.call(self.model, false, refresh, transmitCommand );

            }

          }

        });

      return self;

    }

    function transmitCommand( id ){
      var cmd = this.model.command(id);
      // serialise properties depending on any known encoding type..
      // and submit..
      
      //request(cmd.get('method'), cmd.get('href'))
    }

    function refresh( callback ){

      load(callback);

    }

  },

  transmitCommand : function( command ){

  }

};

module.exports.HyperboneIO = HyperboneIO;