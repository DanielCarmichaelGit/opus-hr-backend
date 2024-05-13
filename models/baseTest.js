const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  test_id: { type: String, required: true },
  owned_by_id: { type: String, required: true, unique: true },
  test_content: { type: Object, required: true },
  test_configs: { type: Object, required: false }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;