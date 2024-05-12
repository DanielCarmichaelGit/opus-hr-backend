const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  avatar_id: { type: String, required: true, unique: true },
  avatar_name: { type: String, required: true },
  avatar_gender: { type: String, required: true },
  avatar_hair_color: { type: String, required: true },
  avatar_image: { type: String, required: true },
  owned_by_id: { type: String, required: true }
});

const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar;