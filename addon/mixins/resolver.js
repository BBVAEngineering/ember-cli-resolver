/* eslint-disable max-statements, complexity, ember/no-new-mixins */
import Mixin from '@ember/object/mixin';
import { debug } from '@ember/debug';
import { set } from '@ember/object';
import { A } from '@ember/array';
import { classify, dasherize, decamelize } from '@ember/string';

const globalTypes = ['engine', 'route-map'];

function normalize(name) {
	// Replace all '_' and '.' for '/'.
	name = name.replace(/([^./_]+)[._]/g, '$1/');

	// Decamelize and replace all new '_' for '-'.
	return decamelize(name).replace(/([^/_]+)_/g, '$1-');
}

function moduleExists(moduleName) {
	return (requirejs && requirejs.entries && requirejs.entries[moduleName]);
}

function loadModule(moduleName) {
	let module;

	if (moduleExists(moduleName) && (module = require(moduleName, null, null, true))) {
		module = module.default;

		// Add module name information when is a class.
		if (module.isClass) {
			module.reopenClass({
				_moduleName: moduleName
			});
		}
	}

	return module;
}

function formatModule(entry) {
	const mainRegex = /^[^/]+\/[^/]+$/;

	if (mainRegex.test(entry)) {
		return formatByMain(entry);
	}

	const podRegex = /^[^/]+\/pods\/[^/]+.\/[^/]+/;

	if (podRegex.test(entry)) {
		return formatByPod(entry);
	}

	const typeRegex = /^(?:[^/]+\/){2}.*$/;

	if (typeRegex.test(entry)) {
		return formatByType(entry);
	}

	return entry;
}

function formatByMain(entry) {
	let [, namespace, type] = /^([^\/]+)\/([^\/]+)$/.exec(entry); //eslint-disable-line

	return {
		namespace,
		type,
		name: 'main'
	};
}

function formatByType(entry) {
	let [, namespace, type, name] = /^([^\/]+)\/([^\/]+)\/(.*)$/.exec(entry); //eslint-disable-line

	// Remove plural from type.
	type = type.substr(0, type.length - 1);

	return {
		namespace,
		type,
		name
	};
}

function formatByPod(entry) {
	let [, namespace, name, type] = /^([^\/]+)\/pods\/(.+)\/(.+)$/.exec(entry); //eslint-disable-line

	return {
		namespace,
		type,
		name
	};
}

function parseName(fullName) {
	// Fix for Ember CLI resolver integration.
	if (fullName.parsedName === true) {
		return fullName;
	}

	let prefix, type, name;
	let fullNameParts = fullName.split('@');

	// HTMLBars uses helper:@content-helper which collides
	// with ember-cli namespace detection.
	// This will be removed in a future release of HTMLBars.
	if (fullName !== 'helper:@content-helper' &&
		fullNameParts.length === 2) {
		const prefixParts = fullNameParts[0].split(':');

		if (prefixParts.length === 2) {
			prefix = prefixParts[1];
			type = prefixParts[0];
			name = fullNameParts[1];
		} else {
			const nameParts = fullNameParts[1].split(':');

			prefix = fullNameParts[0];
			type = nameParts[0];
			name = nameParts[1];
		}
	} else {
		fullNameParts = fullName.split(':');
		type = fullNameParts[0];
		name = fullNameParts[1];
	}

	const fullNameWithoutType = name;
	const root = this.get('namespace');
	let resolveMethodName, moduleName;

	if (!prefix) {
		if (globalTypes.includes(type)) {
			// Special case for route-map engines.
			if (type === 'route-map') {
				type = 'routes';
			}

			prefix = name;
			moduleName = this.findModule(name, type, 'main');
		} else {
			const namespaces = this.get('namespace.namespaces') || this.get('namespaces');

			namespaces.some((namespace) => {
				const entry = this.findModule(namespace, type, name);

				if (entry) {
					prefix = namespace;
					moduleName = entry;
				}

				return Boolean(entry);
			});
		}
	} else {
		moduleName = this.findModule(prefix, type, name);
	}

	if (name === 'main') {
		resolveMethodName = 'resolveMain';
	} else {
		resolveMethodName = `resolve${classify(type)}`;
	}

	if (!this.get(resolveMethodName)) {
		resolveMethodName = 'resolveOther';
	}

	return {
		parsedName: true,
		fullName,
		prefix,
		type,
		fullNameWithoutType,
		name,
		root,
		moduleName,
		resolveMethodName
	};
}

