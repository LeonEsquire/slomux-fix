function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
} // Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState) => {
  let currentState = initialState;
  const listeners = [];

  const getState = () => currentState;
  const dispatch = action => {
    currentState = reducer(currentState, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = listener => listeners.push(listener);

  return { getState, dispatch, subscribe };
};

const connect = (mapStateToProps, mapDispatchToProps) => Component => {
  class WrappedComponent extends React.Component {
    constructor(...args) {
      super(...args);
      _defineProperty(
        this,
        "handleChange",

        () => {
          this.forceUpdate();
        }
      );
    }
    render() {
      return React.createElement(
        Component,
        _extends(
          {},
          this.props,
          mapStateToProps(this.context.store.getState(), this.props),
          mapDispatchToProps(this.context.store.dispatch, this.props)
        )
      );
    }
    componentDidUpdate() {
      this.context.store.subscribe(this.handleChange);
    }
  }

  WrappedComponent.contextTypes = {
    store: PropTypes.object
  };

  return WrappedComponent;
};

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Provider.childContextTypes = {
  store: PropTypes.object

  // APP

  // actions
};
const CHANGE_INTERVAL = "CHANGE_INTERVAL";

// action creators
const changeInterval = value => ({
  type: CHANGE_INTERVAL,
  payload: value
});

// reducers
const reducer = (state, action) => {
  switch (action.type) {
    case CHANGE_INTERVAL:
      return (state += action.payload);
    default:
      return {};
  }
};

// components

class IntervalComponent extends React.Component {
  render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "span",
        null,
        "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u043C\u0435\u0440\u0430: ",
        this.props.currentInterval,
        " \u0441\u0435\u043A."
      ),
      React.createElement(
        "span",
        null,
        React.createElement(
          "button",
          { onClick: () => this.props.changeInterval(-1) },
          "-"
        ),
        React.createElement(
          "button",
          { onClick: () => this.props.changeInterval(1) },
          "+"
        )
      )
    );
  }
}

const Interval = connect(
  dispatch => ({
    changeInterval: value => dispatch(changeInterval(value))
  }),

  state => ({
    currentInterval: state
  })
)(IntervalComponent);

class TimerComponent extends React.Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "state", {
      currentTime: 0
    });
  }

  render() {
    return React.createElement(
      "div",
      null,
      React.createElement(Interval, null),
      React.createElement(
        "div",
        null,
        "\u0421\u0435\u043A\u0443\u043D\u0434\u043E\u043C\u0435\u0440: ",
        this.state.currentTime,
        " \u0441\u0435\u043A."
      ),

      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: this.handleStart },
          "\u0421\u0442\u0430\u0440\u0442"
        ),
        React.createElement(
          "button",
          { onClick: this.handleStop },
          "\u0421\u0442\u043E\u043F"
        )
      )
    );
  }

  handleStart() {
    setTimeout(
      () =>
        this.setState({
          currentTime: this.state.currentTime + this.props.currentInterval
        }),
      this.props.currentInterval
    );
  }

  handleStop() {
    this.setState({ currentTime: 0 });
  }
}

const Timer = connect(
  state => ({
    currentInterval: state
  }),
  () => {}
)(TimerComponent);

// init
ReactDOM.render(
  React.createElement(
    Provider,
    { store: createStore(reducer) },
    React.createElement(Timer, null)
  ),

  document.getElementById("app")
);
