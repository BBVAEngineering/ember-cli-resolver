import Ember from 'ember';
import { module, test } from 'qunit';
import entries from 'ember-cli-awesome-resolver/utils/entries';

module('Util: entries');

test('it returns a generator function to iterate', function(assert) {
	const object = {
		foo: 'bar',
		bar: 'foo'
	};

	const [prop1, prop2] = entries(object);

	assert.equal(prop1[0], 'foo');
	assert.equal(prop1[1], 'bar');
	assert.equal(prop2[0], 'bar');
	assert.equal(prop2[1], 'foo');
});

test('it returns a generator with computed properties', function(assert) {
	const klass = Ember.Object.extend({
		foo: Ember.computed(function() {
			return 'bar';
		})
	});

	const object = klass.create();

	const [prop1] = entries(object);

	assert.equal(prop1[0], 'foo');
	assert.equal(prop1[1], 'bar');
});

test('it throws error when object is null or empty', function(assert) {
	assert.throws(() => {
		const [a] = entries(null);
		assert.notOk(a);
	});

	assert.throws(() => {
		const [a] = entries();
		assert.notOk(a);
	});
});
