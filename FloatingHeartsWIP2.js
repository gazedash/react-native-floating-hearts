import React, { Component } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Easing
} from "react-native";
import { uniqueId, drop } from "lodash";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

export const createHeart = (
  _,
  { top: oldTop = 0, left: oldLeft = 0 } = {}
) => index => {
  const randomNum = getRandomNumber(20, 300);

  const top = oldTop ? oldTop : `${getRandomNumber(0, 95)}%`;
  const left = oldLeft ? oldLeft : `${getRandomNumber(0, 95)}%`;

  const id = uniqueId();

  return {
    id,
    coords: { top, left },
    top,
    left
  };
};

export const getRandomBool = () => {
  return Math.floor(Math.random() * 10) % 2;
};

export const createHearts = (count, height) => {
  const items = Array(count).fill(1);
  const hearts = items.map((_, i) => createHeart(height)(i));
  return hearts;
};

export const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
export const getRandomPercent = () => Math.floor(Math.random() * 100) / 100;

export const Heart = ({ source, color, style, ...props }) => (
  <Image source={source} style={{ tintColor: color, ...style }} {...props} />
);

export class AnimatedHeart extends Component {
  static defaultProps = {
    onComplete: () => {},
    height: 500
  };

  position = new Animated.Value(0);

  get ANIMATION_END_Y() {
    const { height } = this.props;
    return Math.ceil(height * 0.3);
  }

  get NEGATIVE_END_Y() {
    return this.ANIMATION_END_Y * -1;
  }

  componentWillMount() {
    const { NEGATIVE_END_Y, ANIMATION_END_Y } = this;
    const randBools = [getRandomBool(), getRandomBool()];

    this._yAnimation = this.position.interpolate({
      inputRange: [NEGATIVE_END_Y / 2, 0],
      outputRange: [ANIMATION_END_Y / 2, 0]
    });

    this._opacityAnimation = this._yAnimation.interpolate({
      inputRange: [0, ANIMATION_END_Y / 2, ANIMATION_END_Y],
      outputRange: [0, 1, 0]
    });

    this._scaleAnimation = this._yAnimation.interpolate({
      inputRange: [0, ANIMATION_END_Y / 7, ANIMATION_END_Y / 1.3],
      outputRange: [0.01, 1.2, 1],
      extrapolate: "clamp"
    });

    this._xAnimation = this._yAnimation.interpolate({
      inputRange: [
        0,
        ANIMATION_END_Y / 3,
        ANIMATION_END_Y / 2,
        ANIMATION_END_Y
      ],
      outputRange: [0, getRandomBool() ? 5 : -5, getRandomBool() ? -5 : 5, 0]
    });

    const getDegree = (degree, isNeg) => {
      return `${isNeg ? "-" : ""}${degree}deg`;
    };

    this._rotateAnimation = this._yAnimation.interpolate({
      inputRange: [
        0,
        ANIMATION_END_Y / 4,
        ANIMATION_END_Y / 3,
        ANIMATION_END_Y / 2,
        ANIMATION_END_Y
      ],
      // outputRange: ["0deg", "360deg"]
      outputRange: [
        "0deg",
        getDegree(20, randBools[0]),
        "0deg",
        getDegree(20, randBools[1]),
        "0deg"
      ]
    });
  }

  runAnimation() {
    const { coords = { top: 0, left: 0 } } = this.props;
    this.position.setValue(0);
    const delay = coords.top
      ? getRandomNumber(0, 50)
      : getRandomNumber(100, 300);
    const duration = coords.top
      ? getRandomNumber(400, 700)
      : 30 * getRandomNumber(40, 200);
    // Animated.loop(
    Animated.timing(this.position, {
      duration,
      useNativeDriver: true,
      delay,
      easing: Easing.ease,
      toValue: this.NEGATIVE_END_Y
    }).start(() => {
      if (!coords.top) {
        this.runAnimation();
      } else {
        this.props.onComplete();
      }
    });
    // ).start();
  }

  componentDidMount() {
    this.runAnimation();
  }

  getHeartAnimationStyle() {
    return {
      transform: [
        { translateY: this.position },
        { translateX: this._xAnimation },
        { scale: this._scaleAnimation },
        { rotate: this._rotateAnimation }
      ],
      opacity: this._opacityAnimation
    };
  }

  render() {
    return (
      <Animated.View
        style={[
          styles.heartWrap,
          this.getHeartAnimationStyle(),
          this.props.style
        ]}
      >
        <Heart source={require("./heart.png")} />
      </Animated.View>
    );
  }
}

export class HeartFloater extends Component {
  state = {
    hearts: [],
    tapHearts: []
  };

  static defaultProps = {
    count: 0,
    height: 500
  };

  componentDidMount() {
    const { count, height } = this.props;

    const hearts = createHearts(count, height);
    this.setState({ hearts });
  }

  // componentDidUpdate(prevProps) {
  //   const { count: prevCount } = prevProps;
  //   const { count, height } = this.props;
  //   const { hearts } = this.state;
  //   let diffCount = count - prevCount;
  //   if (diffCount < 0) {
  //     diffCount = -diffCount;
  //   }

  //   const newHearts = createHearts(diffCount, height);
  //   this.setState({ hearts: hearts.concat(newHearts) });
  // }

  addHeart = e => {
    const coords = {
      left: e.nativeEvent.locationX,
      top: e.nativeEvent.locationY
    };

    const { tapHearts } = this.state;
    const { height } = this.props;
    // const h = () => createHeart(height)(hearts.length);
    const heart = createHeart(height, coords)(tapHearts.length);
    // const newHearts = [h(), h(), h()];
    this.setState({ tapHearts: [heart].concat(tapHearts) });
  };

  removeHeart = id => {
    this.setState({
      hearts: this.state.hearts.filter(heart => heart.id !== id)
    });
  };

  render() {
    return (
      <View>
        <TouchableWithoutFeedback onPress={this.addHeart}>
          <View>
            <Text>hidsfadfadsfasdfasdfasdfa</Text>
            <Text>hidsfadfadsfasdfasdfasdfa</Text>
            <Text>hidsfadfadsfasdfasdfasdfa</Text>
            <Text>hidsfadfadsfasdfasdfasdfa</Text>
            <Text>hidsfadfadsfasdfasdfasdfa</Text>
          </View>
        </TouchableWithoutFeedback>
        {this.state.tapHearts.map((v, i) => {
          return (
            <AnimatedHeart
              key={v.id}
              coords={v.coords}
              onComplete={() => this.removeHeart(v.id)}
              style={{ left: v.left, top: v.top }}
            />
          );
        })}
        {this.state.hearts.map((v, i) => {
          return (
            <AnimatedHeart
              key={v.id}
              // onComplete={() => this.removeHeart(v.id)}
              style={{ left: v.left, top: v.top * 0.2 }}
            />
          );
        })}
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // position: "absolute"
    flex: 1
  },
  heartWrap: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "transparent"
  },
  shapeWrapper: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent"
  }
});

export default class App extends Component {
  state = {
    count: 5 + Math.floor(deviceWidth / 32 + getRandomNumber(3, 10))
    // count: 0
  };

  render() {
    const { count } = this.state;

    return (
      <View style={styless.container}>
        <HeartFloater color={"red"} count={count} />
      </View>
    );
  }
}

const styless = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 400,
    height: 200
  }
});
