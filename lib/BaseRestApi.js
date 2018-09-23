const BaseApi = require('./BaseApi');

class BaseRestApi extends BaseApi {
	static get name() {
		return 'rest';
	}

	static get Models() {
		throw new Error('You must implement `Models`');
	}

	static get apiRoutes() {
		return Object.keys(this.Models).forEach(key => {
			const each = this.Models[key];

			return {
				name: each.tableName,
				router: each.restRouter
			};
		});
	}
}

module.exports = BaseRestApi;
