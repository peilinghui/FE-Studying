import React from 'react'
import _ from 'lodash';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    ToastAndroid,
    Switch,
} from 'react-native'
import { NavigationScreenProps } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import Icon from 'react-native-vector-icons/Ionicons'
import ImagePicker from 'react-native-image-crop-picker'
import Avatar from '../../components/Avatar'
import { getRandomRealmCoverImages } from '../../services/file'
import { hexCode } from '../../services/realm'
import { convert } from '../../utils/ratio'
import TouchableIcon from '../../components/TouchableIcon'
import { NavigationScreenProp } from 'react-navigation'
import FastImage from 'react-native-fast-image';

interface Props extends NavigationScreenProps {
    dispatch: Dispatch<any>
    realmCallback: any
    currentUser: any
    navigation: NavigationScreenProp<any>
}

interface State {
    step: number
    title: string
    intro: string
    creatorIntro: string
    coverImageFileId: string
    request: boolean
    coverImageUrl: string
    coverImageHexCode: string
    btn1: boolean
}

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)
export default class ModifyRealmScreen extends React.Component<Props, State> {
    static navigationOptions = {
        header: null
    }
    private introInput: any
    private creatorInput: any
    private realm: any

    constructor(props: Props) {
        super(props)
        this.introInput = React.createRef()
        this.creatorInput = React.createRef()
        this.realm = this.props.navigation.getParam('realm')


        this.state = {
            step: 1,
            title: this.realm.title,
            intro: this.realm.intro,
            creatorIntro: this.realm.creatorIntro,
            coverImageFileId: this.realm.coverImage._id,
            request: this.realm.membership === 'request' ? true:false,
            coverImageUrl: this.realm.coverImage.url,
            coverImageHexCode: '',
            btn1: _.get(this.realm,'isPrivate') && this.realm.isPrivate?false:true,
        }
    }

    // async componentDidMount() {
    //     const { RGB } = await hexCode(this.realm.coverImage.url)
    //     const color = RGB.substr(2)
    //     this.setState({ coverImageHexCode: color })
    // }

    next = () => {
        const { step, creatorIntro } = this.state
        const { dispatch, realmCallback } = this.props
        if (step === 3) {
            //创建领域
            const { title, intro, creatorIntro, coverImageFileId, request, btn1 } = this.state
        
            dispatch({ type: 'app/showLoading' })
            dispatch({
                type: 'realm/updateRealm',
                realmId: this.realm._id,
                title,
                intro,
                creatorIntro,
                fileId:coverImageFileId,
                request,
                isPrivate: btn1 ? 0 : 1,
                callback: () => {
                    dispatch({ type: 'app/hideLoading' })
                    const { navigate, goBack, state } = this.props.navigation;
                    state.params.callback(this.state);
                    this.props.navigation.pop()
                },
                onError: () => {
                    ToastAndroid.show('图片上传失败', ToastAndroid.LONG);
                    dispatch({ type: 'app/hideLoading' })
                }
            })
        } else if (step === 2 && creatorIntro === '' && this.creatorInput) {
            this.creatorInput.current.focus()
        } else {
            this.setState(
                ({ step }: any) => ({ step: Math.floor(step + 1) }),
                () => {
                    if (this.state.step === 2 && this.introInput) {
                        this.introInput.current.focus()
                    }
                }
            )
        }
    }

    coverImageHexCode = async (url: string) => {
        const { RGB } = await hexCode(url)
        const color = RGB.substr(2)
        this.setState({
            coverImageHexCode: color
        })
    }

    randomCoverImage = async () => {
        const [{ url, _id }] = await getRandomRealmCoverImages()
        this.setState({
            coverImageFileId: _id,
            coverImageUrl: url,
        })
        await this.coverImageHexCode(url)
    }

    openPicker = async () => {
        const { dispatch } = this.props
        dispatch({ type: 'file/qiniuToken' })
        const image = await ImagePicker.openPicker({ mediaType: 'photo' })
        dispatch({ type: 'app/showLoading' })
        dispatch({
            type: 'file/upload',
            files: [image],
            callback: async ([{ url, response }]: any[]) => {
                this.setState({
                    coverImageFileId: response._id,
                    coverImageUrl: url,
                })
                dispatch({ type: 'app/hideLoading' })
                await this.coverImageHexCode(url)
            }
        })
    }

