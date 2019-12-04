"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DeviceConfig = _interopRequireDefault(require("../device/DeviceConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *****************************************************************************
 Copyright (c) 2019 IBM Corporation and other Contributors.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html
 *****************************************************************************
 *
 */
class GatewayConfig extends _DeviceConfig.default {
  constructor(identity, auth, options) {
    super(identity, auth, options);
  }

  getClientId() {
    return "g:" + this.identity.orgId + ":" + this.identity.typeId + ":" + this.identity.deviceId;
  }

}

exports.default = GatewayConfig;
;