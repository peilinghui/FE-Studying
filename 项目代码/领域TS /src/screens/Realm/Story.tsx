import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationActions, NavigationScreenProp, StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import 'moment/locale/zh-cn'
import Header from '../../components/Header'
import Zhugeio from 'react-native-plugin-zhugeio'
import TopicCard, {buildTopicCardHeight} from "../../components/TopicCard";
import {flatten} from "../../utils/functions";

interface Props {
	dispatch: Dispatch<any>
	navigation: NavigationScreenProp<any>
}

@(connect() as any)
export default class Story extends React.Component<Props> {

	private data: any;
	private dataFlatten: any;
	private timer?: NodeJS.Timeout;
	private _scrollView: any;
	
	constructor(props:any){
		super(props)
		this.data = this.props.navigation.getParam('data');
		this.dataFlatten = flatten(this.data)
	}
	
	
	//计算 跳转到的位置
	async componentDidMount(){
		Zhugeio.startTrack('最近动态页面');
		const dataWithHeight = await buildTopicCardHeight(this.dataFlatten)
		const signId = this.props.navigation.getParam('signId');
		let offset = 0;
		for(let i=0;i<=dataWithHeight.length;i++){
			if(dataWithHeight[i].creator._id === signId){
				break;
			}else {
				offset=offset+dataWithHeight[i].cardHeight
			}
		}
		this.timer = setTimeout(()=>{
			this._scrollView && this._scrollView.scrollTo({x: 0, y: offset, animated: true,});
		},200)
		
	}
	
	componentWillUnmount(){
		Zhugeio.endTrack('最近动态页面',{});
		this.timer && clearTimeout(this.timer );
	}
	
	
	
	render() {
		const { navigation, dispatch } = this.props;
		const data = navigation.getParam('data')
		const dataFlatten = flatten(data)
		return (
			<View style={ { flex:1,paddingTop: getStatusBarHeight(true) } }>
				<Header>
					<Text>关注人动态 </Text>
				</Header>
				<ScrollView
					ref={(ref)=>this._scrollView = ref}
					style={{marginBottom:20}}
				>
					{
						this.dataFlatten.map((item: any, index: number) => {
							return (
								<TopicCard
									key={index}
									onPress={(item) => {
										this.props.navigation.push('TopicViewer', {
											topicId: item._id,
											topicData: item
										})
									}}
									onPressAvatar={(user = {}) => {
										this.props.navigation.push('UserViewer', { userId: user._id })
									}}
									topic={item}
								/>
							)
						})
					}
				</ScrollView>
			
			</View>
		
		)
	}
}

