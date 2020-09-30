import React from 'react'
import { View, TouchableWithoutFeedback, Keyboard, Text, FlatList, ActivityIndicator } from 'react-native'
import Header from '../../components/Header'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { getRecommendUser } from '../../services/recommendUser'
import { NavigationScreenProp, StackActions } from 'react-navigation'
import Avatar from '../../components/Avatar'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import Colors from '../../constants/Colors';
import { objectHash } from '../../utils/functions';
import { convert, winHeight, winWidth } from '../../utils/ratio';
import _ from 'lodash';
import { addRelation, removeRelation } from '../../services/user'
import Zhugeio from 'react-native-plugin-zhugeio'


type Props = {
    navigation: NavigationScreenProp<any>
    dispatch: Dispatch<any>
    user: any
}

type State = {
    friends: any[]
    hasNext: boolean;
    offset: number;
    isBusy: boolean
    limit: number
    isSelect: boolean
}

interface ButtonProps {
    item: any;
    onPress: (onSelected: boolean, item: any) => void;
}

class Button extends React.PureComponent <ButtonProps> {

    state = {
        isSelect: false,
    }

    render() {
        const { item, onPress } = this.props
        const { isSelect } = this.state;
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    isSelect ? onPress(false, item) : onPress(true, item)
                    isSelect ? this.setState({ isSelect: false }) : this.setState({ isSelect: true })
                }}
            >
                <View style={{
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSelect ? "rgba(63,139,251,1)" : "rgba(235,243,251,1)",
                    borderRadius: convert(14),
                    width: convert(80), height: convert(28)
                }}>
                    <Text
                        style={{
                            color: isSelect ? "#fff" : "rgba(63,139,251,1)",
                            fontSize: convert(13),
                            fontWeight: '600',
                        }}>
                        {isSelect ? '已关注' : "关注"}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

@(connect(({ auth: { detail } }: any) => ({ user: detail })) as any)
export default class MayFriend extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            friends: [],
            hasNext: true,
            offset: 0,
            isBusy: false,
            limit: 40,
            isSelect: false,
        }
    }

    componentDidMount() {
        this.mayFriend()
    }


    mayFriend = async () => {
        const { isBusy, hasNext, offset, limit } = this.state
        const { user } = this.props
        if (isBusy || !hasNext) {
            return
        }

        this.setState({ isBusy: true })
        const recommendUser = await getRecommendUser(user._id, offset, limit)
        this.setState({ friends: this.state.friends.concat(recommendUser) })

        if (recommendUser.length < 40 || limit > 110) {
            this.setState({ hasNext: false, isBusy: false, });
        } else {
            this.setState({ limit: limit + 40, isBusy: false });
        }
    }


    //上拉加载更多    
    _fetchMoreData = () => {
        this.mayFriend()
    }

    _renderFooter = () => {
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
                <Text style={{ color: Colors.darkGray }}>- 完 - </Text>
            </View>
        );
    }

    _onSelected = (onSelected: boolean, item: any) => {
        const { dispatch, user, } = this.props
        const { isSelect } = this.state
        if (onSelected) {
            addRelation(user._id, item.user._id, 'followee', () => {})
            Zhugeio.track('点击关注', {});
        } else {
            removeRelation(user._id, item.user._id, 'followee', () => {})
        }
    }
    render() {
        const { friends, isSelect } = this.state

        return (
            <View style={{ flex: 1, paddingTop: getStatusBarHeight(true) }}>
                <Header><Text>你可能认识</Text></Header>
                <View style={{ flex: 1 }}>
                    <FlatList
                        style={{ maxHeight: winHeight }}
                        contentContainerStyle={{ paddingBottom: convert(20) }}
                        ItemSeparatorComponent={() => <View style={{ height: convert(20) }} />}
                        ListEmptyComponent={() =>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>快去添加好友！</Text>
                            </View>
                        }
                        data={friends}
                        ListFooterComponent={() => this._renderFooter()}
                        onEndReached={() => this._fetchMoreData()}
                        onEndReachedThreshold={0.5}
                        keyExtractor={(item, index) => objectHash(item)}
                        renderItem={({ item, index }: any) => (
                            <TouchableWithoutFeedback onPress={() => this.props.dispatch(StackActions.push({
                                routeName: 'UserViewer',
                                params: { userId: item.user._id },
                            }))}
                                key={index}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: winWidth - convert(20), marginVertical: convert(10), marginHorizontal: convert(16), }}>
                                    <Avatar user={item.user} size={convert(40)} />
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingVertical: convert(5),
                                            paddingHorizontal: convert(10)
                                        }}
                                    >
                                        <View>
                                            <Text style={{ color: '#000' }}>{_.get(item, 'user.profile.nickname')}</Text>
                                            <Text>{_.get(item, 'count')} 个共同好友</Text>
                                        </View>
                                        <Button
                                            item={item}
                                            key={index}
                                            onPress={(onSelected: any, item: any) => this._onSelected(onSelected, item)}
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    />
                </View>
            </View>
        )
    }
}