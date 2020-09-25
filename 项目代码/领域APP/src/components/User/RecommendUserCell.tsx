import _ from 'lodash';
import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableWithoutFeedback,
    GestureResponderEvent
} from 'react-native'
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import { convert, winWidth } from "../../utils/ratio";
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;

interface Props {
    item: any;
    onPress?: OnPressCallback;
    onPressAvatar?: OnPressCallback;
    styles: any;
    onSelected: (onSelected: boolean, item: any) => void;
}

export default class RecommendUserCell extends React.PureComponent<Props>{
    state = {
        isSelect: false,
    }

    constructor(props: Props) {
        super(props);
   }

    render() {
        const { item } = this.props
        const { isSelect } = this.state;
        return (
            <View
                style={[
                    { width: winWidth / 3, height: convert(160) },
                ]}>
                <View
                    style={{
                        padding: convert(15),
                        backgroundColor: 'transparent',
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    <Image
                        source={{ uri: _.get(item, 'profile.avatar.url') }}
                        style={{ width: convert(60), height: convert(60), borderRadius: convert(30)}}
                    />
                    <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={[{ maxWidth: convert(100), marginTop: convert(6), lineHeight: 18, color: '#000', }]}
                    >{_.get(item, 'profile.nickname')}</Text>
                    <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={[{ marginTop: convert(6), fontSize: convert(12), lineHeight: convert(18), color: Colors.darkGray, }]}
                    >{_.get(item, 'profile.intro')}</Text>
                    <TouchableWithoutFeedback
                        style={{
                            width: convert(73),
                            height: convert(25),
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => {
                            isSelect? this.props.onSelected(false, item) : this.props.onSelected(true, item)
                            isSelect? this.setState({ isSelect: false }) : this.setState({ isSelect: true })
                            }}
                    >
                        <LinearGradient
                            colors={isSelect ? ['#007AFF', '#007AFF'] : ['#EFEFEF', '#EFEFEF'] }
                            start={{ y: 0.4, x: 0 }}
                            style={{
                                borderRadius: convert(10),
                                padding: convert(6),
                                flexDirection: 'row',
                                marginTop:convert(3),
                                width: convert(80),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: 'center',
                                    flex: 1,
                                    fontSize: convert(12),
                                    lineHeight: convert(18),
                                    color: isSelect ? '#fff' : '#007AFF'
                                }}
                            >{isSelect? "已关注" : "关注"}</Text>
                        </LinearGradient>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        )
    }
}
