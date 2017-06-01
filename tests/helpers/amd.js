import Ember from 'ember';

const { A } = Ember;

export default {

	/**
	 * Array of defined modules.
	 *
	 * @property defines
	 * @type Array
	 */
	defines:  A([]),

	/**
	 * Define a moduleName with exported value.
	 *
	 * @method define
	 * @param  {String} moduleName
	 * @param  {Mixed} value
	 */
	define(moduleName, value) {
		define(moduleName, ['exports'], (exports) => {
			exports['default'] = value;
		});

		this.defines.push(moduleName);
	},

	/**
	 * Require a moduleName.
	 *
	 * @method require
	 * @param  {String} moduleName
	 * @return Mixed
	 */
	require(moduleName) {
		const module = require(moduleName, null, null, true);

		if (this.defines.includes(moduleName)) {
			this._delete(moduleName);
		}

		return module && module.default;
	},

	/**
	 * Unregister defined modules.
	 *
	 * @method reset
	 */
	reset() {
		const defines = this.defines.slice();

		defines.forEach((moduleName) => {
			this._delete(moduleName);
		});
	},

	/**
	 * Deletes module from registry and array.
	 *
	 * @method _delete
	 * @param  {String} moduleName
	 * @private
	 */
	_delete(moduleName) {
		requirejs.unsee(moduleName);
		delete requirejs.entries[moduleName];
		this.defines = this.defines.filter((name) => name !== moduleName);
	}
};
