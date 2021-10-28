# eew

緊急地震速報配信用サーバー

## Installation

    sudo apt-get update
    sudo apt update
    sudo apt install nodejs npm -y
    git clone https://github.com/justoneplanet/eew.git
    cd eew 
    npm install
    sudo npm install -g forever

### config.json (for Twitter API)

    {
      "consumer_key" : "your consumer key",
      "consumer_secret" : "your consumer secret",
      "token_key" : "your token key",
      "token_secret" : "your token secret"
    }

## Launch

    # check if it works.
    node server.js

    # production
    ulimit -n 32768
    forever start -a --spinSleepTime=10000 -w --watchDirectory=./ -l ~/.forever/eew80.log server.js 80

    # Count established connections
    lsof -i:80 | grep "ESTABLISED" | wc -l
