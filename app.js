const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const { response } = require('express');

const app = express();

app.use(bodyParser.json());

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE'
  );

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((request, response, next) => {
  const error = new HttpError('Could not find this route.', 404);
  next(error);
});

app.use((error, request, response, next) => {
  if (response.headerSent) {
    next(error);
  } else {
    response.status(error.code || 500);
    response.json({ message: error.message || 'An unknown error occurred' });
  }
});

const connectUrl =
  'mongodb+srv://Dariusz-Max:kalmar77@cluster0.zguae.mongodb.net/places?retryWrites=true&w=majority';

const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

mongoose
  .connect(connectUrl, connectConfig)
  .then(() => {
    console.log('Database connected.');
    app.listen(5000);
  })
  .catch((error) => {
    console.error('Error connecting to db:', error);
  });