    render() {
        const { currentUser, navigation } = this.props
        const {
            step,
            title,
            intro,
            creatorIntro,
            coverImageFileId,
            request,
            coverImageHexCode,
            coverImageUrl,
            btn1,
        } = this.state
        
        return (
            <View
                style={{
                    flex: 1,
                    paddingTop: getStatusBarHeight(true),
                    backgroundColor: coverImageHexCode !== '' ? `#${coverImageHexCode}aa` : '#000000'
                }}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />

                <View style={{ height: convert(20), justifyContent: 'center' }}>
                    <TouchableIcon name='md-arrow-back' size={convert(20)} color='#fff'
                        style={{ marginLeft: convert(20) }}
                        onPress={()=>this.props.navigation.pop()} />
                </View>

                {step < 3 ?
                    <ScrollView
                        style={{
                            backgroundColor: 'transparent',
                            flex: 1,
                            opacity: step === 3 ? 0.3 : 1,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#303030',
                                padding: convert(20),
                                ...(step === 1 ? {
                                    borderTopLeftRadius: convert(10),
                                    borderBottomLeftRadius: convert(10),
                                    marginTop: convert(20),
                                    marginLeft: convert(39),
                                    height: convert(201),
                                } : {
                                        borderRadius: convert(10),
                                        marginTop: convert(10),
                                        marginHorizontal: convert(31),
                                        height: 1000,
                                    }),
                            }}
                        >

                            <TextInput
                                style={{
                                    backgroundColor: 'transparent',
                                    borderColor: '#E5E5E5',
                                    borderWidth: step === 1 ? 1 : 0,
                                    color: '#fff',
                                    fontSize: convert(30),
                                    fontWeight: '500',
                                    height: convert(70)
                                }}
                                editable={step === 1}
                                placeholderTextColor='rgba(255,255,255,0.47)'
                                keyboardAppearance="dark"
                                placeholder={this.realm.title}
                                value={title}
                                onChangeText={(v) => this.setState({ title: v })}
                            />
                            {step > 1 ?
                                <View>
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '500',
                                        color: 'rgba(255,255,255,0.41)',
                                        marginBottom: convert(5)
                                    }}>修改领域介绍</Text>
                                    <TextInput
                                        ref={this.introInput}
                                        style={{
                                            height: convert(252),
                                            borderColor: '#E5E5E5',
                                            borderWidth: step === 2 ? 1 : 0,
                                            color: '#fff',
                                            textAlignVertical: 'top',
                                            fontSize: convert(19),
                                            fontWeight: '500',
                                            padding: convert(10),
                                        }}
                                        multiline
                                        keyboardAppearance="dark"
                                        editable={step === 2}
                                        placeholderTextColor='rgba(255,255,255,0.32)'
                                        placeholder={this.realm.intro}
                                        onChangeText={(v) => this.setState({ intro: v })}
                                        value={intro}
                                    />
                                    <Text style={{
                                        fontSize: convert(12),
                                        fontWeight: '500',
                                        color: 'rgba(255,255,255,0.41)',
                                        marginBottom: convert(5),
                                        marginTop: convert(20),
                                    }}>修改创建者介绍</Text>
                                    <TextInput
                                        ref={this.creatorInput}
                                        style={{
                                            height: convert(252),
                                            borderColor: '#E5E5E5',
                                            borderWidth: step === 2 ? 1 : 0,
                                            color: '#fff',
                                            textAlignVertical: 'top',
                                            fontSize: convert(19),
                                            fontWeight: '500',
                                            padding: convert(10)
                                        }}
                                        multiline
                                        keyboardAppearance="dark"
                                        editable={step === 2}
                                        placeholderTextColor='rgba(255,255,255,0.32)'
                                        placeholder={this.realm.creatorIntro}
                                        onChangeText={(text) => this.setState({ creatorIntro: text })}
                                        value={creatorIntro}
                                    />
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    :
                    <>
                        <View
                            key="imageSetting"
                            style={{
                                position: 'absolute',
                                top: 20,
                                flex: 1,
                                width: '100%',
                                zIndex: 10,
                            }}>
                            {coverImageUrl !== '' ?
                                <FastImage
                                    resizeMode='cover'
                                    source={{ uri: coverImageUrl }}
                                    style={{
                                        flex: 1,
                                        height: convert(137),
                                        borderRadius: convert(13),
                                        marginHorizontal: convert(33),
                                        marginTop: convert(57),
                                        paddingTop: convert(11),
                                        paddingLeft: convert(16),
                                        transform: [{ rotate: '-6deg' }]
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'rgba(228, 228, 228, 1)',
                                            fontSize: convert(13),
                                            fontWeight: '500',
                                        }}
                                    >{currentUser.profile.nickname} 的</Text>
                                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>{title}</Text>
                                </FastImage>
                                :
                                <View
                                    style={{
                                        backgroundColor: '#525252',
                                        flex: 1,
                                        height: convert(137),
                                        borderRadius: convert(13),
                                        marginHorizontal: convert(33),
                                        marginTop: convert(30),
                                        paddingTop: convert(11),
                                        paddingLeft: convert(16),
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'rgba(228, 228, 228, 1)',
                                            fontSize: convert(13),
                                            fontWeight: '500',
                                        }}
                                    >{currentUser.profile.nickname} 的</Text>
                                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>{title}</Text>
                                </View>}
                            <View style={{ alignItems: 'center', marginTop: coverImageFileId !== '' ? convert(23) : convert(50) }}>
                                <Text style={{ fontSize: convert(35), fontWeight: '600', color: 'white' }}>修改该领域</Text>
                                <Text style={{ fontSize: convert(35), fontWeight: '600', color: 'white' }}>封面图片</Text>
                            </View>
                            <View
                                style={{
                                    marginTop: convert(40),
                                    flexDirection: 'row',
                                    flex: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                    borderRadius: 10,
                                    height: convert(50),
                                    marginHorizontal: 20,
                                }}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRightColor: '#fff',
                                        borderRightWidth: 1
                                    }}
                                    onPress={this.randomCoverImage}
                                >
                                    <Icon name="ios-flash" size={19} color="#fff" />
                                    <Text style={{ marginLeft: convert(12), color: '#fff' }}>随机{coverImageFileId !== '' ? '再来张' : '来一张'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={this.openPicker}
                                >
                                    <Icon name="ios-albums" size={19} color="#fff" />
                                    <Text style={{ marginLeft: convert(12), color: '#fff' }}>从相册{coverImageFileId !== '' ? '重选' : '选择'}</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={{
                                flexDirection: 'row',
                                marginTop: convert(50),
                                marginLeft: convert(20),
                                marginRight: convert(20),
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{ marginLeft: convert(12), color: '#fff' }}>公开领域-内容对外可见</Text>
                                <View
                                    style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginRight: convert(1) }}>
                                    <Switch
                                        thumbColor={btn1 ? '#4caf50' : '#b0b0b0'}
                                        trackColor={{ true: '#81c784', false: '#d2d2d2' }}
                                        value={btn1}
                                        onValueChange={value => this.setState({ btn1: value })}
                                    />
                                </View>
                            </View>

