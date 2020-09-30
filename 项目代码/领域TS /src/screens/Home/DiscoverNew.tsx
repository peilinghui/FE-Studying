import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps, NavigationActions, StackActions, } from 'react-navigation';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors';
import { convert, winWidth, winHeight } from '../../utils/ratio';
import Icon from 'react-native-vector-icons/Feather'
import SliderEntry from './SliderEntry';
import { connect } from 'react-redux'
import { BoxShadow } from 'react-native-shadow'
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Zhugeio from 'react-native-plugin-zhugeio'
import TouchableIcon from '../../components/TouchableIcon';
interface Props extends NavigationScreenProps {
    dispatch: Function,
    recommendedTopics: any[]
    user: any
}

interface State {
    hasNext: boolean;
    offset: number;
    isBusy: boolean
    selectedItem: number
}

@(connect(
    ({
        'discover': { recommendedTopics },
        auth: { detail },
    }: any) => ({
        user: detail,
        recommendedTopics,
    })) as any)


export default class DiscoverNewScreen extends React.Component<Props, State> {

    private tabView?: any
    static navigationOptions = {
        header: null
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            hasNext: true,
            offset: 0,
            isBusy: false,
            selectedItem: 0
        };
    }

    componentDidMount() {
        Zhugeio.startTrack('发现Tab页面');
    }

    componentWillUnmount() {
        Zhugeio.endTrack('发现Tab页面', {});
    }

    render() {
        const { dispatch, recommendedTopics, user, navigation } = this.props
        const { selectedItem } = this.state
        let horizontalPages = [];
        if (recommendedTopics) {
            for (let i = 0; i < recommendedTopics.length; i++) {
                const topic = recommendedTopics[i];
                horizontalPages.push(
                    <SliderEntry
                        dispatch={this.props.dispatch}
                        topic={topic}
                        user={user}
                        key={i}
                        onPress={() => {
                            navigation.push('TopicViewer', {
                                topicId: topic._id,
                                topicData: topic
                            })
                        }}
                    ></SliderEntry>
                );
            }
        }
        return (
            <View style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="rgba(0,0,0,0.1)"
                    translucent={true}
                />
                <View style={styles.topView}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => dispatch(NavigationActions.navigate({ routeName: 'Search' }))}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#cccccc44',
                            margin: convert(15),
                            marginTop: 0,
                            borderRadius: convert(10),
                            paddingHorizontal: convert(10),
                            paddingVertical: convert(10),
                        }}
                    >
                        <Icon name="search" style={{ color: '#555555bb', fontSize: convert(13), marginRight: convert(5) }} />
                        <Text style={{ color: '#555555aa', fontSize: convert(13), }}>搜索领域或用户</Text>
                    </TouchableOpacity>
                </View>
                <BoxShadow setting={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingTop: convert(10),
                    paddingBottom: convert(10),
                    width: winWidth,
                    height: winHeight * 0.8,
                    color: "#000",
                    border: convert(50),
                    opacity: 0.1,
                    radius: convert(46),
                    x: convert(2),
                    y: convert(50),
                }}>
                    <ScrollableTabView
                        renderTabBar={() => <View />}
                        ref={(tabView: any) => {
                            this.tabView = tabView;
                        }}
                        onChangeTab={
                            (obj: { i: any; }) => {
                                this.setState({ selectedItem: obj.i })
                            }
                        }
                        activeTab={this.state.selectedItem}
                        initialPage={0}
                        tabBarBackgroundColor={'white'}
                        tabBarUnderlineColor={'white'}
                        tabBarActiveTextColor={'white'}
                        tabBarInactiveTextColor={'white'}
                        scrollWithoutAnimation={true}
                    >
                        {horizontalPages}
                    </ScrollableTabView>
                    <View
                        style={{
                            backgroundColor: Colors.lightGray,
                            borderRadius: convert(25),
                            height: convert(50),
                            width: convert(50),
                            position: 'absolute',
                            bottom: convert(15),
                            right: convert(15),
                            overflow: 'hidden',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        {selectedItem < 6 ?
                            <Text style={{ color: '#787878', fontSize: convert(20) }}>{6 - selectedItem} </Text>
                            : <TouchableIcon
                                name="md-sync"
                                color='#787878'
                                onPress={() => {
                                    dispatch({ type: 'app/showLoading' })
                                    dispatch({
                                        type: 'discover/refresh',
                                        callback: () => {
                                            dispatch({ type: 'app/hideLoading' })
                                            this.tabView.goToPage(0)
                                        }
                                    })
                                }}
                            />}
                    </View>
                </BoxShadow>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        elevation: 0,
        backgroundColor: 'white'
    },
    topView: {
        paddingHorizontal: convert(6),
        paddingTop: getStatusBarHeight(true) + convert(10),
        backgroundColor: 'white'
    },
});
