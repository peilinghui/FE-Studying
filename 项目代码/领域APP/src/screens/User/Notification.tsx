import React from 'react'
import { View, Text, Image, ActivityIndicator, FlatList, TouchableWithoutFeedback, } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { NavigationScreenProp, StackActions } from 'react-navigation'
import Header from '../../components/Header'
import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import { Dispatch } from 'redux';
import Colors from "../../constants/Colors";
import { combineAtrr } from "../../utils/functions";
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'
import FastImage from 'react-native-fast-image';
import moment from 'moment'
interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  refreshing: boolean,
  ListData: any,
  list: any,
  loading: boolean,
  hasNext: boolean,
  userId: string,
}

@(connect(
  ({
    'list.notification': { ListData, list, refreshing, loading, hasNext },
    auth: { detail: currentUser },
  }: any) => ({
    ListData,
    list,
    loading,
    refreshing,
    hasNext,
    userId: currentUser._id
  })) as any)
export default class Notification extends React.Component<Props> {

  componentDidMount() {
    const { dispatch, userId } = this.props;
    dispatch({ type: 'list.notification/fetch', userId: userId })
    Zhugeio.startTrack('通知页面');
  }


  componentWillUnmount() {
    this.props.dispatch({ type: 'list.notification/clear', })
    Zhugeio.endTrack('通知页面', {});
  }

  handleLoadMore = () => {
    if (this.props.loading) return

    if (this.props.ListData.length == 0) {
      return
    }

    if (!this.props.hasNext) {
      return
    }

    this.props.dispatch({ type: 'list.notification/next', userId: this.props.userId })
  }

