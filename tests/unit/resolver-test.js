import Ember from 'ember';
import { module, test } from 'qunit';
import ResolverMixin from 'ember-cli-awesome-resolver/mixins/resolver';
import cases from 'qunit-parameterize';
import amd from '../helpers/amd';
import profile from '../helpers/profile';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

let application, registry;

module('Unit | Mixin | resolver', {
	beforeEach() {
		application = startApp({
			Resolver: Ember.DefaultResolver.extend(ResolverMixin)
		});

		registry = application.__registry__;
	},
	afterEach() {
		amd.reset();

		destroyApp(application);
	}
});

cases([
	// Main based.
	{ title: 'main', input: 'object:main', output: 'dummy/object' },

	// Engine based.
	{ title: 'engine', input: 'engine:foo', output: 'foo/engine' },

	// Route-map based.
	{ title: 'route-map', input: 'route-map:foo', output: 'foo/routes' },

	// Type based.
	{ title: 'type base', input: 'object:foo', output: 'dummy/objects/foo' },
	{ title: 'type base namespace', input: 'template:foo/bar', output: 'dummy/templates/foo/bar' },
	{ title: 'type dot', input: 'object:foo.bar', output: 'dummy/objects/foo/bar' },
	{ title: 'type dot namespace', input: 'template:foo/foo.bar', output: 'dummy/templates/foo/foo/bar' },
	{ title: 'type camel', input: 'object:fooBar', output: 'dummy/objects/foo-bar' },
	{ title: 'type camel namespace', input: 'template:foo/fooBar', output: 'dummy/templates/foo/foo-bar' },
	{ title: 'type dash', input: 'object:foo-bar', output: 'dummy/objects/foo-bar' },
	{ title: 'type dash namespace', input: 'template:foo/foo-bar', output: 'dummy/templates/foo/foo-bar' },
	{ title: 'type lowdash', input: 'object:foo_bar', output: 'dummy/objects/foo/bar' },
	{ title: 'type lowdash namespace', input: 'template:foo/foo_bar', output: 'dummy/templates/foo/foo/bar' },
	{ title: 'type partial', input: 'object:_foo-bar', output: 'dummy/objects/_foo-bar' },
	{ title: 'type partial namespace', input: 'template:foo/_foo-bar', output: 'dummy/templates/foo/_foo-bar' },
	{ title: 'type partial cli', input: 'object:-foo-bar', output: 'dummy/objects/-foo-bar' },
	{ title: 'type partial cli namespace', input: 'template:foo/-foo-bar', output: 'dummy/templates/foo/-foo-bar' },
	{ title: 'type multi', input: 'object:foo.bar.wow', output: 'dummy/objects/foo/bar/wow' },

	// Pod based.
	{ title: 'pod base', input: 'object:foo', output: 'dummy/pods/foo/object' },
	{ title: 'pod base namespace', input: 'template:foo/bar', output: 'dummy/pods/foo/bar/template' },
	{ title: 'pod dot', input: 'object:foo.bar', output: 'dummy/pods/foo/bar/object' },
	{ title: 'pod dot namespace', input: 'template:foo/foo.bar', output: 'dummy/pods/foo/foo/bar/template' },
	{ title: 'pod camel', input: 'object:fooBar', output: 'dummy/pods/foo-bar/object' },
	{ title: 'pod camel namespace', input: 'template:foo/fooBar', output: 'dummy/pods/foo/foo-bar/template' },
	{ title: 'pod dash', input: 'object:foo-bar', output: 'dummy/pods/foo-bar/object' },
	{ title: 'pod dash namespace', input: 'template:foo/foo-bar', output: 'dummy/pods/foo/foo-bar/template' },
	{ title: 'pod lowdash', input: 'object:foo_bar', output: 'dummy/pods/foo/bar/object' },
	{ title: 'pod lowdash namespace', input: 'template:foo/foo_bar', output: 'dummy/pods/foo/foo/bar/template' },
	{ title: 'pod partial', input: 'object:_foo-bar', output: 'dummy/pods/foo-bar/object' },
	{ title: 'pod partial namespace', input: 'template:foo/_foo-bar', output: 'dummy/pods/foo/foo-bar/template' },
	{ title: 'pod partial cli', input: 'object:-foo-bar', output: 'dummy/pods/foo-bar/object' },
	{ title: 'pod partial cli namespace', input: 'template:foo/-foo-bar', output: 'dummy/pods/foo/foo-bar/template' },
	{ title: 'pod multi', input: 'object:foo.bar.wow', output: 'dummy/pods/foo/bar/wow/object' }
]).test('it loads modules from loader.js ', (params, assert) => {
	const object = Ember.Object.extend();

	amd.define(params.output, object);

	assert.equal(registry.resolve(params.input), object);
});

