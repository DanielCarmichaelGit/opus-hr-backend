const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  owned_by_id: { type: String, required: true },
  test_content: { type: Object, required: true },
  test_configs: { type: Object, required: false },
  created_date: { type: String, required: true },
  source: { type: String, required: true }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;