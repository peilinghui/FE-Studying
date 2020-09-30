import { agree as messageAgree, recall as messageRecall } from '../services/message'
import _ from 'lodash'
import GlobalState from '../services/global-state';
import { ToastAndroid } from 'react-native';

export default {
  namespace: 'message',
  state: {},
  reducers: {},
  effects: {
    *agree({ message }: any, { call, put, select, race, take }: any) {
      const [currentUser, topics] = yield select(
        ({ auth: { user }, 'list.topicMessage': { topics } }: any) => [user, topics])
      const { _id: messageId, topic: topicId } = message;
      const messages = topics[topicId].messages
      const updateItem: any = _.find(messages, { _id: messageId })
      updateItem.statistics.numOfReceivedAgrees++
      updateItem.computed.userInfo.isAgreed = true
      GlobalState.put('agree.sentByMyself', true)
      yield put({ type: 'list.topicMessage/update', messages, topicId })
      yield call(messageAgree, messageId, currentUser._id)
    },
    *recall({ message, refId, callback }: any, { call, put, select, race, take }: any) {
      const [currentUser, topics] = yield select(
        ({ auth: { user }, 'list.topicMessage': { topics } }: any) => [user, topics])
      const { _id: messageId, topic: topicId } = message;
      yield call(messageRecall, messageId, currentUser._id)
      const messages = _.cloneDeep(topics[topicId].messages)
      if (refId) {
        const updateItem: any = _.find(messages, { refId })
        updateItem.content = "消息已被撤回"
      } else {
        const updateItem: any = _.find(messages, { _id: messageId })
        updateItem.content = "消息已被撤回"
      }
      if (callback) {
        yield call(callback)
      }
      yield put({ type: 'list.topicMessage/update', messages, topicId })
    },
    *receiveAgree({ message: agree }: any, { put, select }: any) {
      const [currentUser, topics] = yield select(({
        auth: { user },
        'list.topicMessage': { topics }
      }: any) => [user, topics])
      const sentByMyself = GlobalState.get('agree.sentByMyself')
      if (sentByMyself && agree.fromUser._id === currentUser._id) {
        GlobalState.destory('agree.sentByMyself')
      } else {
        const { ofTopic: topicId } = agree;
        const messages = topics[topicId].messages
        const updateItem: any = _.find(messages, { _id: agree.ofMessage })
        if (updateItem) {
          if (agree.fromUser._id === currentUser._id) {
            updateItem.computed.userInfo.isAgreed = true
            updateItem.statistics.numOfReceivedAgrees++
          } else {
            updateItem.statistics.numOfReceivedAgrees++
          }
        }
        yield put({ type: 'list.topicMessage/update', messages, topicId })
      }
    },
    *receiveMessage({ message }: any, { put, select }: any) {
      const [currentUser, topics] = yield select(({
        auth: { user },
        'list.topicMessage': { topics }
      }: any) => [user, topics])
      const sentByMyself = GlobalState.get('message.sentByMyself')
      const topicId = message.topic
      if (sentByMyself && message.fromUser._id === currentUser._id) {
        GlobalState.destory('message.sentByMyself')
      } else if (topics[topicId].hasNext) {

      } else {
        yield put({ type: 'list.topicMessage/prependMessage', message, topicId })
      }
    },
  },
  subscriptions: {},
}
