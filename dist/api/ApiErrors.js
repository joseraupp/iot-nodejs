"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.handleError = exports.ServiceNotFound = exports.DestinationAlreadyExists = exports.InvalidServiceCredentials = exports.WiotpError = void 0;

class WiotpError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = this.constructor.name;
  }

}

exports.WiotpError = WiotpError;

class InvalidServiceCredentials extends WiotpError {}

exports.InvalidServiceCredentials = InvalidServiceCredentials;

class DestinationAlreadyExists extends WiotpError {}

exports.DestinationAlreadyExists = DestinationAlreadyExists;

class ServiceNotFound extends WiotpError {}

exports.ServiceNotFound = ServiceNotFound;

const handleError = (err, errorMappings) => {
  if (err && err.response && err.response.data && err.response.data.exception && err.response.data.exception.id) {
    if (errorMappings && errorMappings[err.response.data.exception.id]) {
      throw new errorMappings[err.response.data.exception.id](err.response.data.message, err);
    } else {
      throw new WiotpError(err.response.data.message, err);
    }
  } else {
    throw err;
  }
};

exports.handleError = handleError;
var _default = {
  WiotpError,
  InvalidServiceCredentials,
  DestinationAlreadyExists,
  ServiceNotFound
};
exports.default = _default;