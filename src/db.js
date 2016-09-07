/* eslint-env node */

import { User } from '../src/models.js';
import mongoose from 'mongoose';

export function dbConnect(callback=false) {
	mongoose.connect('mongodb://localhost/fieldingchat', (err) => {
		if (callback) {
			if (err) {
				callback(err);
			}
			else {
				callback(true);
			}
		}
	});
}

export function dbDisconnect(callback=false) {
	mongoose.connection.close((err) => {
		if (callback) {
			if (err) {
				callback(err);
			}
			else {
				callback(true);
			}
		}
	});
}

export function dbCreateUser(name, callback=false) {
	const newUser = new User({
		name: name,
		created_at: new Date()
	});
	newUser.save((err, newUser) => {
		if (callback) {
			if (err) {
				callback(err);
			}
			else {
				callback(newUser);
			}
		}
	});
}

export function dbGetUserDate(name, callback=false) {
	User.find({ name: /^${name}/ }, (err, users) => {
		if (callback) {
			if (err) {
				callback(err);
			}
			else {
				callback(users[0].created_at);
			}
		}
	});
}

export function dbGetUsers(name, callback=false) {
	User.find((err, users) => {
		if (callback) {
			if (err) {
				callback(err);
			}
			else {
				callback(users);
			}
		}
	});
}