test('it loads components modules from loader.js', (assert) => {
	const object = Ember.Component.extend();

	amd.define('dummy/pods/components/foo/component', object);

	assert.equal(registry.resolve('component:foo'), object);
});

test('it looks up for namespaces in application', (assert) => {
	application.set('namespaces', ['app', 'dummy']);

	const object = Ember.Object.extend();

	amd.define('app/objects/foo', object);

	assert.equal(registry.resolve('object:foo'), object);
});

cases([
	// Main based.
	{ title: 'main', type: 'object', input: 'dummy/object', output: 'object:main' },

	// Engine based.
	{ title: 'engine', type: 'engine', input: 'foo/engine', output: 'engine:foo' },

	// Route-map based.
	{ title: 'route-map', type: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

	// Type based.
	{ title: 'type base', type: 'object', input: 'dummy/objects/bar', output: 'object:bar' },
	{ title: 'type complex', type: 'object', input: 'dummy/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', type: 'object', input: 'dummy/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', type: 'object', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it looks up for a type given ', (params, assert) => {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	assert.ok(registry.knownForType(params.type)[params.output]);
});

test('it looks up for components', (assert) => {
	const object = Ember.Component.extend();

	amd.define('dummy/pods/components/foo/component', object);

	assert.ok(registry.knownForType('component')['component:foo']);
});

test('it looks up only on defined namespaces', (assert) => {
	const object = Ember.Component.extend();

	amd.define('foo/pods/components/foo/component', object);

	assert.notOk(registry.knownForType('component')['component:foo']);
});

test('it does not lookup on other types', (assert) => {
	const object = Ember.Component.extend();

	amd.define('dummy/controllers/foo', object);

	assert.notOk(registry.knownForType('view')['controller:foo']);
});

cases([
	// Main based.
	{ title: 'main', input: 'dummy/object', output: 'object:main' },

	// Engine based.
	{ title: 'engine', input: 'foo/engine', output: 'engine:foo' },

	// Route-map based.
	{ title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

	// Type based.
	{ title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'dummy/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it lookups description of modules ', (params, assert) => {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	assert.equal(registry.describe(params.output), params.input);
});

test('it makes up description to string when module is not found', (assert) => {
	assert.equal(registry.describe('object:main'), `${application.name}@object:main`);
});

cases([
	// Main based.
	{ title: 'main', input: 'dummy/object', output: 'object:main', toString: 'dummy@object:main' },

	// Engine based.
	{ title: 'engine', input: 'foo/engine', output: 'engine:foo', toString: 'foo@engine:main' },

	// Route-map based.
	{ title: 'route-map', input: 'foo/routes', output: 'route-map:foo', toString: 'foo@route-map:main' },

	// Type based.
	{ title: 'type base', input: 'dummy/objects/bar', output: 'object:bar', toString: 'dummy@object:bar' },
	{ title: 'type complex', input: 'dummy/objects/bar/baz', output: 'object:bar/baz', toString: 'dummy@object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar', toString: 'dummy@object:bar' },
	{ title: 'pod complex', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz', toString: 'dummy@object:bar/baz' }
]).test('it makes object to string', (params, assert) => {
	const object = Ember.Object.extend();

	amd.define(params.input, object);

	const factory = registry.resolve(params.output);

	assert.equal(registry.resolver.makeToString(factory, params.output), params.toString);
});

test('it resolves non factory modules', (assert) => {
	const object = {};

	amd.define('dummy/objects/foo', object);

	assert.equal(registry.resolve('object:foo'), object);
});

test('it resolves names with namespace', (assert) => {
	const object = Ember.Object.extend();

	amd.define('dummy/objects/foo', object);

	assert.equal(registry.resolve('dummy@object:foo'), object);
});

test('it resolves names with ember cli namespace', (assert) => {
	const object = Ember.Object.extend();

	amd.define('dummy/objects/foo', object);

	assert.equal(registry.resolve('object:dummy@foo'), object);
});

test('it does not throw an error when there are unknown modules', (assert) => {
	const object = Ember.Object.extend();

	amd.define('dummy/objects/foo', object);

	amd.define('bar', {});

	assert.ok(registry.knownForType('object'));
});

test('it looks up on pluralized dictionary', (assert) => {
	Ember.run(application, 'destroy');

	const object = Ember.Object.extend();

	amd.define('dummy/config/foo', object);

	application = startApp({
		Resolver: Ember.DefaultResolver.extend(ResolverMixin, {
			pluralizedTypes: {
				config: 'config'
			}
		})
	});

	registry = application.__registry__;

	assert.equal(registry.resolve('config:foo'), object);
});

test('it is a module based resolver', (assert) => {
	assert.equal(registry.resolver.get('moduleBasedResolver'), true);
});

cases([
	// Main based.
	{ title: 'main', input: 'dummy/object', output: 'object:main' },

	// Engine based.
	{ title: 'engine', input: 'foo/engine', output: 'engine:foo' },

	// Route-map based.
	{ title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

	// Type based.
	{ title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'dummy/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it resolves under 1 ms ', (params, assert) => {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const res = profile(() => {
		return registry.resolve(params.output);
	});

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});

cases([
	// Main based.
	{ title: 'main', type: 'object', input: 'dummy/object', output: 'object:main' },

	// Engine based.
	{ title: 'engine', type: 'engine', input: 'foo/engine', output: 'engine:foo' },

	// Route-map based.
	{ title: 'route-map', type: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

	// Type based.
	{ title: 'type base', type: 'object', input: 'dummy/objects/bar', output: 'object:bar' },
	{ title: 'type complex', type: 'object', input: 'dummy/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', type: 'object', input: 'dummy/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', type: 'object', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it knows for types under 1 ms ', (params, assert) => {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const res = profile(() => {
		return registry.knownForType(params.type)[params.output];
	});

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});

cases([
	// Main based.
	{ title: 'main', input: 'dummy/object', output: 'object:main' },

	// Engine based.
	{ title: 'engine', input: 'foo/engine', output: 'engine:foo' },

	// Route-map based.
	{ title: 'route-map', input: 'foo/routes', output: 'route-map:foo' },

	// Type based.
	{ title: 'type base', input: 'dummy/objects/bar', output: 'object:bar' },
	{ title: 'type complex', input: 'dummy/objects/bar/baz', output: 'object:bar/baz' },

	// Pod based.
	{ title: 'pod base', input: 'dummy/pods/bar/object', output: 'object:bar' },
	{ title: 'pod complex', input: 'dummy/pods/bar/baz/object', output: 'object:bar/baz' }
]).test('it resolves under 1 ms ', (params, assert) => {
	const object = Ember.Component.extend();

	amd.define(params.input, object);

	const factory = registry.resolve(params.output);

	const res = profile(() =>
		registry.resolver.makeToString(factory, params.output)
	);

	assert.ok(res.mean < 1, 'resolves under 1 ms');
});

test('it reopens module with properties when resolved', (assert) => {
	const moduleName = 'dummy/object';
	const reopenModule = 'dummy/reopens/object';
	const object = Ember.Object.extend();
	const reopen = {
		for: 'dummy/object',
		reopen: [{
			foo: 'bar'
		}, {
			bar: 'foo'
		}]
	};

	amd.define(moduleName, object);
	amd.define(reopenModule, reopen);

	const resolved = registry.resolve('object:main');

	assert.ok(resolved.PrototypeMixin.mixins[1], 'reopen is included');
	assert.equal(resolved.PrototypeMixin.mixins[1].properties, reopen.reopen[0], 'reopen matches with first defined');
	assert.equal(resolved.PrototypeMixin.mixins[2].properties, reopen.reopen[1], 'reopen matches with second defined');
});

test('it reopens module with mixin when resolved', (assert) => {
	const moduleName = 'dummy/object';
	const reopenModule = 'dummy/reopens/object';
	const object = Ember.Object.extend();
	const reopen = {
		for: 'dummy/object',
		reopen: [Ember.Mixin.create({ foo: 'bar' }, { bar: 'foo' })]
	};

	amd.define(moduleName, object);
	amd.define(reopenModule, reopen);

	const resolved = registry.resolve('object:main');

	assert.ok(resolved.PrototypeMixin.mixins[1], 'reopen is included');
	assert.equal(resolved.PrototypeMixin.mixins[1], reopen.reopen[0], 'reopen matches with defined');
});

test('it reopens class with properties when resolved', (assert) => {
	const moduleName = 'dummy/object';
	const reopenModule = 'dummy/reopens/object';
	const object = Ember.Object.extend();
	const reopen = {
		for: 'dummy/object',
		reopenClass: [{
			foo: 'bar'
		}, {
			bar: 'foo'
		}]
	};

	amd.define(moduleName, object);
	amd.define(reopenModule, reopen);

	const resolved = registry.resolve('object:main');

	assert.equal(resolved.foo, 'bar', 'reopen matches with first defined');
	assert.equal(resolved.bar, 'foo', 'reopen matches with second defined');
});

test('it reopens class with properties when resolved', (assert) => {
	const moduleName = 'dummy/object';
	const reopenModule = 'dummy/reopens/object';
	const object = Ember.Object.extend();
	const reopen = {
		for: 'dummy/object',
		reopenClass: [Ember.Mixin.create({ foo: 'bar' }, { bar: 'foo' })]
	};

	amd.define(moduleName, object);
	amd.define(reopenModule, reopen);

	const resolved = registry.resolve('object:main');

	assert.equal(resolved.foo, 'bar', 'reopen matches with defined');
	assert.equal(resolved.bar, 'foo', 'reopen matches with defined');
});
