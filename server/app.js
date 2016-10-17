var verbose = true; // if (verbose) {console.log('');}
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
var moment = require('moment');
var connectionString = '';

if(process.env.DATABASE_URL !== undefined) {
    console.log('env connection string:', process.env.DATABASE_URL);
    connectionString = process.env.DATABASE_URL;
    pg.defaults.ssl = true;
  } else {
  connectionString ='postgress://localhost:5432/TotalMercyDB';
}

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

  var memberSearch = req.body.memberEmail;
  var memFirstName = req.body.firstName;
  var memLastName = req.body.lastName;
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    } else {
      if (verbose) {console.log('app.post/getMemberDB connected');}
      var checkResultsArray=[];
      var checkQuerySting = 'SELECT * from members where log_email=($1)';
      var checkQueryRes=client.query(checkQuerySting, [memberSearch]);
      checkQueryRes.on('row',function(row){
        checkResultsArray.push(row);
      });
      checkQueryRes.on('end',function(){
        if (verbose) {console.log('checkResultsArray from postStepDB query:',checkResultsArray);}
        if (checkResultsArray.length === 0) {
          var newMemberQueryStr = 'INSERT INTO members (first_name, last_name, log_email) VALUES (($1),($2),($3));';
          if (verbose) {console.log('sending to database:', newMemberQueryStr);}
          //send newMemberQueryStr to database
          var newMemberQueryRes=client.query(newMemberQueryStr, [memFirstName,memLastName,memberSearch]);

          newMemberQueryRes.on('end',function(){

          }); // end newMemberQueryRes.on('end')
        }
        var membersArray=[];
        var inGroup = true;
        var membersQueryString = '(SELECT *, 1 AS thisMem '+
        'FROM members_join_info WHERE log_email=($1) '+
        'ORDER BY step_id DESC) UNION (SELECT *, '+
        'CASE log_email WHEN ($1) THEN 1 ELSE 0 END AS thisMem '+
        'FROM members_join_info WHERE group_title = (SELECT group_title '+
        'FROM members_join_groups WHERE log_email=($1))) '+
        'ORDER BY thismem DESC, log_email, step_id DESC;';

        var membersQueryRes=client.query(membersQueryString, [memberSearch]);

        membersQueryRes.on('row',function(row){
          // if no group then assign default of 'None'
          if (!row.group_title){
            row.group_title = 'None';
            inGroup = false;
          }

          // Using Moment.js to normalize time information
          var memTime = row.member_created;
          var grTime = row.group_created;
          var stTime = row.step_created;
          // but only normalize time, if time info exists
          if (memTime){
            row.member_created = moment(memTime,true).format();
          }
          if (grTime){
            row.group_created = moment(grTime,true).format();
          }
          if (stTime){
            row.step_created = moment(stTime,true).format();
          }

          if(!row.pref_name){
            row.pref_name = row.first_name;
          }

          row.memberHandle = row.pref_name + row.member_id;

          membersArray.push(row);
        });
        membersQueryRes.on('end',function(){
          if (verbose) {console.log('membersArray from query:',membersArray);}
          var shoutsArray=[];
          var shoutsQueryRes=client.query('SELECT * FROM received_shouts '+
          'WHERE (runner_email=\''+memberSearch+'\' OR fan_email=\''+memberSearch+'\') AND shout_heard=false;');
          shoutsQueryRes.on('row',function(row){
            if(!row.runner_pref_name){
              row.runner_pref_name = row.runner_first_name;
            }
            if(!row.fan_pref_name){
              row.fan_pref_name = row.fan_first_name;
            }
            row.runnerHandle = row.runner_pref_name + row.runner_id;
            row.fanHandle = row.fan_pref_name + row.fan_id;

            shoutsArray.push(row);
          });
          shoutsQueryRes.on('end',function(){
            if (verbose) {console.log('shoutsArray from query:',shoutsArray);}
            if(!inGroup) {
              var openGroupsArrayDB=[];
              var openGroupsQueryRes=client.query('SELECT * FROM groups LEFT JOIN members_join_groups on groups.title = members_join_groups.group_title WHERE status = \'Open\';');
              openGroupsQueryRes.on('row',function(row){
                if(!row.pref_name){
                  row.pref_name = row.first_name;
                }
                if(row.pref_name){
                  row.memberHandle = row.pref_name + row.member_id;
                }
                openGroupsArrayDB.push(row);
              });
              openGroupsQueryRes.on('end',function(){
                if (verbose) {console.log('openGroupsArrayDB from query:',openGroupsArrayDB);}
                var openGroups={};
                var thisGroup;
                var thisTitle;
                var thisMember;
                for (var i = 0; i < openGroupsArrayDB.length; i++) {
                  thisGroup = openGroupsArrayDB[i];
                  thisTitle = thisGroup.title;
                  if (!openGroups[thisTitle]){
                    openGroups[thisTitle] = {};
                    openGroups[thisTitle].start_date = moment(thisGroup.created).format();
                    openGroups[thisTitle].numMembers = 0; // initialize size of group
                    openGroups[thisTitle].action_id = thisGroup.action_id;
                  }
                  if (thisGroup.pref_name){
                    openGroups[thisTitle].numMembers++;
                    if (openGroups[thisTitle].numMembers === 1){
                      openGroups[thisTitle].members = {};
                    }
                    thisMember = thisGroup.memberHandle;
                    openGroups[thisTitle].members[thisMember]={};
                    openGroups[thisTitle].members[thisMember].pref_name = thisGroup.pref_name;
                    openGroups[thisTitle].members[thisMember].member_id = thisGroup.member_id;
                  }
                }
                var openGroupsArray=[];
                var groupNum=-1;
                for (var group in openGroups) {
                  if (openGroups.hasOwnProperty(group)) {
                    groupNum++;
                    openGroupsArray[groupNum]=openGroups[group];
                    openGroupsArray[groupNum].title=group;
                  }
                }

                done();
                return res.send([membersArray,shoutsArray,openGroupsArray]);
              }); // end openGroupsQueryRes.on('end')
            } else {
              done();
              return res.send([membersArray,shoutsArray]);
            }
          }); // end shoutsQueryRes.on('end')
        }); // end membersQueryRes.on('end')
      }); // end checkQueryRes.on('end')

    }// end else
  }); // end pg.connect
}); // end app.post getRoute


