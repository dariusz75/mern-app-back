const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (request, response, next) => {
  const placeId = request.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Could not find a place', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a place with provided id', 404);
    return next(error);
  } else {
    response.json({ place: place.toObject({ getters: true }) });
  }
};

const getPlacesByUserId = async (request, response, next) => {
  const userId = request.params.uid;

  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError('Could not find the requested places', 500);
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    const error = new HttpError(
      'Could not find a place with provided User id',
      404
    );
    return next(error);
  } else {
    response.json({
      places: userWithPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  }
};

const createPlace = async (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    next(error);
  }

  const { title, description, coordinates, address, creator } = request.body;

  const createdPlace = new Place({
    title: title,
    description: description,
    address: address,
    location: getCoordForAddress(),
    image:
      'https://lp-cms-production.imgix.net/2019-06/GettyImages-538096543_medium.jpg?auto=format&fit=crop&ixlib=react-8.6.4&h=520&w=1312&q=75&dpr=1',
    creator: creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating Place failed', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find a User with provided id', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating Place failed', 500);
    return next(error);
  }

  response.status(200).json({ place: createdPlace });
};

const updatePlace = async (request, response, next) => {
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

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Updating Place failed', 500);
    return next(error);
  }

  place.title = title;
  place.description = description;
  place.address = address;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('Updating Place failed', 500);
    return next(error);
  }

  response.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (request, response, next) => {
  const placeId = request.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError('Deleting Place failed', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a Place with provided id', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Deleting Place failed', 500);
    return next(error);
  }

  response.status(200).json({ message: 'Place deleted' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
