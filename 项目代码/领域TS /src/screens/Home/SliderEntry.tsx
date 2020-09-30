import _ from 'lodash'
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
    GestureResponderEvent,
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground
} from 'react-native';
import { NavigationScreenProp, NavigationActions, StackActions } from 'react-navigation'
import PropTypes from 'prop-types';
import MessageCardSimple from '../../components/MessageCardSimple'
import AutoHeightImage from 'react-native-auto-height-image'
import Colors from '../../constants/Colors'
import Avatar from '../../components/Avatar'
import { connect } from 'react-redux'
import TouchableIcon from "../../components/TouchableIcon"
import { convert, winWidth, winHeight } from '../../utils/ratio';
import Video from 'react-native-video';
import RealmCard from '../../components/Message/RealmCard'
import TopicCard from '../../components/Message/TopicCard';
import LinkCard from '../../components/Message/LinkCard';
import moment from 'moment'
import 'moment/locale/zh-cn'
import KVDB from '../../services/kvdb'
import { darkLight } from '../../utils/ui-helper'
import { BoxShadow } from 'react-native-shadow'
import Hyperlink from 'react-native-hyperlink'

type OnPressCallback = (event: GestureResponderEvent) => void;

interface Props {
    dispatch: Function
    topic: any
    onPress?: OnPressCallback;
    user: any
    topics?: {
        [key: string]: {
            messages: any[]
            cursorAt?: string
            hasNext?: boolean
        }
    };
}

interface State {
    lightBackground: boolean
}
@(connect(
    ({
        auth: { detail: user, token },
        "list.topicMessage": { topics }
    }: any) => ({ token, user, topics })
) as any)

export default class SliderEntry extends Component<Props, State>  {

