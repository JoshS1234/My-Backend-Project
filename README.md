##

What is this repo???

This is an API which will return data about (fictional) board games. It has data about the games themselves, reviews, users, and comments. The intention is that this can be used to form the back end of a game review site.

##

Requirements

This was developed using Node v18.8.0 and PostgreSQl version 12.12
It may work on versions lower than this but if it isn't check that you are updated to these versions

##

Basic setup

###

Step 1: Cloning the repo
(if you want to have ownership of a copy of the repo) press "fork" from the repo from here: https://github.com/JoshS1234/My-Backend-Project
Navigate using the linux terminal to the desired location for the local copy of the repo
use "git clone https://github.com/JoshS1234/My-Backend-Project" (if not forked) OR "git clone <your github link>" (if forked)
install any dependencies: use the linux command "npm i" when you are in the repo directory

###

Step 2: Set up env files.

The repo contains seed files for the databases, you will need to set up your own env files. Instructions for this are below.

You will need to include a ".env.test" file, which points towards the test dataset. You will also need a ".env.development" file which points at the development dataset.

The .env.test file should look like

'''
PGDATABASE=nc_games_test
'''

The .env.development file should look like

'''
PGDATABASE=nc_games
'''

###

Step 3:

seed the databases using the methods from the package.json file
npm run setup-dbs
npm run seed
npm run seed:prod

###

Step 4:

use "npm start" to locally host the API, it will default to port 9090.

##

Using the API

There are several different endpoints available to get data, there is a full description of these given in a JSON format. In order to access this, acess the "/api" endpoint which will detail the remaining endpoints.

##

Additional Information

There is a link to a hosted version of the site here: https://my-backend-server-josh.herokuapp.com/

There is a link to a react website (using this backend) here: https://sunny-narwhal-f4e1dd.netlify.app/
