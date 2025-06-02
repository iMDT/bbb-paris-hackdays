const { exec } = require('child_process');
import logger from './utils/logger';
const bbbWebConfigPath = '/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties';
const bbbWebOverrideConfigPath = '/etc/bigbluebutton/bbb-web.properties';

class ServerSecuritySalt {
    private securitySalt: string = '';

    loadSecuritySalt() {
        try {
            exec(`cat ${bbbWebConfigPath} ${bbbWebOverrideConfigPath} 2>/dev/null | grep securitySalt | tail -n 1 | cut -d'=' -f2`, (error: { message: any; }, stdout: any, stderr: any) => {
                if (error) {
                    console.error(`Error on fetching server security salt: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Error on fetching server security salt, Stderr: ${stderr}`);
                    return;
                }

                this.securitySalt = stdout.trim();
                logger.info("Server security salt fetched successfully.")
            });
        } catch (err) {
            logger.error("Error on load config file:", err);
            return {};
        }
    }

    getSecuritySalt() {
        return this.securitySalt;
    }
}

let instance = null;

module.exports = (() => {
    if (!instance) {
        instance = new ServerSecuritySalt();
    }
    return instance;
})();
