#!/usr/bin/env node

// ------------------ //
/// Alexa Skill section ///
// ------------------ //

var open = false;

var alexa = require('alexa-app');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app with name that matches name on Alexa Skills Kit
var app = new alexa.app('publish-example');

app.launch(function(req, res) {
  console.log("publish-example: LaunchIntent");
  res.say("Launched publish example skill");
});

app.sessionEnded(function(req, res) {
  open = false;
  console.log("SessionEndedRequest");
  res.say("SessionEndedRequest publish example skill");
});

app.intent("AMAZON.CancelIntent", {
}, function(req, res) {

  console.log("Cancel");
  res.shouldEndSession = true;
  res.say('');
  open = false;
});

app.intent("AMAZON.StopIntent", {
}, function(req, res) {

  console.log("Stop");
  res.shouldEndSession = true;
  res.say('');
  open = false;
});

app.intent("PublishStartIntent", {
  "utterances": ["launch the session", "start the session"]
}, function(req, res) {

  if(open == false) {
    console.log("start session");
    res.say('A session have been launch.');
  }

  res.shouldEndSession(false, "I did not hear you");
  open = true;
});

app.intent("PublishStartIntentFR", {
  "utterances": ["ouvre une session", "d'ouvrir une session", "demarre une session", "de demarrer une session"]
}, function(req, res) {

  if(open == false) {
    console.log("strat session");
    res.say('Une session a ete ouverte');
  }

  res.shouldEndSession(false, "je ne vous ai pas entendu");
  open = true;
});

app.intent("PublishStopIntent", {
  "utterances": ["close the session"]
}, function(req, res) {

  if(open == true) {
    console.log("Close session");
    res.shouldEndSession = true;
    res.say('the session was closed.');
  }
  open = false;
});

app.intent("PublishStopIntentFR", {
  "utterances": ["ferme la session"]
}, function(req, res) {

  if(open == true) {
    console.log("Close session");
    res.say('la session a été fermée.');
    res.shouldEndSession = true;
  }
  open = false;
});

app.intent("PublishMessageIntent", {
  "slots": { "message": "AMAZON.SearchQuery" },
  "utterances": ["listen to {message}", "listen {message}", "listen to me {message}"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log("publish-example: PublishMessageIntent");

  var msg = req.slot("message");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  var str = new ROSLIB.Message({data:msg});
  msg_topic.publish(str);
  // Send a response back to the Echo for the voice interface
  res.shouldEndSession(false, "I did not hear you");
  res.say('you have said ' + msg);
});

app.intent("MessageIntentFR", {
  "slots": { "message": "AMAZON.SearchQuery" },
  "utterances": ["ecoutes {message}"]
}, function(req, res) {
  // Log to console that the intent was received
  console.log("publish-example: MessageIntentFR");

  var msg = req.slot("message");
  // Do stuff with ROS using ROSLIB
  // You can see this String message if you are running rostopic echo /alexa_msgs
  var str = new ROSLIB.Message({data:msg});
  msg_topic.publish(str);
  // Send a response back to the Echo for the voice interface
  res.shouldEndSession(false, "je ne vous ai pas entendu");

  res.say('vous avez dit ' + msg);
});

// ------------------ //
/// ROS Interface section ///
// ------------------ //

// Connecting to ROS
var ROSLIB = require('roslib');
// rosbridge_websocket defaults to port 9090
var ros = new ROSLIB.Ros({url: 'ws://localhost:9090'});

ros.on('connection', function() {
  console.log('publish-example: Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('publish-example: Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('publish-example: Connection to websocket server closed.');
});

// Setup a ROSLIB topic for each ROS topic you need to publish to
// publish Strings to /alexa_msgs and publish Twists to /cmd_vel
var msg_topic = new ROSLIB.Topic({ros: ros, name: '/alexa_msgs', messageType: 'std_msgs/String'});

// Export the alexa-app we created at the top
module.exports = app;
