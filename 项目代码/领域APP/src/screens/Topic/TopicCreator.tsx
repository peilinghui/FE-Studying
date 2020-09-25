import React from 'react';
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  TextInput,
  Animated,
  PermissionsAndroid,
  ToastAndroid
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import Colors from '../../constants/Colors';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { topicTags } from '../../services/topic';
import Button from '../../components/Button';
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from 'react-native-image-crop-picker'
import AddTagModal from '../../components/Modal/AddTag'
import Loader from '../../components/Loader';
import { convert, winHeight, winWidth } from '../../utils/ratio';
import Video from 'react-native-video';
import RealmModal from '../../components/Modal/Realm'
import TopicModal from '../../components/Modal/Topic'
import AddLinkModal from '../../components/Modal/AddLinkModal';
import RealmCard from '../../components/Message/RealmCard'
import TopicCard from '../../components/Message/TopicCard';
import LinkCard from '../../components/Message/LinkCard';
import TouchableIcon from '../../components/TouchableIcon';
import Zhugeio from 'react-native-plugin-zhugeio'
import FastImage from 'react-native-fast-image';
import moonstack from '../../moonstack';
interface Props extends NavigationScreenProps {
  dispatch: Dispatch<any>
}

interface State {
  textContent: string;
  tags: any[]
  images: any[]
  videos: any[]
  selectedTag: string
  modal: string
  topic: any
  realm: any
  link: any
  visible: boolean
}

@(connect() as any)
export default class TopicCreatorScreen extends moonstack.Component<Props, State> {
  static navigationOptions = {
    header: null
  };

  private realmId: string;
  actionSheet: any

  constructor(props: Props) {
    super(props, 'topic_creator');
    this.state = {
      textContent: '',
      tags: [],
      images: [],
      videos: [],
      selectedTag: '默认话题',
      modal: '',
      topic: {},
      realm: {},
      link: {},
      visible: true
    }
    this.actionSheet = React.createRef()
    this.realmId = this.props.navigation.getParam('realmId');
  }

  createTopic = () => {
    const { dispatch } = this.props
    const { images, selectedTag, textContent, videos, realm, topic } = this.state
    Zhugeio.track('发起讨论',{});
    if (images.length > 0 || videos.length > 0) {
      dispatch({ type: 'app/showLoading' })
      dispatch({
        type: 'topic/create',
        realmId: this.realmId,
        content: textContent,
        tag: selectedTag,
        images,
        videos,
        callback: () => {
          dispatch({ type: 'app/hideLoading' })
          this.moon.mark('topic_created');
          this.moon.call(`realm_viewer/${this.realmId}/refreshTopics`);
        }
      })
    } else {
      dispatch({ type: 'app/showLoading' })
      dispatch({
        type: 'topic/createNewTopic',
        realmId: this.realmId,
        content: textContent,
        tag: selectedTag,
        selectedRealmId: realm._id,
        selecteTopicId: topic._id,
        callback: () => {
          dispatch({ type: 'app/hideLoading' })
          this.moon.mark('topic_created');
          this.moon.call(`realm_viewer/${this.realmId}/refreshTopics`);
        }
      })
    }
  }

  async componentDidMount() {
    Zhugeio.startTrack('发布讨论页面');
    const tags = await topicTags(this.realmId)
    this.setState({ tags })

    this.requestMultiplePermission()
  }

  componentWillUnmount(){
    Zhugeio.endTrack('发布讨论页面',{});
  }

  setModalVisible = (modal: string) => this.setState({ modal });

