var request = require('superagent');
var _ = require('underscore');

module.exports.Model = require('hyperbone-model').Model.extend({

  fetch : function( uri ){

    var self = this;

    if(uri) this.url(uri);

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
    var formData;
    var xhr;
    var encoding = "json";

    if (_.isFunction(callback)){
      fn = function(res){
        if(res.status >= 200 && res.status < 300){
          self.trigger('executed', cmd);
          callback(false, res);
        }else{
          self.trigger('execution-failed', res.status, cmd, res);
          callback(res.status, res);
        }
      };
    } else {
      fn = function(res){
        if(res.status >= 200 && res.status < 300){
          self.trigger('executed', cmd);
          self.fetch();
        }else{
          self.trigger('execution-failed', res.status, cmd, res);

        }
      };
    }

    if(cmd.get('encoding') && cmd.get('encoding').indexOf('x-www-form-urlencoded')) encoding = 'form';

    var data = cmd.properties().toJSON();

    if(cmd.get('schema')){

      _.each(data, function(value, key){

        if(value === true && cmd.get('schema.' + key + '.type') === 'html-checkbox' && cmd.get('schema.' + key + '.value')){

          data[key] = cmd.get('schema.' + key + '.value');

        }

      });

    }



    if(cmd._files || encoding === 'form'){

      xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", function( event ){

        if (event.lengthComputable){
          self.trigger('progress', cmd, event.loaded, event.total);
        }

      }, false);

      xhr.addEventListener("readystatechange", function( event ){

        if(xhr.readyState === 4){
            xhr.body = JSON.parse(xhr.responseText || '{}');
            fn(xhr);
        }

      }, false);

      if(cmd._files){

        formData = new FormData();
        xhr.open("POST", cmd.get('href'));

        _.each(data, function(value, key){

          if (cmd._files[key]){

            formData.append(key, cmd._files[key]);

          } else {

              formData.append(key, value);

          }

        });

        xhr.setRequestHeader("Accept", 'application/json');
        xhr.send( formData );

      } else {

        var segments = [];
         xhr.open(cmd.get('method'), cmd.get('href'));

        _.each(data, function (value, key){
          if (_.isArray(value)){
            _.each(value, function (value){
              if(value || value === 0 || value === ""){
                segments.push(key + "=" + encodeURI(value));
              }
            });
          } else if(value || value === 0 || value === ""){
              segments.push(key + '=' + encodeURI(value));
          }
        });

        xhr.setRequestHeader("Accept", 'application/json');
        xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
        xhr.send( segments.join('&'));

      }

    } else {

      // send json...
      request(cmd.get('method') || "GET", cmd.get('href'))
        .set('Accept', 'application/json')
        .type( encoding )
        .send( data )
        .end(function(res){
          fn(res);
        });

      }
  }

});
