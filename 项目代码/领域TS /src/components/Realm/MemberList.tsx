import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors';
import { connect } from 'react-redux'
import { winWidth, convert } from "../../utils/ratio";
import Avatar from '../../components/Avatar'
import { getRealmMembers } from '../../services/realm'
import Icon from 'react-native-vector-icons/Ionicons';
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler'
import FastImage from 'react-native-fast-image';
interface Props {
  currentUser: { _id: string },
  dispatch: Function,
  navigation: any,
  realm: any;
}

interface State {
  members: any[],
  hasNext: boolean;
  offset: number;
  isBusy: boolean
  error: any
}


const errorHandler = (e: any, isFatal: boolean) => {
  if (isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      `Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}   Please close the app and start again.`, [{
        text: 'OK',
      }]
    );
  } else {

  }
};

setJSExceptionHandler((error, isFatal) => {
  // 您可以捕获这些未处理的异常并执行诸如显示警报或弹出窗口之类的任务，执行清理甚至点击API以在关闭应用程序之前通知开发团队。
  Alert.alert(error.name, error.message, [{ text: 'OK' }])
}, true)

setJSExceptionHandler((error, isFatal) => {
  console.log('setJSExceptionHandler-->', error, isFatal);
  errorHandler(error, isFatal);
}, true);

@(connect(
  ({
    auth: { detail },
  }: any) => ({
    currentUser: detail,
  })) as any)

export default class MemberList extends React.Component<Props, State> {
  static defaultProps = {
    currentUser: {},
    dispatch: null,
  }
  static navigationOptions = {
    header: null
  };

  private realmId: any

  constructor(props: Props) {
    super(props);
    this.state = {
      members: [],
      hasNext: true,
      offset: 0,
      isBusy: false,
      error:null
    }
    this.realmId = this.props.navigation.getParam('realmId')
  }

  componentDidMount() {
    this.loadMembers()
  }

