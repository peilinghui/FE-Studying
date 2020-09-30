import React, { Component } from 'react'
import { BackHandler, Platform, PushNotificationIOS, AppState, AppStateStatus, StatusBar, ToastAndroid } from 'react-native'
import { NavigationActions, createStackNavigator } from 'react-navigation'
import {
  createReduxContainer,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers'
import { connect } from 'react-redux'
import Loading from './screens/Loading'
import AppRouter from './routes/AppRouter'
import AuthRouter from './routes/AuthRouter'
import { AuthState } from './models/auth'
import MobileLogin from './screens/Auth/MobileLogin'
import RecommendUser from "./screens/Auth/RecommendUser";
import RecommendRealm from './screens/Auth/RecommendRealm';
import Loader from './components/Loader';
import { getMobileApps } from './services/feature';
import Updater from './components/Modal/Updater';
import moonstack from './moonstack';
import RNUpdate from 'react-native-update-app';
import Colors from './constants/Colors';

const { version: currentVersion } = require('../package.json')

const AppNavigator = createStackNavigator({
  Main: { screen: AppRouter },
  Login: { screen: AuthRouter },
  MobileLogin,
  RecommendUser,
  RecommendRealm,
},
  {
    mode: 'modal',
    headerMode: 'none',
  })

export const routerReducer = createNavigationReducer(AppNavigator)

interface rootState {
  router: Object,
}

export const routerMiddleware = createReactNavigationReduxMiddleware(
  (state: rootState) => state.router,
)

const App = createReduxContainer(AppNavigator)

function getActiveRouteName(navigationState: any): any {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  if (route.routes) {
    return getActiveRouteName(route)
  }
  return route.routeName
}

interface Props {
  dispatch: Function
  auth: AuthState
  router: Object
  loading: boolean
}

interface State {
  appState: AppStateStatus
  showUpdater: boolean
  nextVersion: any
}

@(connect(({ app: { loading }, auth, router }: any) => ({ loading, auth, router })) as any)
class Router extends Component<Props, State> {
  static defaultProps: Props

  constructor(props: Props) {
    super(props)
    this.state = {
      appState: AppState.currentState,
      showUpdater: false,
      nextVersion: {}
    }
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backHandle)
  
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
    BackHandler.removeEventListener('hardwareBackPress', this.backHandle)
    PushNotificationIOS.removeEventListener('register', () => {
    })
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
    this.checkVersion()
    moonstack.Features.Reference.put('app', this)
   
  }

  _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (Platform.OS === 'android') {
        // Fix android statusbar bug
        StatusBar.setTranslucent(true)
      }
    }
    this.setState({ appState: nextAppState })
  }

  backHandle = () => {
    const currentScreen = getActiveRouteName(this.props.router)
    if (currentScreen === 'Login') {
      return true
    }

    if (
      ![
        'Home',
        'RecommendUser',
        'RecommendRealm',
        'RealmCreateFinish'
      ].includes(currentScreen)
    ) {
      this.props.dispatch(NavigationActions.back())
    }
    if (
      [
        'Realm',
        'Discover',
        'Discussion',
        'Personal'
      ].includes(currentScreen)
    ) {
      return false
    }
    return true
  }

  checkVersion = async () => {
    const data = await getMobileApps()
    if (currentVersion !== data.android.version) {
      this.setState({
        showUpdater: true,
        nextVersion: data.android
      })
    }
  }

  onBeforeStart = async () => {
    // 在这里可以发请求，用promise返回结果
    const data = await getMobileApps()
    return {
      "version": data.android.version,
      "filename": "realm.apk",
      "url": data.android.downloadUrl,
      "desc": data.android.intro.split('\n'),
    }
  }

  show(data: any) {
    ToastAndroid.show(data, ToastAndroid.SHORT)
  }

  render() {
    const { auth, dispatch, router, loading } = this.props
    const { showUpdater, nextVersion } = this.state
    if (auth.loading) return <Loading />

    return (
      <>
        <Loader loading={loading}></Loader> 
         {/* <Updater
          app={this}
          visible={true}
          next={nextVersion}
        ></Updater> */}
        
        <RNUpdate
          onBeforeStart={this.onBeforeStart}
          progressBarColor={Colors.blue}
          bannerImage={require('./assets/update.png')}  // 选填，换升级弹框图片
        />
        <App dispatch={dispatch} state={router} /> 
      </>
    )
  }
}

export default Router
