# ember-cli-resolver [![Build Status](https://travis-ci.org/BBVAEngineering/ember-cli-resolver.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-cli-resolver) [![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-resolver.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-resolver) [![Dependency Status](https://david-dm.org/BBVAEngineering/ember-cli-resolver.svg)](https://david-dm.org/BBVAEngineering/ember-cli-resolver)

This resolver allows to use any amd module namespace defined in the configuration file.

## Information

[![NPM](https://nodei.co/npm/ember-cli-resolver.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-cli-resolver/)

<table>
<tr>
<td>Package</td><td>ember-cli-resolver</td>
</tr>
<tr>
<td>Description</td>
<td>Ember-cli awesome resolver</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

## Installation

* `ember install ember-cli-resolver`


## Usage

* Define an array with the namespaces to use in `config/environment.js`
* Import the resolver in `app/app.js` and create an instance passing the namespaces and the modules configuration
* Use the resolver when creating the ember application

### Example

```javascript
// app/app.js
import AwesomeResolverMixin from 'app/mixins/awesome-resolver';
import config from './config/environment';


const resolver = Ember.Resolver.extend(AwesomeResolverMixin, {
    moduleBasedResolver: true,
    namespaces: config.addons,
    pluralizedTypes: {
        config: 'config'
    }
});

const App = Ember.Application.extend({
    Resolver,
    rootElement: '#app',
    modulePrefix: config.modulePrefix,
    ready() {
        // Set app to ready.
        this.set('isReady', true);
    }
});

export default App;
```

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
