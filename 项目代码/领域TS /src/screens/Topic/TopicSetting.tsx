import _ from 'lodash';
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    TouchableWithoutFeedback,
    Switch,
    ToastAndroid
} from 'react-native'
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors'
import { convert } from "../../utils/ratio";
import { getUserSettings, setNotification, archive, topicMembers } from '../../services/topic'
import 'moment/locale/zh-cn'
import Avatar from '../../components/Avatar'
import { connect } from 'react-redux'
import { detail as realmDetail } from '../../services/realm'


interface Props extends NavigationScreenProps {
    dispatch: Function
    user:any
}

interface State {
    value: boolean,
    members: any,
    isCreator:boolean
}

@(connect(({ auth: { detail } }: any) => ({ user: detail })) as any)

export default class TopicSettingScreen extends React.PureComponent<Props, State> {

    static navigationOptions = {
        header: null
    }
    private topicId: any
    private topic: any
    private userId: any

    constructor(props: Props) {
        super(props);
        this.topicId = this.props.navigation.getParam('topicId')
        this.topic = this.props.navigation.getParam('topic')
        this.userId = this.props.navigation.getParam('userId')
        this.state = {
            value: false,
            members: [],
            isCreator:false
        }
    }

    componentDidMount() {
        this.getMembers()
        this.getUserSettings()
        this.refreshRealm()
    }

    refreshRealm = async () => {
        const { user } = this.props
      
        const realm = await realmDetail(this.topic.realm._id, user._id)
        
        this.setState({
            isCreator: realm.creator._id === this.userId ? true:false,
        })
    }
    
    getUserSettings = async () => {
        const settings = await getUserSettings(this.topicId, this.userId)
        this.setState({ value: !settings.notification })
    }
    getMembers = async () => {
        const member = await topicMembers(this.topicId)
        this.setState({ members: member })
        const memebrsId = member.map((member: { _id: any; }, index: any) => { return member._id })
    }

    render() {
        const { value, members, isCreator } = this.state;
        const { navigation } = this.props
        const memebrsId = members.map((member: { _id: any; }, index: any) => { return member._id })

        return (
            <View>
                <StatusBar
                    barStyle={'dark-content'}
                    backgroundColor="rgba(0,0,0,0.1)"
                    translucent={true}
                />
                <View
                    style={{
                        marginTop: getStatusBarHeight(true),
                        paddingHorizontal: convert(20),
                        paddingVertical: convert(10),
                        height: convert(50),
                        flexDirection: 'row',
                    }}
                >
                    <TouchableOpacity
                        style={{ alignSelf: "flex-start" }}
                        activeOpacity={0.7}
                        onPress={() => navigation.pop()}
                    >
                        <Icon
                            name={'ios-arrow-back'}
                            size={convert(26)}
                            style={{ lineHeight: convert(30), color: "black" }}
                        />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: convert(20),
                        lineHeight: convert(30),
                        color: 'black',
                        fontWeight: 'bold',
                        marginLeft: convert(20)
                    }}>讨论信息</Text>
                </View>
                <View
                    style={{
                        marginTop: convert(27),
                        marginLeft: convert(24)
                    }}
                >
                    <Text
                        style={{
                            color: Colors.darkGray,
                            fontSize: convert(10)
                        }}
                    >参与者</Text>
                    <View style={{ flexDirection: 'row', marginTop: convert(16), height: convert(100) }}>
                        {
                            members.map((member: any, index: any) =>
                                <View style={{ padding: convert(5) }} key={index}>
                                    <Avatar size={convert(40)} user={member}></Avatar>
                                </View>
                            )
                        }
                        {
                            members.length > 6 &&
                            <View style={{ padding: convert(5),marginLeft:convert(5)}}>
                                <Icon size={convert(40)} name="ios-more" color='black'></Icon>
                            </View>
                        }
                    </View>
                </View>

                <View
                    style={{
                        marginTop: convert(10),
                        marginLeft: convert(24),
                        marginRight: convert(24)
                    }}
                >
                    <Text
                        style={{
                            color: Colors.darkGray,
                            fontSize: convert(10)
                        }}
                    >讨论设置</Text>
                    {memebrsId.indexOf(this.userId) > -1 ?
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: convert(18),

                        }}>
                            <Text
                                style={{
                                    color: 'black',
                                    fontSize: convert(20),
                                    fontWeight: 'bold'
                                }}
                            >消息免打扰</Text>
                            <Switch style={{}}
                                onValueChange={(value) => {
                                    this.setState({
                                        value: !this.state.value
                                    })
                                    setNotification(this.topicId, this.userId, value)
                                }}
                                value={value} />
                        </View> : null}
                    {this.topic.creator._id === this.userId || isCreator ?
                        <View
                            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    archive(this.topicId)
                                    ToastAndroid.show('该讨论已被封存，将不再显示在领域以及个人主页', ToastAndroid.LONG)
                                    navigation.pop()
                                }}>
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: convert(20),
                                        fontWeight: 'bold',
                                        marginTop: convert(20)
                                    }}
                                >{isCreator?'作为领域主删除讨论':'删除讨论'}</Text>

                            </TouchableWithoutFeedback>
                            <Text
                                style={{
                                    color: Colors.darkGray,
                                    fontSize: convert(10),
                                    marginTop: convert(30)
                                }}
                            >删除对已参与成员无效</Text>
                        </View>
                        : null}
                    <Text
                        style={{
                            color: 'red',
                            fontSize: convert(20),
                            fontWeight: 'bold',
                            marginTop: convert(20)
                        }}
                    >举报</Text>

                </View>
            </View>
        )
    }


}