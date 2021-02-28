const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

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

app.listen(5000);
