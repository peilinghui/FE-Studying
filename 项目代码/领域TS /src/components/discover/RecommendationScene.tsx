import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  SectionList,
  Image,
  TouchableHighlight,
  Dimensions,
  ImageBackground,
  Platform,
  TouchableOpacity
} from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import Colors from '../../constants/Colors';
import RealmCard from './RealmCard'
import Icon from 'react-native-vector-icons/Feather'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import _ from 'lodash';
import { Dispatch } from 'redux';
import Layout from '../../constants/Layout';
import { convert, winWidth } from "../../utils/ratio";
interface Props {
  user: { _id: string },
  dispatch: Function,
  listData: any[],
  refreshing: boolean,
}

interface State {

}

const SECTION_TYPE_RECOMMENDED_REALMS = "recommendedRealms";
const SECTION_TYPE_LATEST_REALMS = "latestRealms";
const SECTION_TYPE_RECOMMENDED_USERS = "recommendedUsers";
const SECTION_TYPE_REALM_CATEGORIES = "realmCategories";
@(connect(
  ({
    'discover': { recommendedUsers, recommendedRealms },
    auth: { detail },
    loading: { effects },
  }: any) => ({
    user: detail,
    listData: [
      { data: [], title: '新鲜领域', type: SECTION_TYPE_LATEST_REALMS },
      { data: [], title: '领域分类浏览', type: SECTION_TYPE_REALM_CATEGORIES },
      { data: [recommendedUsers], title: '推荐用户', type: SECTION_TYPE_RECOMMENDED_USERS },
      { data: recommendedRealms, title: '推荐领域', type: SECTION_TYPE_RECOMMENDED_REALMS },
    ],
    refreshing: effects['discover/refresh'] || false,
  })) as any)
export default class RecommendationScene extends React.Component<Props, State> {
  static defaultProps = {
    user: {},
    dispatch: null,
    listData: [],
    refreshing: false,
  }
  static navigationOptions = {
    header: null
  };

  constructor(props: Props) {
    super(props);

  }

