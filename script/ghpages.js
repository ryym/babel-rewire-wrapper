const path    = require('path');
const ghpages = require('gh-pages');

const root = path.dirname(__dirname);
const docs = path.join(root, 'out');

ghpages.publish(docs, {
  logger: console.log.bind(console),
  message: 'Update jsdoc'
}, (err) => {
  err && console.error("ERROR: ", err);
});
