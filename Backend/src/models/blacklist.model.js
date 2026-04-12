const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true , 'Token is required to add to blacklist'],
  },
},
{
    timestamps: true,
}
);

const tokenBlacklistModel = mongoose.model('TokenBlacklist', blacklistTokenSchema);

module.exports = tokenBlacklistModel;
