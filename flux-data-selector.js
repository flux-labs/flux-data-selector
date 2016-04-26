var FluxDataSelector = (function() {

var sdk;

var DataSelector = function DataSelector(clientId, redirectUri, config) {
    this.exampleDataTable = {};
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    if (config) {
        this.exampleDataTable = config.exampleData
        this.setOnInitial = config.setOnInitial;
        this.setOnLogin = config.setOnLogin;
        this.setOnExamples = config.setOnExamples;
        this.setOnProjects = config.setOnProjects;
        this.setOnKeys = config.setOnKeys;
        this.setOnValue = config.setOnValue;
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
            if (this.setOnInitial) { this.setOnInitial(); }
        }
    } else {
        if (this.setOnLogin) { this.setOnLogin(); }
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
    localStorage.removeItem('fluxCredentials');
    localStorage.removeItem('state');
    localStorage.removeItem('nonce');
    this.setOnInitial();
}

function setExampleData(label, data) {
    this.exampleDataTable[label] = data;
}

function setOnInitial(callback) {
    this.setOnInitial = callback;
}

function setOnLogin(callback) {
    this.setOnLogin = callback;
}

function setOnExamples(callback) {
    this.setOnExamples = callback;
}

function setOnProjects(callback) {
    this.setOnProjects = callback;
}

function setOnKeys(callback) {
    this.setOnKeys = callback;
}

function setOnValue(callback) {
    this.setOnValue = callback;
}

function showExamples() {
    this.setOnExamples(listExampleData.bind(this)());
}

function showProjects() {
    this.setOnProjects(listFluxProjects.bind(this)());
}

function selectExample(label) {
    // Wrapping in Promise object.
    var promise = new Promise(function(resolve, reject) {
        resolve(getExampleData.bind(this)(label));
    }.bind(this));
    this.setOnValue(promise);
}

function selectProject(projectId) {
    this.selectedProjectId = projectId;
    this.setOnKeys(listFluxDataKeys.bind(this)(projectId));
}

function selectKey(keyId) {
    this.setOnValue(getFluxValue.bind(this)(this.selectedProjectId, keyId));
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
    return new sdk.Project(getFluxCredentials(), projectId)
        .getDataTable()
        .listCells();
}

function getFluxValue(projectId, dataKeyId) {
    return new sdk.Project(getFluxCredentials(), projectId)
        .getDataTable()
        .fetchCell(dataKeyId);
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
