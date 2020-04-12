const CONF = require('./config.json')
const PORT = (process.argv[2])? process.argv[2] : 8080;
const FOLLOWING_ID = 85251743;
const CONSUMER_KEY    = CONF['consumer_key'];
const CONSUMER_SECRET = CONF['consumer_secret'];
const TOKEN_KEY       = CONF['token_key'];
const TOKEN_SECRET    = CONF['token_secret'];

var util            = require('util')
  , http            = require('http')
  , twitter         = require('twitter')
  , WebSocketServer = require('websocket').server
;

util.puts('[' + new Date() + ']Listen ' + process.argv[2]);
// build server
var server = http.createServer(function(request, response) {
  response.writeHead(404);
  response.end();
});
server.listen(PORT, function() {
  util.puts('[' + new Date() + ']Server is listening on port ' + PORT);
});
var wsServer = new WebSocketServer({
  "httpServer"            : server,
  "autoAcceptConnections" : false
});
wsServer.on(
  'request',
  function(request) {
    const origin = request.origin;
    if (!origin.indexOf('chrome-extension://') === 0) {
      request.reject();
      util.puts('[' + new Date() + ']Illegal client: ' + request);
      return;
    }
    var connection = request.accept(null, origin);// @TODO a protocol name should be assigned.
    connection.sendUTF('{"status" : "accepted", "origin": "' + origin + '"}');
  }
);

setInterval(function () {wsServer.broadcastUTF("");}, 30 * 1000);

// build twitter connection
var twit = new twitter({
  "consumer_key"        : CONSUMER_KEY,
  "consumer_secret"     : CONSUMER_SECRET,
  "access_token_key"    : TOKEN_KEY,
  "access_token_secret" : TOKEN_SECRET,
  "stream_base"         : "https://stream.twitter.com/1.1"
});
twit.stream('statuses/filter', {"follow" : FOLLOWING_ID}, function(stream) {
  stream.on('data', function(data) {
    if (data['user'] && data['user']['id'] !== FOLLOWING_ID) {
      return;
    }
    data['source']                                     = undefined;
    data['contributors']                               = undefined;
    data['entities']                                   = undefined;
    data['favorited']                                  = undefined;
    data['lang']                                       = undefined;
    data['truncated']                                  = undefined;
    data['in_reply_to_status_id']                      = undefined;
    data['in_reply_to_status_id_str']                  = undefined;
    data['in_reply_to_user_id']                        = undefined;
    data['in_reply_to_user_id_str']                    = undefined;
    data['in_reply_to_screen_name']                    = undefined;
    data['user']['name']                               = undefined;
    data['user']['screen_name']                        = undefined;
    data['user']['url']                                = undefined;
    data['user']['description']                        = undefined;
    data['user']['protected']                          = undefined;
    data['user']['followers_count']                    = undefined;
    data['user']['friends_count']                      = undefined;
    data['user']['listed_count']                       = undefined;
    data['user']['created_at']                         = undefined;
    data['user']['favourites_count']                   = undefined;
    data['user']['utc_offset']                         = undefined;
    data['user']['time_zone']                          = undefined;
    data['user']['geo_enabled']                        = undefined;
    data['user']['verified']                           = undefined;
    data['user']['statuses_count']                     = undefined;
    data['user']['lang']                               = undefined;
    data['user']['contributors_enabled']               = undefined;
    data['user']['is_translator']                      = undefined;
    data['user']['profile_background_color']           = undefined;
    data['user']['profile_background_image_url']       = undefined;
    data['user']['profile_background_image_url_https'] = undefined;
    data['user']['profile_background_tile']            = undefined;
    data['user']['profile_image_url']                  = undefined;
    data['user']['profile_image_url_https']            = undefined;
    data['user']['profile_link_color']                 = undefined;
    data['user']['profile_sidebar_border_color']       = undefined;
    data['user']['profile_sidebar_fill_color']         = undefined;
    data['user']['profile_text_color']                 = undefined;
    data['user']['profile_use_background_image']       = undefined;
    data['user']['default_profile']                    = undefined;
    data['user']['default_profile_image']              = undefined;
    data['user']['following']                          = undefined;
    data['user']['follow_request_sent']                = undefined;
    data['user']['notifications']                      = undefined;
    var text = data['text'];
    if (text.indexOf('■■緊急地震速報(第1報)■■') === -1) {
      return;
    }
    var scale = text.match(/最大震度\s*([1-9])/)[1];
    if (scale < 3) {
      return;
    }
    var magnitude = text.match(/M([1-9]+(.[1-9]+))/)[1];
    var datetime = text.match(/([0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})発生/)[1];
    var place = text.match(/■■緊急地震速報\(第1報\)■■\s*(.*)で地震/)[1];
    text = text.replace(/■■緊急地震速報\(第1報\)■■\s*/, '');
    text = text.replace(/\s#.*/, '');
    data['text'] = text;
    util.puts('[' + new Date() + ']EEW ' + JSON.stringify(data));
    wsServer.broadcastUTF(JSON.stringify(data));
  }); 
  stream.on('error' , function(err) {
    throw new Error('[' + new Date() + ']Error::for stream' + err);
  }); 
  stream.on('end' , function() {
    throw new Error('[' + new Date() + ']End::for stream');
  }); 
});
setTimeout(
  function () {
    throw new Error('[' + new Date() + ']Error::for reboot');
  },  
  1000 * 60 * 60// 1 hour
);
