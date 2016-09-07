/* eslint-env node */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_at: { type: Date, required: true },
});
export const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId },
  ref_id: { type: Number, required: true },
  text: { type: String, required: true },
  created_at: { type: Date, required: true },
});
export const Message = mongoose.model('Message', messageSchema);

const logSchema = new mongoose.Schema({
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  message_ids: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  name: { type: String, required: true },
  created_at: { type: Date, required: true },
});
export const Log = mongoose.model('Log', logSchema);
