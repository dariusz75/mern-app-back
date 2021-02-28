const uuid = require('uuid').v4;

const HttpError = require('../models/http-error');

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Dariusz Franczak',
    email: 'test@test.com',
    password: 'testers',
  },
];

const getUsers = (request, response, next) => {
  response.json({ users: DUMMY_USERS });
};

const signup = (request, response, next) => {
  const { name, email, password } = request.body;

  const isUser = DUMMY_USERS.find((user) => user.email === email);

  if (isUser) {
    const error = new HttpError('User already exists', 422);
    next(error);
  }

  const createdUser = {
    id: uuid(),
    name: name,
    email: email,
    password: password,
  };

  DUMMY_USERS.push(createdUser);

  response.status(201).json({ user: createdUser });
};

const login = (request, response, next) => {
  const { email, password } = request.body;

  const identifiedUser = DUMMY_USERS.find((user) => user.email === email);

  if (identifiedUser && identifiedUser.password === password) {
    response.json({ message: 'Logged in!' });
  } else {
    const error = new HttpError(
      'Could not identify User, please check the credentials',
      401
    );
    next(error);
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
