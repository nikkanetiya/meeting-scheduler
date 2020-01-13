const dotenv = require('dotenv');
module.exports.initEnv = () => {
  dotenv.config();
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS.replace(
    /__dir__/i,
    `${process.cwd()}`
  );
};
