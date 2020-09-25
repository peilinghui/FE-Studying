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
import { convert } from "../utils/ratio";
import Hyperlink from 'react-native-hyperlink'
import LookPhotoModal from '../components/LookPhotoModal';
type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;
interface MessageJSONObject {
  [key: string]: any;
}

interface Props {
  message: MessageJSONObject;
  onAgree?: OnPressCallback;
  onSelected?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  fromMyself?: boolean;
  dispatch: Dispatch<{}>
}

@(connect() as any)
export default class MessageCard extends React.PureComponent<Props> {
  static defaultProps = {
    dispatch: null
  }

  private onAgree?: OnPressCallback
  private onSelected?: OnPressCallback
  private onPressAvatar?: OnPressAvatarCallback
  private fromMyself?: boolean

  constructor(props: Props) {
    super(props)
    this.onAgree = this.props.onAgree
    this.onSelected = this.props.onSelected
    this.fromMyself = this.props.fromMyself
    this.onPressAvatar = this.props.onPressAvatar
  }
  messageBody() {
    const {message } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={this.onSelected}>
        <View
          style={{
            alignSelf: this.fromMyself ? 'flex-end' : 'flex-start'
          }}>
          {(_.get(message, 'type') === 'text'
            || _.get(message, 'type') === 'reply') ? (
              <View
                style={{
                  paddingVertical: convert(5),
                  paddingHorizontal: convert(10),
                  paddingRight: this.fromMyself ? convert(10) : convert(15),
                  borderRadius: convert(12),
                  backgroundColor: this.fromMyself ? '#2979ff' : Colors.lightGray,
                  maxWidth: Layout.screen.width - convert(130)
                }}>
                {_.get(message, 'type') === 'reply' ? (
                    <View
                      style={{
                        backgroundColor: this.fromMyself ? '#448aff' : '#f9f9f9',
                        paddingVertical: convert(5),
                        paddingHorizontal: convert(10),
                        borderLeftColor: this.fromMyself ? '#82b1ff' : '#cfd8dc',
                        borderLeftWidth: convert(3),
                        marginBottom: convert(5)
                      }}>
                      <Hyperlink linkDefault={true} linkStyle={{ color: this.fromMyself ? 'white' : '#2980b9', fontSize: convert(12) }}>
                        <Text
                          style={{
                            fontSize: convert(12),
                            lineHeight: convert(24),
                            color: this.fromMyself ? 'white' : 'black'
                          }}
                        >{_.get(message, 'elements.message.content')}</Text>
                      </Hyperlink>
                    </View>
                  ) : null
                }
                <Hyperlink linkDefault={true} linkStyle={{ color: this.fromMyself ? 'white' : '#2980b9', fontSize: convert(12) }}>
                  <Text
                    style={{
                      fontSize: convert(12),
                      lineHeight: convert(24),
                      color: this.fromMyself ? 'white' : 'black'
                    }}
                  >{ _.get(message, 'content')}</Text>
                </Hyperlink>
              </View>
            ) : null}
          {message.type === 'image' ? (
            <ImageCard message={message} onLongPressImage={()=>this.onSelected}/>
          ) : null}
          {message.type === 'realm' ? (
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
              realm={_.get(message, 'elements.realm')}
              styles={{
                height: convert(100),
                width: convert(230),
              }}
            />
          ) : null}
          {message.type === 'topic' ? (
            <TopicCard
              onPress={() => {
                const { dispatch, message } = this.props
                // const { topic } = message.elements
                dispatch(StackActions.push({
                  routeName: 'TopicViewer',
                  params: {
                    topicId: _.get(message, 'elements.topic._id'),
                    topicData: _.get(message, 'elements.topic'),
                  }
                }))
              }}
              styles={{
                height: convert(120),
                width: convert(230),
              }}
              // onPressAvatar={(user) => dispatch(StackActions.push({
              //   routeName: 'UserViewer',
              //   params: { userId: user._id }
              // }))}
              topic={_.get(message, 'elements.topic') ? _.get(message, 'elements.topic'):null}
            />
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const { message, onPressAvatar } = this.props;
    return (
      <View
        style={{
          paddingHorizontal: convert(10),
          paddingVertical: convert(5)
        }}
      >
        {
          !this.fromMyself ? (
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Avatar
                  user={_.get(message, 'fromUser')}
                  size={convert(32)}
                  onPress={() => this.onPressAvatar && this.onPressAvatar(_.get(message, 'fromUser'))}
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
                >{_.get(message, 'fromUser.profile.nickname')}</Text>
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
                        _.get(message, 'computed.userInfo.isAgreed')
                          ? Colors.blue
                          : Colors.darkGray
                      }
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      marginLeft: convert(10),
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{ alignSelf: 'flex-start' }}
                      onPress={this.onSelected}
                    >
                      <Icon
                        name={'md-more'}
                        size={convert(22)}
                        color={Colors.darkGrayAlpha(0.3)}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {
                  _.get(message, 'statistics.numOfReceivedAgrees') > 0
                    ? (
                      <Text
                        style={{
                          marginTop: convert(5),
                          marginLeft: convert(2),
                          fontSize: convert(10),
                          color: Colors.darkGray,
                          lineHeight: convert(12)
                        }}
                      >获得{_.get(message, 'statistics.numOfReceivedAgrees')}个赞同</Text>
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
                  >{_.get(message, 'fromUser.profile.nickname')}</Text>
                  {this.messageBody()}
                  {_.get(message, 'statistics.numOfReceivedAgrees') > 0
                      ? (
                        <Text
                          style={{
                            alignSelf: 'flex-end',
                            marginTop: convert(5),
                            marginRight: convert(2),
                            fontSize: convert(10),
                            color: Colors.darkGray,
                            lineHeight: convert(10)
                          }}
                        >获得{_.get(message, 'statistics.numOfReceivedAgrees')}个赞同</Text>
                      ) : null}
                </View>
              </View>
            )
        }
      </View>
    )
  }

}
