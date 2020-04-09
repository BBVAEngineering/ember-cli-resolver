/* eslint-disable ember/no-new-mixins */
import Resolver from 'ember-resolver/resolver';
import ResolverMixin from 'ember-cli-awesome-resolver/mixins/resolver';

/**
 * Implements `ResolverMixin`.
 *
 * @class Resolver
 * @extends Ember.Resolver
 * @public
 */
const AwesomeResolver = Resolver.extend(ResolverMixin);

export default AwesomeResolver;
