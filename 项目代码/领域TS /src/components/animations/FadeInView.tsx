import React from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  onFadeComplete?: () => void;
  duration?: number;
  style?: ViewStyle;
}

interface State {
  viewOpacity: Animated.Value;
}

export default class FadeInView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

     this.state = {
      viewOpacity: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const { viewOpacity } = this.state;
    const { onFadeComplete, duration = 250 } = this.props;

    Animated.timing(
      viewOpacity,
      {
        toValue: 1,
        duration,
      },
    ).start(onFadeComplete || (() => {}));
  }

  render() {
    const { viewOpacity } = this.state;
    const { style } = this.props;

    return (
      <Animated.View style={{
        ...style,
        opacity: viewOpacity
      }}>
        {this.props.children}
      </Animated.View>
    );
  }
}