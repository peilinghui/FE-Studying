/**
 * Created by HuangXiaoFeng on 2018-02-08.
 */
import React, { PureComponent } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    Alert,
    StyleSheet,
    Dimensions,
    Image,
    StatusBar
} from 'react-native';
import ScrollableTabView, {DefaultTabBar,ScrollableTabBar} from 'react-native-scrollable-tab-view';
import VideoFlatList from '../components/VideoFlatList'
import { isLT19 } from '../utils/ScreenUtil'

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default class Home extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {

        }
    }

    tabArr = [
        {columnName: '推荐', requestCode: 'home'},
        {columnName: '搞笑', requestCode: 'home'},
        {columnName: '影视', requestCode: 'home'},
        {columnName: '音乐', requestCode: 'home'},
        {columnName: '现场', requestCode: 'home'},
        {columnName: '黑科技', requestCode: 'home'},
        {columnName: '小品', requestCode: 'home'},
        {columnName: '萌物', requestCode: 'home'},
        {columnName: '猎奇', requestCode: 'home'},
        {columnName: '军武', requestCode: 'home'},
        {columnName: '涨姿势', requestCode: 'home'}
    ];

    componentDidMount() {

    }


    render() {
        return(
            <View style={styles.container}>
                {/* 状态栏 */}
                <StatusBar backgroundColor={'rgba(255,255,255, 0)'} translucent={true} animated={true}/>

                {/* 栏目条 */}
                <View style={styles.container}>

                    <ScrollableTabView
                        ref={'tabView'}
                        renderTabBar={() => <ScrollableTabBar style={{borderBottomWidth: 0, paddingBottom: 5, width: screenWidth }} />}
                        tabBarUnderlineStyle={{ height: 2, minWidth: Math.floor(screenWidth* .9/5), backgroundColor: 'rgba(216,30,6,.8)'}}
                        tabBarInactiveTextColor="#515151"
                        tabBarActiveTextColor="#d81e06"
                        tabBarTextStyle={{fontSize: 15}}
                        onChangeTab={(ref)=>{}}
                        onScroll={(postion)=>{}}
                        locked={false}
                        initialPage={0}
                    >

                        {
                            this.tabArr.map(item => {
                                return (
                                    <VideoFlatList
                                        key={item.columnName}
                                        tabLabel={item.columnName}
                                        requestCode={item.requestCode}
                                        navigation={ this.props.navigation }
                                    />
                                )
                            })
                        }

                    </ScrollableTabView>

                </View>

            </View>

        );
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        paddingTop: isLT19()?0:10,
    },
    tabViewItemContainer: {
        flex: 1,
        backgroundColor: '#FFCCCC',
        justifyContent: 'center',
        alignItems: 'center'
    }

});