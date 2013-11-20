var request = require('superagent');
var _ = require('underscore');

module.exports.Model = require('hyperbone-model').Model.extend({

  fetch : function( uri ){

    var self = this;

    if(uri){

      this.url(uri);

    }

    request
      .get(this.url())
      .set('Accept', 'application/json')
      .set('If-None-Match', self.__etag || "")
      .end(function(res){

        // for GET we only want a 200
        if(res.status == 200){

          if(res.header.etag){

            self.__etag = res.header.etag;

          }

          self.reinit(res.body);
          self.trigger('sync', self, res);

        } else if(res.status === 304){

          self.trigger('sync', self, res);

        }else{

          self.trigger('sync-error', res.status, res);

        }

      });

  },

  execute : function( command, callback ){

    var fn;
    var cmd = this.command(command);
    var self = this;

    if (_.isFunction(callback)){
      fn = function(res){
        if(res.status == 200 || res.status == 201 || res.status == 202){
          self.trigger('executed', cmd);
          callback(false, res);
        }else{
          self.trigger('execution-failed', cmd, res);
          callback(res.status, res);
        }
      };
    } else {
      fn = function(res){
        if(res.status == 200 || res.status == 201 || res.status == 202){
          self.trigger('executed', cmd);
          self.fetch();
        }else{
          self.trigger('execution-failed', cmd, res);

        }
      };
    }

    request(cmd.get('method'), cmd.get('href'))
      .set('Accept', 'application/json')
      .type( cmd.get('encoding') === "x-form-www-url-encoding" ? "form" : "json" )
      .send(cmd.properties().toJSON())
      .end(function(res){
        fn(res);   
      });
  }

});