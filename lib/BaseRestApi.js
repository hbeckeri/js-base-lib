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
			const Each = this.Models[key];

			return {
				name: Each.tableName,
				router: Each.restRouter
			};
		});
	}
}

module.exports = BaseRestApi;
