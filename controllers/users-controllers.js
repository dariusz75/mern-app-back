const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Dariusz Franczak',
    email: 'test@test.com',
    password: 'testers',
  },
];

const getUsers = async (request, response, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Getting Users failed', 500);
    return next(error);
  }
  response.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    return next(error);
  }
  const { name, email, password } = request.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Signing up failed 1', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login', 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      'https://avatars.githubusercontent.com/u/12503580?s=400&u=bf93f8321c93cc6ba143903a7c0ee53cdaefb5f7&v=4',
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed 2', 500);
    return next(error);
  }

  response.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (request, response, next) => {
  const { email, password } = request.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging in failed', 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Incorrect credentials', 401);
    return next(error);
  }

  response.json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
