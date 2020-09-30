import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Modal from './Modal'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import Button from '../Button'
import { getFigureAgreedUsers } from '../../services/user'
import List from '../List'
import Avatar from '../Avatar'
import { StackActions } from 'react-navigation'

type Props = {
  dispatch: Dispatch<{}>
  onClose: () => void
  visible: boolean
  userId: string
  figure: string | null
  agreeCount: number
  currentUser: any
}

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)
export default class extends React.Component<Props> {
  static defaultProps = {
    dispatch: null,
    currentUser: null
  }
  private list: any

  state = {
    agreed: false,
  }

  request = async (cursorAt: string | undefined, limit: number) => {
    const { userId, figure, currentUser } = this.props
    if (figure) {
      const data = await getFigureAgreedUsers(userId, figure)
      this.setState({
        agreed: data.map(({ _id }: any) => _id).includes(currentUser._id)
      })
      return data.map((item: any) => ({ ...item, height: 60 }))
    } else {
      return []
    }
  }

  render() {
    const { dispatch, onClose, visible, figure, agreeCount, currentUser, userId } = this.props
    return (
      <Modal onClose={onClose} visible={visible}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomColor: '#F7F7F7',
            borderBottomWidth: 1,
            marginBottom: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, color: '#000' }}>{figure}</Text>
            <Text style={{ fontSize: 13, color: '#9B9B9B' }}>{agreeCount}人认可了该形象</Text>
          </View>
          {currentUser._id === userId ?
            <Button
              style={{ backgroundColor: 'red' }}
              onPress={() => {
                dispatch({ type: 'user/removeFigure', figure })
                onClose()
              }}
            >
              <Text style={{ color: 'white' }}>移除</Text>
            </Button>
            :
            this.state.agreed ?
              <Text>已认可</Text> :
              <Button
                onPress={() => dispatch({
                  type: 'user/agreeFigure',
                  userId,
                  figure,
                  callback: () => this.list.refresh()
                })}
              >认可</Button>
          }
        </View>
        <List
          ref={(c) => this.list = c}
          request={this.request}
          rowRenderer={(layoutType, user) => {
            const { _id: userId, profile: { nickname, intro } } = user
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center' }}
                onPress={() => {
                  onClose()
                  dispatch(StackActions.push({
                    routeName: 'UserViewer',
                    params: { userId },
                  }))
                }}
              >
                <Avatar user={user} size={41} />
                <View style={{ flex: 1, marginLeft: 13 }}>
                  <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{nickname}</Text>
                  <Text style={{ fontSize: 13, color: '#d1d1d1' }}>{intro}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </Modal>
    )
  }
}
