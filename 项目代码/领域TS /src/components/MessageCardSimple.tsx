import _ from 'lodash'
import React from 'react'
import { Text, View, TouchableOpacity, GestureResponderEvent, TouchableWithoutFeedback } from 'react-native'
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'
import Icon from 'react-native-vector-icons/Ionicons'
import Avatar from './Avatar'
import ImageCard from './Message/ImageCard'
import RealmCard from './Message/RealmCard'
import TopicCard from './Message/TopicCard'
import { StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { convert, winWidth } from "../utils/ratio";
import Hyperlink from 'react-native-hyperlink'

type OnPressCallback = (event: GestureResponderEvent) => void;

interface MessageJSONObject {
  [key: string]: any;
}

interface Props {
  message: MessageJSONObject;
  onAgree?: OnPressCallback;
  onPressAvatar?: OnPressCallback;
  fromMyself?: boolean;
  dispatch: Dispatch<{}>
}

@(connect() as any)
export default class MessageCardSimple extends React.PureComponent<Props> {
  static defaultProps = {
    dispatch: null
  }

  private onAgree?: OnPressCallback

  private fromMyself?: boolean

  constructor(props: Props) {
    super(props)
    this.onAgree = this.props.onAgree
    this.fromMyself = this.props.fromMyself
  }

  messageBody() {
    return (
      <View
        style={{
          alignSelf: this.fromMyself ? 'flex-end' : 'flex-start'
        }}
      >
        {(_.get(this.props.message, 'type') === 'text'
          || _.get(this.props.message, 'type') === 'reply') ? (
            <View
              style={{
                paddingVertical: convert(8),
                paddingHorizontal: convert(8),
                paddingRight: this.fromMyself ? convert(8) : convert(10),
                borderRadius: convert(12),
                backgroundColor: this.fromMyself ? '#2979ff' : Colors.lightGray,
                maxWidth: winWidth - convert(150)
              }}
            >
              {
                _.get(this.props.message, 'type') === 'reply' ? (
                  <View
                    style={{
                      backgroundColor: this.fromMyself ? '#448aff' : '#f9f9f9',
                      paddingVertical: convert(5),
                      paddingHorizontal: convert(8),
                      borderLeftColor: this.fromMyself ? '#82b1ff' : '#cfd8dc',
                      borderLeftWidth: convert(3),
                      marginBottom: convert(5)
                    }}
                  >
                    <Hyperlink linkDefault={true} linkStyle={{ color: this.fromMyself ? 'white' : '#2980b9', fontSize: convert(14) }}>
                      <Text
                        style={{
                          fontSize: convert(13),
                          lineHeight: convert(24),
                          color: this.fromMyself ? 'white' : 'black'
                        }}
                      >{_.get(this.props.message, 'elements.message.content')}</Text>
                    </Hyperlink>
                  </View>
                ) : null
              }
              <Hyperlink linkDefault={true} linkStyle={{ color: this.fromMyself ? 'white' : '#2980b9', fontSize: convert(14) }}>
                <Text
                  style={{
                    fontSize: convert(12),
                    lineHeight: convert(24),
                    color: this.fromMyself ? 'white' : 'black'
                  }}
                >{_.get(this.props.message, 'content')}</Text>
              </Hyperlink>
            </View>
          ) : null}
        {_.get(this.props.message, 'type') === 'image' ? (
          <ImageCard
            message={this.props.message}
            styles={{
              height: convert(100),
              width: convert(175),
            }} />
        ) : null}
        {_.get(this.props.message, 'type') === 'realm' ? (
          <RealmCard
            onPress={() => {
              const { dispatch, message } = this.props
              const { realm } = message.elements
              dispatch({ type: 'realm/read', item: realm })
              dispatch(StackActions.push({
                routeName: 'RealmViewer',
                params: {
                  realmId: realm._id,
                  isMember: true
                },
              }))
            }}
            realm={this.props.message.elements.realm}
            styles={{
              height: convert(100),
              width: convert(175),
            }}
          />
        ) : null}
        {_.get(this.props.message, 'type') === 'topic' ? (
          <TopicCard
            onPress={() => {
              const { dispatch, message } = this.props
              const { topic } = message.elements
              dispatch(StackActions.push({
                routeName: 'TopicViewer',
                params: {
                  topicId: topic._id,
                  topicData: topic
                }
              }))
            }}
            styles={{
              height: convert(100),
              width: convert(175),
            }}
            onPressAvatar={(user) => this.props.dispatch(StackActions.push({
              routeName: 'UserViewer',
              params: { userId: user._id }
            }))}
            topic={this.props.message.elements.topic}
          />
        ) : null}
      </View>
    )
  }

  render() {
    return (
      <View
        style={{
          paddingHorizontal: convert(15),
          paddingVertical: convert(8)
        }}
      >
        {
          !this.fromMyself ? (
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Avatar
                  user={_.get(this.props.message, 'fromUser')}
                  size={convert(32)}
                  onPress={this.props.onPressAvatar}
                />
              </View>
              <View style={{
                marginLeft: convert(10),
                flex: 1,
                flexDirection: 'column'
              }}>
                <Text
                  style={{
                    fontSize: convert(11),
                    color: Colors.darkGray,
                    marginLeft: convert(2),
                    marginBottom: convert(5)
                  }}
                >{_.get(this.props.message, 'fromUser.profile.nickname')}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {this.messageBody()}
                  <TouchableOpacity
                    style={{
                      marginLeft: convert(-12),
                      marginTop: convert(23),
                      alignSelf: 'flex-end',
                      height: convert(20),
                      width: convert(20),
                      borderColor: Colors.lightGray,
                      borderWidth: convert(1),
                      justifyContent: 'center',
                      borderRadius: convert(9),
                      backgroundColor: 'white'
                    }}
                    activeOpacity={0.7}
                    onPress={this.onAgree}
                  >
                    <Icon
                      name="md-thumbs-up"
                      size={convert(13)}
                      style={{
                        lineHeight: convert(11),
                        paddingVertical: convert(1),
                        alignSelf: 'center'
                      }}
                      color={
                        _.get(this.props.message, 'computed.userInfo.isAgreed')
                          ? Colors.blue
                          : Colors.darkGray
                      }
                    />
                  </TouchableOpacity>

                </View>
                {
                  _.get(this.props.message, 'statistics.numOfReceivedAgrees') > 0
                    ? (
                      <Text
                        style={{
                          marginTop: convert(5),
                          marginLeft: convert(2),
                          fontSize: convert(10),
                          color: Colors.darkGray,
                          lineHeight: convert(14)
                        }}
                      >获得{_.get(this.props.message, 'statistics.numOfReceivedAgrees')}个赞同</Text>
                    ) : null
                }
              </View>
            </View>
          ) : (
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  flex: 1,
                  flexDirection: 'column'
                }}>
                  <Text
                    style={{
                      fontSize: convert(11),
                      color: '#777',
                      marginLeft: 'auto',
                      marginRight: convert(2),
                      marginBottom: convert(5)
                    }}
                  >{_.get(this.props.message, 'fromUser.profile.nickname')}</Text>
                  {this.messageBody()}
                  {
                    _.get(this.props.message, 'statistics.numOfReceivedAgrees') > 0
                      ? (
                        <Text
                          style={{
                            alignSelf: 'flex-end',
                            marginTop: convert(5),
                            marginRight: convert(2),
                            fontSize: convert(10),
                            color: Colors.darkGray,
                            lineHeight: convert(14)
                          }}
                        >获得{_.get(this.props.message, 'statistics.numOfReceivedAgrees')}个赞同</Text>
                      ) : null
                  }
                </View>
              </View>
            )
        }
      </View>
    )
  }

}
