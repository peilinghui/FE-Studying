import { Platform } from 'react-native'
import { createAppContainer, createStackNavigator } from 'react-navigation'
import { fromRight } from 'react-navigation-transitions'
import TabRouter from './TabRouter'
import RealmViewerScreen from '../screens/Realm/RealmViewer'
import TopicViewerScreen from '../screens/Topic/TopViewerNew'
import TopicSetting from '../screens/Topic/TopicSetting';
import TopicCreatorScreen from '../screens/Topic/TopicCreator'
import RealmCreatorScreen from '../screens/Realm/RealmCreator'
import ModifyRealmScreen from '../screens/Realm/ModifyRealm';
import UserViewerScreen from '../screens/User/UserViewer'
import VideosViewerScreen from '../screens/video/VideosViewer';
import NewCreate from "../screens/Realm/NewCreate";
import CoffeeCreate from '../screens/Realm/CoffeeCreate';
import Agree from '../screens/User/Agree'
import Follower from '../screens/User/Follower'
import Followee from '../screens/User/Followee'
import RealmCreateFinish from '../screens/Realm/CreateFinish'
import ShareRealm from '../screens/Realm/ShareRealmNew';
import ShareLongPic from '../screens/Topic/ShareLongPic';
import ChatList from '../screens/Chat/List'
import ChatDetail from '../screens/Chat/Detail'
import Notification from '../screens/User/Notification'
import Category from '../screens/Category'
import Search from '../screens/Search'
import SearchUser from '../screens/Search/User'
import Setting from '../screens/Setting'
import FieldEdit from '../screens/Setting/FieldEdit'
import Story from "../screens/Realm/Story";
import LinkModal from '../components/Modal/LinkModal';
import Wallet from '../screens/User/Wallet';
import FriendView from '../screens/Home/FriendView';
import MayFriends from "../screens/Chat/MayFriends";
import QRScannerViewScreen from '../screens/Chat/QRScannerView';

export default createAppContainer(createStackNavigator({
  MainTabs: TabRouter,
  RealmViewer: RealmViewerScreen,
  RealmCreator: RealmCreatorScreen,
  ModifyRealm: ModifyRealmScreen,
  TopicViewer: TopicViewerScreen,
  TopicSetting: TopicSetting,
  TopicCreator: TopicCreatorScreen,
  UserViewer: UserViewerScreen,
  VideosViewer: VideosViewerScreen,
  FriendView,
  CoffeeCreate,
  NewCreate,
	Story,
  Agree,
  Follower,
  Followee,
  Notification,
  RealmCreateFinish,
  ShareRealm,
  ShareLongPic,
  ChatList,
  ChatDetail,
  Category,
  Search,
  SearchUser,
  Setting,
  FieldEdit,
  LinkModal,
  Wallet,
  MayFriends,
  QRScannerViewScreen
}, {
  initialRouteName: 'MainTabs',
  headerMode: 'none',
  headerBackTitleVisible: false,
  transitionConfig: Platform.OS === 'android' ? () => fromRight() : undefined
}))
