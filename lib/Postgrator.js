require('dotenv').config();

const Postgrator = require('postgrator');
const _ = require('lodash');
const colors = require('colors');
const fse = require('fs-extra');
const path = require('path');
const prettyHrtime = require('pretty-hrtime');

module.exports = databasePath => {
	const Postgrator = require('postgrator');

	const paths = {
		migrations: path.join(databasePath, 'migrations'),
		views: path.join(databasePath, 'views'),
		functions: path.join(databasePath, 'functions')
	};

	const postgrator = new Postgrator({
		migrationDirectory: paths.migrations,
		driver: 'pg',
		ssl: process.env.DATABASE_SSL === 'true',
		connectionString: process.env.DATABASE_URL,
		schemaTable: '__migrations',
		validateChecksums: true
	});

	switch (process.argv[2]) {
		case 'down':
			migrateDown();
			break;
		case 'to':
			migrateTo(process.argv[3]);
			break;
		default:
			migrateUp();
			break;
	}

	async function migrateTo(version) {
		const startTime = process.hrtime();

		await migrate(version);

		const totalTime = prettyHrtime(process.hrtime(startTime));
		console.log(`Migration completed successfully in ${totalTime}`.bold.green);
	}

	async function migrateUp() {
		const startTime = process.hrtime();

		await migrate();
		await processSqlDirectory(paths.views, 'VIEWS');
		await processSqlDirectory(paths.functions, 'FUNCTIONS');

		const totalTime = prettyHrtime(process.hrtime(startTime));
		console.log(`Migration completed successfully in ${totalTime}`.bold.green);
	}

	async function migrateDown() {
		const startTime = process.hrtime();

		const databaseVersion = await postgrator.getDatabaseVersion();
		const migrations = await postgrator.getMigrations();
		const doMigrations = migrations.filter(m => m.action === 'do');
		const index = doMigrations.findIndex(m => m.version.toString() === databaseVersion);

		await migrate(_.get(doMigrations, [index - 1, 'version'], '0'), startTime);

		const totalTime = prettyHrtime(process.hrtime(startTime));
		console.log(`Migration completed successfully in ${totalTime}`.bold.green);
	}

	async function migrate(toVersion, time) {
		console.log('MIGRATIONS'.bold);

		const startTime = time || process.hrtime();
		const version = _.isUndefined(toVersion) ? toVersion : toVersion.toString();
		await Promise.all(Object.keys(paths).map(which => fse.ensureDir(paths[which])));

		const results = await postgrator.migrate(version);

		results.forEach(result => {
			const verb = result.action === 'do' ? '+'.green : '-'.red;
			const filePath = path.relative(process.cwd(), path.join(paths.migrations, result.filename));
			const md5 = `(${result.md5})`.grey;

			console.log(`${verb} ${filePath} ${md5}`);
		});

		const totalTime = prettyHrtime(process.hrtime(startTime));
		console.log(`\n${results.length} processed in ${totalTime}\n\n`.grey);

		return results;
	}

	async function processSqlDirectory(directory, title) {
		console.log(title.bold);

		try {
			const startTime = process.hrtime();
			const response = await fse.readdir(directory);
			const files = response.filter(file => /.sql$/.test(file));
			const results = [];

			for (file of files) {
				const filePath = path.join(directory, file);
				const sql = await fse.readFile(filePath, 'utf8');
				const result = await postgrator.runQuery(sql);

				results.push({ file, filePath, result });
			}

			results.forEach(result => {
				const verb = '+'.green;
				const filePath = path.relative(process.cwd(), result.filePath);

				console.log(`${verb} ${filePath}`);
			});

			const totalTime = prettyHrtime(process.hrtime(startTime));
			console.log(`\n${results.length} processed in ${totalTime}\n\n`.grey);
		} catch (e) {
			console.log(e);
			process.exit();
		}
	}
};
