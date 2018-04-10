import { module, test } from 'qunit';
import amd from '../helpers/amd';

module('Helper: amd');

test('it defines a module exporting a value', (assert) => {
	const value = {};

	assert.notOk(requirejs.entries['foo']);

	amd.define('foo', value);

	assert.ok(requirejs.entries['foo']);

	amd.reset();
});

test('it requires a module with its value and undefines it', (assert) => {
	const value = {};

	amd.define('foo', value);

	assert.equal(amd.require('foo'), value);
	assert.notOk(requirejs.entries['foo']);
});

test('it does not undefine a module registered from outside', (assert) => {
	assert.ok(amd.require('ember-cli-awesome-resolver/mixins/resolver'));
	assert.ok(requirejs.entries['ember-cli-awesome-resolver/mixins/resolver']);
});

test('it reset all registered modules', (assert) => {
	amd.define('foo', {});
	amd.define('bar', {});

	amd.reset();

	assert.notOk(requirejs.entries['foo']);
	assert.notOk(requirejs.entries['bar']);
});