  async requestMultiplePermission() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA
      ]
      //返回得是对象类型
      const granteds = await PermissionsAndroid.requestMultiple(permissions)
      var data = "是否同意地址权限: "
      if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {
        data = data + "是\n"
      } else {
        data = data + "否\n"
      }
      data = data + "是否同意相机权限: "
      if (granteds["android.permission.CAMERA"] === "granted") {
        data = data + "是\n"
      } else {
        data = data + "否\n"
      }
      data = data + "是否同意存储权限: "
      if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
        data = data + "是\n"
      } else {
        data = data + "否\n"
      }
      // ToastAndroid.show(data, ToastAndroid.SHORT)
    } catch (err) {
      // ToastAndroid.show(err.toString(), ToastAndroid.SHORT)
    }
  }

  render() {
    const { images, selectedTag, textContent, videos, tags, modal, topic, realm, visible, link } = this.state
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <View
          style={{
            paddingHorizontal: convert(20),
            paddingVertical: convert(10),
            height: convert(50),
            flexDirection: 'row'
          }}
        >
          <TouchableOpacity
            style={{
              marginRight: convert(15),
              alignSelf: 'flex-start'
            }}
            activeOpacity={0.7}
            onPress={() => this.props.navigation.pop()}
          >
            <Icon
              name={'ios-arrow-back'}
              size={convert(26)}
              style={{
                lineHeight: convert(30),
                color: 'black'
              }}
            />
          </TouchableOpacity>
          <Text style={{
            fontSize: convert(16),
            lineHeight: convert(30),
            fontWeight: 'bold'
          }}>创建新话题</Text>
          <TouchableOpacity
            style={{
              marginLeft: 'auto',
              borderRadius: convert(12)
            }}
            activeOpacity={0.7}
            onPress={() => this.createTopic()}
          >
            <LinearGradient
              colors={['#2962ff', '#448aff']}
              start={{ y: 0.4, x: 0 }}
              style={{
                borderRadius: convert(12),
                height: convert(30),
                paddingHorizontal: convert(15),
                flexDirection: 'row'
              }}
            >
              <Text
                style={{
                  fontSize: convert(15),
                  lineHeight: convert(30),
                  color: 'white'
                }}
              >发布</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{
            backgroundColor: '#fff',
            height: '100%'
          }}
        >
          <View
            style={{
              marginTop: convert(15),
              paddingVertical: convert(10),
              paddingHorizontal: convert(15)
            }}
          >
            <TextInput
              style={{
                fontSize: convert(14),
                lineHeight: convert(24),
                height: convert(200),
                textAlignVertical: 'top'
              }}
              multiline={true}
              placeholder={'我的想法'}
              onChangeText={textContent => this.setState({ textContent })}
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: convert(20), alignItems: 'flex-start', }}>
            {tags.map(({ _id, name }) => (
              <Button
                key={_id}
                onPress={() => this.setState({ selectedTag: name })}
                style={{
                  marginRight: convert(10),
                  marginBottom: convert(10),
                  backgroundColor: name === selectedTag ? '#0084f8' : '#efeff4'
                }}
              >
                <Text style={{ color: name === selectedTag ? '#fff' : '#000' }}>{name}</Text>
              </Button>
            ))}
            <Button
              onPress={() => this.setState({ modal: 'addTag', selectedTag: '' })}
              style={{
                marginRight: convert(10),
                marginBottom: convert(10),
              }}
            >
              <Text style={{ color: '#000' }}>+ 新标签</Text>
            </Button>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: convert(10), marginLeft: convert(15), marginRight: convert(15), }}>
            {images.map(({path}, index) => (
              <FastImage
                key={path}
                source={{ uri: path }}
                style={{
                  width: winWidth / 3 - convert(20),
                  height: winWidth / 3 - convert(20),
                  margin: convert(5),
                }}
              >
                <TouchableIcon
                  style={{
                    top: convert(5),
                    right: convert(5),
                    position: 'absolute',
                  }}
                  name="md-close-circle"
                  color="#fff"
                  onPress={() => {
                    let nextSelected = this.state.images.splice(index, 1)
                    this.setState({ images: _.difference(this.state.images, [nextSelected]) })
                  }}
                />
              </FastImage>
            ))}
            {videos.map(({ path }, index) => (
              <View>
                <Video
                  source={{ uri: path }} // 视频的URL地址，或者本地地址，都可以.
                  ref='player'
                  rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                  volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                  muted={false}                // true代表静音，默认为false.
                  paused={true}               // true代表暂停，默认为false
                  resizeMode="cover"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                  repeat={false}                // 是否重复播放
                  playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                  playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                  style={{
                    width: winWidth / 3 - convert(20),
                    height: winWidth / 3 - convert(20),
                    margin: convert(5),
                  }}
                />
                <TouchableIcon
                  style={{
                    top: convert(35),
                    left: convert(40),
                    position: 'absolute',
                  }}
                  size={convert(30)}
                  name="md-play-circle"
                  color='#fff'
                  // onPress={() => this.props.navigation.push('VideosViewer', {
                  //   videoURL: topic
                  // })}
                /> 
                <TouchableIcon
                  style={{
                    top: convert(5),
                    right: convert(5),
                    position: 'absolute',
                  }}
                  name="md-close-circle"
                  color="#fff"
                  onPress={() => {
                    let nextSelected = this.state.videos.splice(index, 1)
                    this.setState({ videos: _.difference(this.state.videos, [nextSelected]) })
                  }}
                />
                </View>
            ))}
            {_.get(realm, 'type') ?
              <RealmCard
                onPress={() => { this.setState({ realm: {}, visible: true }) }}
                realm={realm}
                styles={{
                  margin:convert(5),
                  width: winWidth - convert(40),
                }}
              />
              : null}
            {_.get(topic, 'type') &&
              <TopicCard
                onPress={() => { this.setState({ topic: {}, visible: true }) }}
                onPressAvatar={() => { }}
                topic={topic}
                styles={{
                  margin: convert(5),
                  width: winWidth - convert(40),
                  backgroundColor:Colors.lightGray
                }}
              />}
            {/* {link?
                <View
                  style={{
                    marginLeft: convert(15),
                    marginRight: convert(15),
                    height: convert(180)
                  }}
                >
                  <LinkCard
                    onPress={() => { this.setState({ link: {}, visible: true }) }}
                    link={link}
                  />
                </View>:null} */}


            {visible === true && images.length < 9 ? <TouchableOpacity
              onPress={() => this.actionSheet.current.show()}
              style={{
                width: winWidth / 3 - convert(20),
                height: winWidth / 3 - convert(20),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f7f7f7',
                margin: convert(5),
              }}
            >
              <Icon name='md-add' size={30} color='#d6d6d6' />
            </TouchableOpacity>
              : null}
          </View>



          {images.length > 0 || videos.length > 0 ?
            <ActionSheet
              ref={this.actionSheet}
              title="给讨论添加一个"
              options={['视频', '相册', '相机', '取消']}
              cancelButtonIndex={3}
              onPress={async (index: number) => {
                switch (index) {
                  case 0:
                    const videos = await ImagePicker.openPicker({
                      mediaType: 'video'
                    })
                    this.setState({ videos: this.state.videos.concat(videos) })
                    break
                  case 1:
                    const images = await ImagePicker.openPicker({
                      multiple: true,
                      mediaType: 'photo'
                    })
                    this.setState({ images: this.state.images.concat(images) })
                    break
                  case 2:
                    const image = await ImagePicker.openCamera({ mediaType: 'photo' })
                    this.setState({ images: this.state.images.concat([image]) })
                    break
                  case 3:
                  default:
                }
              }}
            />
            : <ActionSheet
              ref={this.actionSheet}
              title="给讨论添加一个"
              // options={['视频', '相册', '相机', '领域', '话题', '外部视频/链接', '取消']}
              options={['视频', '相册', '相机', '领域', '话题', '取消']}
              cancelButtonIndex={5}
              onPress={async (index: number) => {
                switch (index) {
                  case 0:
                    const videos = await ImagePicker.openPicker({
                      mediaType: 'video'
                    })
                    this.setState({ videos: this.state.videos.concat(videos) })
                    break
                  case 1:
                    const images = await ImagePicker.openPicker({
                      multiple: true,
                      mediaType: 'photo'
                    })
                    this.setState({ images: this.state.images.concat(images) })
                    break
                  case 2:
                    const image = await ImagePicker.openCamera({ mediaType: 'photo' })
                    this.setState({ images: this.state.images.concat([image]) })
                    break
                  case 3:
                    this.setState({ modal: 'realm', })
                    break
                  case 4:
                    this.setState({ modal: 'topic' })
                    break
                  // case 5:
                  //   this.setState({ modal: 'link' })
                  //   break
                  case 5:
                  default:
                }
              }}
            />}

          <AddTagModal
            visible={modal === 'addTag'}
            onClose={() => this.setState({ modal: '' })}
            onSubmit={(tag) => this.setState(({ tags }) => ({
              tags: [{ _id: tag, name: tag }, ...tags],
              selectedTag: tag,
            }))}
          />
          <TopicModal
            visible={modal === "topic"}
            onClose={() => this.setModalVisible("")}
            onPress={(item: any) => {
              this.setState({ topic: item, visible: false })
              this.setModalVisible("");
            }}
          />
          <RealmModal
            visible={modal === "realm"}
            onClose={() => this.setModalVisible("")}
            onPress={(item: any) => {
              this.setState({ realm: item, visible: false })
              this.setModalVisible("");
            }}
          />
          {/* <AddLinkModal
            visible={modal === "link"}
            onClose={() => this.setModalVisible("")}
            onPress={item => {
              this.setState({ link: item, visible: false })
              this.setModalVisible("");
            }}
          /> */}
        </ScrollView>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: getStatusBarHeight(true)
  }
});