import React from 'react'
import _ from 'lodash'
import { View, Text, TextInput, TouchableWithoutFeedback, Keyboard, FlatList } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { NavigationScreenProp, StackActions } from 'react-navigation'
import Header from '../components/Header'
import Icon from 'react-native-vector-icons/Ionicons'
import List from '../components/List'
import RealmCard from '../components/RealmCard'
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import { listByCategory } from '../services/realm';
import { objectHash } from '../utils/functions';

type Props = {
  navigation: NavigationScreenProp<any>
  dispatch: Dispatch<any>
}

type State = {
  keyword: string,
  realms: any[],
  cursorAt?: string,
  hasNext: boolean
}

@(connect() as any)
export default class extends React.Component<Props, State> {
  inputTimer: any;

  constructor(props: Props) {
    super(props)
    this.state = {
      keyword: '',
      realms: [],
      hasNext: true
    }
  }
  request = async (cursorAt?: string) => {
    const { subtitle } = this.props.navigation.getParam('category')
    const { keyword } = this.state
    const data = await listByCategory(subtitle.toLowerCase(), keyword, cursorAt)
    return data
  }

  search = (val: string) => {
    clearTimeout(this.inputTimer);
    this.setState({ keyword: val }, () => {
      this.inputTimer = setTimeout(async () => {
        const realms = await this.request()
        this.setState({
          realms,
          cursorAt: realms.length > 0 ? realms[realms.length - 1].lastTopicAt : null
        })
      }, 500);
    });
  }

  loadMore = async () => {
    if (this.state.hasNext) {
      const realms = await this.request(this.state.cursorAt)
      this.setState({
        realms: this.state.realms.concat(realms),
        cursorAt: realms.length > 0 ? realms[realms.length - 1].lastTopicAt : null,
        hasNext: realms.length > 0
      })
    }
  }

  async componentDidMount() {
    const realms = await this.request()
    this.setState({
      realms,
      cursorAt: realms.length > 0 ? realms[realms.length - 1].lastTopicAt : null
    })
  }

  render() {
    const { dispatch, navigation } = this.props
    const { title } = navigation.getParam('category')
    return (
      <View style={{ flex: 1, paddingTop: getStatusBarHeight(true) }}>
        <Header><Text>{title}</Text></Header>
        <FlatList
          contentContainerStyle={{ paddingTop: 10 }}
          data={this.state.realms}
          keyExtractor={(item) => objectHash(item)}
          ListHeaderComponent={() => (
            <View
              style={{
                backgroundColor: 'rgba(142,142,147,0.12)',
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 16,
                marginBottom: 20,
                borderRadius: 10,
                height: 40,
              }}
            >
              <Icon
                name='md-search'
                color='#8E8E93'
                size={20}
                style={{ marginHorizontal: 10 }}
              />
              <TextInput
                placeholderTextColor='#8E8E93'
                placeholder='搜索分类下领域'
                style={{ fontSize: 16, lineHeight: 20 }}
                value={this.state.keyword}
                onChangeText={val => this.search(val)}
              />
            </View>
          )}
          onEndReached={this.loadMore}
          renderItem={({ item, index })  => (
            <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <RealmCard
                onPress={() => {
                  dispatch({ type: 'realm/read', item })
                  dispatch(StackActions.push({
                    routeName: 'RealmViewer',
                    params: {
                      realmId: item._id,
                      isMember: true
                    },
                  }))
                }}
                key={index}
                onPressAvatar={(user) => dispatch(StackActions.push({
                  routeName: 'UserViewer',
                  params: { userId: user._id },
                }))}
                realm={item}
              />
            </View>
          )}
        />
      </View>
    )
  }
}