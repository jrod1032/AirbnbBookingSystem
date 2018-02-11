require('newrelic');
const Koa = require('koa');

// function serve(myPort) {

  const app = new Koa();
  const Router = require('koa-router');
  const router = new Router();
  const bodyParser = require('koa-bodyparser');
  const port = process.env.PORT || 3000;
  const routes = require('./routes.js');

  //Set up body parsing middleware
  app.use(bodyParser());

  //x response-time

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start
    ctx.set('X-Response-Time', ms);
  });

  //logger

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`Timing? ${ctx.method} ${ctx.url} - ${ms}`);
  });


  app
    .use(routes.routes())
    .use(router.allowedMethods());

  if(!module.parent) {
    app.listen(port, () => console.log(`listening on port ${port}!`) ) 
  }
// }

// serve(3000);
// serve(3001);
// serve(3002);
// serve(3003);
// serve(3004);

//module.exports = app;