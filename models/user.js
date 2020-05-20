import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  refreshTokens: [
    {
      hash: {
        type: String,
      },
      expiry: {
        type: Date,
      },
    },
  ],
});

export default mongoose.models.user || mongoose.model('user', UserSchema);
