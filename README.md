NOTE: This module is still under active development. Good for poking under the hood, but not stable for use in any apps, yet.

# flux-data-selector

The Flux Data Selector is a drop-in module for easy communication with Flux via the Flux SDK. It also allows you to register example data. So, you just build your app to respond to callbacks that will execute whenever new data is ready for you. That data can be example data, and once you or your users are logged into Flux, then it can be data coming from your/their projects.

More documentation is coming soon!

## Getting Started

Add the following Javascript files into the header of your webpage.
```html
<script type="text/javascript" src="flux-sdk.js"></script>
<script type="text/javascript" src="flux-data-selector.js"></script>
```

Create a FluxDataSelector.
```javascript
var ds = new FluxDataSelector('<CLIENT ID>', '<REDIRECT URI>');
```

## Methods
### Configuration

####init()
Called after all configuration options has been set. eg. setOnLogin, setExampleData

####setExampleData(label, string)
Creates a new row of example data.

####setOnInitial(callback)
Execute the callback function whenever the initial state of the data-selector is loaded. (Not logged in to Flux)

####setOnLogin(callback)
Execute the callback function whenever the data-selector is loaded after Flux is authenticated. (Logged in to Flux)

####setOnExamples(callback)
Execute the callback function whenever examples are required to be loaded. The callback function receives an object containing the example data.

####setOnProjects(callback)
Execute the callback function whenever projects are required to be loaded. The callback function receives an object containing the Flux SDK response for a list of projects.

####setOnKeys(callback)
Execute the callback function whenever keys are required to be loaded. The callback function receives an object containing the Flux SDK response for a list of data keys.

####setOnValue(callback)
Execute the callback function whenever a data key value has updated. The callback function receives an object containing the Flux SDK response for a fetched value from a data key.

### User Actions

####login()
Authenticates to Flux. Does nothing if already logged in to Flux.

####logout()
Revert back to the initial state of the data-selector. Calls the callback function provided in ```setOnInitial```.

####showExamples()
Calls the callback function provided in ```setOnExamples```.

####showProjects()
Calls the callback function provided in ```setOnProjects```.

###selectExample(label)
Calls the callback function provided in ```setOnValue``` with the corresponding example data as the selected value.

###selectProject(projectId)
Calls the callback function provided in ```setOnKeys``` showing data keys that belong to the selected Flux project.

###selectKey(keyId)
Calls the callback function provided in ```setOnValue``` with the corresponding Flux data key value as the selected value.

### Helpers

####getSDK()
Returns the Flux SDK instance that flux-data-selector is using. Use this if you want to use the SDK aside from what functionalities the data-selector is provided.

## Demo

See ```flux-data-selector-ui.js```
