'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // @noflow


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _inject = require('./inject');

var _inject2 = _interopRequireDefault(_inject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

describe('injectStripe()', function () {
  var WrappedComponent = void 0;
  var context = void 0;
  var createSource = void 0;
  var createToken = void 0;
  var elementMock = void 0;

  // Before ALL tests (sync or async)
  beforeEach(function () {
    createSource = jest.fn();
    createToken = jest.fn();
    elementMock = {
      element: {
        on: jest.fn()
      },
      impliedTokenType: 'card',
      impliedSourceType: 'card'
    };
    WrappedComponent = function WrappedComponent() {
      return _react2.default.createElement('div', null);
    };
    WrappedComponent.displayName = 'WrappedComponent';
  });

  describe('[sync]', function () {
    // Before ONLY sync tests
    beforeEach(function () {
      context = {
        tag: 'sync',
        stripe: {
          elements: jest.fn(),
          createSource: createSource,
          createToken: createToken
        },
        getRegisteredElements: function getRegisteredElements() {
          return [elementMock];
        }
      };
    });

    it('sets the correct displayName', function () {
      expect((0, _inject2.default)(WrappedComponent).displayName).toBe('InjectStripe(WrappedComponent)');
    });

    it("includes the original component's displayName", function () {
      WrappedComponent.displayName = 'foo';
      expect((0, _inject2.default)(WrappedComponent).displayName).toBe('InjectStripe(foo)');
    });

    it("falls back to the original component's name if no displayName is set", function () {
      WrappedComponent.displayName = undefined;
      expect((0, _inject2.default)(WrappedComponent).displayName).toBe('InjectStripe(' + WrappedComponent.name + ')');
    });

    it('throws when StripeProvider is missing from ancestry', function () {
      // Prevent the expected console.error from react to keep the test output clean
      var originalConsoleError = global.console.error;
      global.console.error = function (msg) {
        if (!msg.startsWith('Warning: Failed context type: The context `tag` is marked as required') && !msg.startsWith('Warning: Failed context type: The context `getRegisteredElements` is marked as required')) {
          originalConsoleError(msg);
        }
      };

      var Injected = (0, _inject2.default)(WrappedComponent());

      expect(function () {
        return (0, _enzyme.shallow)(_react2.default.createElement(Injected, null));
      }).toThrow(/It looks like you are trying to inject Stripe context outside of an Elements context/);
      global.console.error = originalConsoleError;
    });

    it('renders <WrappedComponent> with `stripe` prop', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      expect(props).toHaveProperty('stripe');
      expect(props).toHaveProperty('stripe.createSource');
      expect(props).toHaveProperty('stripe.createToken');
    });

    it('props.stripe.createToken calls createToken with element and empty options when called with no arguments', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createToken();
      expect(createToken).toHaveBeenCalledWith(elementMock.element, {});
    });

    it('props.stripe.createToken calls createToken with element and options when called with options object', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createToken({ foo: 'bar' });
      expect(createToken).toHaveBeenCalledWith(elementMock.element, {
        foo: 'bar'
      });
    });

    it('props.stripe.createToken calls createToken with string as first argument and options object as second', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createToken('test', { foo: 'bar' });
      expect(createToken).toHaveBeenCalledWith('test', { foo: 'bar' });
    });

    it('props.stripe.createToken throws when called with invalid options type', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      expect(function () {
        return props.stripe.createToken(1);
      }).toThrow('Invalid options passed to createToken. Expected an object, got number.');
    });

    it('props.stripe.createToken throws when no element is in the tree', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: _extends({}, context, {
          getRegisteredElements: function getRegisteredElements() {
            return [];
          }
        })
      });

      var props = wrapper.props();
      expect(props.stripe.createToken).toThrow(/We could not infer which Element you want to use for this operation./);
    });

    it('props.stripe.createSource errors when called without a type', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      expect(props.stripe.createSource).toThrow(/Invalid Source type/);
    });

    it('props.stripe.createSource calls createSource with element and type when only type is passed in', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createSource({ type: 'card' });
      expect(createSource).toHaveBeenCalledWith(elementMock.element, {
        type: 'card'
      });
    });

    it('props.stripe.createSource calls createSource with options', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createSource({ type: 'card', foo: 'bar' });
      expect(createSource).toHaveBeenCalledWith(elementMock.element, {
        type: 'card',
        foo: 'bar'
      });
    });

    it('props.stripe.createSource calls createSource with options when called with unknown type', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      props.stripe.createSource({ type: 'baz', foo: 'bar' });
      expect(createSource).toHaveBeenCalledWith({ type: 'baz', foo: 'bar' });
    });

    it('props.stripe.createSource throws when called with invalid options argument', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: context
      });

      var props = wrapper.props();
      expect(function () {
        return props.stripe.createSource(1);
      }).toThrow('Invalid options passed to createSource. Expected an object, got number.');
    });

    it('props.stripe.createSource throws when called with source type that matches multiple elements', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(Injected, null), {
        context: _extends({}, context, {
          getRegisteredElements: function getRegisteredElements() {
            return [{
              element: {
                on: jest.fn()
              },
              impliedTokenType: 'card',
              impliedSourceType: 'card'
            }, {
              element: {
                on: jest.fn()
              },
              impliedTokenType: 'card',
              impliedSourceType: 'card'
            }];
          }
        })
      });

      var props = wrapper.props();
      expect(function () {
        return props.stripe.createSource({ type: 'card' });
      }).toThrow(/We could not infer which Element you want to use for this operation/);
    });

    it('throws when `getWrappedInstance` is called without `{withRef: true}` option.', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);

      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(Injected, null), {
        context: context
      });

      expect(function () {
        return wrapper.node.getWrappedInstance();
      }).toThrow('To access the wrapped instance, the `{withRef: true}` option must be set when calling `injectStripe()`');
    });

    it('`getWrappedInstance` works whith `{withRef: true}` option.', function () {
      // refs won't work with stateless functional components
      var WrappedClassComponent = function (_React$Component) {
        _inherits(WrappedClassComponent, _React$Component);

        function WrappedClassComponent() {
          _classCallCheck(this, WrappedClassComponent);

          return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
        }

        WrappedClassComponent.prototype.render = function render() {
          return _react2.default.createElement(
            'div',
            null,
            this.foo
          );
        };

        return WrappedClassComponent;
      }(_react2.default.Component);

      WrappedClassComponent.displayName = 'WrappedClassComponent';


      var Injected = (0, _inject2.default)(WrappedClassComponent, { withRef: true });

      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(Injected, null), {
        context: context
      });

      expect(wrapper.node.getWrappedInstance() instanceof WrappedClassComponent).toBe(true);
    });
  });

  describe('[async]', function () {
    it('props.stripe is null if addStripeLoadListener never fires', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);
      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(Injected, null), {
        context: {
          tag: 'async',
          // simulate StripeProvider never giving us a StripeShape
          addStripeLoadListener: function addStripeLoadListener() {},
          getRegisteredElements: function getRegisteredElements() {
            return [elementMock];
          }
        }
      });

      var props = wrapper.find(WrappedComponent).props();
      expect(props).toHaveProperty('stripe', null);
    });

    it('props.stripe is set when addStripeLoadListener fires', function () {
      var Injected = (0, _inject2.default)(WrappedComponent);
      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(Injected, null), {
        context: {
          tag: 'async',
          // simulate StripeProvider eventually giving us a StripeShape
          addStripeLoadListener: function addStripeLoadListener(fn) {
            fn({
              elements: jest.fn(),
              createSource: createSource,
              createToken: createToken
            });
          },
          getRegisteredElements: function getRegisteredElements() {
            return [elementMock];
          }
        }
      });

      var props = wrapper.find(WrappedComponent).props();
      expect(props).toHaveProperty('stripe');
      expect(props).toHaveProperty('stripe.createToken');
      expect(props).toHaveProperty('stripe.createSource');
    });
  });
});