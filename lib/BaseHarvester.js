const schedule = require('node-schedule');
const BaseModel = require('./BaseModel');

class BaseHarvester extends BaseModel {
	static async harvest() {
		throw new Error('You must implement `harvest`');
	}

	static get harvestSchedule() {
		throw new Error('You must implement `harvestSchedule`');
	}

	static async start(param) {
		schedule.scheduleJob(param, this.run.bind(this));
	}

	static async run() {
		console.log(`[HARVESTER][${this.objectName}] starting job`);
		try {
			await this.harvest();
			console.log(`[HARVESTER][${this.objectName}] completed job`);
		} catch (e) {
			console.log(`[HARVESTER][${this.objectName}] error job`, e);
		}
	}
}

module.exports = BaseHarvester;
