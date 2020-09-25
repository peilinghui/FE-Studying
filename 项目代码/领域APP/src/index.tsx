import React from 'react'
import { AppRegistry, YellowBox } from 'react-native'
import dva from './utils/dva'
import Router, { routerMiddleware, routerReducer } from './router'
import appModel from './models/app'
import authModel from './models/auth'
import realmModel from './models/realm'
import userModel from './models/user'
import topicModel from './models/topic'
import chatModel from './models/chat'
import messageModel from './models/message'
import realmListModel from './models/list/realm'
import realmTopicListModel from './models/list/realmTopic'
import joinedTopicListModel from './models/list/joinedTopic'
import topicMessageListModel from './models/list/topicMessage'
import recommendedModel from './models/recommended'
import discoverModel from "./models/discoverNew";
import fileModel from './models/file'
import agreeModel from './models/list/agree';
import notificationModel from './models/list/notification';
import walletModel from './models/list/wallet';
import storyModel from './models/story'
import recommendUserModel from "./models/recommendUser";
import { name as appName } from '../app.json'
import * as WeChat from 'react-native-wechat'
import axios from 'axios'
import { API_SERVER } from './constants/API'
import {persistReducer, persistStore} from "redux-persist";
import {AsyncStorage as storage} from 'react-native';
const key = 'dav';

axios.defaults.baseURL = API_SERVER


axios.interceptors.request.use(cfg => {
  console.log('HttpUrl',cfg.url)
  console.log('HttpUrl params',cfg.params)
  return cfg;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
	console.log('HttpUrl',response.config.url)
	console.log('Response',response.data)
	
	return response;
}, error => {
	console.log(error)
	return Promise.reject(error);
});

WeChat.registerApp('wxee75c867edaf55ff')



function storageEnhancer(opts: { key?: string, storage?: any, whitelist?: string[] } = { key, storage }) {
	return (createStore: any) => (reducer: any, initialState: any, enhancer: any) => {
		const options = { key, storage, ...opts };
		const store = createStore(persistReducer(options, reducer), initialState, enhancer);
		const persistor = persistStore(store);
		return {...store, persistor };
	}
}

const app = dva({
  initialState: {},
  models: [appModel, authModel, realmModel, userModel, topicModel, chatModel, messageModel, realmListModel,
		recommendedModel,
		realmTopicListModel, joinedTopicListModel, fileModel, 
		discoverModel, 
		topicMessageListModel, agreeModel,notificationModel,
		storyModel, recommendUserModel, walletModel],

  extraReducers: { router: routerReducer },
	extraEnhancers: [
		storageEnhancer({
			whitelist: ['list.agree', 'list.notification' ]
		})
	],
  onAction: [routerMiddleware],
  onError(e: any) {
    console.log('onError', e)
    e.preventDefault()
  },
})


console.disableYellowBox = true;

YellowBox.ignoreWarnings([
  'Module RCTImagePickerManager requires',
]);

const StartApp = app.start(<Router />)

AppRegistry.registerComponent(appName, () => StartApp)
