import Resolver from 'ember-cli-awesome-resolver/resolvers/default';
import config from '../../config/environment';

const resolver = Resolver.extend().create({
	namespaces: ['dummy'],
	pluralizedTypes: {
		config: 'config'
	},
	namespace: {
		modulePrefix: config.modulePrefix,
		podModulePrefix: config.podModulePrefix
	}
});

export default resolver;
