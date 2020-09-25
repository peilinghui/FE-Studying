import React from 'react'
import _ from 'lodash';
import { View, Text, TouchableOpacity, Image, FlatList, Linking, ToastAndroid, Alert,TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import TouchableIcon from '../../components/TouchableIcon'
import LinearGradient from 'react-native-linear-gradient';
import { NavigationScreenProps, StackActions } from 'react-navigation'
import Avatar from '../../components/Avatar';
import Colors from '../../constants/Colors';
import { getAccount } from '../../services/user';
import WithdrawModal from '../../components/Modal/Withdraw';
import { weChatPayWithdraw, IsAuthorizedByMiniProgram } from "../../services/feature";
import * as WeChat from 'react-native-wechat'
import FastImage from 'react-native-fast-image';

interface Props extends NavigationScreenProps {
  dispatch: Function
  currentUser: any;
  ListData: any,

}

interface State {
  data: any
  modal: string
  realName: string
  isAuthorized: boolean
}

@(connect(
  ({
    auth: { detail: currentUser },
    "list.getTransactions": { list: ListData }
  }: any) => ({ currentUser, ListData })
) as any)



export default class WalletScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }
  private flatList?: any;

  constructor(props: Props) {
    super(props)
    this.state = {
      data: {},
      modal: '',
      realName: '',
      isAuthorized: false
    }
  }

  async componentDidMount() {
    const { dispatch, currentUser } = this.props;
    const isAuthorizedData = await IsAuthorizedByMiniProgram(currentUser._id)
    const data = await getAccount(currentUser._id)
    this.setState({ data, isAuthorized: isAuthorizedData.isAuthorized })
    dispatch({ type: 'list.getTransactions/fetch', userId: currentUser._id, action: 'update' })
  }

  setModalVisible = (modal: string) => this.setState({ modal });

  handleLoadMore = () => {
    this.props.dispatch({
      type: 'list.getTransactions/next',
      action: 'append',
      callback: (len: number) => {
        if (len === 0) {
          this.flatList.keepScrollToEnd = false;
        }
      }
    })
  }

  _renderRow(item: any) {
    return (
      <View style={{
        flexDirection: 'row',
        marginLeft: convert(15),
        marginRight: convert(15),
        height: convert(65),
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', }}>
          {item.metadata.type === 'realm_creator_profit' ?
            <Avatar
              user={item.metadata.fromUser}
              size={convert(40)}
              style={{
                // marginRight: convert(10),
                // marginLeft: winWidth - convert(60)
              }}
              onPress={() => { }
                // this.onPressAvatar &&
                // this.onPressAvatar(_.get(this.props.realm, 'lastTopic.creator'))
              }
            /> :
            <FastImage source={item.metadata.type === 'withdraw' || item.metadata.type === 'add_balance' ? require('../../assets/withdraw.png') : require('../../assets/Corners.png')}
              style={{ width: convert(40), height: convert(40), borderRadius: convert(10) }}>
            </FastImage>}

          <View style={{ marginLeft: convert(10) }}>
            <Text style={{ fontSize: convert(17), color: '#000000' }}>
              {item.metadata.type === 'join_realm_payment' ? '加入领域支出'
                : item.metadata.type === 'withdraw' ? '提现到微信钱包'
                  : item.metadata.type === 'realm_creator_profit' ? _.get(item.metadata.fromUser, 'profile.nickname')
                    : _.get(item.metadata, 'description')
              }</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableIcon name={item.metadata.type === 'realm_creator_profit' || item.metadata.type === 'join_realm_payment' ? 'md-arrow-back' :
                item.metadata.type === 'withdraw' ? 'md-checkmark' : 'md-arrow-forward'} size={convert(15)} color='#8D8D8D'
                style={{ marginRight: convert(5), marginTop: convert(5) }}
                onPress={() => { }} />
              <Text style={{ fontSize: convert(16), color: '#8D8D8D' }}>
                {item.metadata.type === 'join_realm_payment' ? _.get(item.metadata, 'realm.title')
                  : item.metadata.type === 'realm_creator_profit' ? '加入领域-' + _.get(item.metadata, 'realm.title')
                    : item.metadata.type === 'withdraw' ? '提现成功' : _.get(item.metadata, 'description')}</Text>
            </View>
          </View>
        </View>
        <Text
          style={{
            fontSize: convert(17),
            color: item.metadata.type === 'realm_creator_profit' || item.metadata.type === 'add_balance' ? '#4CD964' : '#000000',
            marginVertical: convert(10)
          }}
        >¥ {item.amount}</Text>
      </View>
    )
  }


  render() {
    const { dispatch, navigation, currentUser, ListData, } = this.props
    const transactions = ListData.filter((item: { type: string; }) => item.type !== 'score');
    const { data, modal, isAuthorized } = this.state
    const realName = _.get(data, 'computed.realName')

    return (
      <View style={{ paddingTop: getStatusBarHeight(true), backgroundColor: '#F4F4F5', height: winHeight }}>
        <View style={{ height: convert(40), justifyContent: 'center' }}>
          <TouchableIcon name='md-arrow-back' size={convert(20)} color='#000000'
            style={{ marginLeft: convert(20), marginRight: convert(16) }}
            onPress={() => navigation.pop()} />
        </View>
        <View style={{ marginRight: convert(10), marginLeft: winWidth - convert(60) }}>
          <Avatar
            user={currentUser}
            size={convert(40)}
            style={{
              // marginRight: convert(10),
              // marginLeft: winWidth - convert(60)
            }}
            onPress={() => { }
              // this.onPressAvatar &&
              // this.onPressAvatar(_.get(this.props.realm, 'lastTopic.creator'))
            }
          />
        </View>
        <View style={{ marginTop: convert(5), marginLeft: convert(15) }}>

          <Text style={{ fontSize: convert(13), color: '#000000' }}>总收益：{_.get(data, 'statistics.totalProfit')}</Text>
          <Text
            style={{
              fontSize: convert(34),
              fontFamily: 'SFProDisplay-Bold',
              fontWeight: 'bold',
              color: '#000',
              marginTop: convert(5)
            }}
          >¥ {_.get(data, 'balance') ? Math.round(data.balance * 100) / 100 : 0}</Text>
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            realName && realName.length > 0 ?
              this.props.dispatch({
                type: 'user/weChatPayWithdraw',
                textContent: data.computed.realName,
                amount: Math.round(data.balance),
                callBack: (sucess: boolean) => {
                  if (sucess) {
                    ToastAndroid.show('提现成功！', ToastAndroid.LONG)
                  } else {
                    ToastAndroid.show('提现失败！', ToastAndroid.LONG)
                  }

                }
              })
              : isAuthorized ? this.setModalVisible('withdrawModal')
                : Alert.alert('提示', '需要小程序授权才能提现',
                  [
                    {
                      text: "好的", onPress: () => {
                        WeChat.launchMini({
                          userName: 'gh_f9cab1f08463',
                          miniProgramType: 0,
                          //    path: path
                        })
                      }
                    },
                  ])
          }}
          disabled={_.get(data, 'balance') === 0}
        >
          <LinearGradient
            colors={['#007AFF', '#007AFF']}
            start={{ y: 0.4, x: 0 }}
            style={{
              borderRadius: convert(8),
              marginLeft: convert(15),
              marginRight: convert(15),
              marginTop: convert(15),
              marginBottom: convert(5),
              flexDirection: 'row',
              height: convert(40),
              justifyContent: 'center',
              alignItems: 'center',
              opacity: _.get(data, 'balance') === 0 ? 0.5 : 1
            }}
          >
            <TouchableIcon name='md-flash' size={convert(20)} color='#fff'
              style={{ marginRight: convert(10) }}
            />
            <Text
              style={{
                fontSize: convert(17),
                color: 'white'
              }}
            >{_.get(data, 'balance') === 0 ? '暂无余额可提现'
              : '提现余额到微信'}</Text>
          </LinearGradient>
        </TouchableWithoutFeedback>

        <View style={{ justifyContent: 'flex-end', flexDirection: 'row', height: convert(26), alignItems: 'center' }}>

          <TouchableWithoutFeedback
            onPress={() => Linking.openURL('https://www.atrealm.com/money.html')}
          ><Text style={{ fontSize: convert(13), color: '#000000' }}>提现说明</Text></TouchableWithoutFeedback>
          <TouchableIcon name='md-help-circle-outline' size={convert(20)} color='#000000'
            style={{ marginLeft: convert(10), marginRight: convert(16) }}
            onPress={() => Linking.openURL('https://www.atrealm.com/money.html')} />
        </View>

        <FlatList
          style={{ backgroundColor: '#fff', marginTop: convert(10) }}
          ref={ref => this.flatList = ref}
          onEndReached={() => this.handleLoadMore()}
          onEndReachedThreshold={convert(10)}
          data={transactions}
          keyExtractor={(item, index) => (index + '')}
          ListHeaderComponent={() => (
            <View>
              <Text
                style={{
                  fontSize: convert(25),
                  // fontFamily: 'SFProDisplay-Bold',
                  // fontWeight: 'bold',
                  color: '#000',
                  marginVertical: convert(10),
                  marginLeft: convert(15)
                }}
              >最近账单</Text>
            </View>
          )}
          renderItem={({ item }) => this._renderRow(item)}
          ItemSeparatorComponent={() => <View style={{
            width: winWidth - convert(80), backgroundColor: Colors.lightGray, marginLeft: convert(60),
            height: convert(0.5)
          }} />}
          ListEmptyComponent={
            <View style={{ paddingTop: convert(25) }}>
              <Text style={{ fontSize: convert(25), color: Colors.darkGray, alignSelf: 'center' }} >
                暂无账单
                            </Text>
            </View>
          }
          automaticallyAdjustContentInsets={false}
        />
        <WithdrawModal
          visible={modal === "withdrawModal" && isAuthorized}
          onClose={() => this.setModalVisible("")}
          onPress={item => {
            this.setState({ realName: item, })
            this.setModalVisible("");
          }}
          amount={Math.round(data.balance)}
          dispatch={this.props.dispatch}
        />

      </View>
    )
  }
}

