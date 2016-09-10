'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Log = exports.Message = exports.User = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userSchema = new _mongoose2.default.Schema({
  name: { type: String, required: true },
  created_at: { type: Date, required: true }
}); /* eslint-env node */

var User = exports.User = _mongoose2.default.model('User', userSchema);

var messageSchema = new _mongoose2.default.Schema({
  user_id: { type: _mongoose2.default.Schema.Types.ObjectId },
  ref_id: { type: Number, required: true },
  text: { type: String, required: true },
  created_at: { type: Date, required: true }
});
var Message = exports.Message = _mongoose2.default.model('Message', messageSchema);

var logSchema = new _mongoose2.default.Schema({
  user_ids: [{ type: _mongoose2.default.Schema.Types.ObjectId, required: true }],
  message_ids: [{ type: _mongoose2.default.Schema.Types.ObjectId, required: true }],
  name: { type: String, required: true },
  created_at: { type: Date, required: true }
});
var Log = exports.Log = _mongoose2.default.model('Log', logSchema);