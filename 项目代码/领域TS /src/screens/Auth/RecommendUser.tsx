
import React from 'react'
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
import { convert } from "../../utils/ratio";
import LinearGradient from 'react-native-linear-gradient'
import _ from 'lodash';
import RecommendUserCell from "../../components/User/RecommendUserCell";
import { addRelation } from '../../services/user'
import Zhugeio from 'react-native-plugin-zhugeio'
interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  listData: any[],
  currentUser: any
  refreshing: boolean,
}

@(connect(
  ({
    'recommendUser': { recommendedUsers },
    auth: { detail },
    loading: { effects },
  }: any) => ({
    currentUser: detail,
    listData: [
      { data: recommendedUsers },
    ],
    refreshing: effects['recommendUser/refresh'] || false,

  })) as any)

export default class RecommendUser extends React.Component<Props>{
  static defaultProps = {
    currentUser: {},
    dispatch: null,
    listData: [],
    refreshing: false,
  }
  static navigationOptions = {
    header: null
  };
  selectDate: any[] = []

  state = {
    piedata: [],
  }
  constructor(props: Props) {
    super(props);
  }

  _onSelect = (onSelected: boolean, item: any) => {
    if (onSelected) {
      this.selectDate.push(item._id);
      Zhugeio.track('点击关注',{});
    } else {
      const id = item._id;
      let tag = -1;
      this.selectDate.map((i, index) => {
        if (i == id) {
          tag = index
        }
      })
      this.selectDate.splice(tag, 1);
    }
    this.setState({
      piedata: this.selectDate,
    })
  }

  _renderRow({ user: item }: any, index: number, section: any, ) {
    if ((index + 1) % 3) {
      return null;
    }

    return (
      <View style={{ marginTop: convert(10), marginBottom: convert(10), flexDirection: 'row' }}>
        <RecommendUserCell
          key={index}
          onSelected={
            (onSelected, item) => this._onSelect(onSelected, item)
          }
          styles={{ marginTop: convert(1) }}
          item={item}
        />
        {index < section.data.length - 1
          && <RecommendUserCell
            key={index + 1}
            onSelected={
              (onSelected, item) => this._onSelect(onSelected, item)
            }
            styles={{ marginTop: convert(1) }}
            item={section.data[index + 1].user}
          />}
        {index < section.data.length - 2
          && <RecommendUserCell
            key={index + 2}
            onSelected={
              (onSelected, item) => this._onSelect(onSelected, item)
            }
            styles={{ marginTop: convert(1) }}
            item={section.data[index + 2].user}
          />}
      </View>
    )
  }
  _keyExtractor = ({ user }: any, index: any) => user ? `${user._id}${index}` : index;

  render() {
    const { dispatch, refreshing, currentUser, listData } = this.props
    const { piedata } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          translucent={true}
        />
        <Text style={styles.topTitle} numberOfLines={1}>为你推荐一些用户</Text>
        <Text style={styles.subTitle}>你可能认识，或者不妨认识的朋友！</Text>
        <SectionList
          style={styles.scrollCon}
          contentContainerStyle={{ paddingTop: convert(10) }}
          refreshing={refreshing}
          onRefresh={() => dispatch({ type: 'recommendUser/refresh' })}
          sections={listData}
          keyExtractor={this._keyExtractor}
          initialNumToRender={3}
          renderItem={({ item, index, section }: { item: any, index: number, section: any }) => this._renderRow(item, index, section)}
        />

        <View style={styles.bottomCon}>
          <Text style={styles.textStyle}>已关注{piedata.length}人</Text>
          <TouchableOpacity
            activeOpacity={.7}
            style={styles.readyCon}

            onPress={() => {
              dispatch(NavigationActions.navigate({
                routeName: 'RecommendRealm',
              }));

              this.selectDate.map((value, index) => {
                addRelation(currentUser._id, value, 'followee', () => {
                })
              })
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
              >继续</Text>
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
  },
  flowCon: {
    width: convert(73),
    height: convert(25),
    marginTop: convert(6),
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomCon: {
    height: convert(100) + getBottomSpace(),
    backgroundColor: '#fff',
  },
  textStyle: {
    textAlign: 'center',
    marginTop: convert(20),
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