function reopenModule(module) {
	const regexp = /^([^/]+)\/reopens\//;
	const namespaces = this.get('namespace.namespaces') || this.get('namespaces');
	const moduleName = module._moduleName;

	Object.keys(requirejs.entries).forEach((entry) => {
		const matches = regexp.exec(entry);

		if (matches && namespaces.includes(matches[1])) {
			const reopen = this._loadModule(entry);

			if (reopen && moduleName === reopen.for) {
				if (reopen.reopen) {
					debug(`found reopen '${entry}' for '${moduleName}'`);
					module.reopen(...reopen.reopen);
				}

				if (reopen.reopenClass) {
					debug(`found class reopen '${entry}' for '${moduleName}'`);
					module.reopenClass(...reopen.reopenClass);
				}
			}
		}
	});
}

function resolveModule(parsedName) {
	const module = this._loadModule(parsedName.moduleName);

	if (module && module.isClass) {
		this._reopenModule(module);
	}

	return module || this._super(parsedName);
}

function makeToString(namespace, type, name) {
	return `${namespace}@${type}:${name}`;
}

/**
 * Implements a new lookup method for resolving Ember dependencies
 * using internal AMD definition.
 *
 * The lookup heuristic is based on namespace and name of the module. The
 * namespace is the type of the module in plural form.
 *
 * Conversion:
 *
 * - Class name: route:application
 * - Module name: dummy/routes/application
 *
 * More namespaces can be added using namespaces property of application.
 *
 * ```javascript
 * App.set('namespaces', ['app', 'dummy']);
 * ```
 *
 * @class ResolverMixin
 * @extends Ember.Mixin
 * @public
 */
