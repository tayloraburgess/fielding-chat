/* eslint-env node */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	name: String,
	created_at: Date
});
export const User = mongoose.model('User', userSchema);