const BaseRouter = require('./BaseRouter');

class BaseApi extends BaseRouter() {
	static get name() {
		throw new Error('You must implement `name`');
	}

	static get Models() {
		throw new Error('You must implement `Models`');
	}

	static get apiRoutes() {
		return [];
	}

	static get apiRouter() {
		const router = this.router;

		router.get('/', (req, res) => {
			res.status(200).json({
				api: `/${this.name}`,
				apis: this.apiRoutes.map(e => `/${e.name}`)
			});
		});

		this.apiRoutes.forEach(each => {
			router.use(`/${each.name}`, each.router);
		});

		return router;
	}
}

module.exports = BaseApi;
