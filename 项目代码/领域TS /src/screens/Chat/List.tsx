import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { NavigationScreenProps, StackActions } from 'react-navigation'
import ChatCard from '../../components/ChatCard'
import Colors from '../../constants/Colors'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { objectHash } from '../../utils/functions'
import { connect } from 'react-redux'
import Header from '../../components/Header';
import Zhugeio from 'react-native-plugin-zhugeio'

interface Props extends NavigationScreenProps {
  dispatch: Function
  userChats: any
  joinedTopics: any
  refreshing: boolean
  loading: boolean
  hasNext: boolean
}

interface State {
  currentTabIndex: number;
}

@(connect(({ chat: { userChats } }: any) => ({ userChats })) as any)
export default class extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      currentTabIndex: 0,
    }
  }

  componentDidMount(){
    Zhugeio.startTrack('私信页面');
  }

  componentWillUnmount(){
    Zhugeio.endTrack('私信页面',{});
  }

  _onRefreshTopic = () => this.props.dispatch({ type: 'list.joinedTopic/refresh' })

  loadMoreTopics = () => {

    if (this.props.loading) return;

    if (this.props.joinedTopics.length == 0) {
      return;
    }

    if (!this.props.hasNext) {
      return;
    }
    this.props.dispatch({ type: 'list.joinedTopic/next' })
  }

  renderFooter = () => {
    return (
      <View style={{ width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', }}>
        {this.props.loading && <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />}
        {!this.props.hasNext && <Text style={{ color: Colors.darkGray }}>- 完 -</Text>}
      </View>
    );
  };

  render() {
    const { dispatch, userChats } = this.props
    return (
      <View style={{ marginTop: getStatusBarHeight(true), flex: 1 }}>
        <Header><Text>私信</Text></Header>
        <FlatList
          style={{ flex: 1 }}
          bounces={true}
          data={userChats}
          keyExtractor={(item, index) => objectHash(item)}
          renderItem={({ item }: { item: any }) => (
            <ChatCard
              chat={item}
              onPress={() => {
                dispatch({ type: 'chat/chat', chat: item })
                dispatch(StackActions.push({ routeName: 'ChatDetail' }))
              }}
            />
          )}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray
  },
  topTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: getStatusBarHeight(true),
    height: 50 + getStatusBarHeight(true),
    backgroundColor: 'white'
  },
  topTab: {
    fontSize: 22,
    lineHeight: 50,
    fontWeight: 'bold',
    marginRight: 5,
    paddingHorizontal: 2,
    borderRadius: 12,
    color: Colors.tabIconDefault
  },
  topTabActivated: {
    color: Colors.tabIconSelected
  }
})
