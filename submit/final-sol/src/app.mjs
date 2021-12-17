import Path from 'path';

import cors from 'cors';
import express from 'express';
//HTTP status codes
import STATUS from 'http-status';  
import assert from 'assert';
import bodyParser from 'body-parser';

export default function serve(data) {
  const app = express();
  cdThisDir();
  app.locals.data = data;
  app.use(express.static('statics'));
  setupRoutes(app);
  return app;
}


/** set up mapping between URL routes and handlers */
function setupRoutes(app) {
  app.use(cors({ exposedHeaders: [ 'Location' ]}));
  app.use(bodyParser.json());

  //TODO: add routes

  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}

//TODO: add handler generating functions

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [	{ code: 'NOT_FOUND', message, }, ],
    };
    res.status(STATUS.NOT_FOUND).json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const result = {
      status: STATUS.INTERNAL_SERVER_ERROR,
      errors: [ { code: 'SERVER_ERROR', message: err.message } ],
    };
    res.status(STATUS.INTERNAL_SERVER_ERROR).json(result);
    console.error(result.errors);
  };
}


/**************************** Misc Utilities ***************************/

function cdThisDir() {
  try {
    const path = new URL(import.meta.url).pathname;
    const dir = Path.dirname(path);
    process.chdir(dir);
  }
  catch (err) {
    console.error(`cannot cd to this dir: ${err}`);
    process.exit(1);
  }
}
