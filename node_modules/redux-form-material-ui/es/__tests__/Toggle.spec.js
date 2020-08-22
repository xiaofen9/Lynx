'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _lodash = require('lodash.noop');

var _lodash2 = _interopRequireDefault(_lodash);

var _getMuiTheme = require('material-ui/styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _MuiThemeProvider = require('material-ui/styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

var _Toggle = require('material-ui/Toggle');

var _Toggle2 = _interopRequireDefault(_Toggle);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _Toggle3 = require('../Toggle');

var _Toggle4 = _interopRequireDefault(_Toggle3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('Toggle', function () {
  it('has a display name', function () {
    (0, _expect2.default)(_Toggle4.default.displayName).toBe('ReduxFormMaterialUIToggle');
  });

  it('renders an untoggled Toggle', function () {
    (0, _expect2.default)(new _Toggle4.default({
      input: {
        name: 'myToggle',
        onChange: _lodash2.default
      }
    }).render()).toEqualJSX(_react2.default.createElement(_Toggle2.default, {
      name: 'myToggle',
      onToggle: _lodash2.default,
      ref: 'component'
    }));
  });

  it('renders a toggled Toggle', function () {
    (0, _expect2.default)(new _Toggle4.default({
      input: {
        name: 'myToggle',
        onChange: _lodash2.default,
        value: true
      }
    }).render()).toEqualJSX(_react2.default.createElement(_Toggle2.default, {
      name: 'myToggle',
      onToggle: _lodash2.default,
      ref: 'component',
      toggled: true
    }));
  });

  it('should ignore defaultToggled', function () {
    (0, _expect2.default)(new _Toggle4.default({
      input: {
        name: 'myToggle',
        onChange: _lodash2.default
      },
      defaultToggled: true
    }).render()).toEqualJSX(_react2.default.createElement(_Toggle2.default, {
      name: 'myToggle',
      onToggle: _lodash2.default,
      ref: 'component'
    }));
  });

  it('renders a controlled Toggle', function () {
    (0, _expect2.default)(new _Toggle4.default({
      input: {
        name: 'myToggle',
        onChange: _lodash2.default,
        value: true
      }
    }).render()).toEqualJSX(_react2.default.createElement(_Toggle2.default, { name: 'myToggle', onToggle: _lodash2.default, ref: 'component', toggled: true }));
    (0, _expect2.default)(new _Toggle4.default({
      input: {
        name: 'myToggle',
        onChange: _lodash2.default
      }
    }).render()).toEqualJSX(_react2.default.createElement(_Toggle2.default, { name: 'myToggle', onToggle: _lodash2.default, ref: 'component', toggled: false }));
  });

  it('provides getRenderedComponent', function () {
    var dom = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { muiTheme: (0, _getMuiTheme2.default)() },
      _react2.default.createElement(_Toggle4.default, {
        input: { name: 'myToggle', onChange: _lodash2.default }
      })
    ));

    var element = _testUtils2.default.findRenderedComponentWithType(dom, _Toggle4.default);
    (0, _expect2.default)(element.getRenderedComponent).toBeA('function');
    (0, _expect2.default)(element.getRenderedComponent()).toExist();
  });
});