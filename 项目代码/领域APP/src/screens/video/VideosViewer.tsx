import React, { Component } from 'react';
import { View, Dimensions, Image, Text, Slider, TouchableWithoutFeedback, TouchableOpacity, Button, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { winWidth, winHeight, convert } from '../../utils/ratio';
import _ from 'lodash'
import { getBottomSpace } from 'react-native-iphone-x-helper';

function formatTime(second: any) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    return [zero(h), zero(i), zero(s)].join(":");
}
interface Props {
    navigation: any
}
interface State {
    showVideoControl: boolean;
    isPlaying: boolean;
    currentTime: number
    duration: number
    isFullScreen: boolean
    playFromBeginning: boolean
    videoWidth: any,
    videoHeight: any
}

export default class VideoPlayScreen extends React.Component<Props, State>  {

    private videoPlayer?: any;
    constructor(props: any) {
        super(props);
        this.state = {
            showVideoControl: false, // 是否显示视频控制组件
            isPlaying: true,        // 视频是否正在播放
            currentTime: 0,        // 视频当前播放的时间
            duration: 0,           // 视频的总时长
            isFullScreen: false,     // 当前是否全屏显示
            playFromBeginning: false, // 是否从头开始播放
            videoWidth: winWidth,
            videoHeight: winHeight
        };
    }

    render() {

        return (
            <View style={styles.container} onLayout={this._onLayout} >
                <View style={{ width: this.state.videoWidth, height: this.state.videoHeight, backgroundColor: '#000000' }}>

                    <Video
                        ref={(ref: any) => this.videoPlayer = ref}
                        source={{ uri: _.get(this.props.navigation.getParam('videoURL'), 'elements.videos.0.url') }}
                        rate={1.0}
                        volume={1.0}
                        muted={false}
                        paused={!this.state.isPlaying}
                        resizeMode={'contain'}
                        playWhenInactive={false}
                        playInBackground={false}
                        ignoreSilentSwitch={'ignore'}
                        progressUpdateInterval={250.0}
                        onLoadStart={this._onLoadStart}
                        onLoad={this._onLoaded}
                        onProgress={this._onProgressChanged}
                        onEnd={this._onPlayEnd}
                        onError={this._onPlayError}
                        onBuffer={this._onBuffering}
                        style={{ width: this.state.videoWidth, height: this.state.videoHeight }}
                    />

                    <View style={{
                        width: this.state.videoWidth,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        height: convert(50),
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        position: 'absolute',
                        bottom: 0 + getBottomSpace(),
                        left: 0,
                    }}>
                        <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlPlayPress() }}>
                            <Image
                                style={styles.playControl}
                                source={this.state.isPlaying ? require('../../assets/icon_control_pause.png') : require('../../assets/icon_control_play.png')}
                            />
                        </TouchableOpacity>
                        <Text style={styles.time}>{formatTime(this.state.currentTime)}</Text>
                        <Slider
                            style={{ flex: 1 }}
                            maximumTrackTintColor={'#999999'}
                            minimumTrackTintColor={'#00c06d'}
                            thumbImage={require('../../assets/icon_control_slider.png')}
                            value={this.state.currentTime}
                            minimumValue={0}
                            maximumValue={this.state.duration}
                            onValueChange={(currentTime) => { this.onSliderValueChanged(currentTime) }}
                        />
                        <Text style={styles.time}>{formatTime(this.state.duration)}</Text>
                        <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlShrinkPress() }}>
                            <Image
                                style={styles.shrinkControl}
                                source={this.state.isFullScreen ? require('../../assets/icon_control_shrink_screen.png') : require('../../assets/icon_control_full_screen.png')}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    /// -------Video组件回调事件-------

    _onLoadStart = () => {
        // console.log('视频开始加载');
    };

    _onBuffering = () => {
        // console.log('视频缓冲中...')
    };

    _onLoaded = (data: { duration: number; }) => {
        // console.log('视频加载完成');
        this.setState({
            duration: data.duration,
        });
    };

    _onProgressChanged = (data: { currentTime: number; }) => {
        // console.log('视频进度更新');
        if (this.state.isPlaying) {
            this.setState({
                currentTime: data.currentTime,
            })
        }
    };

    _onPlayEnd = () => {
        // console.log('视频播放结束');
        this.setState({
            currentTime: 0,
            isPlaying: false,
            playFromBeginning: true
        });
    };

    _onPlayError = () => {
        // console.log('视频播放失败');
    };

    /// 点击了播放器正中间的播放按钮
    onPressPlayButton() {
        let isPlay = !this.state.isPlaying;
        this.setState({
            isPlaying: isPlay,
        });
        if (this.state.playFromBeginning) {
            this.videoPlayer.seek(0);
            this.setState({
                playFromBeginning: false,
            })
        }
    }

    /// 点击了工具栏上的播放按钮
    onControlPlayPress() {
        this.onPressPlayButton();
    }

    // 点击了工具栏上的全屏按钮
    onControlShrinkPress() {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToLandscape();
        }
    }

    /// 进度条值改变
    onSliderValueChanged(currentTime: number) {
        this.videoPlayer.seek(currentTime);
        if (this.state.isPlaying) {
            this.setState({
                currentTime: currentTime
            })
        } else {
            this.setState({
                currentTime: currentTime,
                isPlaying: true,
            })
        }
    }

    // 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
    _onLayout = (event: any) => {
        //获取根View的宽高
        let { width, height } = event.nativeEvent.layout;

        // 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                videoWidth: width,
                videoHeight: height,
                isFullScreen: true,
            })
        } else {
            this.setState({
                videoWidth: width,
                videoHeight: winHeight,
                isFullScreen: false,
            })
        }
        // Orientation.unlockAllOrientations();
    };

    ///播放视频，提供给外部调用
    playVideo() {
        this.setState({
            isPlaying: true,
        })
    }

    /// 暂停播放，提供给外部调用
    pauseVideo() {
        this.setState({
            isPlaying: false,
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0'
    },
    playControl: {
        width: convert(40),
        height: convert(40),
        marginLeft:convert(10)
    },
    shrinkControl: {
        width: convert(15),
        height: convert(15),
        marginRight: convert(15),
    },
    time: {
        fontSize: convert(15),
        color: 'white',
        marginLeft: convert(5),
        marginRight: convert(5),
    },
});