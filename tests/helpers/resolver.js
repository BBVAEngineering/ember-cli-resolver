import Resolver from 'ember-cli-awesome-resolver/resolvers/default';
import config from '../../config/environment';

const resolver = Resolver.extend().create({
	namespace: ['dummy'],
	pluralizedTypes: {
		config: 'config'
	}
});

resolver.namespace = {
	modulePrefix: config.modulePrefix,
	podModulePrefix: config.podModulePrefix
};

export default resolver;
