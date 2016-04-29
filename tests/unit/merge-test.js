import Ember from 'ember';
import { module, test } from 'qunit';
import merge from 'ember-cli-awesome-resolver/utils/merge';
import cases from '../helpers/cases';

const object = {};

const object1 = {
	foo: '1',
	bar: {
		wow: '1',
		bar: '1'
	},
	'foo.bar.wow': '1'
};

const object2 = {
	foo: '2',
	bar: {
		foo: '2',
		bar: '2'
	},
	'foo.bar.wow': '2'
};

//Result
const object12 = {
	foo: '2',
	bar: {
		wow: '1',
		foo: '2',
		bar: '2'
	},
	'foo.bar.wow': '2'
};

module('Util: merge');

cases([
	{ title: 'ok', input: [object, object1], output: object1 },
	{ title: 'ok ', input: [object1, object2], output:  object12 },
	{ title: 'object null', input: [object, null], output: object },
	{ title: 'object undefined', input: [object, undefined], output: object },
	{ title: 'ko null', input: [null,{}], output: null },
	{ title: 'ko undefined', input: [undefined,{}], output: undefined }
]).test('it merges multiple objects', function(params, assert) {
	const ret = merge(params.input[0], params.input[1]);

	assert.equal(params.input[0], ret);
	assert.deepEqual(params.input[0], params.output);
});

test('it merges ember objects but private keys', function(assert) {
	assert.expect(3);

	const o1 = Ember.Object.extend({
		observer: Ember.observer('foo', function() {
			assert.ok(true);
		})
	}).create({
		__private: 'abc',
		foo: 'foo'
	});

	const o2 = Ember.Object.extend({
		foo: Ember.computed(function() {
			return 'bar';
		})
	}).create({
		__private: '123'
	});

	merge(o1, o2);

	assert.equal(o1.get('foo'), 'bar');
	assert.equal(o1.get('__private'), 'abc');
});

test('it does not merge prototype properties', function(assert) {
	const obj = Ember.Object.extend({
		foo: {
			bar: 'bar'
		}
	}).create();

	const ret = {};

	merge(ret, obj);

	assert.notOk(ret.foo);
});

test('it does not merge recursive properties', function(assert) {
	const obj = {};

	obj.context = obj;

	merge(obj, obj);

	assert.equal(obj.context, obj);
});

test('it runs setter of computed properties', function(assert) {
	assert.expect(1);

	const obj1 = Ember.Object.extend({
		foo: Ember.computed({
			// getter
			get(key, value) {
				if(arguments.length === 1) {
					return 'wow';
				}

				assert.ok(true, 'Computed property setter is executed once');

				return value;
			}
		})
	}).create();

	const obj2 = {
		foo: 'bar'
	};

	merge(obj1, obj2);

	assert.equal(obj1.get('foo'), 'bar');
});

test('it does not set readonly computed properties', function(assert) {
	const obj1 = Ember.Object.extend({
		foo: Ember.computed({
			// getter
			get(key, value) {
				if(arguments.length === 1) {
					return 'wow';
				}

				assert.ok(false, 'Computed property setter is never executed');

				return value;
			}
		}).readOnly()
	}).create();

	const obj2 = {
		foo: 'bar'
	};

	merge(obj1, obj2);

	assert.equal(obj1.get('foo'), 'wow');
});

test('it runs setter of defined properties', function(assert) {
	const obj1 = {
		foo: 'foo'
	};
	const obj2 = {
		foo: 'bar'
	};

	Ember.Object.extend({
		fooDidChange: Ember.observer('obj.foo', () => {})
	}).create({
		obj: obj1
	});

	merge(obj1, obj2);

	assert.equal(obj1.foo, 'bar');
});

test('it ignores setting same values', function(assert) {
	const obj = {
		foo: {}
	};

	obj.foo['bar'] = obj;

	const obj1 = { obj };
	const obj2 = { obj };

	merge(obj1, obj2);

	assert.equal(obj1.obj.foo.bar, obj);
});

test('it merges undefined values', function(assert) {
	const obj1 = {};
	const obj2 = { foo: undefined };

	merge(obj1, obj2);

	assert.ok(obj1.hasOwnProperty('foo'));
});
