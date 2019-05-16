import _ from 'lodash';
import { ApplicationClient } from '../../../../src/wiotp/sdk/'


let appClient = null;

window.initialize = function() {
  if (appClient != null) {
    console.log("Client is already initialized");
  }
  else {
    let orgId = document.getElementById("orgId").value;
    let apikey = document.getElementById("apikey").value;
    let token = document.getElementById("token").value;
    appClient = new ApplicationClient({org:orgId, id:'sample', 'auth-token': token, 'auth-key': apikey});

    appClient.on("deviceEvent", function (typeId, deviceId, eventId, format, payload) {
      console.log("Device Event from :: " + typeId + " : " + deviceId + " of event " + eventId + " with format " + format + " - payload = " + payload);
    });
  }
}

window.connect = function() {
  if (appClient == null) {
    console.log("Need to init client before you can connect");
    return;
  }
  appClient.connect();
}

window.disconnect = function() {
  if (appClient == null) {
    console.log("Need to init client before you can disconnect");
    return;
  }
  appClient.disconnect();
}

window.subscribeToEvents = function() {
  if (appClient == null) {
    console.log("Need to init client before you can disconnect");
    return;
  }
  appClient.subscribeToDeviceEvents("+", "+", "+", "+", 0);
}

function component() {
    const element = document.createElement('div');
  
    // Lodash, currently included via a script, is required for this line to work
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  
    return element;
  }
  
  document.body.appendChild(component());