    private onPress?: OnPressCallback;
    static propTypes = {
        topic: PropTypes.object.isRequired,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            lightBackground: false,
        }
        this.onPress = this.props.onPress;
    }

    componentDidMount() {
        this.props.dispatch({ type: 'list.topicMessage/fetch', topicId: this.props.topic._id, action: 'update' })
    }

    componentDidUpdate(nextProps: { topic: any; }) {
        if (this.props.topic !== nextProps.topic) {
            this.props.dispatch({ type: 'list.topicMessage/fetch', topicId: this.props.topic._id, action: 'update' })
        }
    }

    async loadPreviousMessages() {
        const { topic, dispatch, user } = this.props
        this.props.dispatch({
            type: 'list.topicMessage/next',
            topicId: topic._id,
            action: 'append',
            callback: (len: number) => {
                // if (len === 0) {
                //     this.messageView.keepScrollToEnd = false;
                // }
            }
        })
    }

    render() {
        const { topic, user, onPress, topics = {} } = this.props;
        const { lightBackground } = this.state
        if (!topics[topic._id]) topics[topic._id] = { messages: [] };

        return (
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: winWidth
            }}>
                <View style={styles.slideInnerContainer} >
                    <ImageBackground
                        resizeMode={'cover'} // or cover
                        style={{
                            height: convert(40),
                            width: winWidth - convert(40),
                        }}
                        imageStyle={{
                            borderTopLeftRadius: convert(20),
                            borderTopRightRadius: convert(20),
                        }}
                        source={{
                            uri: _.get(topic.realm, 'coverImage.url') +
                                '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: winWidth - convert(40),
                                height: convert(40),
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, .35)',
                                borderTopLeftRadius: convert(20),
                                borderTopRightRadius: convert(20),
                            }}
                            onPress={() => {
                                this.props.dispatch(NavigationActions.navigate({
                                    routeName: 'RealmViewer',
                                    params: {
                                        realmId: topic.realm._id
                                    }
                                }))
                            }}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={require("../../assets/wlogo.png")}
                                style={{
                                    width: convert(15),
                                    height: convert(15),
                                    marginLeft: convert(5),
                                    marginRight: convert(5),
                                    backgroundColor: "transparent",
                                    borderRadius: convert(5),
                                }}
                            />
                            <Text style={{
                                color: lightBackground ? 'black' : '#fff',
                                fontWeight: 'bold',
                                fontSize: convert(17),
                            }}>{topic.realm.title}</Text>
                        </TouchableOpacity>
                    </ImageBackground>
                    <ScrollView>
                        <TouchableWithoutFeedback onPress={onPress}>
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        marginTop: convert(15),
                                        marginBottom: convert(15),
                                        paddingHorizontal: convert(10),
                                        marginRight: convert(10),
                                    }}>
                                    <Avatar
                                        user={_.get(topic, 'creator')}
                                        size={convert(36)}
                                    />
                                    <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
                                        <Text style={{ fontSize: convert(12), lineHeight: convert(16), fontWeight: 'bold', color: 'black' }}>{
                                            _.get(topic, 'creator.profile.nickname')
                                        }</Text>
                                        <View style={{ flexDirection: 'row', marginTop: convert(5) }}>
                                            <Text style={{ fontSize: convert(11), lineHeight: convert(12), color: Colors.darkGray }}>
                                                {moment().from(topic.createdAt).replace('内', '前')}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: convert(14),
                                            lineHeight: convert(16),
                                            marginRight: convert(5),
                                            color: Colors.darkGray,
                                            marginTop: convert(7),
                                        }}
                                    >{_.get(topic, 'statistics.numOfReceivedAgrees')}</Text>
                                    <TouchableIcon
                                        name="md-thumbs-up"
                                        size={24}
                                        color={_.get(topic, 'computed.userInfo.isAgreed') ? Colors.blue : '#555'}
                                    />
                                </View>
                                <Hyperlink linkDefault={true} linkStyle={{ color: Colors.blue, fontSize: convert(14) }}>
                                    <Text
                                        style={{
                                            fontSize: convert(13),
                                            lineHeight: convert(24),
                                            paddingHorizontal: convert(10),
                                            marginBottom: convert(10),
                                            color: 'black'
                                        }}
                                    >{_.get(topic, 'content')}</Text>
                                </Hyperlink>
                                {topic.type === 'image' && _.get(topic, 'elements.videos.0.url')
                                    && <View>
                                        <Video
                                            source={{ uri: _.get(topic, 'elements.videos.0.url') }}
                                            ref='player'
                                            rate={1}
                                            volume={1.0}
                                            muted={false}
                                            paused={true}
                                            resizeMode="cover"
                                            repeat={false}
                                            playInBackground={true}
                                            playWhenInactive={false}
                                            style={{
                                                height: convert(200),
                                                borderRadius: convert(12),
                                            }}
                                        />
                                        <TouchableIcon
                                            style={{
                                                top: convert(70),
                                                left: winWidth / 2 - convert(40),
                                                position: 'absolute',
                                            }}
                                            size={convert(50)}
                                            name="md-play-circle"
                                            color='#fff'
                                        /></View>}
                                {
                                    topic.type === 'image' &&
                                    _.map(topic.elements.images, image =>
                                        <View style={{ marginBottom: convert(20) }} key={image._id}>
                                            <Image
                                                style={{
                                                    backgroundColor: Colors.lightGray,
                                                    marginLeft: convert(10),
                                                    width: winWidth - convert(60),
                                                    height: winWidth - convert(60)
                                                }}
                                                // width={winWidth - convert(60)}
                                                source={{
                                                    uri: image.url
                                                        + '?imageMogr2/auto-orient/format/jpg/interlace/1/size-limit/$(fsize)'
                                                }}
                                            />
                                        </View>
                                    )
                                }
                                {topic.type === 'video' && _.get(topic, 'elements.videos.0.url') &&
                                    <View>
                                        <Video
                                            source={{ uri: _.get(topic, 'elements.videos.0.url') }}
                                            ref='player'
                                            rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                                            volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                                            muted={false}                // true代表静音，默认为false.
                                            paused={true}               // true代表暂停，默认为false
                                            resizeMode="cover"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                                            repeat={false}                // 是否重复播放
                                            playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                                            playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                                            style={{
                                                height: convert(200),
                                                borderRadius: convert(12),
                                            }}
                                        />
                                        <TouchableIcon
                                            style={{
                                                top: convert(60),
                                                left: winWidth / 2 - convert(50),
                                                position: 'absolute',
                                            }}
                                            size={convert(50)}
                                            name="md-play-circle"
                                            color='#fff'
                                        /></View>}
                                {topic.type === 'realm' &&
                                    <RealmCard
                                        realm={topic.elements.realm}
                                        styles={{
                                            margin: convert(20),
                                            width: winWidth - convert(100)
                                        }}
                                    />
                                }
                                {topic.type === 'topic' &&
                                    <TopicCard
                                        topic={topic.elements.topic}
                                        styles={{
                                            margin: convert(20),
                                            width: winWidth - convert(100)
                                        }}
                                    />
                                }
                                {topic.type === 'link' && _.get(topic, 'elements.link') &&
                                    <View
                                        style={{
                                            margin: convert(15),
                                            height: convert(180)
                                        }}
                                    >
                                        <LinkCard
                                            link={_.get(topic, 'elements.link')}
                                        />
                                    </View>}

                                {
                                    _.get(topic, 'statistics.numOfMessages') !== 0 ? <View
                                        style={{
                                            flexDirection: 'row',
                                            marginTop: convert(5),
                                            marginBottom: convert(5),
                                            paddingHorizontal: convert(15),
                                            backgroundColor: Colors.lightGray,
                                            height: convert(30),
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: convert(12),
                                                lineHeight: convert(16),
                                                marginRight: convert(3)
                                            }}
                                        >
                                            {
                                                _.get(topic, 'statistics.numOfMessages')
                                            } 条消息 · {_.get(topic, 'statistics.numOfMembers')} 人参与
                                        </Text>
                                    </View>
                                        : <View
                                            style={{
                                                backgroundColor: Colors.lightGray,
                                                height: convert(10),
                                            }}
                                        />
                                }

                                <FlatList
                                    // style={{ flexGrow: 0 }}
                                    contentContainerStyle={{ paddingVertical: 10 }}
                                    onEndReached={() => {
                                        this.loadPreviousMessages()
                                    }}
                                    onEndReachedThreshold={10}
                                    data={topics[topic._id].messages}
                                    keyExtractor={(item, index) => item + index}
                                    renderItem={({ item }) => (
                                        <MessageCardSimple
                                            message={item}
                                            fromMyself={_.get(item, 'item.fromUser') && item.fromUser._id === user._id}
                                        />
                                    )}
                                    ListEmptyComponent={
                                        <View style={{
                                            paddingTop: convert(50),
                                            backgroundColor: '#fff',
                                            height: convert(80)
                                        }}>
                                            <Text
                                                style={{
                                                    fontSize: convert(20),
                                                    color: Colors.darkGray,
                                                    alignSelf: 'center',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {_.get(topic, 'statistics.numOfMessages') !== 0 ? '加载评论中...' : '发表第一条回复'}
                                            </Text>
                                        </View>
                                    }
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </View>
            </View>

        );
    }
}


const styles = StyleSheet.create({
    slideInnerContainer: {
        backgroundColor: '#fff',
        borderRadius: convert(20),
        width: winWidth - convert(40),
        height: 0.75 * winHeight,
        marginTop: convert(10),
    },
});