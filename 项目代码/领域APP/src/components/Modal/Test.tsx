import React from 'react'
import { Button } from 'react-native'
import Modal from './Modal'
import { connect } from 'react-redux'
import List from "../List"
import { list as realmList } from "../../services/realm"

type Props = {
  onClose: () => void
  visible: boolean
  list: {}[]
  user: any
}

export default connect(
  ({
     auth: { detail },
     'list.realm': { list, refreshing },
   }: any) => ({
    user: detail,
    list,
    refreshing,
  })
)(({ onClose, visible, list, user }: Props) => (
  <Modal visible={visible} onClose={onClose}>
    <List
      request={(cursorAt, limit) => realmList(user._id, cursorAt, limit)}
      rowRenderer={() => (
        <Button title="test" onPress={() => console.log('on press')} />
      )}
    />
  </Modal>
))

