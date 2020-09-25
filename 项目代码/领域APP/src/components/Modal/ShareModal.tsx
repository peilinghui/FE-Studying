import React from 'react'
import { View, Text,  StyleSheet, TouchableOpacity, Image } from 'react-native'
import Modal from './Modal'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import FastImage from 'react-native-fast-image';

interface Props {
    onClose: () => void
    visible: boolean
    onPress: (item: any) => void
}

export default class ShareModal extends React.Component<Props, State> {
    shareList = ['领域好友', '微信好友', '朋友圈', '生成长图', '复制链接']
    imageData = [
        require('../../assets/Group.png'),
        require('../../assets/wechat.png'),
        require('../../assets/pengyouquan.png'),
        require('../../assets/share.png'),
        require('../../assets/link.png'),
    ]
    render() {
        const { visible, onClose, onPress } = this.props
 
        return (
            <Modal
                visible={visible}
                onClose={onClose}
                style={{ 
                    justifyContent: 'flex-end',
                    margin: 0, 
                    paddingTop: winHeight - convert(300)}}
            >
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
                        }}>分享讨论</Text>
                    </View>
                    <View style={styles.list}>
                        {
                            this.shareList.map((item: any, index: number) => {
                                return (
                                    <TouchableOpacity style={styles.listCell}
                                        key={index}
                                        onPress={()=>
                                            this.props.onPress(index)
                                        }>
                                        <FastImage source={this.imageData[index]}
                                            style={{ width: convert(50), height: convert(50) }} />
                                        <Text numberOfLines={1}
                                            style={{
                                                fontSize: convert(12),
                                                color: 'rgba(0,0,0,0.55)',
                                                marginTop: convert(8),
                                            }}>
                                            {item}</Text>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        marginLeft: convert(20)
    },
    listCell: {
        alignItems: 'center',
        justifyContent: 'center',
        height: convert(80),
        marginLeft: convert(20),
        marginRight: convert(20),
        borderRadius: convert(12),
        width: (winWidth - convert(160)) / 3,
        marginTop: convert(10)
    }
});