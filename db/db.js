const Cloudant = require('@cloudant/cloudant');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const log4js = require('log4js');
const logger = log4js.getLogger('db');

const getDBCredentialsUrl = (jsonData) => {
    logger.debug('START getDBCredentialsUrl');
    const vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (const vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
};

module.exports.initDBConnection = () => {

    return new Promise((resolve, reject) => {
        logger.info('Initialization of database...');

        const dbCredentials = {
            dbName: 'my_sample_db'
        };

        // When running on Bluemix, this variable will be set to a json object
        // containing all the service credentials of all the bound services
        if (process.env.VCAP_SERVICES) {
            dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
        } else { // When running locally, the VCAP_SERVICES will not be set

            // When running this app locally you can get your Cloudant credentials
            // from Bluemix (VCAP_SERVICES in 'cf env' output or the Environment
            // Variables section for an app in the Bluemix console dashboard).
            // Once you have the credentials, paste them into a file called vcap-local.json.
            // Alternately you could point to a local database here instead of a
            // Bluemix service.
            // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
            dbCredentials.url = getDBCredentialsUrl(fs.readFileSync(path.join(__dirname, '..', 'config', 'vcap-local.json'), 'utf-8'));
        }
        logger.info('Connecting to database...');
        const cloudant = Cloudant({url: dbCredentials.url, plugin: 'promises'});

        // check if DB exists if not create
        cloudant.db.list().then((allDbs) => {
            return _.find(allDbs, (db) => {
                return db === dbCredentials.dbName;
            });
        }).then((dbExists) => {
            if (!dbExists) {
                cloudant.db.create(dbCredentials.dbName).then(() => {
                    return;
                }).catch((err) => {
                    logger.error('Could not create new db %s.', dbCredentials.dbName);
                    logger.error('Error: %s - %s', err.message, err.stack);
                    throw err;
                });
            }
            return;
        }).then(() => {
            const db = cloudant.db.use(dbCredentials.dbName);
            logger.info('Connected to %s database', dbCredentials.dbName);
            return resolve(db);
        }).catch((err) => {
            logger.error('Cannot list databases');
            logger.error('Error: %s - %j', err.message, err.stack);
            return reject(err);
        });
    });
};
