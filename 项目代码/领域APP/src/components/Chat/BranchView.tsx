import React from 'react'
import { View, PanResponder, Animated, Text, Dimensions, FlatList } from 'react-native'
import BranchAddButton from './BranchAddButton'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import BranchItem from './BranchItem';
import _ from 'lodash'
import moment from 'moment'
import 'moment/locale/zh-cn'
import Icon from 'react-native-vector-icons/Ionicons'
import { winWidth, convert } from '../../utils/ratio';

type Props = {
  dispatch: Dispatch<any>
  branches: any[]
  selectedBranch: any
  addBranch: (branch: any) => void
  changeBranch: (branch: any) => void
  groupedBranches: any
}

type State = {
  open: boolean
  height: any
  wrapperHeight: any
  barHeight: any
}

@(connect(
  ({ chat: { branches, selectedBranch } }: any) => ({
    branches,
    selectedBranch,
    groupedBranches: _.groupBy(branches, ({ lastMsgAt }) => moment().from(lastMsgAt).replace('内', '前'))
  }),
  (dispatch) => ({
    addBranch: (branch: any) => dispatch({ type: 'chat/addBranch', branch }),
    changeBranch: (branch: any) => dispatch({ type: 'chat/changeBranch', branch })
  })
) as any)
export default class extends React.Component<Props, State> {
  static defaultProps = {
    dispatch: null,
    branches: [],
    selectedBranch: null,
    groupedBranches: null,
    addBranch: () => null,
    changeBranch: () => null,
  }
  _panResponder: any
  list: any

  constructor(props: Props) {
    super(props)
    this.list = React.createRef()
    this.state = {
      open: false,
      height: new Animated.Value(90),
      barHeight: new Animated.Value(90),
      wrapperHeight: new Animated.Value(110),
    }
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, { dy }) => {
        if (this.state.open && dy < 0) {
          const { height } = Dimensions.get('window')
          this.state.height.setValue(height - 80 + dy)
          this.state.wrapperHeight.setValue(height - 80 + dy)
          this.state.barHeight.setValue(height - 120 + dy)
        }
        if (dy > 0) {
          this.state.height.setValue(90 + dy)
          this.state.wrapperHeight.setValue(110 + dy)
          if (dy > 100) {
            this.state.barHeight.setValue(40 + dy)
            this.setState({ open: true })
          } else {
            this.setState({ open: false })
          }
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > 0) {
          if (dy <= 100) {
            this.close()
          } else {
            const { height } = Dimensions.get('window')
            this.state.height.setValue(height - 80)
            this.state.wrapperHeight.setValue(height - 80)
            this.state.barHeight.setValue(height - 120)
          }
        } else {
          if (dy <= -100) {
            this.setState({ open: false })
            this.close()
          } else if (this.state.open) {
            const { height } = Dimensions.get('window')
            this.state.height.setValue(height - 80)
            this.state.wrapperHeight.setValue(height - 80)
            this.state.barHeight.setValue(height - 120)
          }
        }
      },
    })
  }

  close = () => {
    this.state.height.setValue(90)
    this.state.wrapperHeight.setValue(110)
    this.state.barHeight.setValue(90)
  }

  render() {
    const { branches, selectedBranch, addBranch, changeBranch, groupedBranches } = this.props
    const { width } = Dimensions.get('window')
    return (
      <Animated.View
        pointerEvents='box-none'
        style={{
          position: 'relative',
          backgroundColor: '#fafafa',
          alignItems: 'center',
          height: this.state.wrapperHeight,
          zIndex: 1,
        }}>
        {this.state.open ?
          <Animated.ScrollView
            style={{
              position: 'absolute',
              width: '100%',
              height: this.state.height,
              backgroundColor: 'transparent',
              zIndex: 10,
              paddingHorizontal: 16,
              paddingVertical: 13,
              overflow: 'hidden',
            }}
          >
            <BranchAddButton onSubmit={(branch) => addBranch(branch)} />
            {Object.keys(groupedBranches).map((date: string) => (
              <View key={date}>
                <Text>{date}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            
                  {groupedBranches[date].map((branch: any) => (
                    <BranchItem
                      key={branch._id}
                      branch={branch}
                      onPress={() => {
                        this.setState({ open: false }, () => {
                          // const index = branches.findIndex(({ _id }) => _id === branch._id)
                          // this.list.current.scrollToIndex({ index, viewOffset: 0, viewPosition: 0.5 })
                          this.list.current.scrollToEnd()
                        })
                        this.close()
                        changeBranch(branch)
                      }}
                      selected={branch._id === selectedBranch._id}
                    />
                  ))}
                </View>
              </View>
            )
            )}
          </Animated.ScrollView> :
          <Animated.View style={{ height: this.state.height, backgroundColor: '#fafafa', alignSelf: 'flex-start' }}>
            <View style={{ height: convert(90),flexDirection:'row',width:winWidth }}>
              <BranchAddButton onSubmit={(branch) => addBranch(branch)} styles={{
                marginVertical: convert(20),
                marginLeft: convert(20),}}
                openStyles={{ marginVertical: convert(25), marginLeft: convert(10),}}/>
              <FlatList
                ref={this.list}
                data={branches}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
                getItemLayout={(data, index) => ({
                  length: 80,
                  offset: 80 * index,
                  index,
                })}
                renderItem={({ item: branch }: any) => (
                  <BranchItem
                    key={branch._id}
                    branch={branch}
                    onPress={() => changeBranch(branch)}
                    selected={branch._id === selectedBranch._id}
                  />
                )}
                keyExtractor={({ _id }) => _id}
              />
            </View>
          </Animated.View>
        }
        <View {...this._panResponder.panHandlers}>
          {this.state.open ?
            <Animated.View
              style={{
                position: 'absolute',
                top: this.state.barHeight,
                left: -width / 2,
                backgroundColor: '#fafafa',
                width: '100%',
                height: 50,
                zIndex: 100,
                alignItems: 'center',
              }}
            >
              <Icon name='ios-arrow-up' size={20} color='#e0e0e0' />
              <Text style={{ color: '#e0e0e0' }}>上滑返回对话</Text>
            </Animated.View>
            :
            <View
              style={{
                backgroundColor: '#fafafa',
                width: '100%',
                height: 20,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 41,
                  height: 4,
                  borderRadius: 100,
                  backgroundColor: '#ededed',
                  marginBottom: 5,
                }}
              />
            </View>
          }
        </View>
      </Animated.View>
    )
  }
}