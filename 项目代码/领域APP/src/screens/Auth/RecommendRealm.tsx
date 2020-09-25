
import React from 'react'
import _ from 'lodash';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SectionList,
  TouchableOpacity,
} from 'react-native'
import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationActions, NavigationScreenProp, StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import 'moment/locale/zh-cn'
import RecommendRealmCell from "../../components/User/RecommendRealmCell";
import { convert, winHeight } from "../../utils/ratio";
import LinearGradient from 'react-native-linear-gradient'
import { isLanded } from '../../services/user'
interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  listData: any[],
  currentUser: any
  refreshing: boolean,
}

@(connect(
  ({
    'recommended': { recommendedRealms },
    auth: { detail },
    loading: { effects },
  }: any) => ({
    currentUser: detail,
    listData: [
      { data: recommendedRealms },
    ],
      refreshing: effects['recommended/refresh'] || false,
  })) as any)


export default class RecommendRealm extends React.Component<Props>{
  static defaultProps = {
    currentUser: {},
    dispatch: null,
    listData: [],
    refreshing: false,
  }
  static navigationOptions = {
    header: null
  };

  listDataT = this.props.listData[0].data.slice(1, 4);
  selectData = this.listDataT.map((val: any, index: number) => { return val.realm._id });

  state = {
    piedata: this.selectData
  };

  constructor(props: Props) {
    super(props);
  }

  _onSelect = (onSelected: boolean, item: any) => {
    if (onSelected) {

      this.selectData.push(item.realm._id);
    } else {
      const id = item.realm._id;
      let tag = -1;
      this.selectData.map((i: any, index: number) => {
        if (i === id) {
          tag = index
        }
      })
      this.selectData.splice(tag, 1);

    }
    this.selectData = _.uniq(this.selectData)
    this.setState({
      piedata: this.selectData,
    })
  }

  _renderRow(item: any, index: number, section: any) {

    if ((index + 1) % 2) {
      return null;
    }

    return (
      <View style={{ marginHorizontal: convert(20), marginTop: convert(10), marginBottom: convert(10), flexDirection: 'row' }}>

        <RecommendRealmCell
          key={index}
          onSelected={
            (onSelected, item) => this._onSelect(onSelected, item)
          }
          styles={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, marginRight: (index === section.data.length - 1) ? 0 : convert(10), }}
          item={item}
          indexKey={index}
        />

        {index < section.data.length - 1
          && <RecommendRealmCell
            key={index + 1}
            onSelected={
              (onSelected, item) => this._onSelect(onSelected, item)
            }
            styles={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, marginLeft: convert(10) }}
            item={section.data[index + 1]}
            indexKey={index + 1}
          />}
      </View>
    )
  }
  _keyExtractor = ({ realm }: any, index: any) => realm ? `${realm._id}${index}` : index;

  render() {
    const { dispatch, refreshing, listData, currentUser } = this.props;
    const { piedata } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          translucent={true}
        />
        <Text style={styles.topTitle} numberOfLines={1}>为你推荐一些领域</Text>
        <Text style={styles.subTitle}>加入几个领域热身一下吧！</Text>
        <SectionList
          style={styles.scrollCon}
          contentContainerStyle={{ paddingTop: convert(10) }}
          refreshing={refreshing}
          onRefresh={() => dispatch({ type: 'discover/refresh' })}
          sections={this.props.listData}
          stickySectionHeadersEnabled={false}
          keyExtractor={this._keyExtractor}
          renderItem={({ item, index, section }: { item: any, index: number, section: any }) => this._renderRow(item, index, section)}
        />
        <View style={styles.bottomCon}>
          <Text style={styles.textStyle}>将加入{piedata.length}个领域</Text>

          <TouchableOpacity
            activeOpacity={.7}
            style={styles.readyCon}
            onPress={() => {
              dispatch({
                type: 'realm/addMembers',
                realmIds: this.selectData,
                callback: () => {
                  isLanded(currentUser._id)
                },
              });
              dispatch(NavigationActions.navigate({
                routeName: 'Main',
              }));
            }}
          >
            <LinearGradient
              colors={['#007AFF', '#007AFF']}
              start={{ y: 0.4, x: 0 }}
              style={{
                borderRadius: convert(8),
                padding: convert(15),
                flexDirection: 'row'
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  flex: 1,
                  fontSize: convert(16),
                  lineHeight: convert(18),
                  color: 'white'
                }}
              >准备好了，开始体验</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  topTitle: {
    paddingTop: getStatusBarHeight(true),
    fontWeight: 'bold',
    fontSize: convert(32),
    fontFamily: 'SFProDisplay-Bold',
    color: '#000',
    marginTop: convert(20),
    marginLeft: convert(20),
  },
  subTitle: {
    marginTop: convert(8),
    marginLeft: convert(20),
    fontSize: convert(18),
    fontFamily: 'SFProText-Semibold',
    fontWeight: '600',
    color: '#999',
  },
  scrollCon: {
    backgroundColor: '#F9F9F9',
    marginTop: convert(20),
    height: winHeight - convert(134),
  },
  bottomCon: {
    height: convert(100) + getBottomSpace(),
    backgroundColor: '#fff',
  },
  textStyle: {
    textAlign: 'center',
    marginTop: convert(15),
    fontSize: convert(14),
    lineHeight: convert(18),
    color: '#999',
  },
  readyCon: {
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10
  },
  imageStyle: {
    overflow: 'hidden',
    position: 'absolute',
    top: convert(100),
    left: convert(70),
  }
});
