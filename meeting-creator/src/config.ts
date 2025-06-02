const fs = require('fs');
const path = require('path');
import logger from './utils/logger';

class Config {
    private config;

    constructor() {
        const filePath = path.resolve(__dirname, 'config/config.json');
        this.config = this.loadConfig(filePath);
    }

    loadConfig(filePath: string) {
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            logger.error("Error on load config file:", err);
            return {};
        }
    }

    get(key: string) {
        return this.config[key];
    }

    getAll() {
        return this.config;
    }
}

let instance = null;

module.exports = (() => {
    if (!instance) {
        instance = new Config();
    }
    return instance;
})();
