import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationActions, NavigationScreenProp, StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import Avatar from '../../components/Avatar'
import moment from 'moment'
import 'moment/locale/zh-cn'
import Header from '../../components/Header'
import Colors from '../../constants/Colors';
import { combineAtrr } from "../../utils/functions";
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'

interface Props {
	dispatch: Dispatch<any>
	navigation: NavigationScreenProp<any>
	refreshing: boolean,
	ListData: any,
	list: any,
	loading: boolean,
	hasNext: boolean,
	currentUser: any
}

@(connect(
	({
		'list.agree': { ListData, list, refreshing, loading, hasNext },
		auth: { detail }
	}: any) => ({
		ListData,
		list,
		loading,
		refreshing,
		hasNext,
		currentUser: detail
	})) as any)


export default class Agree extends React.Component<Props> {

	private userId: any

	componentDidMount() {
		const { navigation, dispatch, currentUser } = this.props;
		this.userId = navigation.getParam('userId')
		dispatch({ type: 'list.agree/fetch', userId: this.userId })
		if (this.userId === currentUser._id) {
			Zhugeio.startTrack('个人认同页面');
		} else {
			Zhugeio.startTrack('他人认同页面');
		}
	}


	componentWillUnmount() {
		this.props.dispatch({ type: 'list.agree/clear', })
		if (this.userId === this.props.currentUser._id) {
			Zhugeio.endTrack('个人认同页面', {});
		} else {
			Zhugeio.endTrack('他人认同页面', {});
		}
	}

	handleLoadMore = () => {
		if (this.props.loading) return

		if (this.props.ListData.length == 0) {
			return
		}

		if (!this.props.hasNext) {
			return
		}

		this.props.dispatch({ type: 'list.agree/next', userId: this.userId })
	}

	renderFooter = () => {
		return (
			<View style={{ width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', }}>
				{this.props.loading && <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />}
				{!this.props.hasNext && <Text style={{ color: Colors.darkGray }}>- 完 - </Text>}
			</View>
		)
	}

	render() {
		const { dispatch, refreshing, list, ListData, navigation, currentUser } = this.props;
		const AGREE_TYPES: { [key: string]: string } = {
			topic: '发起的话题',
			message: '回复'
		}
		const data = combineAtrr(list, ListData);
		console.log('=========',data)

		return (
			<View style={{ paddingTop: getStatusBarHeight(true) }}>
				<Header>
					<Text>获得的认同</Text>
				</Header>
				<FlatList
					contentContainerStyle={{ paddingTop: convert(10) }}
					refreshing={refreshing}
					onRefresh={() => dispatch({ type: 'list.agree/refresh', userId: this.userId })}
					data={data}
					keyExtractor={(item, index) => (index + '')}
					onEndReached={this.handleLoadMore}
					renderItem={({ item }: { item: any }) => {
						const { type, ofMessage = {}, ofTopic = {}, fromUser, createdAt, updatedAt } = item
						const { content: title, _id: topicId } = ofTopic
						const memo = type === 'topic' ? ofTopic.content : type === 'message' ? ofMessage.content : '讨论主题'
						return (
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => {
									dispatch(StackActions.push({
										routeName: 'TopicViewer',
										params: { topicId }
									}))
								}}
							>
								<View>
									{item.readText && <Text style={{ fontSize: convert(24), fontWeight: 'bold', marginLeft: convert(15), marginTop: convert(10), marginBottom: convert(30) }}>{item.readText}</Text>}
									<View
										style={{
											flexDirection: 'row',
											paddingHorizontal: convert(20),
											height: convert(64),
										}}>
										<View>
											<Avatar
												user={fromUser}
												size={convert(40)}
												onPress={() => {
													dispatch(StackActions.push({
														routeName: 'TopicViewer',
														params: { topicId }
													}))
												}}
											/>
										</View>
										<View style={{ marginLeft: convert(10) }}>
											<View style={{ flexDirection: 'row' }}>
												<Text numberOfLines={1} style={{ color: '#000' }}>{fromUser.profile.nickname}</Text>
												<Text style={{
													fontSize: convert(12),
													color: Colors.darkGray,
													marginLeft: convert(10),
													textAlignVertical: 'bottom'
												}}>
													{moment().from(updatedAt).replace('内', '前')}
												</Text>
											</View>
											<Text numberOfLines={1} style={{ color: Colors.darkGray, marginTop: convert(3), overflow: 'hidden', maxWidth: winWidth - convert(100) }}>
												认同了{this.userId === currentUser._id ? '你' : 'Ta'}{AGREE_TYPES[type]}：{memo}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						)
					}}
					ListEmptyComponent={
						<View style={{ paddingTop: convert(50) }}>
							<Text
								style={{
									fontSize: convert(20),
									color: Colors.darkGray,
									alignSelf: 'center'
								}}
							>
								还没有认同
							</Text>
						</View>
					}
					ListFooterComponent={() => this.renderFooter()}
				/>
			</View>

		)
	}
}
