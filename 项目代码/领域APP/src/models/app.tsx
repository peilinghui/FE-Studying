import { eventChannel } from 'redux-saga'
import _ from 'lodash';
import React from 'react'
import { connect } from '../services/socket'
import PushService from "../services/push-notification"
import { Platform, DeviceEventEmitter, NativeModules, TouchableWithoutFeedback, TouchableOpacity, AsyncStorage, } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation';
import SnackBar from 'rn-snackbar';
import { convert, winWidth } from '../utils/ratio';
import { Text, View, Image } from 'react-native';
import Avatar from '../components/Avatar';
import Colors from '../constants/Colors';
import moonstack from '../moonstack';
import Router from '../router';
// import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'


export default {
  namespace: 'app',
  state: {
    loading: false
  },
  reducers: {
    updateState(state: any, { payload }: any) {
      return { ...state, ...payload }
    },
  },
  effects: {
    *showLoading({ }: any, { put }: any) {
      yield put({ type: 'updateState', payload: { loading: true } })
    },
    *hideLoading({ }: any, { put }: any) {
      yield put({ type: 'updateState', payload: { loading: false } })
    },
    *sub({ topicId }: any, { put }: any) {
      yield put({ type: 'sendMessage', event: 'sub', payload: topicId })
    },
    *unsub({ topicId }: any, { put }: any) {
      yield put({ type: 'sendMessage', event: 'unsub', payload: topicId })
    },
    *notification({ notification }: any, { put }: any) {   
      DeviceEventEmitter.emit('新通知', {});
      if (_.get(notification, 'action') && notification.action === 'com.atrealm.INNER_NOTI') {
        SnackBar.show('chatMessage', {
          style: { marginTop: convert(45), height: convert(66), width: winWidth - convert(40), marginLeft: convert(20), borderRadius: convert(10), },
          backgroundColor: 'rgba(0, 0, 0, .35)',
          textColor: 'white',
          position: 'top',
          duration: 3000,
          // isStatic: true,
          renderContent: () =>
            <TouchableOpacity
              onPress={() => {
                SnackBar.dismiss(() => {
                  const appRef = moonstack.Features.Reference.get('app') as Router

                  switch (notification.jumpType) {
                    case 'realmTopic':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'TopicViewer', params: { topicId: notification.topicId }
                      }))
                      break
                    case 'notifRealm':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'RealmViewer', params: { topicId: notification.realmId }
                      }))
                      break
                    case 'userChat':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'ChatList', params: { chatId: notification.chatId } 
                      }))
                      break
                    case 'notifAgree':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'Agree', params: { userId: notification.fromUser._id }
                      }))
                      break
                    case 'topicChat':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'TopicViewer', params: { topicId: notification.topicId }
                      }))
                      break
                    case 'notifUserFigure':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'UserViewer', params: { userId: notification.fromUser._id }
                      }))
                      break
                    case 'notifJoinRealmRequest':
                      appRef.props.dispatch(NavigationActions.navigate({
                        routeName: 'Notification', params: { userId: notification.userId }
                      }))
                      break
                    default:
                  }
                })
              }}
            >
              <View
                style={{ height: convert(58), width: winWidth - convert(40), marginTop: convert(10), flexDirection: 'row', marginLeft: convert(20) }}>
                <Avatar
                  user={_.get(notification, 'fromUser') || _.get(notification, 'creator') }
                  size={30}
                  style={{
                    marginVertical: convert(10),
                    backgroundColor: 'transparent'
                  }}
                />
                <View style={{ marginLeft: convert(10), maxWidth: winWidth - convert(60) }}>
                  <Text style={{ fontSize: convert(11), color: 'white' }}>{
                    notification.jumpType==='realmTopic'? '领域新讨论 - '+_.get(notification, 'title')
                      : notification.jumpType === 'notifRealm' ? '领域新通知'
                        : notification.jumpType === 'userChat' ?  '新私信'
                          : notification.jumpType === 'notifAgree' ? '新认同'
                            : notification.jumpType === 'topicChat' ? '讨论新回复'
                              : notification.jumpType === 'notifJoinRealmRequest' ?'请求加入领域' 
                                : notification.jumpType === 'notifUserFigure' ?'个人形象新通知' : '收到一个消息!'}</Text>
                  <Text style={{ fontSize: convert(12), color: 'white', marginTop: convert(6) }}>{_.get(notification, 'alert')}</Text>
                </View>
              </View>
              <View style={{ height: convert(8), justifyContent: 'center', width: winWidth - convert(40), alignItems: 'center' }}>
                <Image source={require('../assets/indicator.png')}
                  style={{ marginBottom: convert(6) }} />
              </View>
            </TouchableOpacity>
        })

      } else {
        switch (notification.jumpType) {
          case 'realmTopic':
            yield put(StackActions.push({ routeName: 'TopicViewer', params: { topicId: notification.topicId } }))
            break
          case 'notifRealm':
            yield put(StackActions.push({ routeName: 'RealmViewer', params: { realmId: notification.realmId } }))
            break
          case 'notifUser':
            yield put(StackActions.push({ routeName: 'UserViewer', params: { userId: notification.fromUser._id } }))
            break
          case 'userChat':
            yield put(StackActions.push({ routeName: 'ChatList', params: { chatId: notification.chatId } }))
            break
          case 'notifAgree':
            yield put(StackActions.push({ routeName: 'Agree', params: { userId: notification.fromUser._id } }))
            break
          case 'topicChat':
            yield put(StackActions.push({ routeName: 'TopicViewer', params: { topicId: notification.topicId } }))
            break
          case 'notifUserFigure':
            yield put(StackActions.push({ routeName: 'UserViewer', params: { userId: notification.fromUser._id } }))
            break
          case 'notifJoinRealmRequest':
            yield put(StackActions.push({ routeName: 'Notification', params: { userId: notification.userId } }))
            break

          default:
        }
      }
    },
    userWatcher: [function* ({ take, put, fork, select, call, cancel }: any) {
      while (true) {
        yield take('auth/loginSuccess')
        const [token, user] = yield select(({ auth: { token, user } }: any) => [token, user])
        const socket = yield call(connect, token, user._id)
        const task = yield fork(handleIO, socket);
        yield take('auth/logout')
        yield cancel(task)
        socket.disconnect()
      }
      function createSocketChannel(socket: SocketIOClient.Socket) {

        return eventChannel(emit => {
          const topicMessageHandler = (event: any) => {
            emit({ type: 'message/receiveMessage', message: JSON.parse(event) })
          }
          const chatMessageHandler = (event: any) => {
            DeviceEventEmitter.emit('新私信',{});
            emit({ type: 'chat/receiveMessage', message: JSON.parse(event) })
          }
          const agreeHandler = (event: any) => {
            DeviceEventEmitter.emit('收到新赞同',{ agreeCount:1});
            emit({ type: 'message/receiveAgree', message: JSON.parse(event) })
          }
          socket.on('topic_message', topicMessageHandler)
          socket.on('chat_message', chatMessageHandler)
          socket.on('agree', agreeHandler)
          const unsubscribe = () => {
            socket.off('topic_message', topicMessageHandler)
            socket.off('chat_message', chatMessageHandler)
            socket.off('agree', agreeHandler)
          }
          return unsubscribe
        })
      }
      function* read(socket: SocketIOClient.Socket) {
        const channel = yield call(createSocketChannel, socket);
        while (true) {
          let action = yield take(channel);
          yield put(action);
        }
      }
      function* write(socket: SocketIOClient.Socket) {
        while (true) {
          const { event, payload } = yield take('sendMessage')
          socket.emit(event, payload)
        }
      }
      function* handleIO(socket: SocketIOClient.Socket) {
        yield fork(read, socket);
        yield fork(write, socket);
      }
    }, { type: 'watcher' }],
    pushWatcher: [function* ({ take, select, call, put, fork, cancel }: any) {
      while (true) {
        yield take('auth/loginSuccess')
        const user = yield select(({ auth: { user } }: any) => user)
        if (Platform.OS === 'android') {
          yield call(PushService._an_saveInstallation, user._id)
          const task = yield fork(process);
          yield take('auth/logout')
          yield cancel(task)
        }
      }
      function createNotificationChannel() {
        return eventChannel(emit => {
          const AndroidPush = NativeModules.androidPushModule
          const onReveiceListener = DeviceEventEmitter.addListener(AndroidPush.ON_RECEIVE, (notification) => {
            emit({ type: 'notification', notification: JSON.parse(notification.data) })
          });
          const onCustomReceiveListener = DeviceEventEmitter.addListener(AndroidPush.ON_CUSTOM_RECEIVE, (notification) => {
            emit({ type: 'notification', notification: JSON.parse(notification.data) })
          });
          const unsubscribe = () => {
            onReveiceListener.remove()
            onCustomReceiveListener.remove()
          }
          return unsubscribe
        })
      }
      function* process() {
        const channel = yield call(createNotificationChannel);
        while (true) {
          let action = yield take(channel);
          yield put(action);
        }
      }
    }, { type: 'watcher' }]
  },

  subscriptions: {},
}