  _renderRow(item: any, index: number, section: any) {

    const { dispatch, user } = this.props
    if (section.type === SECTION_TYPE_LATEST_REALMS) {
      return (
        <RecommendedRealmCarousel entries={this.props.listData[0].data[0]} />
      )
    }

    if (section.type === SECTION_TYPE_REALM_CATEGORIES) {
      // return <RecommendedRealmCarousel entries={this.state.listData[1].data} />
    }

    if (section.type === SECTION_TYPE_RECOMMENDED_USERS) {
      return (
        <View>
          <RecommendedUserCarousel entries={this.props.listData[2].data[0]}
            onPressItem={(user) => dispatch(NavigationActions.navigate({
              routeName: 'UserViewer',
              params: { userId: user._id },
            }))} />
          {this.props.listData[2].data[0].length > 0 &&
            <TouchableOpacity
              activeOpacity={.7}
            style={[{ flex: 1, borderRadius: convert(15), marginHorizontal: convert(20), marginVertical: convert(10) },]}
              onPress={() => {
                dispatch({ type: 'app/showLoading' })
                dispatch({
                  type: 'discover/refreshUsers',
                  callback: () => {
                    dispatch({ type: 'app/hideLoading' })
                  }
                })
              }}
            >
              <LinearGradient
                colors={['#434343', '#3e4f6c']}
                start={{ y: 0.4, x: 0 }}
                style={{
                  borderRadius: convert(100),
                  padding: convert(10),
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    flex: 1,
                    fontSize: convert(15),
                    lineHeight: convert(18),
                    color: 'white'
                  }}
                >换三个更有趣的人儿</Text>
              </LinearGradient>
            </TouchableOpacity>}
        </View>
      )
    }



    if (section.type === SECTION_TYPE_RECOMMENDED_REALMS) {
      if ((index + 1) % 2) {
        return null;
      }
      return (
        <View style={{ marginHorizontal: convert(20), marginBottom: convert(20), flexDirection: 'row' }}>
          <RealmCard
            onPress={() => {
              dispatch({ type: 'realm/read', item: item.realm })
              dispatch(NavigationActions.navigate({
                routeName: 'RealmViewer',
                params: {
                  realmId: item.realm._id,
                  isMember: false
                },
              }))
            }}
            styles={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, marginRight: (index === section.data.length - 1) ? 0 : convert(10) }}
            item={item}
          />

          {index < section.data.length - 1 && <RealmCard
            onPress={() => {
              dispatch({ type: 'realm/read', item: section.data[index + 1].realm })
              dispatch(NavigationActions.navigate({
                routeName: 'RealmViewer',
                params: {
                  realmId: section.data[index + 1].realm._id,
                  isMember: false
                },
              }))
            }}
            styles={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, marginLeft: convert(10) }}
            item={section.data[index + 1]}
          />}
        </View>
      )
    }
    return null;
  }

  _renderRealmCategories() {
    let showN = 3;
    let containerWidth = Dimensions.get("window").width;
    if (containerWidth <= 320) {
      showN = 2;
    }
    let margin = 10;
    let width = Math.floor((containerWidth - margin * (showN - 1) - 30) / showN);
    let categories = [
      { title: '科学技术', subtitle: 'Science', icon: '🛸' },
      { title: '艺术人文', subtitle: 'Art', icon: '👩‍🎨' },
      { title: '生活娱乐', subtitle: 'Life', icon: '🏄' },
      { title: '商业金融', subtitle: 'Business', icon: '💶' },
      { title: '学校职业', subtitle: 'School', icon: '🏫' },
      { title: '个人领域', subtitle: 'personal', icon: '👩‍🎤' },
    ]
    let btns = categories.map((category, index) => {
      return (
        <CategoryButton
          key={category.title}
          iconName={category.icon}
          title={category.title}
          subtitle={category.subtitle}
          styles={{ width, marginRight: (index + 1) % showN === 0 ? 0 : margin }}
          onPressItem={() => this.props.dispatch(StackActions.push({
            routeName: 'Category',
            params: { category },
          }))}
        />
      )
    })
    return (
      <View style={{ marginHorizontal: 15, }}>
        {/* <View style={styles.line}></View> */}
        <View style={{ flexDirection: 'row', marginVertical: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {btns}
        </View>
        {/* <View style={styles.line}></View> */}
      </View>
    )
  }

  _renderSectionHeader(section: any) {

    if (section.type === SECTION_TYPE_LATEST_REALMS) {
      return null;
    }

    if (section.type === SECTION_TYPE_REALM_CATEGORIES) {

      return this._renderRealmCategories()
    }

    if (section.type === SECTION_TYPE_RECOMMENDED_USERS && !section.data[0].length) {
      return null;
    }

    return section.data.length > 0 ? <Text style={{ fontSize: convert(18), color: '#222222', marginVertical: convert(20), marginHorizontal: convert(20) }}>{section.title}</Text> : null;
  }

  _keyExtractor = ({ realm }: any, index: any) => realm ? `${realm._id}${index}` : index;
  render() {
    
    const { dispatch, refreshing, listData } = this.props

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => dispatch(StackActions.push({ routeName: 'Search' }))}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#cccccc44',
            margin: convert(15),
            marginTop: 0,
            borderRadius: convert(10),
            paddingHorizontal: convert(10),
            paddingVertical: convert(10),
          }}
        >
          <Icon name="search" style={{ color: '#555555bb', fontSize: convert(13), marginRight: convert(5) }} />
          <Text style={{ color: '#555555aa', fontSize: convert(13), }}>搜索领域或用户</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SectionList
            contentContainerStyle={{ paddingTop: convert(10) }}
            refreshing={refreshing}
            onRefresh={() => dispatch({ type: 'discover/refresh' })}
            sections={this.props.listData}
            stickySectionHeadersEnabled={false}
            keyExtractor={this._keyExtractor}
            renderItem={({ item, index, section }: { item: any, index: number, section: any }) => this._renderRow(item, index, section)}
            renderSectionHeader={({ section }: { section: any }) => this._renderSectionHeader(section)}
          />
        </View>
      </View>
    );
  }
}

interface CategoryButtonProps {
  onPressItem?(): void,
  iconName: string,
  title: string,
  subtitle: string,
  styles?: any
}
class CategoryButton extends React.PureComponent<CategoryButtonProps, any>{

  render() {

    return (
      <TouchableHighlight activeOpacity={.95} style={[{ borderRadius: convert(10), marginBottom: convert(10) }, this.props.styles]} underlayColor={'#cccccc55'}
        onPress={() => {
          this.props.onPressItem && this.props.onPressItem()
        }}
      >
        <View style={[{ alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', backgroundColor: Colors.lightGray, borderRadius: convert(10), }]}>
          <Text
            style={{
              fontSize: convert(15),
              marginVertical: convert(20),
              marginHorizontal: convert(10),
              marginRight: convert(8),
              backgroundColor: 'transparent',
              borderRadius: convert(100),
            }}
          >{this.props.iconName}</Text>
          <View style={{ flex: 1, marginRight: convert(10) }}>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[{ fontSize: convert(12), color: '#222222' }]}>{this.props.title}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[{ fontWeight: '100', fontSize: convert(10), color: '#333333bb' }]}>{this.props.subtitle}</Text>
          </View>
        </View>
      </TouchableHighlight >
    )
  }
}


interface CarouselProps {
  onPressItem?(item: any): void,
  entries: any,
  user?: any,
  dispatch?: Function
}

abstract class Carousel extends React.PureComponent<CarouselProps, any>  {

