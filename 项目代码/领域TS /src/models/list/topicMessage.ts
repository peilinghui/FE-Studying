import { topicMessages as loadTopicMessages } from "../../services/message"
import _ from 'lodash';

export default {
  namespace: 'list.topicMessage',
  state: {
    topics: {},
    limit: 40,
    cursorKey: 'createdAt',
  },
  reducers: {
    append(state: any, { messages, topicId }: any) {
      const topics = _.clone(state.topics)
      topics[topicId].messages = [...topics[topicId].messages, ...messages]
      topics[topicId].hasNext = messages.length === state.limit
      return {
        ...state,
        topics
      }
    },
    update(state: any, { messages, topicId }: any) {
      const topics = _.clone(state.topics)
      if (!topics[topicId]) {
        topics[topicId] = {}
      }
      topics[topicId].messages = messages;
      topics[topicId].hasNext = messages.length === state.limit
      return { ...state, topics }
    },
    updateCursorAtState(state: any, { cursorAt, topicId }: any) {
      const topics = state.topics
      topics[topicId].cursorAt = cursorAt;
      return { ...state, topics }
    },
    updateHasNext(state: any, { hasNext, topicId }: any) {
      const topics = state.topics
      topics[topicId].hasNext = hasNext;
      return { ...state, topics }
    }
  },
  effects: {
    *fetch({ action = 'append', topicId, callback }: any, { call, put, select }: any) {
      let [currentUser, limit, topics] = yield select(
        ({
          auth: { user },
          'list.topicMessage': { limit, topics },
        }: any) => ([
          user,
          limit,
          topics
        ]))
      if (!topics[topicId]) {
        topics[topicId] = {}
      }
      if (action === 'update') {
        topics[topicId].cursorAt = null
      }
      if (currentUser) {
        const messages = yield call(loadTopicMessages, topicId, currentUser._id,
          topics[topicId].cursorAt, limit)
        yield put({ type: action, messages, topicId })
        yield put({ type: 'updateCursorAt', topicId })
        if (callback) {
          yield call(callback, messages.length)
        }
      }
    },
    *prependMessage({ message, topicId, callback }: any, { put, call }: any) {
      yield put({ type: 'append', messages: [message], topicId })
      if (callback) {
        yield call(callback)
      }
    },
    *next({ type, topicId, ...rest }: any, { select, put }: any) {
      let topics = yield select(({ 'list.topicMessage': { topics } }: any) => topics)
      if (topics[topicId] && topics[topicId].hasNext) {
        yield put({ type: 'updateCursorAt', topicId })
        yield put({ type: 'fetch', topicId, ...rest })
      }
    },
    *updateCursorAt({ type, topicId }: any, { select, put }: any) {
      let [topics, cursorKey] = yield select(({
        'list.topicMessage': { topics, cursorKey }
      }: any) => [topics, cursorKey])
      if (topics[topicId].messages && topics[topicId].messages.length > 0) {
        const [{ [cursorKey]: cursorAt }] = topics[topicId].messages.slice(-1)
        yield put({ type: 'updateCursorAtState', topicId, cursorAt })
      }
    }
  },
}
