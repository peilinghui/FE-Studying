
import React from 'react'
import _ from 'lodash';
import { View, ActivityIndicator, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import Header from '../../components/Header'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { search as searchUser, getFriends } from '../../services/user'
import { getRecommendUser } from '../../services/recommendUser'
import { connect } from 'react-redux'
import { StackActions } from 'react-navigation'
import { Dispatch } from 'redux'
import Avatar from '../../components/Avatar'
import Button from '../../components/Button';
import { objectHash } from '../../utils/functions';
import { convert, winHeight, winWidth, statusBarHeight } from '../../utils/ratio';
import Colors from '../../constants/Colors';

type Props = {
  dispatch: Dispatch<any>
  user: any
}

type State = {
  users: any[] | null
  friends: any[]
  hasNext: boolean;
  offset: number;
  isBusy: boolean
  limit: number
}

@(connect(({ auth: { detail } }: any) => ({ user: detail })) as any)
export default class FriendViewerScreen extends React.Component<Props, State> {


  constructor(props: Props) {
    super(props);
    this.state = {
      users: null,
      friends: [],
      hasNext: true,
      offset: 0,
      isBusy: false,
      limit: 40,
    }
  }

  componentDidMount() {
    this.mayFriend()
  }


  mayFriend = async () => {
    const { isBusy, hasNext, offset, limit } = this.state
    const { user } = this.props
    if (isBusy || !hasNext) {
      return
    }

    this.setState({ isBusy: true })

    const members = await getFriends(user._id, offset, limit)

    const recommendUser = await getRecommendUser(user._id, 0, 10)
    this.setState({ friends: this.state.friends.concat(members.data), users: recommendUser })

    if (members.data.length < 40) {
      this.setState({ hasNext: false, isBusy: false, });
    } else {
      this.setState({ offset: offset + 40, isBusy: false });
    }
  }

  _renderFooter = () => {
    const { isBusy } = this.state
    if (isBusy) {
      return (
        <View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
          <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />
        </View>
      )
    }
    return (
      <View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
        <Text style={{ color: Colors.darkGray }}>- 完 - </Text>
      </View>
    );
  }

  //上拉加载更多    
  _fetchMoreData = () => {
    this.mayFriend()
  }

  render() {
    const { dispatch } = this.props
    const { friends, users } = this.state
    const { width } = Dimensions.get('window')
    return (
      <View style={{ flex: 1, paddingTop: getStatusBarHeight(true) }}>
        <Header><Text style={{ fontSize: convert(15), color: '#000', fontWeight: 'bold' }}>好友</Text></Header>
        {users &&
          <View style={{ marginTop: convert(20), }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: convert(16), justifyContent: 'space-between' }}>
              <Text style={{ fontSize: convert(20), color: '#000' }}>你可能认识</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => dispatch(StackActions.push({
                  routeName: 'MayFriends',
                }))}
              >
                <Text style={{ color: Colors.blue, fontSize: convert(15), marginTop: convert(5) }}>查看全部 ></Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users}
              horizontal
              ItemSeparatorComponent={() => <View style={{ width: convert(20) }} />}
              ListEmptyComponent={() =>
                <View style={{ paddingHorizontal: convert(16), flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>没有找到用户</Text>
                </View>
              }
              keyExtractor={(item, index) => objectHash(item)}
              renderItem={({ item }: any) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', width: width - convert(80), marginVertical: convert(10), marginHorizontal: convert(16), }}>
                  <Avatar
                    user={item.user}
                    size={convert(40)}
                    onPress={() => {
                      dispatch(StackActions.push({
                        routeName: 'UserViewer',
                        params: { userId: item.user._id },
                      }))
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginLeft: convert(10),
                      paddingVertical: convert(5),
                    }}
                  >
                    <View>
                      <Text style={{ color: '#000' }}>{_.get(item, 'user.profile.nickname')}</Text>
                      <Text>{_.get(item, 'computed.userInfo.numOfCommonFriends') || 0}个共同好友</Text>
                    </View>
                    <Button
                      onPress={() => dispatch(StackActions.push({
                        routeName: 'UserViewer',
                        params: { userId: item.user._id },
                      }))}
                    >查看</Button>
                  </View>
                </View>
              )}
            />
          </View>
        }

        <View>
          <Text style={{ marginTop: convert(30), marginBottom: convert(10), paddingHorizontal: convert(16), fontSize: convert(20), color: '#000' }}>好友</Text>
          <FlatList
            style={{ maxHeight: winHeight - convert(250) - statusBarHeight }}
            contentContainerStyle={{ paddingBottom: convert(20) }}
            ItemSeparatorComponent={() => <View style={{ height: convert(20) }} />}
            ListEmptyComponent={() =>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>快去添加好友！</Text>
              </View>
            }
            data={friends}
            ListFooterComponent={() => this._renderFooter()}
            onEndReached={() => this._fetchMoreData()}
            onEndReachedThreshold={10}
            keyExtractor={(item, index) => objectHash(item)}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flexDirection: 'row',
                  alignItems: 'center',
                  width: winWidth,
                  marginHorizontal: convert(16)
                }}
                onPress={() => {
                  dispatch(StackActions.push({
                    routeName: 'UserViewer',
                    params: { userId: item._id },
                  }))
                }}
              >
                <Avatar
                  user={item}
                  size={convert(40)}
                  onPress={() => {
                    dispatch(StackActions.push({
                      routeName: 'UserViewer',
                      params: { userId: item._id },
                    }))
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: convert(10),
                  }}
                >
                  <View>
                    <Text style={{ color: '#000' }}>{_.get(item, 'profile.nickname')}</Text>
                    <Text>{_.get(item, 'computed.userInfo.numOfCommonFriends') || 0} 个共同好友</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    )
  }
}