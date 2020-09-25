import React from 'react'
import _ from 'lodash';
import { View, Text, TouchableOpacity, CameraRoll, ToastAndroid, StyleSheet, Image } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationScreenProp, NavigationActions } from 'react-navigation'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

interface Props {
    dispatch: Dispatch<any>
    navigation: NavigationScreenProp<any>
}

interface State {
   
}

@(connect() as any)
export default class NewCreateRealm extends React.Component<Props, State> {
    static navigationOptions = {
        header: null
    }

    render() {
        const { dispatch, navigation } = this.props
        return (
            <View style={{ paddingTop: getStatusBarHeight(true) }}>
                <FastImage
                    source={require('../../assets/create.png')}
                    style={{ width: winWidth, height: winHeight / 2+convert(10)}}>
                </FastImage>
                <Text
                    numberOfLines={1}
                    style={{ color: '#000', fontSize: convert(32), fontWeight: '600', marginTop: convert(12), textAlign:'center' }}>
                    创建一个领域
                </Text>

                <Text
                    style={{ color: 'rgba(0, 0, 0, 0.46)', fontSize: convert(15), marginTop: convert(6), textAlign:'center',paddingHorizontal:convert(35) }}>
                    助力意见领袖创造专属的深度交流空间，帮助链接彼此、创造交流的价值
                    </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        height: convert(64),
                        width: winWidth - convert(60),
                        backgroundColor: '#F3F3F3',
                        flexDirection: 'row',
                        borderRadius: convert(12),
                        marginLeft: convert(30),
                        marginRight: convert(30),
                        marginTop: convert(15),
                    }}
                    onPress={() => {
                        // navigation.push('RealmCreator',{
                        // })
                        dispatch(NavigationActions.navigate({
                            routeName: 'RealmCreator',
                            params:{
                                realmType: 'public'
                            }
                        }))

                    }}
                >
                    <View style={{
                        maxWidth: winWidth - convert(150),
                        justifyContent: 'center',
                        marginLeft: convert(15),
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/open.png')}
                                style={{ width: convert(40), height: convert(40) }} />
                            <View style={{ marginLeft: convert(12) }}>
                                <Text style={{ fontSize: convert(15), color: 'black', fontWeight: 'bold', }}>开放领域</Text>
                                <Text style={{ fontSize: convert(13), color: 'rgba(0,0,0,0.55)', marginTop: convert(4) }}>免费加入，无限制的领域</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name='ios-arrow-forward' size={17} color='#000000'
                            style={{ marginLeft: convert(10), marginRight: convert(16) }} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        height: convert(64),
                        width: winWidth - convert(60),
                        backgroundColor: '#F3F3F3',
                        flexDirection: 'row',
                        borderRadius: convert(12),
                        marginLeft: convert(30),
                        marginRight: convert(30),
                        marginTop: convert(10),
                    }}
                    onPress={() => {
                        // navigation.push('CoffeeCreate')
                        dispatch(NavigationActions.navigate({
                            routeName: 'CoffeeCreate',
                        }))
                    }}
                >
                    <View style={{
                        maxWidth: winWidth - convert(150),
                        justifyContent: 'center',
                        marginLeft: convert(15),
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/coffee.png')}
                                style={{ width: convert(40), height: convert(40) }} />
                            <View style={{ marginLeft: convert(12) }}>
                                <Text style={{ fontSize: convert(15), color: 'black', fontWeight: 'bold', }}>咖啡领域</Text>
                                <Text style={{ fontSize: convert(13), color: 'rgba(0,0,0,0.55)', marginTop: convert(4) }}
                                numberOfLines={1}
                                >付费订阅制，一杯咖啡钱加入</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name='ios-arrow-forward' size={17} color='#000000'
                            style={{ marginLeft: convert(10), marginRight: convert(16) }} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}
