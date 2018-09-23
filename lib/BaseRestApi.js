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

			class RestModel extends Each {
				static get Models() {
					return this.Models;
				}
			}

			return {
				name: RestModel.tableName,
				router: RestModel.restRouter
			};
		});
	}
}

module.exports = BaseRestApi;
