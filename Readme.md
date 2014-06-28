# Hyperbone Model (With IO)

## This module is no longer being maintained

It is replaced by [HalogenJS Resource](https://github.com/halogenjs/resource). 

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-model-with-io.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-model-with-io)

## tldr; 

Adds HTTP interactions to Hyperbone Models. Ridiculously early push this.

## Intro

Adds a 'fetch' method for loading a Hypermedia resource from a server, and a 'execute' method for sending Command data to a server. 

## Installation

Install with [npm(1)](http://npmjs.org):

```sh
$ npm install --save hyperbone-model-with-io
```

## Tests

If you don't already have grunt..
```sh
$ npm install -g grunt-cli
```
After cloning the repo..
```sh
$ npm install
```
To run the tests
```sh
$ npm test
```


## Usage

Instead of ...

```js
var Model = require('hyperbone-model').Model;
```

do...

```js
var Model = require('hyperbone-model-with-io').Model;
```

## API

### .fetch()

Assuming your model has a self href, it will load the hypermedia and fire a `sync` event, as per normal Backbone. Parameters in the callback
are the model and the request response.

### .execute( "command name" )

If you're using the '_commands' functionality, calling `.execute` will seralise the command's properties and PUT/POST/DELETE etc to the specified HREF. 

HTTP error codes 201, 200 and 202 are considered successful. ANything else counts as an error. 
On success, a .fetch() automatically happens. If it's an error this doesn't happen. 

It will also trigger `executed` or `execution-failed` which is passed the command that failed. This should bubble up to the parent model.

### .execute( "command name", callback )

If you pass a callback, instead of an automatic .fetch() happening your callback is called so you can manually decide whether or not to resync.

The parameters passed to the callback are `err` and `response`. 201, 200 and 202 are considered successful. ANything else counts as an error.

It will also trigger `executed` or `execution-failed`, which is passed the command that failed.

And this gives you Hyperbone Models with the HTTP extensions. This module is badly named really. This should bubble up to the parent model.


## License

  MIT
