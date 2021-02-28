const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordForAddress = require('../util/location');

let DUMMY_PLACES = [
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

const getPlacesByUserId = (request, response, next) => {
  const userId = request.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    const error = new HttpError(
      'Could not find a place with provided User id',
      404
    );
    next(error);
  } else {
    response.json({ places: places });
  }
};

const createPlace = (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    next(error);
  }

  const { title, description, coordinates, address, creator } = request.body;
  const createdPlace = {
    id: uuid(),
    title: title,
    description: description,
    location: getCoordForAddress(),
    address: address,
    creator: creator,
  };

  DUMMY_PLACES.push(createdPlace);

  response.status(200).json({ place: createdPlace });
};

const updatePlace = (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    next(error);
  }

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

const deletePlace = (request, response, next) => {
  const placeId = request.params.pid;
  if (!DUMMY_PLACES.find((place) => place.id === placeId)) {
    const error = new HttpError('No place found with this id', 404);
    next(error);
  } else {
    DUMMY_PLACES = DUMMY_PLACES.filter((place) => place !== placeId);
    response.status(200).json({ message: 'Place deleted' });
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
