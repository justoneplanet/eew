# eew

緊急地震速報配信用サーバー

## Installation

    sudo apt-get install nodejs-legacy npm
    npm install
    npm install -g forever

### config.json (for Twitter API)

    {
      "consumer_key"    : "your consumer key",
      "consumer_secret" : "your consumer secret",
      "token_key"       : "your token key",
      "token_secret"    : "your token secret"
    }

## Launch

    ulimit -n 32768
    forever start -a --spinSleepTime=10000 -w --watchDirectory=./ -l ~/.forever/eew80.log server.js 80