  renderFooter = () => {
    return (
      <View style={{ width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', }}>
        {this.props.loading && <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />}
        {!this.props.hasNext && <Text style={{ color: Colors.darkGray }}>- 完 - </Text>}
      </View>
    )
  }

  _renderItemContent = (item: any, dispatch: any) => {
    const { navigation } = this.props
    switch (item.type) {
      case 'follower':
        const { follower: { user }, updatedAt } = item
        return (
          <TouchableWithoutFeedback onPress={() => {
            navigation.push('UserViewer', {
              userId: user._id
            })
          }}>
            <View style={{ flexDirection: 'row' }}>
              <Avatar user={user} size={convert(40)} />
              <View style={{ marginLeft: convert(12) }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text numberOfLines={1} style={{ color: '#000' }}>{user && user.profile.nickname}</Text>
                  <Text style={{
                    fontSize: convert(10),
                    color: Colors.darkGray,
                    marginLeft: convert(10),
                    textAlignVertical: 'bottom'
                  }}>
                    {moment().from(updatedAt).replace('内', '前')}
                  </Text>
                </View>
                <Text style={{marginTop:convert(7)}}>开始关注你了！</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )
      case 'user_figure':
        const { userFigure: { name, event: { type, fromUser } } } = item
        return (
          <TouchableWithoutFeedback onPress={() => {
            navigation.push('UserViewer', {
              userId: fromUser._id
            })
          }}>
            <View style={{ flexDirection: 'row' }}>
              <Avatar user={fromUser} size={convert(40)} />
              <View style={{ marginLeft: convert(12) }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text numberOfLines={1} style={{ color: '#000' }}>{fromUser && fromUser.profile.nickname}</Text>
                  <Text style={{
                    fontSize: convert(10),
                    color: Colors.darkGray,
                    marginLeft: convert(10),
                    textAlignVertical: 'bottom'
                  }}>
                    {moment().from(updatedAt).replace('内', '前')}
                  </Text>
                </View>
                <Text style={{ marginTop: convert(7) }}>{type === 'agreed' ? '认同' : '新建'}了你的形象标签：{name}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )
      case 'realm_event':
        const { realm: { event: { type: realmEventType, ofRealm } } } = item
        const { coverImage, title } = ofRealm
        return (
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.push('RealmViewer', {
                realmId: item.realm._id,
                isMember: true
              })
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <FastImage
                source={{ uri: coverImage.url }}
                style={{ width: convert(40), height: convert(40), borderRadius: convert(5) }}
              />
              <View style={{  marginLeft: convert(12) }}>       
                <View style={{ flexDirection: 'row' }}>
                  <Text>{title}</Text>
                  <Text style={{
                    fontSize: convert(10),
                    color: Colors.darkGray,
                    marginLeft: convert(10),
                    textAlignVertical: 'bottom'
                  }}>
                    {moment().from(updatedAt).replace('内', '前')}
                  </Text>
                </View>
                <Text style={{ marginTop: convert(7) }}>{realmEventType === 'activated'
                  ? '[' + title + ']'+ '领域已被激活'
                  : '领域不足4位成员，需要重新激活才可发现'}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        );
      case 'realm_join_request':
        const { _id: notificationId, realm: { joinRequest: {
          fromUser: joinRequestFromUser,
          ofRealm: { title: joinRequestRealmTitle, creator },
          status,
        } }, toUser } = item

        return (
          <TouchableWithoutFeedback onPress={() => {
            navigation.push('UserViewer', {
              userId: joinRequestFromUser._id
            })
          }}>
            <View style={{ flexDirection: 'row' }}>
              <Avatar user={joinRequestFromUser} size={convert(40)} />
              <View
                style={{
                  marginLeft: convert(12),
                  flexDirection: 'row',
                  // alignItems: 'center'
                }}>
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text numberOfLines={1} style={{ color: '#000' }}>{joinRequestFromUser && joinRequestFromUser.profile.nickname}</Text>
                    <Text style={{
                      fontSize: convert(10),
                      color: Colors.darkGray,
                      marginLeft: convert(10),
                      textAlignVertical: 'bottom'
                    }}>
                      {moment().from(updatedAt).replace('内', '前')}
                    </Text>
                  </View>
                  <Text style={{ marginTop: convert(7) }}>{toUser === creator
                    ? `向你申请加入「${joinRequestRealmTitle}」`
                    : `同意了你加入「${joinRequestRealmTitle}」的请求`}</Text>
                </View>
                {toUser === creator && <Button
                  style={{ marginLeft: convert(25), alignSelf: 'flex-end', marginRight: convert(5), marginTop: convert(3) }}
                  onPress={() => {
                    if (status === 'accepted') {
                      dispatch(StackActions.push({
                        routeName: 'UserViewer',
                        params: { userId: joinRequestFromUser._id }
                      }))
                    } else {
                      dispatch({
                        type: 'realm/processJoinRequest',
                        notificationId,
                        decision: 'accepted',
                        callback: () => dispatch({ type: 'list.notification/refresh', userId: this.props.userId }),
                      })
                    }
                  }}
                >{status === 'accepted' ? '已通过' : '同意'}</Button>}
              </View>
            </View>
          </TouchableWithoutFeedback>
        )
      default:
        return null
    }
  }

  render() {
    const { dispatch, refreshing, list, ListData, userId } = this.props;
    const data = combineAtrr(list, ListData);
    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <Header>
          <Text>通知</Text>
        </Header>
        <FlatList
          // contentContainerStyle={{ paddingTop: convert(10) }}
          refreshing={refreshing}
          onRefresh={() => dispatch({ type: 'list.notification/refresh', userId: userId })}
          data={data}
          keyExtractor={(item, index) => (index + '')}
          onEndReached={this.handleLoadMore}
          renderItem={({ item }: { item: any }) => {
            return (
              <View style={{ paddingHorizontal: convert(15) }}>
                <Text style={{ fontSize: convert(15), fontWeight: 'bold', marginVertical: convert(4) }}>{item.readText}</Text>
                {this._renderItemContent(item, dispatch)}
              </View>
            )
          }}
          ListEmptyComponent={
            <View style={{ paddingTop: convert(26) }}>
              <Text
                style={{
                  fontSize: convert(20),
                  color: '#ccc',
                  alignSelf: 'center'
                }}
              >
                还没有通知！
						  </Text>
            </View>
          }
          ListHeaderComponent={<View />}
          ListFooterComponent={() => this.renderFooter()}
          automaticallyAdjustContentInsets={false}
        />
      </View>

    )

  }
}
