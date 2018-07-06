const schedule = require('node-schedule');

class BaseHarvester {
	static async harvest() {
		throw new Error('You must implement `harvest`');
	}

	static get harvestSchedule() {
		throw new Error('You must implement `harvestSchedule`');
	}

	static async start() {
		schedule.scheduleJob(this.harvestSchedule, async () => {
			await this.harvest();
		});
	}
}

module.exports = BaseHarvester;
