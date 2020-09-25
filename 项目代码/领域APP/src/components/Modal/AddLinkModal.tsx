import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput
} from 'react-native'
// import Modal from './Modal'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import TouchableIcon from "../TouchableIcon"
import Colors from '../../constants/Colors';

interface Props {
    onClose: () => void
    visible: boolean
    onPress: (item: any) => void
}

interface State {
    textContent: string;
}

export default class AddLinkModal extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.state = {
            textContent: '',
        }
    }

    render() {
        const { visible, onClose, onPress} = this.props
        const { textContent } =this.state;
        return (
            <Modal
                animationType={'slide'}
                transparent={true}
                visible={visible}
            >
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1 }}>
                    <View style={{ backgroundColor: '#fff', flex: 1, marginTop: convert(300),borderRadius:convert(12) }}>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                height: convert(50),
                            }}>
                            <Text style={{
                                fontSize: convert(20),
                                fontWeight: '600',
                                color: 'black',
                                marginLeft: convert(20),
                                marginTop: convert(15),
                            }}>添加链接/外部视频</Text>
                            <TouchableOpacity
                                style={{
                                    right: 0,
                                    margin: convert(10),
                                    backgroundColor: textContent ? Colors.blue : Colors.darkGray,
                                    borderRadius:convert(12),
                                    width:convert(70),
                                    height:convert(20),
                                    justifyContent:'center',
                                    alignItems:'center',
                                }}
                                onPress={textContent ? onPress:onClose}
                            >
                                {textContent?<Text style={{color:'#fff'}}>发布</Text>
                                    : <Text style={{ color: '#fff' }}>取消</Text>}
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={{
                                fontSize: convert(14),
                                lineHeight: convert(24),
                                height: convert(200),
                                textAlignVertical: 'top',
                                margin:convert(20)
                            }}
                            multiline={true}
                            placeholder={'复制链接到这里，支持微信，知乎，豆瓣等网站链接插入，支持微博，抖音，爱奇艺等主流视频网站嵌入播放'}
                            onChangeText={textContent => this.setState({ textContent })}
                        />
                        {/* <WebView style={styles.list}
                            source={{ uri: this.state.textContent }}
                            domStorageEnabled={true}
                            javaScriptEnabled={true}
                            startInLoadingState={true}
                        /> */}
                    </View>
                </View>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    list: {
        backgroundColor: '#FFFFFF',
    },
});