                            {btn1 && this.realm.type === 'public' ?
                                <View style={{
                                    flexDirection: 'row',
                                    marginTop: convert(20),
                                    marginLeft: convert(20),
                                    marginRight: convert(20),
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{ marginLeft: convert(12), color: '#fff' }}>成员需申请加入</Text>
                                    <View
                                        style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginRight: convert(1) }}>
                                        <Switch
                                            thumbColor={request ? '#4caf50' : '#b0b0b0'}
                                            trackColor={{ true: '#81c784', false: '#d2d2d2' }}
                                            value={request}
                                            onValueChange={value => this.setState({ request: value })}
                                        />
                                    </View>
                                </View> : null}
                        </View>
                    </>
                }
                <KeyboardAvoidingView
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: convert(20),
                        paddingBottom: convert(24),
                    }}
                >
                    <Text
                        style={{
                            fontSize: convert(13),
                            color: step > 2 ? '#000' : 'rgba(255,255,255,0.47)',
                        }}
                    >step {this.state.step} of 3</Text>
                    <TouchableOpacity
                        style={{
                            width: convert(120),
                            height: convert(50),
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: convert(10),
                            backgroundColor: 'white'
                        }}
                        activeOpacity={0.7}
                        onPress={this.next}
                    >
                        <Text
                            style={{ color: step > 3 ? '#fff' : '#000', fontSize: convert(17), fontWeight: '600' }}
                        >{step === 3 ? '完成' : '下一步'} ></Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        )
    }
}
