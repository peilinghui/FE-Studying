import { detail as topicDetail, reply, createTopic } from '../services/topic'
import { StackActions } from 'react-navigation';
import GlobalState from '../services/global-state';
import { ToastAndroid } from 'react-native';

export default {
  namespace: 'topic',
  state: {
    detail: null,
    selectedImages: [],
  },
  reducers: {
    updateTopicDetail(state: any, { detail }: any) {
      return { ...state, detail }
    },
    updateSelectedImages(state: any, { selected }: any) {
      return { ...state, selectedImages: selected }
    },
  },
  effects: {
    *detail({ topicId }: any, { call, put }: any) {
      const data = yield call(topicDetail, topicId)
      yield put({ type: 'updateTopicDetail', detail: data })
    },
    *fakeReply({ replyType, content, topicId, _id, elements, refId }: any, { select, put }: any) {
      const currentUser = yield select(({ auth: { detail } }: any) => detail)
      let message: any = {
        _id: _id || null,
        refId,
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
      if (replyType === 'image' || replyType === 'video') {
        message.elements = elements
      }
      yield put({ type: 'list.topicMessage/prependMessage', message, topicId })
    },
    *reply({ topicId, replyType, content, elements, callback, refresh = false }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { detail } }: any) => detail)
      const refId = Math.floor(Math.random() * 1000) + 1
      if (replyType === 'text' || replyType === 'image' || replyType === 'video') {
        GlobalState.put('message.sentByMyself', true)
      }
      if (replyType === 'text') {
        yield put({ type: 'fakeReply', replyType, content, elements, topicId, refId })
      }
      if (replyType === 'image' || replyType === 'video') {
        yield put({ type: 'app/showLoading' })
      }
      const message = yield call(reply, topicId, replyType, content, currentUser._id, elements)
      if (replyType === 'image' || replyType === 'video') {
        yield put({
          type: 'fakeReply',
          replyType,
          _id: message._id,
          content,
          elements: message.elements,
          topicId
        })
        yield put({ type: 'app/hideLoading' })
      }
      if (refresh) {
        yield put({ type: 'detail', topicId })
        yield put({ type: 'list.topicMessage/refresh', topicId })
      }
      if (callback) {
        yield call(callback, message, refId)
      }
    },
    *uploadReplyImages({ topicId }: any, { call, select, put }: any) {
      const selected = yield select(({ topic: { selectedImages } }: any) => selectedImages)
      yield put({
        type: 'file/upload',
        files: selected.map((uri: any) => ({ path: uri, mime: 'image/jpg' })),
        callbackAction: { type: 'topic/replyImages', topicId }
      })
    },
    *replyImages({ topicId, urls }: any, { put }: any) {
      for (let url of urls) {
        const { response: { _id } } = url
        yield put({
          type: 'reply',
          topicId,
          replyType: 'image',
          content: '[图片]',
          elements: { imageFileIds: [_id] }
        })
      }
    },
    *create({ realmId, content, tag = '默认话题', images = [], videos = [], callback }: any, { call, put, select, take }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const elements: any = {}
      let topicType = 'text'
      if (images.length > 0) {
        yield put({ type: 'file/upload', files: images })
        const { urls } = yield take('file/uploadSuccess')
        elements.imageFileIds = urls.map(({ response: { _id } }: any) => _id)
        topicType = 'image'
      }
      if (videos.length > 0) {
        yield put({ type: 'file/upload', files: videos })
        const { urls } = yield take('file/uploadSuccess')
        elements.videoFileIds = urls.map(({ response: { _id } }: any) => _id)
        topicType = 'video'
      }
      const { _id } = yield call(createTopic, realmId, topicType, content, tag, elements, currentUser._id)
      yield put(StackActions.replace({ routeName: 'TopicViewer', params: { topicId: _id } }))
      if (callback) {
        yield call(callback)
      }
    },
    *createNewTopic({ realmId, content, tag = '默认话题', selectedRealmId, selecteTopicId, callback }: any, { call, put, select, take }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const elements: any = {}
      let topicType = 'text'
      if (selectedRealmId) {
        elements.realmId = selectedRealmId
        topicType = 'realm'
      }
      if (selecteTopicId) {
        elements.topicId = selecteTopicId
        topicType = 'topic'
      }

      const { _id } = yield call(createTopic, realmId, topicType, content, tag, elements, currentUser._id)
      yield put(StackActions.replace({ routeName: 'TopicViewer', params: { topicId: _id } }))
      if (callback) {
        yield call(callback)
      }
    },
  },
  subscriptions: {},
}
