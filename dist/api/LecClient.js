"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _loglevel = _interopRequireDefault(require("loglevel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class LecClient {
  constructor(apiClient) {
    this.log = _loglevel.default;
    this.apiClient = apiClient; // Create an alias to the apiClient's callApi

    this.callApi = this.apiClient.callApi.bind(this.apiClient);
  }

  getLastEvents(type, id) {
    this.log.debug("[ApiClient] getLastEvents() - event cache");
    return this.callApi('GET', 200, true, ["device", "types", type, "devices", id, "events"], null);
  }

  getLastEventsByEventType(type, id, eventType) {
    this.log.debug("[ApiClient] getLastEventsByEventType() - event cache");
    return this.callApi('GET', 200, true, ["device", "types", type, "devices", id, "events", eventType], null);
  }

}

exports.default = LecClient;
;