// // post route to receive information from client
// app.post('/postRoute', function(req,res){
//   if (verbose) {console.log('Route /postRoute hit', req.body);}
//   res.send('/postRoute response. Received: '+req.body);
// });

//post route to add Step information in Database
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
        if (verbose) {console.log('resultsArray from postStepDB query:',resultsArray);}
        done();
        return res.send(resultsArray);
      }); // end queryResults.on('end')
    }
  });
});//end /postStepDB Route




//post route to add information in Database
app.post( '/postThanksDB', function( req, res ){
  if (verbose) {console.log( '/postThanksDB route hit', req.body );}
  var thankInfo = req.body;
  var thankQuery = 'INSERT INTO shouts (runner_id, fan_id, cheer_id) VALUES (($1),($2),($3));';
  if (verbose) {console.log('sending Thank to database:', thankQuery);}
  //send thankQuery to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.post/postThanksDB part 1 connected');}
      var resultsArray=[];
      var queryResults=client.query(thankQuery, [thankInfo.runnerID, thankInfo.fanID, 3]);
      queryResults.on('end',function(){
        var shoutUpdate = 'UPDATE shouts SET delivered = true WHERE id = ($1);';
        if (verbose) {console.log('sending to database:', shoutUpdate);}
        //send shoutUpdate to database
        pg.connect(connectionString, function(err, client, done){
          if (err){
            if (verbose) {console.log(err);}
          }
          else{
            if (verbose) {console.log('app.put/postThanksDB part 2 connected');}
            client.query(shoutUpdate,[thankInfo.shoutID]);
            done();
            return res.sendStatus(200);
          }
        });
      }); // end queryResults.on('end')
    }
  });
});//end /postThanksDB Route


//post route to add information in Database
app.post( '/postJoinDB', function( req, res ){
  if (verbose) {console.log( '/postJoinDB route hit', req.body );}
  var joinRequest = req.body;
  var queryString = 'INSERT INTO member_group (member_id, member_action, group_id) VALUES (($1),($2),(SELECT id FROM groups WHERE title = ($3)));';
  if (verbose) {console.log('sending to database:', queryString);}
  //send queryString to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.post/postJoinDB connected');}
      var queryResults=client.query(queryString, [joinRequest.memberID, joinRequest.actionID, joinRequest.groupTitle]);
      queryResults.on('end',function(){
        if (verbose) {console.log('returned from postJoinDB query');}
        done();
        return res.sendStatus(200);
      }); // end queryResults.on('end')
    }
  });
});//end /postStepDB Route



//post route to add information in Database
app.post( '/postShoutDB', function( req, res ){
  if (verbose) {console.log( '/postShoutDB route hit', req.body );}
  var shoutInfo = req.body;
  var shoutQuery = 'INSERT INTO shouts (runner_id, fan_id, cheer_id) VALUES (($1),($2),($3));';
  if (verbose) {console.log('sending Shout to database:', shoutQuery);}
  //send shoutQuery to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.post/postShoutDB connected');}
      var resultsArray=[];
      var queryResults=client.query(shoutQuery, [shoutInfo.runnerID, shoutInfo.fanID, shoutInfo.cheerType]);
      done();
      return res.sendStatus(200);
    }
  });
});//end /postShoutDB Route

//put route to update information in Database
app.put( '/putHeardDB', function( req, res ){
  if (verbose) {console.log( '/putHeardDB route hit', req.body );}
  var heardInfo = req.body;
  var shoutUpdate = 'UPDATE shouts SET delivered = true WHERE id = ($1);';
  if (verbose) {console.log('sending to database:', shoutUpdate);}
  //send shoutUpdate to database
  pg.connect(connectionString, function(err, client, done){
    if (err){
      if (verbose) {console.log(err);}
    }
    else{
      if (verbose) {console.log('app.put/putRouteDB connected');}
      client.query(shoutUpdate,[heardInfo.shoutID]);
      done();
      return res.sendStatus(200);
    }
  });
});//end /putRoute

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
