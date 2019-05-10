function _extends() {
  // сюда добавил `var`, чтобы не переписывалось свойство `_extends` (при LHS look-up)
  // на глобальном объекте `window`.
  // Если такой код "скормим" webpack'у 
  // (а в нем по умолчанию выставлен режим `use strict`)
  // и данная переменная будет иметь другое название
  // (к примеру `_extp`), тогда переменная (а точнее свойство) не будет
  // создана на глобальном объекте и мы увидим ошибку
  // `ReferenceError`.
  // Почему ваш код работает:
  // при первом выполнении функции исполняется строка `return _extends.apply(this, arguments)`,
  // благодаря которой внешний `_extends` корректно передает поведение вызываемого внутреннего 
  // `_extends`, а при последующих вызовах код будет работать и без этой строки
  var _extends =
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

  const subscribe = listener => {
    listeners.push(listener);

    //  для возможной отписки получателя оповещений
    return () => {
      listeners = listeners.filter(lr => lr !== listener);
    };
  };

  return { getState, dispatch, subscribe };
};

const connect = (mapStateToProps, mapDispatchToProps) => Component => {
  class WrappedComponent extends React.Component {
    // нам передали объект, потом мы его поместили в массив(rest), 
    // чтобы далее достать данный объект из массива(spread) и задействовать его
    // в качестве аргумента `super()`. Ниже я просто исключаю две
    // лишние операции (rest/spread)
    constructor(props) {
      super(props);
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
          // обе функции принимают по одному аргументу
          // и для корректной работы им пропсы не нужны.
          // функции возвращают объекты, свойства которых
          // далее передаются новому объекту (первый аргумент `_extends`)
          mapStateToProps(this.context.store.getState()),
          mapDispatchToProps(this.context.store.dispatch)
        )
      );
    }

    // `...DidUpdate`, при каждом вызове 
    // обновления нашего компонента, будет повторно регистрировать
    // один и тот же обработчик событий. Не говоря о том, что при 
    // первой прорисовке, компонент вообще никак не будет подписан
    // на изменения store'а
    componentDidMount() {
      // сохраняем ссылку на функцию отписки
      this.unsubscribe = this.context.store.subscribe(this.handleChange);
    }
    
    // отписываемся от оповещений, при демонтировании компонента,
    // так как мы не сможем оповещать не существующий компонент
    componentWillUnmount() {
      this.unsubscribe();
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

  // actionTypes - больше нра:)
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
      // получается на наш store сможет влиять абсолютно любой action.
      // Возвращаем просто state, чтобы миновать не интересующие нас action'ы
      return state;
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
          {
            onClick: () => {
              // исключение отрицательного значения счетчика
              if (this.props.currentInterval === 0) return;
              this.props.changeInterval(-1);
            }
          },
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

// mapStateToProps - передаем состояние в качестве props, 
// а тут мы пытались передать функцию dispatch вместо
// состояния store'a (результат вызова this.context.store.getState())
const Interval = connect(
  state => ({
    currentInterval: state
  }),
  dispatch => ({
    changeInterval: value => {
      dispatch(changeInterval(value));
    }
  })
)(IntervalComponent);

class TimerComponent extends React.Component {
  // нам передали объект, потом мы его поместили в массив(rest), 
  // чтобы далее достать данный объект из массива(spread) и задействовать его
  // в качестве аргумента `super()`. Ниже я просто исключаю две
  // лишние операции (rest/spread)
  constructor(props) {
    super(props);
    _defineProperty(this, "state", {
      currentTime: 0
    });

    // чтобы не терять контекст `this`
    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
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
    // исключаем запуск секундомера с интервалом в 0 секунд,
    // а также добавляем остановку, при повторном нажатии 
    // `старта` (со значением интервала равным 0), во время
    // работы секундомера с отличным от 0 интервалом
    if (this.props.currentInterval === 0) return clearInterval(this.interval);

    // останавливаем секундомер перед его повторным запуском
    if (this.interval !== "undefined") clearInterval(this.interval);

    // выносим значение интервала секундомера за пределы `setState`,
    // чтобы секундомер не менял свой интервал при каждом нажатии
    // конопок `+/-` (т.е. без участия кнопки `start`)
    const { currentInterval } = this.props;

    this.interval = setInterval(
      () =>
        this.setState(state => ({
          currentTime: state.currentTime + currentInterval
        })),
      currentInterval * 1000
    );
  }

  handleStop() {
    // останавливаем секундомер
    clearInterval(this.interval);
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
    // задаем начальное значение состояния хранилища
    { store: createStore(reducer, 0) },
    React.createElement(Timer, null)
  ),

  document.getElementById("app")
);
