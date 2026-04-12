const mognoose = require('mongoose');

const userSchema = new mognoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, 'Username already exists'],
  },

  email: {
    type: String,
    required: true,
    unique: [true, 'Email already exists'],
  },

  password: {
    type: String,
    required: true,
  }
});

const UserModel = mognoose.model('User', userSchema);

module.exports = UserModel;