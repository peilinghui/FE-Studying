import React from 'react'
import _ from 'lodash';
import { View, Text, TouchableOpacity, Image, } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import TouchableIcon from '../../components/TouchableIcon'
import LinearGradient from 'react-native-linear-gradient';
import { NavigationScreenProp, NavigationActions } from 'react-navigation'
import FastImage from 'react-native-fast-image';
interface Props {
    dispatch: Dispatch<any>
    navigation: NavigationScreenProp<any>
}

type State = {
    btn1: boolean,
    btn2: boolean,
    btn3: boolean,
    price: string,
}

@(connect() as any)

export default class CoffeeCreate extends React.Component<Props, State> {
    static navigationOptions = {
        header: null
    }


    constructor(props: Props) {
        super(props)
        this.state = {
            btn1: true,
            btn2: false,
            btn3: false,
            price: '9.12'
        }
    }

    render() {
        const { dispatch, navigation } = this.props
        const { btn1, btn2, btn3 } = this.state

        return (
            <View style={{ paddingTop: getStatusBarHeight(true), backgroundColor: '#F4F4F5', height: winHeight }}>
                <View style={{ height: convert(40), justifyContent: 'center' }}>
                    <TouchableIcon name='md-arrow-back' size={convert(20)} color='#000000'
                        style={{ marginLeft: convert(20), marginRight: convert(16) }}
                        onPress={() => navigation.pop()} />
                </View>

                <FastImage
                    source={require('../../assets/bigcoffee.png')}
                    resizeMode={'stretch'}
                    style={{ width: winWidth, height: winHeight * 3 / 10 }}>
                </FastImage>
                <Image
                    source={btn1 ? require('../../assets/lite.png') : btn2 ? require('../../assets/regular.png') : require('../../assets/premium.png')}
                    resizeMode={'stretch'}
                    style={{ position: 'absolute', top: convert(70), right: convert(20), height: convert(22) }}>
                </Image>
                <Text
                    numberOfLines={1}
                    style={{ color: '#000', fontSize: convert(28), fontWeight: '600', marginTop: convert(12), paddingHorizontal: convert(38) }}>
                    选择领域的入场费
                </Text>

                <Text
                    style={{ color: 'rgba(0, 0, 0, 0.46)', fontSize: convert(15), marginTop: convert(6), paddingHorizontal: convert(38) }}>
                    领域收益100%归创建者，帮助意见领域在维护高质量社群的同时也能得到相应的回报。
                    </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        height: convert(62),
                        width: winWidth - convert(32),
                        backgroundColor: '#fff',
                        flexDirection: 'row',
                        borderRadius: convert(12),
                        marginLeft: convert(16),
                        marginRight: convert(16),
                        marginTop: convert(10),
                    }}
                    onPress={() => { this.setState({ btn1: true, btn2: false, btn3: false, price: '9.12' }) }}
                >
                    <View style={{
                        maxWidth: winWidth - convert(160),
                        justifyContent: 'center',
                        marginLeft: convert(17),
                    }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ marginLeft: convert(10) }}>
                                <Text style={{ fontSize: convert(15), color: 'black', fontWeight: 'bold', }}>¥ 9.12 / 季度</Text>
                                <Text style={{ fontSize: convert(13), color: 'rgba(0,0,0,0.55)' }}>Coffee Lite</Text>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginRight: convert(16) }}>
                        <TouchableIcon name={btn1 ? 'md-radio-button-on' : 'md-radio-button-off'} size={convert(25)} color='#007AFF'
                            onPress={() => { this.setState({ btn1: true, btn2: false, btn3: false, price: '9.12' }) }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        height: convert(62),
                        width: winWidth - convert(32),
                        backgroundColor: '#fff',
                        flexDirection: 'row',
                        borderRadius: convert(12),
                        marginLeft: convert(16),
                        marginRight: convert(16),
                        marginTop: convert(10),
                    }}
                    onPress={() => { this.setState({ btn2: true, btn1: false, btn3: false, price: '21.13' }) }}
                >
                    <View style={{
                        maxWidth: winWidth - convert(160),
                        justifyContent: 'center',
                        marginLeft: convert(17),
                    }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ marginLeft: convert(10) }}>
                                <Text style={{ fontSize: convert(15), color: 'black', fontWeight: 'bold', }}>¥ 21.13 / 季度</Text>
                                <Text style={{ fontSize: convert(13), color: 'rgba(0,0,0,0.55)' }}>Coffee Regular</Text>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginRight: convert(16) }}>
                        <TouchableIcon name={btn2 ? 'md-radio-button-on' : 'md-radio-button-off'} size={convert(25)} color='#007AFF'
                            onPress={() => { this.setState({ btn2: true, btn1: false, btn3: false, price: '21.13' }) }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        height: convert(62),
                        width: winWidth - convert(32),
                        backgroundColor: '#fff',
                        flexDirection: 'row',
                        borderRadius: convert(12),
                        marginLeft: convert(16),
                        marginRight: convert(16),
                        marginTop: convert(10),
                    }}
                    onPress={() => { this.setState({ btn3: true, btn2: false, btn1: false, price: '39.11' }) }}
                >
                    <View style={{
                        maxWidth: winWidth - convert(160),
                        justifyContent: 'center',
                        marginLeft: convert(17),
                    }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ marginLeft: convert(10) }}>
                                <Text style={{ fontSize: convert(15), color: 'black', fontWeight: 'bold', }}>¥ 39.11 / 季度</Text>
                                <Text style={{ fontSize: convert(13), color: 'rgba(0,0,0,0.55)' }}>Coffee Premium</Text>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginRight: convert(16) }}>
                        <TouchableIcon name={btn3 ? 'md-radio-button-on' : 'md-radio-button-off'} size={convert(25)} color='#007AFF'
                            onPress={() => { this.setState({ btn3: true, btn2: false, btn1: false, price: '39.11' }) }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        // navigation.push('RealmCreator', {
                        //     realmType: 'purchase',
                        //     price:this.state.price
                        // })
                        dispatch(NavigationActions.navigate({
                            routeName: 'RealmCreator',
                            params: {
                                realmType: 'purchase',
                                price: this.state.price
                            }
                        }))

                    }}
                >
                    <LinearGradient
                        colors={['#007AFF', '#007AFF']}
                        start={{ y: 0.4, x: 0 }}
                        style={{
                            borderRadius: convert(8),
                            margin: convert(15),
                            flexDirection: 'row',
                            height: convert(45),
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                flex: 1,
                                fontSize: convert(17),
                                lineHeight: convert(18),
                                color: 'white'
                            }}
                        >下一步</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )
    }
}

