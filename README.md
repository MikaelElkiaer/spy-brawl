# What is 'Spybrawl' ?

Bla bla cool game - play it on a computer or phone...

## How is this shit structured?
Well, it ain't. But it uses `socket.io` and `express` to run a node.js web server with websockets communication.
For the web-part, it uses ES6-compliant `angular` and `jade`.

# How to run
Please tell me oh great one, how do I, a simple dimwit, run your cool shit?

## Prerequisites

* Node (https://nodejs.org/en/)
* NPM (Comes with nodejs, but remember to `npm install npm -g`)
* A proper browser, supporting most ES6 constructions (see https://kangax.github.io/compat-table/es6/)

## Starting a local server

* Install dependencies: `npm install`
* Start the server: `npm start` (this will automatically reload every time index.js is changed)

## Using livereload
If you are using Chrome, you can take advantage of livereload, which will automatically refresh the page when changes are made.
First, install the livereload extension: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei

* If you haven't already, start a local server (see above)
* Run `npm run watcher`
* Open web-client in a new tab (Default: http://localhost:5000/)
* Click the livereload chrome-extension (the circle should fill)

## Deploying to heroku

* `git remote add heroku git@heroku.com:[project-name].git`
* `git push heroku`
