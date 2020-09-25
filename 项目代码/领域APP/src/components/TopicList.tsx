import React from 'react'
import { Dimensions, RefreshControl, ActivityIndicator, View, Text, Image, ListView } from "react-native"
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import TopicCard, { buildTopicCardHeight } from '../components/TopicCard'
import Colors from '../constants/Colors';
import { convert, winWidth, winHeight } from '../utils/ratio';
import _ from 'lodash'
import AutoHeightImage from 'react-native-auto-height-image'
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import ScrollableMixin from 'react-native-scrollable-mixin';
import InvertibleScrollView from 'react-native-invertible-scroll-view';

interface Props {
  request: Function
  limit: number,
  navigation: any
  realmType: string
  isMember: boolean
  isPrivate: boolean
}

interface State {
  dataSource: any
  refreshing: boolean,
  loading: boolean,
  cursorAt: null,
  hasNext: boolean,
  modal: string,
  singalTopic: any
  listViewPaddingTop: number
  listHeight: any
}

export default class extends React.Component<Props, State> {
  static defaultProps = {
    limit: 20
  }

  listData: any[];
  listview: any;
  cardHeight: any[]

  constructor(props: Props) {
    super(props);
    this.listData = [];
    this.state = {
      refreshing: false,
      loading: false,
      cursorAt: null,
      hasNext: true,
      modal: "",
      singalTopic: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      listViewPaddingTop: 0,
      listHeight: 300
    };
    this.cardHeight = ['150', '150'];
  }

  componentDidMount() {
    this.refresh()
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  //下拉刷新
  refresh = () => {
    this.setState({ cursorAt: null, refreshing: true }, async () => {
      const response = await this.props.request(this.state.cursorAt, this.props.limit)

      this.listData = response;
      const dataWithHeight = await buildTopicCardHeight(this.listData)
      this.cardHeight = dataWithHeight.map((item) => { return item.cardHeight })

      this.setState({
        cursorAt: response.length > 0 ? response[response.length - 1].createdAt : null,
        dataSource: this.state.dataSource.cloneWithRows(response),
        refreshing: false
      })
    })
  }

  next = () => {
    this.setState({ loading: true }, async () => {
      const response = await this.props.request(this.state.cursorAt, this.props.limit)
      if (response.length > 0) {
        this.listData = [...this.listData, ...response];
        this.setState({
          cursorAt: response[response.length - 1].createdAt,
          dataSource: this.state.dataSource.cloneWithRows(this.listData),
          loading: false,
          hasNext: response.length === this.props.limit,
        })
      } else {
        this.setState({
          loading: false,
          hasNext: false
        })
      }
    })
  }

  //上拉加载更多
  handleLoadMore() {
    const { realmType, isMember, isPrivate } = this.props
    if (this.state.loading) return;

    if (this.listData.length == 0) {
      return;
    }

    if (!this.state.hasNext) {
      return;
    }

    if (realmType === 'purchase' && !isMember) {
      return
    }

    this.next();
  }

  _rowRenderer = (item: any, index: any) => {

    const { realmType, isMember, isPrivate } = this.props
    return (
      <TopicCard
        onPress={(item) => {
          this.props.navigation.push('TopicViewer', {
            topicId: item._id,
            topicData: item,
            isRealmMember: isMember
          })
        }}
        key={index}
        onPressAvatar={(user = {}) => {
          this.props.navigation.push('UserViewer', { userId: user._id })
        }}
        topic={item}
        onPressRealm={(topic) => {
          _.get(topic, 'elements.realm') &&
            this.props.navigation.push('RealmViewer', {
              realmId: topic.elements.realm._id,
              isMember: isMember
            })
        }}
        onPressTopic={(topic) => {
          this.props.navigation.push('TopicViewer', {
            topicId: topic.elements.topic._id,
            topicData: topic.elements.topic
          })
        }}
        onPressVideo={(topic) => {
          this.props.navigation.push('VideosViewer', {
            videoURL: topic
          })
        }}
        onPressLink={(topic) => {
          _.get(topic, 'elements.link') &&
          this.props.navigation.push('TopicViewer', {
            topicId: item._id,
            topicData: item
          })
        }}
      />
    );
  }

  renderHeader = () => {
    const { listHeight } = this.state

    if (this.listData.length < 3) {
      return (
        <View
          style={{
            height: this.listData.length === 1 ?
              listHeight - this.cardHeight[0]
              : listHeight - this.cardHeight[0] - this.cardHeight[1]
          }} />
      );
    }
    return (<View style={{ height: convert(5) }}></View>);
  }

  renderFooter = () => {
    const { realmType, isMember } = this.props
    const { listHeight } = this.state
    return (
      <View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
        {this.state.loading && <ActivityIndicator size="large" color={Colors.darkGray} />}
        {!this.state.hasNext && this.listData.length > 3 && <Text style={{ color: Colors.darkGray }}>- 完 - </Text>}
        {realmType === 'purchase' && !isMember && <Text style={{ color: Colors.darkGray }}>- 更多内容需要加入领域才能看到 - </Text>}
      </View>
    );
  };

  render() {
    const { isPrivate, isMember } = this.props
    const { refreshing } = this.state

    if (this.listData.length > 0) {
      return (
        <ListView
          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
          dataSource={this.state.dataSource}
          renderHeader={() => this.renderHeader()}
          renderFooter={() => this.renderFooter()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={async () => {
                this.refresh();
              }}
            />
          }
          contentContainerStyle={{
            paddingTop: convert(20)
          }}
          initialListSize={10}
          renderRow={this._rowRenderer}
          onEndReachedThreshold={5}
          onEndReached={() => {
            this.handleLoadMore();
          }}
          onLayout={(event: any) => {
            let { width, height } = event.nativeEvent.layout;
            this.setState({
              listHeight: height,
            })
          }
          }
        />
      )

    } else if (this.listData.length === 0 && refreshing) {
      return (
        <View style={{ paddingTop: convert(40) }}>
          <Text
            style={{
              fontSize: convert(20),
              color: '#ccc',
              alignSelf: 'center'
            }}
          >
            加载中……
          </Text>
        </View>
      )
    } else if (isPrivate && !isMember) { //私密领域或者是付费但是不公开
      return (
        <View style={{ paddingTop: convert(40) }}>
          <Text
            style={{
              fontSize: convert(20),
              color: '#ccc',
              alignSelf: 'center',
              paddingHorizontal: convert(10)
            }}
          >
            领域讨论对外不可见，需要加入查看！
          </Text>
        </View>
      )
    } else {
      return <View style={{ paddingTop: convert(40) }}>
        <AutoHeightImage
          style={{ marginLeft: convert(10) }}
          width={winWidth - convert(20)}
          source={require('../assets/noTopic.png')} />
      </View>
    }
  }
}
