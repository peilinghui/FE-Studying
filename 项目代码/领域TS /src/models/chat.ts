import { userChats, getBranches, addBranch, getMessages, addMessage, ensureChat } from '../services/chat'
import _ from 'lodash';

export default {
  namespace: 'chat',
  state: {
    userChats: [],
    chat: {},
    branches: [],
    selectedBranch: {},
    messages: [],
  },
  reducers: {
    updateUserChats(state: any, { userChats }: any) {
      return { ...state, userChats }
    },
    updateChat(state: any, { chat }: any) {
      return { ...state, chat }
    },
    updateBranches(state: any, { branches }: any) {
      return { ...state, branches }
    },
    updateSelectedBranch(state: any, { branch }: any) {
      return { ...state, selectedBranch: branch }
    },
    updateMessages(state: any, { messages }: any) {
      return { ...state, messages }
    },
    appendMessage(state: any, { message }: any) {
      return { ...state, messages: [...state.messages, message] }
    },
    prependMessage(state: any, { message }: any) {
      return { ...state, messages: [message, ...state.messages] }
    }
  },
  effects: {
    *receiveMessage({ message }: any, { put, select }: any) {
      const { chat, content, createdAt } = message
      const [selectedBranch, branches, userChats] = yield select(({ chat: { selectedBranch, branches, userChats } }: any) => [selectedBranch, branches, userChats])
      const selectedBranchIndex = branches.findIndex(({ _id }: any) => _id === chat._id)
      const chatIndex = userChats.findIndex(({ _id }: any) => _id === chat.parent)
      userChats[chatIndex] = {
        ...userChats[chatIndex],
        lastMsgContent: content,
        lastMsgAt: createdAt,
      }
      yield put({ type: 'updateUserChats', userChats: [...userChats] })
      branches[selectedBranchIndex] = {
        ...branches[selectedBranchIndex],
        statistics: {
          ...(branches[selectedBranchIndex] ? branches[selectedBranchIndex]['statistics'] : {}),
          numOfMessages: _.get(branches, 'selectedBranchIndex.statistics.numOfMessages') + 1,
        },
        lastMessage: message,
        lastMsgContent: content,
        lastMsgAt: createdAt,
      }
      yield put({ type: 'updateBranches', branches: [...branches] })
      if (chat._id === selectedBranch._id) {
        yield put({ type: 'prependMessage', message })
      }
    },
    *chat({ chat, callback }: any, { call, put }: any) {
      yield put({ type: 'updateChat', chat })
      const branches = yield call(getBranches, chat._id)
      yield put({ type: 'updateBranches', branches })
      yield put({ type: 'changeBranch', branch: branches[0] })
      if (callback) {
        yield call(callback)
      }
    },
    *changeBranch({ branch }: any, { put }: any) {
      yield put({ type: 'updateSelectedBranch', branch })
      yield put({ type: 'refreshMessages' })
    },
    *refreshMessages({ reset = true }: any, { call, put, select }: any) {
      const branch = yield select(({ chat: { selectedBranch } }: any) => selectedBranch)
      if (reset) {
        yield put({ type: 'updateMessages', messages: [] })
      }
      const messages = yield call(getMessages, branch._id)
      yield put({ type: 'updateMessages', messages })
    },
    *addBranch({ branch }: any, { put, call, select }: any) {
      const chat = yield select(({ chat: { chat } }: any) => chat)
      const newBranch = yield call(addBranch, chat._id, { tags: [{ name: branch, weight: 1 }] })
      yield put({ type: 'changeBranch', branch: newBranch })
      const branches = yield call(getBranches, chat._id)
      yield put({ type: 'updateBranches', branches })
    },
    *ensureChat({ userId, callback }: any, { put, call, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const chat = yield call(ensureChat, currentUser._id, userId)
      const data = yield call(userChats, currentUser._id)
      yield put({ type: 'updateUserChats', userChats: data })
      if (callback) {
        yield call(callback, chat)
      }
    },
    *replyImages({ images, callback }: any, { put, take, call }: any) {
      yield put({ type: 'file/upload', files: images })
      const { urls } = yield take('file/uploadSuccess')
      for (let url of urls) {
        const { response: { _id } } = url
        yield put({
          type: 'reply',
          replyType: 'image',
          content: '[图片]',
          elements: { imageFileIds: [_id] },
          refresh: false
        })
      }
      yield put({ type: 'refreshMessages' })
      if (callback) {
        yield call(callback);
      }
    },
    *reply({ replyType, content, elements, refresh = true, callback }: any, { call, put, select }: any) {
      const [currentUser, branch] = yield select(({ auth: { detail }, chat: { selectedBranch } }: any) => [detail, selectedBranch])
      let message: any
      message = {
        _id: null,
        type: replyType,
        content,
        statistics: { numOfReceivedAgrees: 0 },
        fromUser: {
          _id: currentUser._id,
          profile: {
            nickname: currentUser.profile.nickname,
            avatar: currentUser.profile.avatar
          }
        },
        createdAt: (new Date()).toISOString(),
      }
      if (replyType === 'reply') {
        message.elements = { message: { content } }
      }
      yield put({ type: 'prependMessage', message })
      yield call(addMessage, branch._id, replyType, content, currentUser._id, elements)
      if (refresh) {
        yield put({ type: 'refreshMessages', reset: false })
      }
      if (callback) {
        yield call(callback)
      }
    },
    *loadUserChats(action: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const data = yield call(userChats, currentUser._id)
      yield put({ type: 'updateUserChats', userChats: data })
    },
    userWatcher: [function* ({ take, put }: any) {
      while (true) {
        yield take('auth/loginSuccess')
        yield put({ type: 'loadUserChats' })
      }
    }, { type: 'watcher' }],
  },
  subscriptions: {},
}
