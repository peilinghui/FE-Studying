import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  SectionList,
  Text,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import RealmCard from './TopicCard'
import { connect } from 'react-redux'
import _ from 'lodash';




interface Props {
  user: { _id: string },
  dispatch: Function,
  refreshing: boolean,
  listData: any[]
}

interface State {

}

const SECTION_TYPE_TOPIC = "topic";

@(connect(
  ({
    'discover': { recommendedRealms },
    auth: { detail },
    loading: { effects },
  }: any) => ({
    user: detail,
    listData: [{ data: recommendedRealms, title: '推荐领域', type: SECTION_TYPE_TOPIC }],
    refreshing: effects['discover/refresh'] || false,
  })) as any)
export default class TopicScene extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
      listData: [],
    }
  }

  componentDidMount() {

  }



  _renderRow({ realm: item }: any, index: number, section: any) {

    const { dispatch, user } = this.props

    if (section.type === SECTION_TYPE_TOPIC) {
      return (
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <RealmCard
            onPress={() => {
              dispatch({ type: 'realm/read', item })
              dispatch(NavigationActions.navigate({
                routeName: 'RealmViewer',
                params: {
                  realmId: item._id,
                  isMember: true
                },
              }))
            }}

            realm={item}
          />


        </View>
      )
    }
    return null;
  }



  _renderSectionHeader(section: any) {



    return null;
  }

  _keyExtractor = ({ realm }: any, index: any) => realm ? `${realm._id}${index}` : index;
  render() {
    const { dispatch, refreshing } = this.props
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, color: Colors.darkGray, alignSelf: 'center', padding: 10 }}>我们正在全力开发</Text>
          {/* <SectionList
            contentContainerStyle={{ paddingTop: 10 }}
            refreshing={refreshing}
            onRefresh={() => dispatch({ type: 'discover/refresh' })}
            sections={this.props.listData}
            stickySectionHeadersEnabled={false}
            keyExtractor={this._keyExtractor}

            renderItem={({ item, index, section }: { item: any, index: number, section: any }) => this._renderRow(item, index, section)}
            renderSectionHeader={({ section }: { section: any }) => this._renderSectionHeader(section)}
          /> */}
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
  topTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: getStatusBarHeight(true),
    height: 40 + getStatusBarHeight(true),
    backgroundColor: 'white'
  },
  topTab: {
    fontSize: 22,
    lineHeight: 50,
    fontWeight: 'bold',
    marginRight: 5,
    paddingHorizontal: 2,
    borderRadius: 12,
    color: Colors.tabIconDefault
  },
  topTabActivated: {
    color: Colors.tabIconSelected
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#cccccc77'
  }
});
