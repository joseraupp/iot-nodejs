"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _loglevel = _interopRequireDefault(require("loglevel"));

var errors = _interopRequireWildcard(require("./ApiErrors"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
class DscClient {
  constructor(apiClient) {
    this.log = _loglevel.default; // callApi(method, expectedHttpCode, expectJsonContent, paths, body, params) {

    this.apiClient = apiClient;
  }
  /**************************************
   ** Services
   **************************************/
  // {name, description, type, credentials}


  createService(service) {
    return this.apiClient.callApi('POST', 201, true, ['s2s', 'services'], service).catch(err => errors.handleError(err, {
      CUDSS0026E: errors.InvalidServiceCredentials
    }));
  }

  createCloudantService({
    name,
    description,
    username,
    password,
    host = `${username}.cloudant.com`,
    port = 443,
    url = `https://${username}:${password}@${host}`,
    apikey,
    iam_apikey_name,
    iam_apikey_description,
    iam_role_crn,
    iam_serviceid_crn
  }) {
    return this.createService({
      name,
      description,
      type: 'cloudant',
      credentials: {
        username,
        password,
        host,
        port,
        url,
        apikey,
        iam_apikey_name,
        iam_apikey_description,
        iam_role_crn,
        iam_serviceid_crn
      }
    });
  }

  createEventstreamsService({
    name,
    description,
    api_key,
    kafka_admin_url,
    kafka_brokers_sasl,
    user,
    password,
    apikey,
    iam_apikey_name,
    iam_apikey_description,
    iam_role_crn,
    iam_serviceid_crn
  }) {
    return this.createService({
      name,
      description,
      type: 'eventstreams',
      credentials: {
        api_key,
        kafka_admin_url,
        kafka_brokers_sasl,
        user,
        password,
        apikey,
        iam_apikey_name,
        iam_apikey_description,
        iam_role_crn,
        iam_serviceid_crn
      }
    });
  }

  getService(serviceId) {
    return this.apiClient.callApi('GET', 200, true, ['s2s', 'services', serviceId]).catch(err => errors.handleError(err, {
      CUDSS0019E: errors.ServiceNotFound
    }));
  }

  getServices(serviceType) {
    return this.apiClient.callApi('GET', 200, true, ['s2s', 'services'], null, {
      bindingMode: 'manual',
      serviceType
    }).catch(err => errors.handleError(err, {}));
  }

  deleteService(serviceId) {
    return this.apiClient.callApi('DELETE', 204, false, ['s2s', 'services', serviceId]).catch(err => errors.handleError(err, {}));
  }
  /**************************************
   ** Historian Connectors
   **************************************/
  // {name, description, serviceId, timezone, enabled}


  createConnector({
    name,
    type,
    description = undefined,
    serviceId,
    timezone = 'UTC',
    enabled = true
  }) {
    return this.apiClient.callApi('POST', 201, true, ['historianconnectors'], {
      name,
      description,
      type,
      serviceId,
      timezone,
      enabled
    }).catch(err => errors.handleError(err, {}));
  }

  updateConnector({
    id,
    name,
    description,
    serviceId,
    type,
    enabled,
    timezone
  }) {
    return this.apiClient.callApi('PUT', 200, true, ['historianconnectors', id], {
      id,
      name,
      description,
      serviceId,
      type,
      enabled,
      timezone
    }).catch(err => errors.handleError(err, {}));
  }

  getConnectors({
    name,
    serviceType,
    enabled,
    serviceId
  }) {
    return this.apiClient.callApi('GET', 200, true, ['historianconnectors'], null, {
      name: name ? name : undefined,
      type: serviceType ? serviceType : undefined,
      enabled: enabled === undefined ? undefined : enabled,
      serviceId: serviceId ? serviceId : undefined
    }).catch(err => errors.handleError(err, {}));
  }

  deleteConnector(connectorId) {
    return this.apiClient.callApi('DELETE', 204, false, ['historianconnectors', connectorId]).catch(err => errors.handleError(err, {}));
  }
  /**************************************
   ** Destinations
   **************************************/
  // {name, type, configuration}


  createDestination(connectorId, destination) {
    return this.apiClient.callApi('POST', 201, true, ['historianconnectors', connectorId, 'destinations'], destination).catch(err => errors.handleError(err, {
      CUDDSC0103E: errors.DestinationAlreadyExists
    }));
  }

  createCloudantDestination(connectorId, {
    name,
    bucketInterval
  }) {
    return this.createDestination(connectorId, {
      name,
      type: 'cloudant',
      configuration: {
        bucketInterval
      }
    });
  }

  createEventstreamsDestination(connectorId, {
    name,
    partitions = 1
  }) {
    return this.createDestination(connectorId, {
      name,
      type: 'eventstreams',
      configuration: {
        partitions
      }
    });
  }

  getDestinations(connectorId, params = {
    name: undefined
  }) {
    const {
      name
    } = params;
    return this.apiClient.callApi('GET', 200, true, ['historianconnectors', connectorId, 'destinations'], null, {
      name: name ? name : undefined
    }).catch(err => errors.handleError(err, {}));
  }

  deleteDestination(connectorId, destinationName) {
    return this.apiClient.callApi('DELETE', [200, 204], false, ['historianconnectors', connectorId, 'destinations', destinationName]).catch(err => errors.handleError(err, {}));
  }
  /**************************************
   ** Forwarding Rules
   **************************************/
  // {name, destinationName, type:event, selector: {deviceType, eventId}}
  // {name, destinationName, type:state, selector: {logicalInterfaceId}}


  createForwardingRule(connectorId, forwardingrule) {
    return this.apiClient.callApi('POST', 201, true, ['historianconnectors', connectorId, 'forwardingrules'], forwardingrule).catch(err => errors.handleError(err, {}));
  }

  createEventForwardingRule(connectorId, {
    name,
    destinationName,
    deviceType = '*',
    eventId = '*'
  }) {
    return this.createForwardingRule(connectorId, {
      name,
      destinationName,
      type: 'event',
      selector: {
        deviceType,
        eventId
      }
    });
  }

  getForwardingRules(connectorId) {
    // TODO: QS params
    return this.apiClient.callApi('GET', 200, true, ['historianconnectors', connectorId, 'forwardingrules']).catch(err => errors.handleError(err, {}));
  }

  deleteForwardingRule(connectorId, forwardingRuleId) {
    return this.apiClient.callApi('DELETE', 204, false, ['historianconnectors', connectorId, 'forwardingrules', forwardingRuleId]).catch(err => errors.handleError(err, {}));
  }

}

exports.default = DscClient;