import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Text,
  StatusBar,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import _ from 'lodash';
import RecommendationScene from '../../components/discover/RecommendationScene';
import TopicScene from '../../components/discover/TopicScene';
import { TabView, SceneMap } from 'react-native-tab-view';
import TabBar from '../../components/TabBar';
import Layout from '../../constants/Layout';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors';
import { convert } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'

interface Props extends NavigationScreenProps { }

interface State {
  index: number,
  routes: object[]
}

export default class DiscoverScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: "推荐" },
        { key: 'second', title: "专题" },
      ],
    };
  }

  componentDidMount() {
    Zhugeio.startTrack('发现Tab页面');
  }

  componentWillUnmount() {
    Zhugeio.endTrack('发现Tab页面', {});
  }

  _handleIndexChange = (index: number) => this.setState({ index });

  _renderScene = SceneMap({
    first: RecommendationScene,
    second: TopicScene,
  });

  _renderTabBar = (props: any) => {
    return (
      <TabBar {...props} />
    )
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <View style={styles.topTabBar}>
          <TouchableWithoutFeedback>
            <View>
              <Animated.View style={[{  }]}>
                <Text style={[, styles.topTab,]}>推荐</Text>
              </Animated.View>
              <Animated.View
                style={[StyleSheet.absoluteFill, {  },]}
              >
                <Text style={[, styles.topTab, styles.topTabActivated]}>推荐</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <RecommendationScene />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    elevation: 0,
    backgroundColor: 'white'
  },
  topTabBar: {
    flexDirection: 'row',
    paddingHorizontal: convert(16),
    paddingTop: getStatusBarHeight(true),
    backgroundColor: 'white'
  },
  topTab: {
    fontSize: convert(22),
    lineHeight: convert(50),
    fontWeight: 'bold',
    marginRight: convert(5),
    paddingHorizontal: convert(2),
    borderRadius: convert(12),
    color: Colors.tabIconDefault
  },
  topTabActivated: {
    color: Colors.tabIconSelected
  },
});
