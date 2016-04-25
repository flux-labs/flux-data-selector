var FluxDataSelector = (function() {

var sdk;

var DataSelector = function DataSelector(clientId, redirectUri) {
    this.exampleDataTable = {};
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.onReady = function(res) { console.log(res); };
    this.onNotification = function(res) { console.log(res); };

}

DataSelector.prototype = {
        setOnReady: setOnReady,
        setOnNotification: setOnNotification,
        init: init,
        getSDK: getSDK,
        isAuthed: isAuthed,
        login: login,
        logout: logout,
        setExampleData: setExampleData,
        listExampleData: listExampleData,
        getExampleData: getExampleData,
        selectExampleData: selectExampleData,
        listFluxProjects: listFluxProjects,
        listFluxDataKeys: listFluxDataKeys,
        getFluxValue: getFluxValue,
        selectFluxData: selectFluxData,
        getData: getData
}

function setOnReady(callback) {
    this.onReady = callback;
}

function setOnNotification(callback) {
    this.onNotification = callback;
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
        }
    } else {
        if (this.onReady) { this.onReady(); }
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

function isAuthed() {
    return (getFluxCredentials() ? true : false);
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
    localStorage.removeItem('fluxCredentials');
    localStorage.removeItem('state');
    localStorage.removeItem('nonce');
    this.selectedFluxDataProjectId = null;
    this.selectedFluxDataDataKeyId = null;
}

function setExampleData(label, data) {
    this.exampleDataTable[label] = data;
}

function listExampleData() {
    return this.exampleDataTable;
}

function getExampleData(label) {
    return this.exampleDataTable[label];
}

function selectExampleData(label) {
    this.selectedExampleDataLabel = label;
}

function listFluxProjects() {
    return new sdk.User(getFluxCredentials())
        .listProjects();
}

function listFluxDataKeys(projectId) {
    return new sdk.Project(getFluxCredentials(), projectId)
        .getDataTable()
        .listCells();
}

function getFluxValue(projectId, dataKeyId) {
    return new sdk.Project(getFluxCredentials(), projectId)
        .getDataTable()
        .fetchCell(dataKeyId);
}

function selectFluxData(projectId, dataKeyId) {
    this.selectedFluxDataProjectId = projectId;
    this.selectedFluxDataDataKeyId = dataKeyId;
}

function getData(callback) {
    if (isAuthed()) {
        return getFluxValue(this.selectedFluxDataProjectId, this.selectedFluxDataDataKeyId).then(callback);
    } else {
        return callback(getExampleData.bind(this)(this.selectedExampleDataLabel));
    }
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
