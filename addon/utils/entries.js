import Ember from 'ember';

/**
 * Generator function to iterate over the properties of an object.
 *
 * ```javascript
 * for(const [key, value] of entries(obj)) {
 *     // key, value
 * }
 * ```
 *
 * @method *entries
 * @param  {Object} obj
 * @return  Array
 */
export default function* entries(obj) {
    if (!obj) {
        throw new Error('Cannot iterate over empty or null object');
    }

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            yield [key, obj[key]];
        }
    }

    if (Ember.Object.detectInstance(obj)) {
        const klass = obj.constructor;
        const properties = Ember.get(klass, '_computedProperties');

        for (const { name } of properties) {
            yield [name, obj.get(name)];
        }
    }
}