  componentDidCatch(error: any, info: any) {
    Alert.alert('1111')
    this.setState({
      error
    });
  }


  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }


  loadMembers = async () => {
    const { isBusy, hasNext, offset } = this.state
    if (isBusy || !hasNext) {
      return
    }

    this.setState({ isBusy: true })

    const members = await getRealmMembers(this.realmId, offset)

    this.setState({ members: this.state.members.concat(members) })

    if (members.length < 40) {
      this.setState({ hasNext: false, isBusy: false });
    } else {
      this.setState({ offset: offset + 40, isBusy: false });
    }

  }

  _renderRow(item: any, index: number, section: any) {
    const { dispatch, currentUser, navigation } = this.props

    if (section.type === 'influencer' || section.type === 'connector') {
      return (
        <TouchableWithoutFeedback
          // activeOpacity={0.7}
          key={index}
          onPress={() => {
            navigation.push('UserViewer', {
              userId: item.user._id
            })
          }}
        >
          <View style={{
            height: convert(76),
            width: winWidth - convert(32),
            backgroundColor: '#F8F8F8',
            flexDirection: 'row',
            borderRadius: convert(12),
            marginLeft: convert(16),
            marginRight: convert(16),
            marginTop: convert(15),
          }}>
            <View style={{
              maxWidth: winWidth - convert(160),
              justifyContent: 'center',
              marginLeft: convert(17),
            }}>
              <View style={{ flexDirection: 'row' }}>
                {_.get(item, 'user.profile') && <Text style={{ fontSize: convert(15), color: 'rgba(0,0,0,0.55)', fontWeight: 'bold', }}>{_.get(item, 'user.profile.nickname')}</Text>}
                <Text style={{ fontSize: convert(10), color: '#BBBBC5', marginTop: convert(8), marginLeft: convert(5) }}>{_.get(item, 'statistics.numOfJoinedTopics')}讨论-</Text>
                <Text style={{ fontSize: convert(10), color: '#BBBBC5', marginTop: convert(8) }}>{_.get(item, 'statistics.numOfReceivedAgrees')}赞同</Text>
              </View>
              {_.get(item, 'user.profile') && <Text style={{ fontSize: convert(11), color: '#bbbbc5', marginTop: convert(3) }} numberOfLines={2}>{_.get(item, 'user.profile.intro') ? _.get(item, 'user.profile.intro') : '暂无介绍'}</Text>}
            </View>
            <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
              <Avatar user={_.get(item, 'user')} size={convert(45)} />
              <Icon name='ios-arrow-forward' size={17} color='#ccc'
                style={{ marginLeft: convert(10), marginRight: convert(16) }} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    }
    return (
      <View style={styles.list}>
        {
          item.map((item: any, index: number) => this.renderExpenseItem(item, index))
        }
      </View>
    )
  }

  renderExpenseItem(item: any, index: any) {
    const { dispatch, navigation } = this.props
    return (
      <TouchableWithoutFeedback
        key={index}
        onPress={() => {
          navigation.push('UserViewer', {
            userId: _.get(item, 'user._id')
          })
        }}>
        <View style={styles.listCell}>
          <FastImage
            resizeMode={'cover'}
            style={{
              borderRadius:convert(20),
              width:convert(40),
              height: convert(40),
            }}
            source={{
              uri: _.get(item, 'user.profile.avatar.url') ||'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1559226178185&di=2ff6ee6b789680d913e13bad98a6f83f&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F69ad7a731f43d4b8729f1a2fbe65c43801ca0f033250-EV1vMf_fw658'
            }}
          />
          <Text numberOfLines={1} style={{ fontSize: convert(11), color: 'rgba(0,0,0,0.55)', marginTop: convert(13), fontWeight: 'bold', }}>{_.get(item, 'user.profile.nickname')}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _renderSectionHeader = (section: any) => {
    if (section.data.length > 0) {
      return (
        <View style={{ flex: 1, height: convert(50), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image source={section.type === 'influencer' ?
            require('../../assets/influencer.png') : section.type === 'connector' ?
              require('../../assets/connector.png') : null}
            style={{ width: convert(40), height: convert(45), marginLeft: convert(17) }} />
          <Text style={{
            fontSize: convert(18),
            // fontFamily: 'SFProText-Semibold',
            fontWeight: 'bold',
            color: '#000000',
            marginRight: convert(21)
          }}>{section.title}</Text>
        </View>
      );
    } else {
      return <View/>
    }
  };

  _renderFooter = () => {
    const { realm } = this.props
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
        <Text style={{ color: Colors.darkGray }}>- 共{_.get(realm, 'statistics.numOfMembers')}人 - </Text>
      </View>
    );
  }

  //上拉加载更多    
  _fetchMoreData = () => {
    this.loadMembers()
  }

  _keyExtractor = (index: any) => index;

  render() {

    const { dispatch } = this.props
    const { members } = this.state

    var influencer = members.filter(item => item.medal === 'influencer')
    var connector = members.filter(item => item.medal === 'connector')
    var general = _.difference(members, influencer, connector);
    // var general = members.filter(item => item.medal !== 'connector' || item.medal !== 'influencer')

    var sectionData = [
      { data: influencer, title: '影响者', type: 'influencer' },
      { data: connector, title: '连接者', type: 'connector' },
      { data: [general], title: '成员', type: 'member' },
    ]
    if (this.state.error) { // 如果页面崩溃，则显示下面的UI
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>
            {this.state.error && this.state.error.toString()}
          </Text>
        </View>
      );
    }


    return (
      <View style={styles.container}>
        <SectionList
          style={styles.scrollCon}
          contentContainerStyle={{ paddingTop: 10 }}
          sections={sectionData}
          stickySectionHeadersEnabled={false}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item, index, section }: { item: any, index: number, section: any }) => this._renderRow(item, index, section)}
          renderSectionHeader={({ section }: { section: any }) => this._renderSectionHeader(section)}
          ListFooterComponent={() => this._renderFooter()}
          onEndReached={() => this._fetchMoreData()}
          onEndReachedThreshold={0.5}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: 'white'
  },
  scrollCon: {
    backgroundColor: 'white',
    marginTop: convert(5),
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginLeft: convert(10)
  },
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    height: convert(90),
    marginLeft: convert(3),
    marginRight: convert(3),
    borderRadius: convert(12),
    width: (winWidth - convert(44)) / 4,
    backgroundColor: '#F8F8F8',
    marginTop: convert(10)
  }
});
