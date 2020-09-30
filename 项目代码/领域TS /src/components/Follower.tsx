import { StyleProp, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native'
import Avatar from './Avatar'
import { addRelation, removeRelation } from '../services/user'
import React from 'react'
import { connect } from 'react-redux'
import { StackActions } from 'react-navigation'
import { Dispatch } from 'redux'
import Colors from '../constants/Colors';
import Zhugeio from 'react-native-plugin-zhugeio'
import { winWidth } from '../utils/ratio';
interface ButtonProps {
	active: boolean
	onPress: () => void
	title: string
}

const Button = ({ onPress, active, title }: ButtonProps) => (
	<TouchableOpacity
		activeOpacity={0.7}
		onPress={onPress}
	>
		<View style={{
			alignItems: 'center', justifyContent: 'center',
			backgroundColor: active ? "rgba(235,243,251,1)" : "rgba(63,139,251,1)",
			borderRadius: 14,
			width: 80, height: 28
		}}>
			<Text
				style={{
					color: active ? "rgba(63,139,251,1)" : "#fff",
					fontSize: 13,
					fontWeight: '600',
				}}>
				{title}
			</Text>
		</View>
	</TouchableOpacity>
)


interface Props {
	dispatch: Dispatch<any>
	user: any
	currentUser: any
}

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)
export default class Follower extends React.Component<Props> {

	static defaultProps = {
		dispatch: null,
		currentUser: null,
		user: null
	}

	state = {
		relationType: this.props.user.computed.userInfo.relationType,
	}

	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		Zhugeio.startTrack('好友列表页面');
	}

	componentWillUnmount() {
		Zhugeio.endTrack('好友列表页面', {});
	}

	_renderButton = () => {
		const { user, dispatch, currentUser } = this.props;
		const { profile: { nickname, intro }, _id: userId } = user
		const { relationType } = this.state;
		switch (relationType) {
			case 'follower':
				return (
					<Button
						title={"关注"}
						active={true}
						onPress={() => {
							addRelation(currentUser._id, user._id, 'followee', () => {
								this.setState({
									relationType: 'mutual',
								})
							})
						}}
					/>
				)
				break;
			case 'followee':
				return (
					<Button
						title="已关注"
						active={true}
						onPress={() => {
							removeRelation(currentUser._id, user._id, 'followee', () => {
								this.setState({
									relationType: 'unfollowee',
								})
							})
						}}
					/>
				)
				break;
			case 'unfollowee':
				return (
					<Button
						title="未关注"
						active={true}
						onPress={() => {
							addRelation(currentUser._id, user._id, 'followee', () => {
								this.setState({
									relationType: 'followee',
								})
							})
						}}
					/>
				)
				break;
			case 'mutual':
				return (
					<Button
						title="好友"
						active={false}
						onPress={() => {
							removeRelation(currentUser._id, user._id, 'followee', () => {
								this.setState({
									relationType: 'follower',
								})
							})
						}}
					/>
				)
				break;
			default:
				return (
					<Button
						title={"关注"}
						active={true}
						onPress={() => {
							addRelation(currentUser._id, user._id, 'followee', () => {
								this.setState({
									relationType: 'mutual',
								})
							})
						}}
					/>
				)
				break;
		}
	}

	render() {
		const { user, dispatch, currentUser } = this.props;
		const { profile: { nickname, intro }, _id: userId } = user
		const { relationType } = this.state;
		return (
			<TouchableWithoutFeedback
				style={{ flexDirection: 'row', flex: 1, alignItems: 'center', width: winWidth }}
				onPress={() => dispatch(StackActions.push({ routeName: 'UserViewer', params: { userId } }))}
			>
				<View
					style={{
						flexDirection: 'row',
						marginHorizontal: 20,
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>

					<Avatar user={user} size={30} style={{ marginRight: 10 }} onPress={() => dispatch(StackActions.push({ routeName: 'UserViewer', params: { userId } }))}/>
					<View style={{ flex: 1 }}>
						<Text style={{ color: '#999' }}>{nickname}</Text>
						<Text style={{ color: Colors.darkGray }} numberOfLines={1}>{intro ? intro : '暂无介绍'}</Text>
					</View>

					{this._renderButton()}
				</View>
			</TouchableWithoutFeedback>
		)
	}
}



