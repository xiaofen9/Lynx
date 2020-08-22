'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _lodash = require('lodash.noop');

var _lodash2 = _interopRequireDefault(_lodash);

var _SelectField = require('material-ui/SelectField');

var _SelectField2 = _interopRequireDefault(_SelectField);

var _getMuiTheme = require('material-ui/styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _MuiThemeProvider = require('material-ui/styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _SelectField3 = require('../SelectField');

var _SelectField4 = _interopRequireDefault(_SelectField3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('SelectField', function () {
  it('has a display name', function () {
    (0, _expect2.default)(_SelectField4.default.displayName).toBe('ReduxFormMaterialUISelectField');
  });

  it('renders a SelectField', function () {
    (0, _expect2.default)(new _SelectField4.default({
      input: {
        name: 'mySelect',
        value: 'Foo'
      }
    }).render()).toEqualJSX(_react2.default.createElement(_SelectField2.default, {
      name: 'mySelect',
      value: 'Foo',
      onChange: _lodash2.default,
      ref: 'component',
      onBlur: _lodash2.default
    }));
  });

  it('renders a SelectField with no error when not touched', function () {
    (0, _expect2.default)(new _SelectField4.default({
      input: {
        name: 'mySelect',
        value: 'Foo'
      },
      meta: {
        error: 'FooError'
      }
    }).render()).toEqualJSX(_react2.default.createElement(_SelectField2.default, {
      name: 'mySelect',
      value: 'Foo',
      onChange: _lodash2.default,
      ref: 'component',
      onBlur: _lodash2.default
    }));
  });

  it('renders a SelectField with an error', function () {
    (0, _expect2.default)(new _SelectField4.default({
      input: {
        name: 'mySelect',
        value: 'Foo'
      },
      meta: {
        error: 'FooError',
        touched: true
      }
    }).render()).toEqualJSX(_react2.default.createElement(_SelectField2.default, {
      name: 'mySelect',
      value: 'Foo',
      errorText: 'FooError',
      onChange: _lodash2.default,
      ref: 'component',
      onBlur: _lodash2.default
    }));
  });

  it('renders a SelectField with no warning when not touched', function () {
    (0, _expect2.default)(new _SelectField4.default({
      input: {
        name: 'mySelect',
        value: 'Foo'
      },
      meta: {
        warning: 'FooWarning'
      }
    }).render()).toEqualJSX(_react2.default.createElement(_SelectField2.default, {
      name: 'mySelect',
      value: 'Foo',
      onChange: _lodash2.default,
      ref: 'component',
      onBlur: _lodash2.default
    }));
  });

  it('renders a SelectField with an warning', function () {
    (0, _expect2.default)(new _SelectField4.default({
      input: {
        name: 'mySelect',
        value: 'Foo'
      },
      meta: {
        warning: 'FooWarning',
        touched: true
      }
    }).render()).toEqualJSX(_react2.default.createElement(_SelectField2.default, {
      name: 'mySelect',
      value: 'Foo',
      errorText: 'FooWarning',
      onChange: _lodash2.default,
      ref: 'component',
      onBlur: _lodash2.default
    }));
  });

  it('maps onChange properly', function () {
    var onChange = (0, _expect.createSpy)();

    var dom = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { muiTheme: (0, _getMuiTheme2.default)() },
      _react2.default.createElement(_SelectField4.default, {
        name: 'mySelect',
        input: { onChange: onChange, value: 'Foo' }
      })
    ));

    var select = _testUtils2.default.findRenderedComponentWithType(dom, _SelectField2.default);
    (0, _expect2.default)(onChange).toNotHaveBeenCalled();
    select.props.onChange(undefined, 42, 'TheValue');
    (0, _expect2.default)(onChange).toHaveBeenCalled().toHaveBeenCalledWith('TheValue');
  });

  it('maps onChange from Field property properly', function () {
    var reduxFormOnChange = (0, _expect.createSpy)();
    var fieldOnChange = (0, _expect.createSpy)();

    var dom = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { muiTheme: (0, _getMuiTheme2.default)() },
      _react2.default.createElement(_SelectField4.default, {
        name: 'mySelect',
        input: { onChange: reduxFormOnChange, value: 'Foo' },
        onChange: fieldOnChange
      })
    ));

    var select = _testUtils2.default.findRenderedComponentWithType(dom, _SelectField2.default);

    (0, _expect2.default)(reduxFormOnChange).toNotHaveBeenCalled();
    (0, _expect2.default)(fieldOnChange).toNotHaveBeenCalled();

    select.props.onChange(undefined, 42, 'TheValue');

    (0, _expect2.default)(reduxFormOnChange).toHaveBeenCalled().toHaveBeenCalledWith('TheValue');
    (0, _expect2.default)(fieldOnChange).toHaveBeenCalled().toHaveBeenCalledWith('TheValue');
  });

  it('calls onBlur with currently selected value', function () {
    var fieldOnBlur = (0, _expect.createSpy)();

    var dom = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { muiTheme: (0, _getMuiTheme2.default)() },
      _react2.default.createElement(_SelectField4.default, {
        name: 'mySelect',
        input: { value: 'Foo', onBlur: fieldOnBlur }
      })
    ));

    var select = _testUtils2.default.findRenderedComponentWithType(dom, _SelectField2.default);

    (0, _expect2.default)(fieldOnBlur).toNotHaveBeenCalled();

    select.props.onBlur();

    (0, _expect2.default)(fieldOnBlur).toHaveBeenCalled().toHaveBeenCalledWith('Foo');
  });

  it('provides getRenderedComponent', function () {
    var dom = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { muiTheme: (0, _getMuiTheme2.default)() },
      _react2.default.createElement(_SelectField4.default, { input: { name: 'mySelect' } })
    ));

    var element = _testUtils2.default.findRenderedComponentWithType(dom, _SelectField4.default);
    (0, _expect2.default)(element.getRenderedComponent).toBeA('function');
    (0, _expect2.default)(element.getRenderedComponent()).toExist();
  });
});