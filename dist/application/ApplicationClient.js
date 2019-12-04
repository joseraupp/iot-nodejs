"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("../util");

var _BaseClient = _interopRequireDefault(require("../BaseClient"));

var _ApiClient = _interopRequireDefault(require("../api/ApiClient"));

var _RegistryClient = _interopRequireDefault(require("../api/RegistryClient"));

var _MgmtClient = _interopRequireDefault(require("../api/MgmtClient"));

var _LecClient = _interopRequireDefault(require("../api/LecClient"));

var _DscClient = _interopRequireDefault(require("../api/DscClient"));

var _RulesClient = _interopRequireDefault(require("../api/RulesClient"));

var _StateClient = _interopRequireDefault(require("../api/StateClient"));

var _ApplicationConfig = _interopRequireDefault(require("./ApplicationConfig"));

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
const DEVICE_EVT_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/evt\/(.+)\/fmt\/(.+)$/;
const DEVICE_CMD_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/cmd\/(.+)\/fmt\/(.+)$/;
const DEVICE_STATE_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/intf\/(.+)\/evt\/state$/;
const DEVICE_STATE_ERROR_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/err\/data$/;
const RULE_TRIGGER_RE = /^iot-2\/intf\/(.+)\/rule\/(.+)\/evt\/trigger$/;
const RULE_ERROR_RE = /^iot-2\/intf\/(.+)\/rule\/(.+)\/err\/data$/;
const DEVICE_MON_RE = /^iot-2\/type\/(.+)\/id\/(.+)\/mon$/;
const APP_MON_RE = /^iot-2\/app\/(.+)\/mon$/;

class ApplicationClient extends _BaseClient.default {
  constructor(config) {
    if (!config instanceof _ApplicationConfig.default) {
      throw new Error("Config must be an instance of ApplicationConfig");
    }

    super(config);
    this.useLtpa = config.auth && config.auth.useLtpa;

    if (config.auth && config.auth.useLtpa || config.getOrgId() != "quickstart") {
      this._apiClient = new _ApiClient.default(this.config);
      this.dsc = new _DscClient.default(this._apiClient);
      this.lec = new _LecClient.default(this._apiClient);
      this.mgmt = new _MgmtClient.default(this._apiClient);
      this.registry = new _RegistryClient.default(this._apiClient);
      this.rules = new _RulesClient.default(this._apiClient);
      this.state = new _StateClient.default(this._apiClient);
    }

    this.log.debug("[ApplicationClient:constructor] ApplicationClient initialized for organization : " + config.getOrgId());
  }

  connect() {
    super.connect();
    this.mqtt.on('message', (topic, payload) => {
      this.log.trace("[ApplicationClient:onMessage] mqtt: ", topic, payload.toString()); // For each type of registered callback, check the incoming topic against a Regexp.
      // If matches, forward the payload and various fields from the topic (extracted using groups in the regexp)

      var match = DEVICE_EVT_RE.exec(topic);

      if (match) {
        this.emit('deviceEvent', match[1], match[2], match[3], match[4], payload, topic);
        return;
      }

      var match = DEVICE_CMD_RE.exec(topic);

      if (match) {
        this.emit('deviceCommand', match[1], match[2], match[3], match[4], payload, topic);
        return;
      }

      var match = DEVICE_STATE_RE.exec(topic);

      if (match) {
        this.emit('deviceState', match[1], match[2], match[3], payload, topic);
        return;
      }

      var match = DEVICE_STATE_ERROR_RE.exec(topic);

      if (match) {
        this.emit('deviceStateError', match[1], match[2], payload, topic);
        return;
      }

      var match = RULE_TRIGGER_RE.exec(topic);

      if (match) {
        this.emit('ruleTrigger', match[1], match[2], payload, topic);
        return;
      }

      var match = RULE_ERROR_RE.exec(topic);

      if (match) {
        this.emit('ruleError', match[1], match[2], payload, topic);
        return;
      }

      var match = DEVICE_MON_RE.exec(topic);

      if (match) {
        this.emit('deviceStatus', match[1], match[2], payload, topic);
        return;
      }

      var match = APP_MON_RE.exec(topic);

      if (match) {
        this.emit('appStatus', match[1], payload, topic);
        return;
      } // catch all which logs the receipt of an unexpected message


      this.log.warn("[ApplicationClient:onMessage] Message received on unexpected topic" + ", " + topic + ", " + payload);
    });
  } // ==========================================================================
  // Device Events
  // ==========================================================================


  publishEvent(typeId, deviceId, eventId, format, data, qos, callback) {
    qos = qos || 0;

    if (!(0, _util.isDefined)(typeId) || !(0, _util.isDefined)(deviceId) || !(0, _util.isDefined)(eventId) || !(0, _util.isDefined)(format)) {
      this.log.error("[ApplicationClient:publishDeviceEvent] Required params for publishDeviceEvent not present");
      this.emit('error', "[ApplicationClient:publishDeviceEvent] Required params for publishDeviceEvent not present");
      return;
    }

    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/evt/" + eventId + "/fmt/" + format;

    this._publish(topic, data, qos, callback);

    return this;
  }

  subscribeToEvents(typeId, deviceId, eventId, format, qos, callback) {
    typeId = typeId || '+';
    deviceId = deviceId || '+';
    eventId = eventId || '+';
    format = format || '+';
    qos = qos || 0;
    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/evt/" + eventId + "/fmt/" + format;

    this._subscribe(topic, qos, callback);

    return this;
  }

