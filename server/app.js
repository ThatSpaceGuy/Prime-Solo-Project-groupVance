var verbose = true; // if (verbose) {console.log('');}
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
var connectionString = 'postgress://localhost:5432/TotalMercyDB';

app.use(bodyParser.urlencoded( {extended: false } ));
app.use(bodyParser.json());

var portDecision = process.env.PORT || 3000;
// spin up server
app.listen(portDecision, function(){
  if (verbose) {console.log('Server is listening on Heroku or port 3000');}
});

// setup 'public' as a static resource
app.use(express.static('public'));

// // GET route with a basic response
// app.get('/getRoute', function(req,res){
//   // Code for basic get response
//   console.log( '/getRoute hit' );
//   var responseObject ={
//     response: 'response text from get'
//   };
//   res.send( responseObject );
// }); // end app.get getRoute

// POST route with a Database call
app.post('/getMemberDB', function(req,res){
  console.log( '/getMemberDB hit with:',req.body );

  var memberSearch = req.body;
    pg.connect(connectionString, function(err, client, done){
      if (err){
        if (verbose) {console.log(err);}
      } else {
        if (verbose) {console.log('app.post/getMemberDB connected');}

        var resultsArray=[];
        var queryResults=client.query('SELECT * FROM members_join_steps '+
        'WHERE '+memberSearch.fieldName+'=\''+memberSearch.fieldValue+'\''+
        ' ORDER BY step_id DESC LIMIT 1;');
        queryResults.on('row',function(row){
          resultsArray.push(row);
        });
        queryResults.on('end',function(){
          if (verbose) {console.log('resultsArray from query:',resultsArray);}
          done();
          return res.send(resultsArray);
        }); // end queryResults.on('end')
      }// end else
    }); // end pg.connect
  }); // end app.post getRoute


  // // post route to receive information from client
  // app.post('/postRoute', function(req,res){
  //   if (verbose) {console.log('Route /postRoute hit', req.body);}
  //   res.send('/postRoute response. Received: '+req.body);
  // });

  //post route to add information in Database
  app.post( '/postStepDB', function( req, res ){
    if (verbose) {console.log( '/postStepDB route hit', req.body );}
    var stepReport = req.body;
    var queryString = 'INSERT INTO steps (member_id, action_id) VALUES (($1),($2)) RETURNING id;';
    if (verbose) {console.log('sending to database:', queryString);}
    //send queryString to database
    pg.connect(connectionString, function(err, client, done){
      if (err){
        if (verbose) {console.log(err);}
      }
      else{
        if (verbose) {console.log('app.post/postStepDB connected');}
        var resultsArray=[];
        var queryResults=client.query(queryString, [stepReport.memberID, stepReport.actionType]);
        queryResults.on('row',function(row){
          resultsArray.push(row);
        });
        queryResults.on('end',function(){
          if (verbose) {console.log('resultsArray from getRouteDB query:',resultsArray);}
          done();
          return res.send(resultsArray);
        }); // end queryResults.on('end')
      }
    });
  });//end /postStepDB Route

  // //put route to update information in Database
  // app.put( '/putRouteDB', function( req, res ){
  //   if (verbose) {console.log( '/putRouteDB route hit', req.body );}
  //   //// --------NEED TO ENTER ***: SQL Query
  //   var queryString = 'UPDATE <table> SET <field> = '+variable+' WHERE <field> = ($1);';
  //   if (verbose) {console.log('sending to database:', queryString);}
  //   //send queryString to database
  //   pg.connect(connectionString, function(err, client, done){
  //     if (err){
  //       if (verbose) {console.log(err);}
  //     }
  //     else{
  //       if (verbose) {console.log('app.put/putRouteDB connected');}
  //       client.query(queryString,[variableToReplaceBling]);
  //       done();
  //       return res.sendStatus(200);
  //     }
  //   });
  // });//end /putRoute

  //delete route to update information in Database
  app.delete( '/deleteStepDB', function( req, res ){
    if (verbose) {console.log( '/deleteStepDB route hit', req.body );}
    var stepToDelete = req.body.stepID;
    var queryString = 'DELETE FROM steps WHERE id = ($1);';
    if (verbose) {console.log('sending to database:', queryString);}
    //send queryString to database
    pg.connect(connectionString, function(err, client, done){
      if (err){
        if (verbose) {console.log(err);}
      }
      else{
        if (verbose) {console.log('app.delete/deleteStepDB connected');}
        client.query(queryString,[stepToDelete]);
        done();
        return res.sendStatus(200);
      }
    });
  });//end /deleteStepDB

  // setting catch all route
  app.get('/*', function(req,res){
    if (verbose) {console.log('Made it to the catch all route, with',req.params);}
    var file = req.params[0];

    // checking for valid url
    if (!file.includes('.')){
      file = 'views/index.html';
      // leave params untouched so that NG-routing can still use it
    }

    res.sendFile(path.resolve('public/', file));
  });
