import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Text,
    Linking,
    DeviceEventEmitter,
    ToastAndroid
} from 'react-native';
import Button from '../Button';
import Colors from '../../constants/Colors';
import { convert } from "../../utils/ratio";
import Router from '../../router';
// import RNFetchBlob from 'react-native-fetch-blob'
interface Props {
    app: Router;
    visible: boolean;
    next: any;
}

interface State {
    visible: boolean;
}

export default class Updater extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            visible: this.props.visible
        }
    }
    render() {
        const { next, visible, app } = this.props
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={visible}
                onRequestClose={() => {  }}>
                <View style={styles.modalBackground}>
                    <View style={styles.activityIndicatorWrapper}>
                        <Text style={{ fontSize: convert(26), color: 'black' }}>发现新版本</Text>
                        <Text style={styles.heading}>最新版本</Text>
                        <Text>{next.version}</Text>
                        <Text style={styles.heading}>版本介绍</Text>
                        <Text>{next.intro}</Text>
                        <Button
                            onPress={() => {
                                // Linking.openURL(next.downloadUrl)
                                console.warn('更新');
                                // const android = RNFetchBlob.android;
                                // RNFetchBlob.config({
                                //     addAndroidDownloads: {
                                //         // 调起原生下载管理
                                //         useDownloadManager: true,
                                //         // 你想要设置的下载的安装包保存的名字
                                //         title: 'realm.apk',
                                //         // 下载时候顶部通知栏的描述
                                //         description: '下载完成之后将会自动安装',
                                //         // 下载的文件格式
                                //         mime: 'application/vnd.android.package-archive',
                                //         // 下载完成之后扫描下载的文件
                                //         mediaScannable: true,
                                //         // 通知栏显示下载情况
                                //         notification: true,
                                //         // 文件下载的同时缓存起来，提高操作效率
                                //         fileCache: true
                                //     }
                                // })
                                //     .fetch('GET', `https://storage.public.atrealm.com/android/beta/realm_beta_1.5.0.apk`)
                                //     .progress((received: any, total: any) => {
                                //         // todo：貌似下载进度无法响应
                                //         DeviceEventEmitter.addListener('LOAD_PROGRESS', (msg) => {
                                //             let title = "当前下载进度：" + msg
                                //             ToastAndroid.show(title, ToastAndroid.SHORT);
                                //         }); 
                                //         console.warn('下载进度：' + Math.floor(received / total * 100) + '%')
                                //     })
                                //     .then((res: any) => {
                                //         // 下载完成之后自动切换到安装管理程序
                                //         android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
                                //     })
                                //     .catch((err: any) => {
                                //         console.warn('下载失败');
                                //         console.warn(err);
                                //     });
                            }}
                            style={{ marginTop: convert(40) }}
                        >下载最新版本</Button>
                        <Button
                            onPress={() => {
                                app.setState({ showUpdater: false });
                            }}
                            style={{ marginTop: convert(10) }}
                        >暂不更新</Button>
                        <Text style={{
                            fontSize: convert(12),
                            marginTop: convert(15),
                            borderTopColor: Colors.lightGray,
                            borderTopWidth: convert(1),
                            paddingTop: convert(15)
                        }}>
                            Android 版本目前处于公测阶段，推荐尽快升级到最新版本
                        </Text>
                    </View>
                </View>
            </Modal>
        )
    }

}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
    },
    heading: {
        marginTop: 20,
        marginBottom: 3,
        color: 'black'
    }
});