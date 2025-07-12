const mongoose = require('mongoose');
require('dotenv').config();

const models = [
  require('../models/User'),
  require('../models/Campaign'),
  require('../models/Execution'),
  require('../models/ExecutionPage'),
  require('../models/Page') // Google Sheet cache
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (let model of models) {
    await model.deleteMany({});
    console.log(`Cleared ${model.modelName}`);
  }
  await mongoose.disconnect();
})();
