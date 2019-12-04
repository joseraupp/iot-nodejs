"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isDefined = isDefined;
exports.generateUUID = generateUUID;
exports.isNode = exports.isBrowser = void 0;

/**
 *****************************************************************************
 Copyright (c) 2014, 2019 IBM Corporation and other Contributors.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html
 *****************************************************************************
 *
 */
function isString(value) {
  return typeof value === 'string';
}

function isNumber(value) {
  return typeof value === 'number';
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
exports.isBrowser = isBrowser;
const isNode = new Function("try {return this===global;}catch(e){return false;}");
exports.isNode = isNode;

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}