export default Mixin.create({

	/**
	 * List of resolver namespaces.
	 *
	 * @property namespaces
	 * @type Array
	 */
	namespaces: null,

	/**
	 * Define module based resolver.
	 *
	 * @property moduleBasedResolver
	 * @type Boolean
	 */
	moduleBasedResolver: true,

	/**
	 * Init resolver.
	 *
	 * @method init
	 */
	init() {
		this._super(...arguments);

		// Fallback code

		if (!this.get('pluralizedTypes')) {
			this.set('pluralizedTypes', {
				config: 'config'
			});
		}

		if (!this.get('namespaces')) {
			this.set('namespaces', A());
		}

		this._normalizeCache = {};
		this._typeCache = {};
		this._stringCache = {};
	},

	/**
	 * Lookup for a module in registry based on name and type.
	 *
	 * @method resolveMain
	 * @param  {String}     parsedName
	 * @return Object
	 */
	resolveMain: resolveModule,

	/**
	 * Lookup for a module in registry based on name and type.
	 *
	 * @method resolveModel
	 * @param  {String}     parsedName
	 * @return Object
	 */
	resolveModel: resolveModule,

	/**
	 * Lookup for a module in registry based on name and type.
	 *
	 * @method resolveTemplate
	 * @param  {String}     parsedName
	 * @return Object
	 */
	resolveTemplate: resolveModule,

	/**
	 * Lookup for an engine in registry based on name and type.
	 *
	 * @method resolveEngine
	 * @param  {String}     parsedName
	 * @return Object
	 */
	resolveEngine: resolveModule,

	/**
	 * Lookup for a module in registry based on name and type.
	 *
	 * @method resolveOther
	 * @param  {String}     parsedName
	 * @return Object
	 */
	resolveOther: resolveModule,

	/**
	 * Lookup description for a given parsed name.
	 *
	 * @method lookupDescription
	 * @param  {String}          fullName
	 * @return String
	 */
	lookupDescription(fullName) {
		const parsedName = this.parseName(fullName);

		return parsedName.moduleName || makeToString(parsedName.root, parsedName.type, parsedName.name);
	},

	/**
	 * Lookup all modules known for a type.
	 *
	 * @method knownForType
	 * @param  {String}     type
	 * @return Object
	 */
	knownForType(type) {
		const namespaces = this.get('namespace.namespaces') || this.get('namespaces');
		const items = {};

		if (this._typeCache[type]) {
			return this._typeCache[type];
		}

		if (globalTypes.includes(type)) {
			const regexp = /^[^/]+\/(engine|routes)$/;
			let moduleType = type;

			if (type === 'route-map') {
				moduleType = 'routes';
			}

			Object.keys(requirejs.entries).forEach((entry) => {
				if (regexp.test(entry)) {
					const formatedModule = formatModule(entry);

					if (formatedModule.type === moduleType) {
						items[`${type}:${formatedModule.namespace}`] = true;
					}
				}
			});
		} else {
			const regexp = /^([^/]+)\//;

			Object.keys(requirejs.entries).forEach((entry) => {
				const matches = regexp.exec(entry);

				if (matches && namespaces.includes(matches[1])) {
					if (type === 'component') {
						entry = entry.replace(/pods\/components\//, 'pods/');
					}

					const formatedModule = formatModule(entry);

					if (formatedModule.type === type) {
						items[`${type}:${formatedModule.name}`] = true;
					}
				}
			});
		}

		Object.assign(items, this._super(type));

		this._typeCache[type] = items;

		return items;
	},

	/**
	 * Parse name from fullName.
	 *
	 * @method parseName
	 * @param  {String|Object}  fullName
	 * @return Object
	 */
	parseName,

	/**
	 * Make factory to string.
	 *
	 * @method makeToString
	 * @param  {String}     factory
	 * @param  {String}     fullName
	 * @return Object
	 */
	makeToString(factory, fullName) {
		if (this._stringCache[fullName]) {
			return this._stringCache[fullName];
		}

		let stringName = this._super(factory, fullName);

		if (factory._moduleName) {
			const formatedModule = formatModule(factory._moduleName);

			// Special case for route-map engines.
			if (formatedModule.type === 'routes') {
				formatedModule.type = 'route-map';
			}

			stringName = makeToString(formatedModule.namespace, formatedModule.type, formatedModule.name);
		}

		this._stringCache[fullName] = stringName;

		return stringName;
	},

	/**
	 * Return pluralized types.
	 *
	 * @method pluralize
	 * @param  {String}  type
	 * @return String
	 */
	pluralize(type) {
		return this.get(`pluralizedTypes.${type}`) || set(this, `pluralizedTypes.${type}`, `${type}s`);
	},

	/**
	 * Return normalized names.
	 *
	 * @method pluralize
	 * @param  {String}  type
	 * @return String
	 */
	normalize(fullName) {
		return this._normalizeCache[fullName] || (this._normalizeCache[fullName] = this._normalize(fullName));
	},

	/**
	 * Find module by any resolver type.
	 *
	 * @method findModule
	 * @param  {String}   namespace
	 * @param  {String}   type
	 * @param  {String}   name
	 * @return String
	 */
	findModule(namespace, type, name) {
		const resolvers = A([this.findModuleByMain, this.findModuleByType, this.findModuleByPod]);

		let foundEntry = null;

		const moduleEntry = resolvers.any((resolver) => {
			const entry = resolver.call(this, namespace, type, name);
			const existEntry = moduleExists(entry) && entry;

			if (existEntry) {
				foundEntry = existEntry;
			}

			return existEntry;
		});

		return moduleEntry && foundEntry;
	},

	/**
	 * Find module by main.
	 *
	 * @method moduleByMain
	 * @param  {String}     namespace
	 * @param  {String}     type
	 * @param  {String}     name
	 * @return String
	 */
	findModuleByMain(namespace, type, name) {
		type = dasherize(type);

		if (name === 'main') {
			return `${namespace}/${type}`;
		}

		return null;
	},

	/**
	 * Find module by type.
	 *
	 * @method moduleByType
	 * @param  {String}     namespace
	 * @param  {String}     type
	 * @param  {String}     name
	 * @return String
	 */
	findModuleByType(namespace, type, name) {
		name = normalize(name);
		type = this.pluralize(dasherize(type));

		return `${namespace}/${type}/${name}`;
	},

	/**
	 * Find module by pod.
	 *
	 * @method moduleByPod
	 * @param  {String}     namespace
	 * @param  {String}     type
	 * @param  {String}     name
	 * @return String
	 */
	findModuleByPod(namespace, type, name) {
		name = normalize(name);
		type = dasherize(type);

		if (type === 'component') {
			name = `components/${name}`;
		}

		return `${namespace}/pods/${name}/${type}`;
	},

	/**
	 * Normalize fullName to clean it up.
	 *
	 * @method _normalize
	 * @param  {String}  fullName
	 * @return String
	 * @private
	 */
	_normalize(fullName) {
		const split = fullName.split(':');

		return `${split[0]}:${normalize(split[1])}`;
	},

	/**
	 * Load module from given module name.
	 *
	 * @method _loadModule
	 * @param {Object} moduleName
	 * @return Object
	 */
	_loadModule: loadModule,

	/**
	 * Reopen module.
	 *
	 * @method _reopenModule
	 * @param {Object} module
	 */
	_reopenModule: reopenModule

});
