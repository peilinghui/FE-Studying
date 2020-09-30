import _ from 'lodash';
import React from 'react';
import { Text, View,  GestureResponderEvent, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import TouchableIcon from '../../components/TouchableIcon'
import { convert, winWidth } from "../../utils/ratio";
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;

interface RealmJSONObject {
  [key: string]: any;
}

interface Props {
  item: { realm: any, source: string, count?: number }
  onPress?: OnPressCallback;
  styles: any;
  onSelected: (onSelected: boolean, item: any) => void;
  indexKey: number
}

export default class RecommendRealmCell extends React.PureComponent<Props> {


  private onPress?: OnPressCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
  }

  state = {
    isJion: this.props.indexKey === 3 || this.props.indexKey === 1 || this.props.indexKey === 2 ?
      true : false
  }

  render() {

    const { item, indexKey } = this.props
    const { realm, source } = item
    const text = source === 'most_friends' ? `${item.count}个好友所在` : '热门领域'
    const { isJion } = this.state;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          isJion
            ? this.props.onSelected(false, item)
            : this.props.onSelected(true, item);
          isJion
            ? this.setState({ isJion: false })
            : this.setState({ isJion: true });
        }}
        style={{
          borderRadius: convert(12),
          ...this.props.styles
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: convert(12),
            overflow: "hidden",
            height: convert(210),
            marginLeft:convert(5),
          }}
        >
          <ImageBackground
            resizeMode={"cover"} // or cover
            style={{
              flex: 1,
              // opacity: isJion ? 0.5 : 1,
              backgroundColor:'black'
            }}
            source={{
              uri:
                _.get(realm, "coverImage.url") +
                "?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1"
            }}
          >
            {isJion ? (
              <TouchableIcon
                name="md-checkmark-circle"
                style={{
                  position: "absolute",
                  top: convert(80),
                  left: convert(60),
                  opacity: 1,
                }}
                color={"#fff"}
                size={convert(40)}
                onPress={() => {
                  isJion === true
                    ? this.setState({ isJion: false })
                    : this.setState({ isJion: true });
                }}
              />
            ) : null}
            <View
              style={{
                flex: 1,
                // backgroundColor: "black",
                // opacity:0.5
                backgroundColor: isJion ?'rgba(0, 0, 0, .35)':'transparent'
              }}
            >
              <Text
                numberOfLines={3}
                ellipsizeMode="tail"
                style={{
                  color: "white",
                  fontSize: convert(15),
                  marginTop: convert(10),
                  marginHorizontal: convert(10)
                }}
              >
                {realm.title}
              </Text>
              <Text
                style={{
                  color: Colors.lightGray,
                  fontSize: convert(11),
                  marginTop: convert(5),
                  marginHorizontal: convert(10)
                }}
              >
                {_.get(realm, 'statistics.numOfMembers')}个成员-{_.get(realm, 'statistics.numOfTopics')}个讨论
                  </Text>
              <View style={{ flex: 1 }} />

              <View style={{ padding: convert(15) }}>
                <Text
                  style={{
                    color: Colors.lightGray,
                    fontSize: convert(14),
                    marginTop: convert(3),
                    textAlign: "center"
                  }}
                >
                  {text}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    );
  }

}
