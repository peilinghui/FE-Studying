import _ from 'lodash';
import React from 'react';
import { Text, View, TouchableOpacity, GestureResponderEvent, ColorPropType } from 'react-native';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Avatar from './Avatar';
import { connect } from 'react-redux'
import Colors from '../constants/Colors';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;

interface ChatJSONObject {
  [key: string]: any;
}

interface Props {
  chat: ChatJSONObject;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  currentUser: any
}

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)
export default class ChatCard extends React.PureComponent<Props> {
  static defaultProps = {
    currentUser: null
  }

  private onPress?: OnPressCallback;
  private onPressAvatar?: OnPressAvatarCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
    this.onPressAvatar = this.props.onPressAvatar;
  }

  render() {
    const { currentUser, chat } = this.props
    const { lastMsgContent, users, statistics, lastMsgAt } = chat
    const { numOfMessages } = statistics
    const opposite = users.find(({ _id }: any) => _id !== currentUser._id)
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{ backgroundColor: '#fff' }}
      >
        <View style={{ flexDirection: 'row', margin: 20, alignItems: 'center' }}>
          <Avatar user={opposite} size={40} />
          <View style={{ marginLeft: 24, flex: 1 }} >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, lineHeight: 25, fontWeight: '500' }}>
                {opposite ? opposite.profile.nickname : ''}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  lineHeight: 25,
                  fontWeight: '400',
                  color: Colors.darkGray,
                  marginLeft: 10,
                }}>
                {moment().from(lastMsgAt).replace('内', '前')}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                lineHeight: 16,
                marginTop: 8,
                color: Colors.darkGray
              }}
            >{lastMsgContent}</Text>
          </View>
          {/* <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#2585FC',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 12, color: 'white' }}>
              {numOfMessages}
            </Text>
          </View> */}
        </View>
      </TouchableOpacity>
    )
  }

}
