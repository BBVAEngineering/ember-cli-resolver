/* jshint node: true */
'use strict';

module.exports = {
	name: 'ember-cli-resolver',

	included: function(app) {
		this._super.included(app);

		app.import(app.bowerDirectory + '/babel-polyfill/browser-polyfill.js');
	},
};
