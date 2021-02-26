const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building 111',
    description: 'One of the most famous sky scrappers in the world',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St, New York, NY 10001, United States',
    creator: 'u1',
  },
];

const getPlaceById = (request, response, next) => {
  const placeId = request.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    const error = new HttpError('Could not find a place with provided id', 404);
    next(error);
  } else {
    response.json({ place: place });
  }
};

const getPlaceByUserId = (request, response, next) => {
  const userId = request.params.uid;
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });
  if (!place) {
    const error = new HttpError(
      'Could not find a place with provided User id',
      404
    );
    next(error);
  } else {
    response.json({ place: place });
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
