'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Slider = require('material-ui/Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _createComponent = require('./createComponent');

var _createComponent2 = _interopRequireDefault(_createComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = (0, _createComponent2.default)(_Slider2.default, function (_ref) {
  var _ref$input = _ref.input,
      onDragStart = _ref$input.onDragStart,
      _onChange = _ref$input.onChange,
      name = _ref$input.name,
      value = _ref$input.value,
      onChangeFromField = _ref.onChange,
      defaultValue = _ref.defaultValue,
      meta = _ref.meta,
      props = _objectWithoutProperties(_ref, ['input', 'onChange', 'defaultValue', 'meta']);

  return _extends({}, props, {
    name: name,
    value: value,
    onChange: function onChange(event, value) {
      _onChange(value);
      if (onChangeFromField) {
        onChangeFromField(value);
      }
    }
  });
});