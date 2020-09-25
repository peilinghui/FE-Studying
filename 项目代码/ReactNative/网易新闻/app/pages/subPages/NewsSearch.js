/**
 * Created by HuangXiaoFeng on 2018-02-08.
 */

import React, { PureComponent } from 'react';
import {
    Platform,
    Dimensions,
    StyleSheet,
    Text,
    Button,
    View,
    Alert,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity
} from 'react-native';
import {isLT19} from './../../utils/ScreenUtil'
import ajax from './../../utils/fetch'
import Toast, {DURATION} from 'react-native-easy-toast'

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default class NewsSearch extends PureComponent{

    // 构造器
    constructor(props){
        super(props);
        this.state = {
            searchValue: this.props.navigation.state.params.keyword,
            placeholder: this.props.navigation.state.params.keyword
        };
    }

    // 设置默认输入参数
    static defaultProps = {

    };

    hotList = [
        {keyword: '景甜妈妈 张继科'},
        {keyword: '星巴克关闭店面'},
        {keyword: '魅族内讧'},
        {keyword: '老布什夫人去世'},
        {keyword: '5G争夺白热化'},
        {keyword: '美国客机迫降'},
        {keyword: '绿军2-0雄鹿'},
        {keyword: '记者暗访遭扣押'},
        {keyword: '电子身份证来了'},
        {keyword: '少年被批评后溺亡'}
    ];



    // 渲染完成钩子
    componentDidMount() {
        this.search.focus();
    }

    _onChangeText = (text)=> {

    };

    _onClearText = ()=> {

    };

    _setColor = (index) => {

        switch (index){
            case 0:
                return '#CC0000';
            case 1:
                return '#FF6600';
            case 2:
                return '#ffCC66';
            default:
                return '#bfbfbf'
        }

    };

    render() {
        return (
            <View style={styles.container}>

                {/* 头部搜索区域 */}
                <View style={styles.headerContainer}>
                    <View style={styles.searchContainer}>
                        <Image style={styles.searchImg} source={require('./../../../assets/images/i_search_grey.png')} resizeMode={'contain'} />
                        <TextInput
                            ref={ref => this.search = ref}
                            style={styles.inputStyle}
                            placeholder={this.state.placeholder}
                            placeholderTextColor="#bfbfbf"
                            underlineColorAndroid="transparent"
                            onChangeText={this._onChangeText}
                            onClearText={this._onClearText}
                        />
                    </View>

                    <TouchableOpacity style={{width: 55, alignItems: 'center'}} activeOpacity={1} onPress={()=>{this.props.navigation.goBack()}}>
                        <Text style={styles.cancelBtn}>取消</Text>
                    </TouchableOpacity>
                </View>

                {/* 搜索推荐列表 */}
                <View>

                    <ScrollView>
                        {/* hot search */}
                        <Text style={styles.hotSearch}>热门搜索</Text>

                        {
                            this.hotList.map((item, index) => {

                                return (
                                    <View key={index} style={styles.hotListItem}>
                                        <Text style={{color: this._setColor(index), marginRight: 5}}>
                                            {index+1}.
                                        </Text>
                                        <Text style={styles.itemText}>
                                            {item.keyword}
                                        </Text>
                                        {
                                            !index && <Image style={styles.hotImg} source={require('./../../../assets/images/i_hot.png')} resizeMode={'contain'} />
                                        }
                                    </View>
                                )

                            })
                        }

                    </ScrollView>

                </View>

            </View>
        );
    }

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingLeft: 10,
        backgroundColor: '#f8f8f8'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 70,
        paddingTop: isLT19()?0:25
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cdcdcd',
        borderRadius: 15,
        paddingHorizontal: 10,
    },
    searchImg: {
        width: 15,
        height: 15,
        marginRight: 5
    },
    inputStyle: {
        width: screenWidth * .7,
        padding: 0,
        color: '#000',
    },
    cancelBtn: {
        color: '#000'
    },
    hotSearch: {
        height: 25,
        marginTop: 30,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        color: '#bfbfbf',
    },
    hotListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#bcbcbc'
    },
    itemText: {
      color: '#000',
        marginRight: 5
    },
    hotImg: {
        width: 15,
        height: 15,
    }

});