  protected itemMargin: number;
  protected itemWidth: number;
  protected itemHeight: number;

  constructor(props: CarouselProps) {
    super(props);
    this.itemMargin = convert(15);
    this.itemWidth = Math.ceil(winWidth - this.itemMargin * 2);
    this.itemHeight = convert(170);
  }

  protected abstract _renderCarouselItem(item: any, index: number, total: number): JSX.Element;
 
  _keyExtractor = (item : any, index: any) => `${item._id}${index}`
  render() {

    return (

      <FlatList
        data={this.props.entries}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={this.itemWidth + this.itemMargin}
        snapToAlignment={"start"}
        decelerationRate={"fast"}
        renderItem={({ item, index }) => this._renderCarouselItem(item, index, this.props.entries.length)}
        removeClippedSubviews={false}
        keyExtractor={this._keyExtractor}

      />

    )
  }

}

@(connect() as any)
class RecommendedRealmCarousel extends Carousel {
  _renderCarouselItem(item: any, index: number, total: number) {
    var lastItem = index === total - 1;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.props.dispatch!(StackActions.push({
          routeName: 'RealmViewer',
          params: { realmId: item._id, isMember: false }
        }))}
        style={[
          { width: this.itemWidth },
          { display: 'flex', flexDirection: 'column', marginLeft: this.itemMargin, marginBottom: convert(20) },
          lastItem && { marginRight: this.itemMargin },
          { borderRadius: convert(8), overflow: 'hidden', backgroundColor: '#f0f0f055' }
        ]}
      >
        <ImageBackground
          resizeMode={'cover'} // or cover
          style={{
            flex: 1,
            height: convert(150),
            borderRadius: convert(8), overflow: 'hidden',
            marginHorizontal: convert(2)
          }}
          source={{
            uri: _.get(item, 'coverImage.url') +
              '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
          }}
        >
        </ImageBackground>
      </TouchableOpacity>
    );
  }
}

class RecommendedUserCarousel extends Carousel {

  constructor(props: CarouselProps) {
    super(props);
    let showN = 3;
    let containerWidth = Layout.window.width;
    if (containerWidth <= 320) {
      showN = 2;
    }
    this.itemWidth = Math.ceil((containerWidth - this.itemMargin * (showN + 1)) / showN);
    this.itemHeight = convert(150);
  }

  _renderCarouselItem({ user: item, numOfCommonFriends }: any, index: number, total: number) {

    var isLastItem = index === total - 1;
    var isFirstItem = index === 0;
    return (
      <View
        style={[
          { width: this.itemWidth, height: this.itemHeight, marginBottom: convert(20) },
          { display: 'flex', flexDirection: 'column', marginHorizontal: this.itemMargin / 2, marginTop: convert(5), borderRadius: convert(15), },
          isLastItem && { marginRight: this.itemMargin },
          isFirstItem && { marginLeft: this.itemMargin },
          {
            elevation: 2,
            backgroundColor: Colors.lightGray,
            shadowColor: Colors.darkGrayAlpha(0.4),
            shadowRadius: convert(6),
            shadowOpacity: .5,
            shadowOffset: {
              width: convert(1),
              height: convert(3)
            },
          }
        ]}>
        <TouchableHighlight
          activeOpacity={.99}
          style={[{ flex: 1, borderRadius: convert(16) }]}
          underlayColor={'#000000'}
          onPress={() => {
            if (this.props.onPressItem) this.props.onPressItem(item)
          }}
        >
          <View
            style={{
              padding: convert(10),
              borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
              borderRadius: convert(15),
              borderColor: '#f0f0f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}
          >
            <Image
              source={{ uri: item.profile.avatar.url }}
              style={{ width: convert(50), height: convert(50), borderRadius: convert(30), marginBottom: convert(10) }}
            />
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={[{ maxWidth: convert(100), overflow: 'hidden', lineHeight: convert(18), color: '#000', }]}
            >{_.get(item, 'profile.nickname')}</Text>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={[{ overflow: 'hidden', fontSize: convert(12), lineHeight: convert(18), color: Colors.darkGray, }]}
            >获 {_.get(item, 'statistics.numOfReceivedAgrees')} 认同</Text>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={[{ maxWidth: convert(100), overflow: 'hidden', marginTop: convert(10), fontSize: convert(10), lineHeight: convert(18), color: Colors.darkGray, }]}
            ><Text style={{ color: 'black' }}>{numOfCommonFriends}</Text> 共同好友</Text>
          </View>
        </TouchableHighlight >
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },

  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#cccccc77'
  }
});
