import Resolver from 'ember-cli-awesome-resolver/resolvers/default';
import config from '../../config/environment';

const resolver = Resolver.extend({
    namespaces: ['dummy'],
    pluralizedTypes: {
        config: 'config'
    }
}).create();

resolver.namespace = {
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix
};

export default resolver;
