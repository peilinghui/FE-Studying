import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	StatusBar,
	ActivityIndicator, ScrollView,
	DeviceEventEmitter
} from 'react-native'
import { NavigationScreenProps, NavigationActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import RealmCard from '../../components/RealmCard'
import Colors from '../../constants/Colors'
import Avatar from '../../components/Avatar'
import { connect } from 'react-redux'
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'
import { shallowEqualImmutable } from 'react-immutable-render-mixin';

interface Props extends NavigationScreenProps {
	dispatch: Function
	list: Object[]
	refreshing: boolean
	loading: boolean
	hasNext: boolean
	user: { _id: string }
	storys: any
}

@(connect(
	({
		'list.realm': { list, refreshing, loading, hasNext },
		story: { storys },
		auth: { detail },
	}: any) => ({
		list,
		loading,
		refreshing,
		hasNext,
		user: detail, storys
	})) as any)
export default class RealmListScreen extends React.Component<Props> {
	static navigationOptions = {
		header: null
	}
	componentDidMount(){
		Zhugeio.startTrack('领域Tab页面');
	
	}

	shouldComponentUpdate(nextProps: any, nextState: any) {
		return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
	}
	componentWillUnmount(){
		Zhugeio.endTrack('领域Tab页面',{});
		DeviceEventEmitter.removeAllListeners()
	}
	
	handleLoadMore = () => {
		if (this.props.loading) return

		if (this.props.list.length == 0) {
			return
		}

		if (!this.props.hasNext) {
			return
		}

		this.props.dispatch({ type: 'list.realm/next' })
	}

	renderFooter = () => {
		return (
			<View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
				{this.props.loading && <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />}
				{!this.props.hasNext && <Text style={{ color: Colors.darkGray }}>- 已加载全部 - </Text>}
			</View>
		)
	}

	renderHeader = () => {
		const { storys, dispatch } = this.props;
		if (storys && storys.length > 0) {
			return (
				<View
					style={{
						width: '100%',
						paddingVertical: convert(12),
						marginBottom: convert(12),
						backgroundColor: '#fff',
						borderBottomColor: Colors.lightGray,
						borderBottomWidth: convert(1)
					}}>
					<Text
						style={{
							fontSize: convert(17),
							fontWeight: 'bold',
							color: '#131313',
							marginBottom: convert(8),
							marginHorizontal: convert(20)
						}}
					>最近动态</Text>
					<ScrollView
						contentContainerStyle={{ paddingHorizontal: convert(16) }}
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						style={{ width: '100%', }}>
						{storys.map((item: any, index: number) => {
							return (
								<View style={{ alignItems: 'center', justifyContent: 'center' }} key={index}>
									<Avatar
										style={{ marginRight: convert(8) }}
										user={item[0].creator}
										size={convert(58)}
										activeStatus={true}
										onPress={() => dispatch(NavigationActions.navigate({
											routeName: 'Story',
											params: { data: storys, signId: item[0].creator._id },
										}))}
									/>
									<Text style={{ width: convert(58), textAlign: 'center',marginTop:convert(8),fontSize:convert(13)}}
										numberOfLines={1}
									>{item[0].creator.profile.nickname}</Text>
								</View>
							)
						})}
					</ScrollView>
				</View>
			)
		} else return null

	}

	_keyExtractor = (item: any, index: any) => `${item._id}${index}`
	render() {
		const { dispatch, list, refreshing, user, storys } = this.props
	
		return (
			<View style={styles.container}>
				<StatusBar
					barStyle="dark-content"
					backgroundColor="rgba(0,0,0,0.1)"
					translucent={true}
				/>
				<View style={styles.topTabBar}>
					<View style={{ paddingVertical: 9, flexDirection: 'row' }}>
						<Avatar
							user={user}
							size={convert(34)}
							activeStatus={false}
							onPress={() => dispatch(NavigationActions.navigate({
								routeName: 'UserViewer',
								params: { userId: this.props.user._id },
							}))}
						/>
					</View>
					<TouchableOpacity
						style={{
							marginLeft: 'auto',
							borderRadius: convert(15)
						}}
						activeOpacity={0.7}
						onPress={() => dispatch(NavigationActions.navigate({
                            routeName: 'RealmCreator',
                            params:{
                                realmType: 'public'
                            }
                        }))}
					>
						<LinearGradient
							colors={['#2962ff', '#448aff']}
							start={{ y: 0.4, x: 0 }}
							style={{
								borderRadius: convert(15),
								paddingHorizontal: convert(15),
								paddingVertical: convert(5),
								flexDirection: 'row'
							}}
						>
							<Icon
								name={'md-create'}
								size={convert(15)}
								color={'white'}
								style={{
									lineHeight: convert(18)
								}}
							/>
							<Text
								style={{
									marginLeft: convert(5),
									fontSize: convert(13),
									lineHeight: convert(18),
									color: 'white'
								}}
							>创建领域</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
				<FlatList
					contentContainerStyle={{
						...((!storys || storys.length === 0) ? {
							paddingTop: convert(12)
						}: {})
					}}
					refreshing={refreshing}
					onRefresh={() => dispatch({ type: 'list.realm/refresh' })}
					data={list}
					keyExtractor={this._keyExtractor}
					onEndReached={this.handleLoadMore}
					renderItem={({ item, index }) => (
						<View style={{ marginHorizontal: convert(20), marginBottom: convert(20) }}>
							<RealmCard
								onPress={() => {
									dispatch({ type: 'realm/read', item })
									dispatch(NavigationActions.navigate({
										routeName: 'RealmViewer',
										params: {
											realmId: (item as any)._id,
											isMember: true
										},
									}))
								}}
								key={index}
								onPressAvatar={(user) => dispatch(NavigationActions.navigate({
									routeName: 'UserViewer',
									params: { userId: user._id },
								}))}
								realm={item}
							/>
						</View>
					)}
					ListEmptyComponent={
						<View style={{ paddingTop: convert(26) }}>
							<Text
								style={{
									fontSize: convert(20),
									color: '#ccc',
									alignSelf: 'center'
								}}
							>
								快来发布第一个话题吧！
							</Text>
						</View>
					}
					ListHeaderComponent={() => this.renderHeader()}
					ListFooterComponent={() => this.renderFooter()}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.lightGray
	},
	topTabBar: {
		flexDirection: 'row',
		paddingHorizontal: convert(20),
		paddingTop: getStatusBarHeight(true),
		height: convert(50) + getStatusBarHeight(true),
		backgroundColor: 'white',
		alignItems: 'center'
	},
	topTab: {
		fontSize: convert(22),
		lineHeight: convert(50),
		fontWeight: 'bold',
		marginRight: convert(5),
		paddingHorizontal: convert(2),
		borderRadius: convert(12),
		color: Colors.tabIconDefault
	},
	topTabActivated: {
		color: Colors.tabIconSelected
	}
})
