const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ProfileSchema = new schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  bio: {
    type: String
  },
  avatar: {
    type: String,
  }
})

module.exports = Profile = mongoose.model('profile', ProfileSchema);