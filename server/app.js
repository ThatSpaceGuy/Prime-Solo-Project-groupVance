var verbose = true; // if (verbose) {console.log('');}
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
//// --------NEED TO ENTER ***: Database Name
var connectionString = 'postgress://localhost:5432/***';

app.use(bodyParser.urlencoded( {extended: false } ));
app.use(bodyParser.json());

var portDecision = process.env.PORT || 3000;
// spin up server
app.listen(portDecision, function(){
  if (verbose) {console.log('Server is listening on Heroku or port 3000');}
});

// base url hit
app.get('/', function(req,res){
  if (verbose) {console.log('base url hit');}
  res.sendFile(path.resolve('public/views/index.html'));
});

// setup 'public' as a static resource
app.use(express.static('public'));

// GET route with a basic response
app.get('/getRoute', function(req,res){
  // Code for basic get response
  console.log( '/getRoute hit' );
  var responseObject ={
    response: 'response text from get'
  };
  res.send( responseObject );
}); // end app.get getRoute

// GET route with a Database call
app.get('/getRouteDB', function(req,res){
  // Code for basic get response
  console.log( '/getRouteDB hit' );
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    } else {
      if (verbose) {console.log('app.get/getRouteDB connected');}

      /////// --------- Use to get info from Database --------- ///////
      var resultsArray=[];
      //// --------NEED TO EDIT SQL Query
      var queryResults=client.query('SELECT * FROM <table> ORDER BY <field1>, <field2>;');
      queryResults.on('row',function(row){
        resultsArray.push(row);
      });
      if (verbose) {console.log('resultsArray from getRouteDB query:',resultsArray);}
      queryResults.on('end',function(){
        done();
        return res.send(resultsArray);
      }); // end queryResults.on('end')
      /////// --------- Use to get info from Database --------- ///////

    }// end else
  }); // end pg.connect
}); // end app.get getRoute


// post route to receive information from client
app.post('/postRoute', function(req,res){
  if (verbose) {console.log('Route /postRoute hit', req.body);}
  res.send('/postRoute response. Received: '+req.body);
});

//post route to add information in Database
app.post( '/postRouteDB', function( req, res ){
  if (verbose) {console.log( '/postRouteDB route hit', req.body );}
  //// --------NEED TO ENTER ***: SQL Query
  var queryString = 'INSERT INTO <table> (<field1>, <field2>) VALUES (($1),($2));';
  if (verbose) {console.log('sending to database:', queryString);}
  //send queryString to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.post/postRouteDB connected');}
      client.query(queryString,[variableToReplaceBling]);
      done();
      return res.sendStatus(200);
    }
  });
});//end /postRoute

//put route to update information in Database
app.put( '/putRouteDB', function( req, res ){
  if (verbose) {console.log( '/putRouteDB route hit', req.body );}
  //// --------NEED TO ENTER ***: SQL Query
  var queryString = 'UPDATE <table> SET <field> = '+variable+' WHERE <field> = ($1);';
  if (verbose) {console.log('sending to database:', queryString);}
  //send queryString to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.put/putRouteDB connected');}
      client.query(queryString,[variableToReplaceBling]);
      done();
      return res.sendStatus(200);
    }
  });
});//end /putRoute

//delete route to update information in Database
app.delete( '/deleteRouteDB', function( req, res ){
  if (verbose) {console.log( '/deleteRouteDB route hit', req.body );}
  //// --------NEED TO ENIT: SQL Query
  var queryString = 'DELETE FROM <table> WHERE <field> = ($1);';
  if (verbose) {console.log('sending to database:', queryString);}
  //send queryString to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.delete/deleteRouteDB connected');}
      client.query(queryString,[variableToReplaceBling]);
      done();
      return res.sendStatus(200);
    }
  });
});//end /deleteRoute
