import fs from 'fs';
import logger from './logger';

export default {
  readFile(path) {
    logger.log(`Read ${path}`);
    return fs.readFileSync(path);
  },

  getLogger() {
    return logger;
  }
}
