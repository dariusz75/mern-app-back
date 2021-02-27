const uuid = require('uuid').v4;

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

const createPlace = (request, response, next) => {
  const { title, description, coordinates, address, creator } = request.body;
  const createdPlace = {
    id: uuid(),
    title: title,
    description: description,
    location: coordinates,
    address: address,
    creator: creator,
  };

  DUMMY_PLACES.push(createdPlace);

  response.status(200).json({ place: createdPlace });
};

const updatePlace = (request, response, next) => {
  const { title, description, address } = request.body;
  const placeId = request.params.pid;

  const updatedPlace = {
    ...DUMMY_PLACES.find((place) => place.id === placeId),
  };
  const placeIndex = DUMMY_PLACES.findIndex((place) => place.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  updatedPlace.address = address;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  response.status(200).json({ place: updatedPlace });
};

const deletePlace = (request, response, next) => {};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
