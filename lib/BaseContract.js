const BaseRouter = require('./BaseRouter');

const truffleContract = require('truffle-contract');
const truffleProvider = require('truffle-provider');

class BaseContract extends BaseRouter() {
	constructor() {
		super();
	}

	static get truffleConfig() {
		throw new Error('You must override `truffleConfig`');
	}

	static get contractJson() {
		throw new Error('You must override `contractJson`');
	}

	static get contractRouter() {
		const router = this.router;

		this.contractRoutes(router);

		return router;
	}

	static async contractRoutes(router) {
		const instance = await this.deployed();
		const calls = instance.abi.filter(e => e.constant);

		calls.map(each => this.routeCall(router, each));

		router.get('/', async (req, res, next) => {
			const i = await this.deployed();

			return res.status(200).json({
				address: i.address,
				abi: i.abi,
			});
		});
	}

	static async routeCall(router, method) {
		router.get(`/${method.name}`, async (req, res, next) => {
			try {
				const contract = await this.deployed();
				const inputs = method.inputs.map(e => req.query[e.name]);
				const result = await contract[method.name](...inputs);

				const response = { response: result };

				if (Array.isArray(result)) {
					method.outputs.map((e, i) => {
						response[e.name] = result[i];
					});
				}

				return res.status(200).json(response);
			} catch (e) {
				next(e);
			}
		});
	}

	static get web3Provider() {
		return truffleProvider.create(this.truffleConfig);
	}

	static async deployed() {
		const C = this.Contract;

		C.setProvider(this.web3Provider);

		return await C.deployed();
	}

	static get Contract() {
		return truffleContract(this.contractJson);
	}
}

module.exports = BaseContract;
