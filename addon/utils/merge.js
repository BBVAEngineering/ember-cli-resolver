import Ember from 'ember';
import entries from './entries';

function isEmberObject(obj) {
	return Ember.Object.detectInstance(obj);
}

function get(obj, key) {
	const descriptor = Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(obj, key);

	if (isEmberObject(obj)) {
		return obj.get(key);
	} else if (descriptor && descriptor.get) {
		return Ember.get(obj, key);
	}

	return obj[key];
}

function set(obj, key, val) {
	const descriptor = Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(obj, key);

	if (isEmberObject(obj)) {
		return obj.set(key, val);
	}

	if (descriptor && descriptor.set) {
		return Ember.set(obj, key, val);
	}

	obj[key] = val;
}

function getComputedPropertyMeta(obj, key) {
	const proto = obj.constructor.proto();
	const possibleDesc = proto[key];

	return (possibleDesc !== null && typeof possibleDesc === 'object' && possibleDesc.isDescriptor) ?
		possibleDesc :
		undefined;
}

function meta(obj, key) {
	if (isEmberObject(obj)) {
		return getComputedPropertyMeta(obj, key);
	}

	return null;
}

function isRecursive(object, key) {
	const value1 = get(object, key);
	const value2 = get(value1, key);

	return value1 === value2;
}

function isPrivate(key) {
	return Boolean(key.match(/^__.*/));
}

function deepMerge(object1, object2) {
	if (object2 && typeof object2 === 'object') {
		for (const [key, value2] of entries(object2)) {
			const value1 = get(object1, key);
			const meta1 = meta(object1, key);

			// If value1 is same as value2, ignore step.
			if (!Ember.isNone(value1) && value1 === value2) {
				continue;
			}

			// If key is a private key.
			if (isPrivate(key)) {
				continue;
			}

			// Do a deep merge when objects are not recursive.
			if (value1 && typeof value1 === 'object' && typeof value2 === 'object' && !isRecursive(object1, key) && !isRecursive(object2, key)) {
				set(object1, key, deepMerge(value1, value2));
				// When meta does not exists or readOnly is false run setter.
			} else if (!meta1 || !meta1._readOnly) {
				set(object1, key, value2);
			}
		}
	}

	return object1;
}

/**
 * Util to deep merge several objects into one.
 *
 * ```javascript
 * merge(object1, object2, ..., objectN);
 * ```
 *
 * To create a new object in the merge, unshift an empty hash in the arguments.
 *
 * ```javascript
 * merge({}, object1, object2, ..., objectN);
 * ```
 *
 * @method merge
 * @param  {...Object} objects
 * @return Object
 */
export default function merge(...objects) {
	const main = objects.shift();

	objects.forEach((object) => {
		deepMerge(main, object);
	});

	return main;
}
