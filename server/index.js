const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const bodyParser = require('koa-bodyparser');
const port = process.env.PORT || 3000;
const listings = require('./listings.js');

//Set up body parsing middleware
app.use(bodyParser());

//x response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`);
});

//logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`Timing? ${ctx.method} ${ctx.url} - ${ms}`);
});

// app.use(listings.routes());
let searchResult = [{
    id:53323,
    title: 'Many pools!',
  },
  {
    id: 21123,
    title: 'Home near Franklin Park',
  },
  {
    id: 765433,
    title: 'Comfy Cambridge Home'
  }]


// router.get('/', (ctx, next) => {
//   ctx.response.body = JSON.stringify(searchResult)
// })
app
  .use(listings.routes())
  .use(router.allowedMethods());

// app.use(async ctx => {
//   ctx.response.status = 201;
//   ctx.response.body = JSON.stringify(searchResult)
// });

//app.listen(3000);
app.listen(port, () => console.log(`listening on port ${port}!`))