import React from "react";
import PropTypes from "prop-types";
import {
    View,
    Text,
    Modal,
    GestureResponderEvent
} from "react-native";
import Colors from "../../constants/Colors";
import { winHeight, convert, winWidth } from "../../utils/ratio";
import TouchableIcon from "../../components/TouchableIcon";
import _ from 'lodash'
import { getBottomSpace, getStatusBarHeight } from "react-native-iphone-x-helper";
import { connect } from 'react-redux'
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { BoxShadow } from 'react-native-shadow'
import { userRealmTopics as getJoinedTopics } from "../../services/topic"
import RealmTopicCell from "./RealmTopicCell";
import { Dispatch } from 'redux'
import { NavigationActions, StackActions } from 'react-navigation';


type OnPressCallback = (event: GestureResponderEvent) => void;

interface Props {
    dispatch: Dispatch<any>
    onClose: () => void
    visible: boolean
    joinRealm: any
    user?: any
    userId: any
    indexId: any
}

interface State {}

@(connect(({ auth: { detail } }: any) => ({ user: detail })) as any)

export default class RealmDrawer extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        const { onClose, visible, user, joinRealm, userId, indexId, dispatch } = this.props;
        const MAX_HEIGHT = winHeight - convert(140) - getBottomSpace() - getStatusBarHeight();
        let horizontalPages = [];
        if (joinRealm) {
            for (let i = 0; i < joinRealm.length; i++) {
                const myJoinRealm = joinRealm[i];
                horizontalPages.push(
                    <RealmTopicCell
                        key={i}
                        currentUserId={userId}
                        myJoinRealm={myJoinRealm}
                        onClose={onClose}
                        request={(cursorAt: string | null, limit: number) =>
                            getJoinedTopics(myJoinRealm._id, user._id, cursorAt, limit, userId)}
                        limit={40}
                        onPressRealm={() => {
                            onClose()
                            dispatch(StackActions.push({
                                routeName: 'RealmViewer',
                                params: {
                                    realmId: myJoinRealm._id,
                                    // isMember: true
                                },
                            }))
                        }}
                        onPressRealmTopic={(item:any) => {
                            onClose()
                            const topicId = item._id
                            dispatch(StackActions.push({
                                routeName: 'TopicViewer',
                                params: {
                                    topicId: topicId,
                                    topicData: item
                                },
                            }))
                        }}
                    />
                );
            }
        }

        return (
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={visible}>
                <BoxShadow setting={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingTop: convert(0),
                    paddingBottom: convert(0),
                    width: winWidth,
                    height: convert(200),
                    color: "#000",
                    border: convert(50),
                    opacity: 0.4,
                    radius: convert(50),
                    x: convert(2),
                    y: convert(10),
                }}>
                </BoxShadow>
                <View
                    style={{
                        backgroundColor: "#fff",
                        height: MAX_HEIGHT,
                        borderTopLeftRadius: convert(12),
                        borderTopRightRadius: convert(12),
                    }}>
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
                        }}>参与话题</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                            }}>
                            <Text style={{
                                fontSize: 13,
                                color: Colors.darkGray,
                                marginTop: convert(23)
                            }}>领域成就</Text>
                            <TouchableIcon
                                style={{
                                    right: 0,
                                    margin: convert(10)
                                }}
                                name="md-close-circle"
                                onPress={onClose}
                            />
                        </View>
                    </View>

                </View>
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                    <ScrollableTabView
                        renderTabBar={() => <View />}
                        ref={(tabView: any) => {
                            tabView = 'scroll';
                        }}
                        onChangeTab={
                            (obj: { i: any; }) => {
                                // this.setState({ selectedItem: obj.i })
                            }
                        }
                        activeTab={indexId}
                        initialPage={indexId}
                        tabBarBackgroundColor={'white'}
                        tabBarUnderlineColor={'white'}
                        tabBarActiveTextColor={'white'}
                        tabBarInactiveTextColor={'white'}
                        scrollWithoutAnimation={true}
                    >
                        {horizontalPages}
                    </ScrollableTabView>
                </View>
            </Modal>
        );
    }
}
