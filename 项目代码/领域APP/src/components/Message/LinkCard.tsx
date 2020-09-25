import _ from 'lodash';
import React from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    GestureResponderEvent
} from 'react-native';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import { convert } from '../../utils/ratio';
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;

interface RealmJSONObject {
    [key: string]: any;
}

interface Props {
    link: RealmJSONObject;
    onPress?: OnPressCallback;
}

export default class LinkCard extends React.PureComponent<Props> {

    private onPress?: OnPressCallback;

    constructor(props: Props) {
        super(props);
        this.onPress = this.props.onPress;
    }

    render() {
        const { link } = this.props;

        return (
            <TouchableOpacity
                onPress={this.onPress}
                activeOpacity={1}
                style={{
                    backgroundColor: '#fff',
                    borderRadius: convert(12),
                    padding: convert(10),
                    height: convert(180),
                    margin:convert(5)
                }}
            >
                <View
                    style={{
                        flex: 1,
                    }}>
                    <FastImage
                        resizeMode={'cover'} // or cover
                        style={{
                          flex:1
                        }}
                        source={{ uri: _.get(link, 'coverImage') }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                color: 'black',
                                fontWeight: 'bold',
                                fontSize: convert(16),
                                marginTop: convert(15),
                                marginLeft: convert(10)
                            }}>{_.get(link, 'title')}</Text>
                        <Text style={{
                            color: Colors.darkGray,
                            fontSize: convert(12),
                            marginTop: convert(10),
                            marginLeft: convert(10)
                        }}
                            numberOfLines={1}>{_.get(link, 'description')}</Text>
                        <Text style={{
                            color: Colors.darkGray,
                            fontSize: convert(10),
                            marginTop: convert(5),
                            marginLeft: convert(10)
                        }}
                            numberOfLines={1}>{_.get(link, 'url')}</Text>
                    </View>

                </View>
            </TouchableOpacity>
        )
    }

}
