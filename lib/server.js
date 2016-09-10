'use strict';

var _api = require('./api.js');

var _api2 = _interopRequireDefault(_api);

var _db = require('./db.js');

var db = _interopRequireWildcard(_db);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env node */

if (process.env.NODE_ENV === 'development') {
  db.connect('mongodb://localhost/fieldingchat');
  _api2.default.listen(5000);
} else if (process.env.NODE_ENV === 'production') {
  db.connect(process.env.MONGODB_URI);
  _api2.default.listen(process.env.PORT);
}