import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ToastAndroid,
    WebView,
    Modal,
    StatusBar,
} from 'react-native'

import { convert, winWidth, winHeight } from '../../utils/ratio';
import TouchableIcon from "../TouchableIcon"
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'

// interface Props {
//     onClose: () => void
//     visible: boolean
//     topic: any;
//     onPress: (item: any) => void
// }

interface Props extends NavigationScreenProps {
    dispatch: Function
    user: any
}

interface State {}

export default class LinkModal extends React.Component<Props, State> {

    private topic: any

    constructor(props: Props) {
        super(props);
        this.topic = this.props.navigation.getParam('topic')
    }

    render() {
        const { navigation } = this.props
        return (
            <View style={{
                backgroundColor: '#fff',
                flex: 1,
                justifyContent: 'flex-start',
                alignItems: 'stretch'
            }}>
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
                    }}>外部链接</Text>
                </View>
                <WebView style={styles.list}
                    source={{ uri: this.topic.elements.link.url }}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    startInLoadingState={true}
                    useWebKit={true}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});