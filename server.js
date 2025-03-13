const express = require('express');
const { v4: uuidv4 } = require('uuid');
const DataManager = require('./src/DataManager');
const RealtimeServer = require('./src/websocket');
const { securityMiddlewares } = require('./src/middlewares');

const app = express();
const dataManager = new DataManager(process.env.DATA_PATH);
const realtimeServer = new RealtimeServer();

app.use(express.json({ limit: '1mb' }));
app.use(securityMiddlewares.rateLimiter);
app.use(securityMiddlewares.pathSanitization);
app.use(securityMiddlewares.jsonValidation);

// CRUD Endpoints
app.post('/:path', async (req, res) => {
  const newId = uuidv4();
  const pathSegments = req.params.path.split('/');
  
  const result = await dataManager.atomicUpdate((data) => {
    const parent = dataManager.resolvePath(pathSegments, true);
    parent[newId] = req.body;
    realtimeServer.broadcast({ event: 'create', path: req.params.path, id: newId });
    return { id: newId };
  });
  
  res.status(201).json(result);
});

app.get('/:path', (req, res) => {
  const pathSegments = req.params.path.split('/');
  const collection = dataManager.resolvePath(pathSegments);
  const filtered = _.isEmpty(req.query) 
    ? collection 
    : _.pickBy(collection, doc => _.matches(req.query)(doc));
  
  res.json(filtered);
});
