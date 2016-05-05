var FluxDataSelector = (function() {

var sdk;
var dataTables = {};

var DataSelector = function DataSelector(clientId, redirectUri, config) {
    this.exampleDataTable = {};
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.websocketCallbackHandlers = {};
    if (config) {
        this.exampleDataTable = config.exampleData
        this.setOnInitialCallback = config.setOnInitial;
        this.setOnLoginCallback = config.setOnLogin;
        this.setOnExamplesCallback = config.setOnExamples;
        this.setOnProjectsCallback = config.setOnProjects;
        this.setOnKeysCallback = config.setOnKeys;
        this.setOnValueCallback = config.setOnValue;
    }
}

DataSelector.prototype = {
    // Initialization
    init: init,

    // Configuration functions.
    setExampleData: setExampleData,
    setOnInitial: setOnInitial,
    setOnLogin: setOnLogin,
    setOnExamples: setOnExamples,
    setOnProjects: setOnProjects,
    setOnKeys: setOnKeys,
    setOnValue: setOnValue,

    // User actions.
    login: login,
    logout: logout,
    showExamples: showExamples,
    showProjects: showProjects,
    selectExample: selectExample,
    selectProject: selectProject,
    selectKey: selectKey,

    // Helper functions.
    getSDK: getSDK,
}

function init() {
    getSDK(this.clientId, this.redirectUri);
    var credentials = getFluxCredentials();
    if (!credentials) {
        if (window.location.hash.match(/access_token/)) {
            sdk.exchangeCredentials(getState(), getNonce())
            .then(function(credentials) {
                setFluxCredentials(credentials);
            })
            .then(function() {
                console.log('Flux Login Succeeded. Redirecting again to ' + this.redirectUri + ' ...');
                window.location.replace(this.redirectUri);
            }.bind(this));
        } else {
            if (this.setOnInitialCallback) { this.setOnInitialCallback(); }
        }
    } else {
        if (this.setOnLoginCallback) { this.setOnLoginCallback(); }
    }
}

function getSDK(clientId, redirectUri) {
    if (!sdk) {
        sdk = new FluxSdk(clientId, {
          fluxUrl: 'https://flux.io',
          redirectUri: redirectUri
        });
    }

    return sdk;
}

function login() {
    var credentials = getFluxCredentials();
    if (!credentials) {
        if (!window.location.hash.match(/access_token/)) {
            window.location.replace(sdk.getAuthorizeUrl(getState(), getNonce()));
        }
    } else {
        console.log('You have already logged in to Flux.');
    }
}

function logout() {
    closeWebsocketConnections();
    localStorage.removeItem('fluxCredentials');
    localStorage.removeItem('state');
    localStorage.removeItem('nonce');
    this.setOnInitialCallback();
}

function setExampleData(label, data) {
    this.exampleDataTable[label] = data;
}

function setOnInitial(callback) {
    this.setOnInitialCallback = callback;
}

function setOnLogin(callback) {
    this.setOnLoginCallback = callback;
}

function setOnExamples(callback) {
    this.setOnExamplesCallback = callback;
}

function setOnProjects(callback) {
    this.setOnProjectsCallback = callback;
}

function setOnKeys(callback) {
    this.setOnKeysCallback = callback;
}

function setOnValue(callback) {
    this.setOnValueCallback = callback;
}

function showExamples() {
    this.setOnExamplesCallback(listExampleData.bind(this)());
}

function showProjects() {
    this.setOnProjectsCallback(listFluxProjects.bind(this)());
}

function selectExample(label) {
    // Wrapping in Promise object.
    var promise = new Promise(function(resolve, reject) {
        resolve(getExampleData.bind(this)(label));
    }.bind(this));
    this.setOnValueCallback(promise);
}

function selectProject(projectId) {
    this.selectedProjectId = projectId;
    this.setOnKeysCallback(listFluxDataKeys.bind(this)(projectId));
}

function selectKey(keyId) {
    this.setOnValueCallback(getFluxValue.bind(this)(this.selectedProjectId, keyId));
    setUpNotification(this, this.selectedProjectId, keyId);
}

function isAuthed() {
    return (getFluxCredentials() ? true : false);
}

function listExampleData() {
    return this.exampleDataTable;
}

function getExampleData(label) {
    return this.exampleDataTable[label];
}

function listFluxProjects() {
    return new sdk.User(getFluxCredentials())
        .listProjects();
}

function listFluxDataKeys(projectId) {
    return getDataTable(projectId).listCells();
}

function getFluxValue(projectId, dataKeyId) {
    return getDataTable(projectId).fetchCell(dataKeyId);
}

function getDataTable(projectId) {
    if (!(projectId in dataTables)) {
      dataTables[projectId] = {
          dt: new sdk.Project(getFluxCredentials(), projectId).getDataTable(),
          websocketOpen: false
      }
    }
    return dataTables[projectId].dt;
}

function setUpNotification(dataSelector, projectId, keyId) {
    var dt = getDataTable(projectId);
    var options = {
        onOpen: function() {
            console.log('Websocket opened for '+ projectId + ' ' + keyId + '.');
            return;
        },
        onError: function() {
            console.log('Websocket error for '+ projectId + ' ' + keyId + '.');
            return;
        }
    };

    // Handler that calls the correct handlers for particular key ids, if set.
    function websocketRefHandler(msg) {
        if (msg.body.id in dataSelector.websocketCallbackHandlers) {
            dataSelector.websocketCallbackHandlers[msg.body.id](msg);
        } else {
            console.log('Received a notification, but key id is not matched by any callback handlers.')
        }
    }

    dataSelector.websocketCallbackHandlers[keyId] = function(msg) {
        console.log('Notification received.', msg);
        if (msg.body.id === keyId) {
            console.log('Calling setOnValueCallback on '+ projectId + ' ' + keyId + '.');
            dataSelector.setOnValueCallback(getFluxValue.bind(this)(projectId, keyId));
        }
    }

    if (!dataTables[projectId].websocketOpen) {
        console.log("websocketOpen", dataTables[projectId]);
        dataTables[projectId].websocketOpen = true;
        dt.openWebSocket(options);
        dt.addWebSocketHandler(websocketRefHandler);
    }
}

function closeWebsocketConnections() {
    for (var project in dataTables) {
        dataTables[project].closeWebSocket();
    }
    dataTables = {};
}

function getFluxCredentials() {
    return JSON.parse(localStorage.getItem('fluxCredentials'));
}

function setFluxCredentials(credentials) {
    localStorage.setItem('fluxCredentials', JSON.stringify(credentials));
}

function generateRandomToken() {
    var tokenLength = 24;
    var randomArray = [];
    var characterSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < tokenLength; i++) {
        randomArray.push(Math.floor(Math.random() * tokenLength));
    }
    return btoa(randomArray.join('')).slice(0, 48);
}

function getState() {
    var state = localStorage.getItem('state') || generateRandomToken();
    localStorage.setItem('state', state);
    return state;
}

function getNonce() {
    var nonce = localStorage.getItem('nonce') || generateRandomToken();
    localStorage.setItem('nonce', nonce);
    return nonce;
}

return DataSelector;

}());
