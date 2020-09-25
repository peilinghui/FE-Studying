import React from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native'
import Colors from '../../constants/Colors'
import moment from 'moment'
import 'moment/locale/zh-cn'
import Avatar from '../Avatar'
import { convert } from '../../utils/ratio';
import _ from 'lodash';
import FastImage from 'react-native-fast-image';
import { CacheImage } from 'react-native-rn-cacheimage'

type OnPressCallback = (item: any) => void;
type OnPressAvatarCallback = (user: any) => void;

interface TopicJSONObject {
  [key: string]: any;
}

interface Props {
  topic: TopicJSONObject;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  styles: any;
}

export default class TopicCard extends React.PureComponent<Props> {

  private onPress?: OnPressCallback
  private onPressAvatar?: OnPressAvatarCallback

  constructor(props: Props) {
    super(props)
    this.onPress = this.props.onPress
    this.onPressAvatar = this.props.onPressAvatar
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => this.onPress && this.onPress(this.props.topic)}
        activeOpacity={1}
        style={{ 
          backgroundColor: '#fbfcfd', 
          width: convert(260), 
          borderRadius: convert(10), 
          padding: convert(15),
          flexDirection: 'column',
          overflow: 'hidden',
          ...this.props.styles }}
      >
        {_.get(this.props.topic, 'isArchived') ? (
          <View style={{ marginBottom: convert(15) }}>
            <Text style={{ fontSize: convert(12), color: '#880e4f' }}>[该话题已经被封存了]</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Avatar
              onPress={() =>
                this.onPressAvatar &&
                this.onPressAvatar(_.get(this.props.topic, 'creator'))
              }
              size={convert(36)}
              activeStatus={true}
              user={_.get(this.props.topic, 'creator')}
            />
          </View>
          <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
            <Text style={{ fontSize: convert(14), lineHeight: convert(16) }}>
              {_.get(this.props.topic, 'creator') ? _.get(this.props.topic, 'creator.profile.nickname'): null}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: convert(10), height: convert(25) }}>
          <Text
            numberOfLines={1}
            style={{ lineHeight: convert(25), fontSize: convert(14) }}
          >
            {_.get(this.props.topic, 'content')}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            paddingTop: convert(5)
          }}>
          <Text>{_.get(this.props.topic, 'realm.title')}</Text>
          <CacheImage
            style={{
              width: convert(24),
              height: convert(24),
              borderRadius: convert(15),
              marginLeft: convert(5)
            }}
            source={{uri: _.get(this.props.topic, 'realm.coverImage.url')}}
          />
        </View>
      </TouchableOpacity>
    )
  }

}

