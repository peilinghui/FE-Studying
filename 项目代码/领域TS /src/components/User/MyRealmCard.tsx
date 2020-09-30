import _ from 'lodash';
import React from 'react';
import { Text, View, ImageBackground, TouchableOpacity, GestureResponderEvent } from 'react-native';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import { convert } from '../../utils/ratio';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient'

type OnPressCallback = (event: GestureResponderEvent) => void;

interface RealmJSONObject {
  [key: string]: any;
}

interface Props {
  realm: RealmJSONObject;
  onPress?: OnPressCallback;
  styles: any;
  currentUserId: string,
}

export default class MyRealmCard extends React.PureComponent<Props> {

  private onPress?: OnPressCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
  }

  render() {
    const {
      realm: {
        statistics: { numOfMembers, numOfTopics }
      }, currentUserId, realm
    } = this.props

    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{
          borderRadius: convert(12),
          height: convert(100),
          width: convert(250),
          elevation: convert(2),
          backgroundColor: '#eee',
          shadowColor: Colors.darkGrayAlpha(0.4),
          shadowRadius: convert(6),
          shadowOpacity: convert(1),
          shadowOffset: {
            width: 0,
            height: 0
          },
          ...this.props.styles
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: convert(12),
            overflow: 'hidden'
          }}>

          <FastImage
            resizeMode={'cover'} // or cover
            style={{
              flex: 1
            }}
            source={{
              uri: _.get(this.props.realm, 'coverImage.url') +
                '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
            }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, .35)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: convert(16),
                    marginTop: convert(15),
                    marginLeft: convert(15)
                  }}
                    numberOfLines={1}>{_.get(this.props.realm, 'title')}</Text>
                  <Text style={{
                    color: '#eee',
                    fontSize: convert(10),
                    marginTop: convert(3),
                    marginLeft: convert(15)
                  }}>{numOfMembers} 个成员 - {numOfTopics}个讨论</Text>
                </View>
                {_.get(realm, 'creator._id') === currentUserId && <View>
                  <LinearGradient
                    colors={['#fff', '#fff']}
                    start={{ y: 0, x: 0 }}
                    style={{
                      paddingVertical: convert(5),
                      height: convert(20),
                      width: convert(60),
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: convert(5), marginTop: convert(10),
                      marginRight: convert(10)
                    }}>
                    <Text
                      style={{
                        fontSize: convert(10),
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                    >创立者</Text>
                  </LinearGradient>
                </View>}
              </View>
              <Text style={{
                color: Colors.lightGray,
                fontSize: convert(12),
                marginTop: convert(20),
                alignSelf: 'center'
              }}>进入领域</Text>
            </View>
          </FastImage>
        </View>
      </TouchableOpacity>
    )
  }

}