  unsubscribeFromEvents(typeId, deviceId, eventId, format) {
    typeId = typeId || '+';
    deviceId = deviceId || '+';
    eventId = eventId || '+';
    format = format || '+';
    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/evt/" + eventId + "/fmt/" + format;

    this._unsubscribe(topic, callback);

    return this;
  } // ==========================================================================
  // Device Commands
  // ==========================================================================


  publishCommand(typeId, deviceId, commandId, format, data, qos, callback) {
    qos = qos || 0;

    if (!(0, _util.isDefined)(typeId) || !(0, _util.isDefined)(deviceId) || !(0, _util.isDefined)(commandId) || !(0, _util.isDefined)(format)) {
      this.log.error("[ApplicationClient:publishDeviceCommand] Required params for publishDeviceCommand not present");
      this.emit('error', "[ApplicationClient:publishDeviceCommand] Required params for publishDeviceCommand not present");
      return;
    }

    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/cmd/" + commandId + "/fmt/" + format;

    this._publish(topic, data, qos, callback);

    return this;
  }

  subscribeToCommands(typeId, deviceId, commandId, format, qos, callback) {
    typeId = typeId || '+';
    deviceId = deviceId || '+';
    commandId = commandId || '+';
    format = format || '+';
    qos = qos || 0;
    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/cmd/" + commandId + "/fmt/" + format;
    this.log.debug("[ApplicationClient:subscribeToDeviceCommands] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos, callback);

    return this;
  }

  unsubscribeFromCommands(typeId, deviceId, commandId, format, callback) {
    typeId = typeId || '+';
    deviceId = deviceId || '+';
    commandId = commandId || '+';
    format = format || '+';
    var topic = "iot-2/type/" + typeId + "/id/" + deviceId + "/cmd/" + commandId + "/fmt/" + format;

    this._unsubscribe(topic, callback);

    return this;
  } // ==========================================================================
  // Device State Events
  // ==========================================================================


  subscribeToDeviceState(type, id, interfaceId, qos) {
    type = type || '+';
    id = id || '+';
    interfaceId = interfaceId || '+';
    qos = qos || 0;
    var topic = "iot-2/type/" + type + "/id/" + id + "/intf/" + interfaceId + "/evt/state";
    this.log.debug("[ApplicationClient:subscribeToDeviceState] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToDeviceState(type, id, interfaceId) {
    type = type || '+';
    id = id || '+';
    interfaceId = interfaceId || '+';
    var topic = "iot-2/type/" + type + "/id/" + id + "/intf/" + interfaceId + "/evt/state";

    this._unsubscribe(topic);

    return this;
  } // ==========================================================================
  // Device State Errors
  // ==========================================================================


  subscribeToDeviceErrors(type, id, qos) {
    type = type || '+';
    id = id || '+';
    qos = qos || 0;
    var topic = "iot-2/type/" + type + "/id/" + id + "/err/data";
    this.log.debug("[ApplicationClient:subscribeToDeviceErrors] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToDeviceErrors(type, id) {
    type = type || '+';
    id = id || '+';
    var topic = "iot-2/type/" + type + "/id/" + id + "/err/data";

    this._unsubscribe(topic);

    return this;
  } // ==========================================================================
  // Rule Triggers
  // ==========================================================================


  subscribeToRuleTriggers(interfaceId, ruleId, qos) {
    interfaceId = interfaceId || '+';
    ruleId = ruleId || '+';
    qos = qos || 0;
    var topic = "iot-2/intf/" + interfaceId + "/rule/" + ruleId + "/evt/trigger";
    this.log.debug("[ApplicationClient:subscribeToRuleTriggers] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToRuleTriggers(interfaceId, ruleId) {
    interfaceId = interfaceId || '+';
    ruleId = ruleId || '+';
    var topic = "iot-2/intf/" + interfaceId + "/rule/" + ruleId + "/evt/trigger";

    this._unsubscribe(topic);

    return this;
  } // ==========================================================================
  // Rule Trigger Errors
  // ==========================================================================


  subscribeToRuleErrors(interfaceId, ruleId, qos) {
    interfaceId = interfaceId || '+';
    ruleId = ruleId || '+';
    qos = qos || 0;
    var topic = "iot-2/intf/" + interfaceId + "/rule/" + ruleId + "/err/data";
    this.log.debug("[ApplicationClient:subscribeToRuleErrors] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToRuleErrors(interfaceId, ruleId) {
    interfaceId = interfaceId || '+';
    ruleId = ruleId || '+';
    var topic = "iot-2/intf/" + interfaceId + "/rule/" + ruleId + "/err/data";

    this._unsubscribe(topic);

    return this;
  } // ==========================================================================
  // Device Status
  // ==========================================================================


  subscribeToDeviceStatus(type, id, qos) {
    type = type || '+';
    id = id || '+';
    qos = qos || 0;
    var topic = "iot-2/type/" + type + "/id/" + id + "/mon";
    this.log.debug("[ApplicationClient:subscribeToDeviceStatus] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToDeviceStatus(type, id) {
    type = type || '+';
    id = id || '+';
    var topic = "iot-2/type/" + type + "/id/" + id + "/mon";

    this._unsubscribe(topic);

    return this;
  } // ==========================================================================
  // Application Status
  // ==========================================================================


  subscribeToAppStatus(id, qos) {
    id = id || '+';
    qos = qos || 0;
    var topic = "iot-2/app/" + id + "/mon";
    this.log.debug("[ApplicationClient:subscribeToAppStatus] Calling subscribe with QoS " + qos);

    this._subscribe(topic, qos);

    return this;
  }

  unsubscribeToAppStatus(id) {
    id = id || '+';
    var topic = "iot-2/app/" + id + "/mon";

    this._unsubscribe(topic);

    return this;
  }

}

exports.default = ApplicationClient;
;