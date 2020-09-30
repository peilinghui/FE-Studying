import React from 'react'
import { View, Text, FlatList } from 'react-native'
import Modal from './Modal'
import TouchableIcon from "../TouchableIcon"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { objectHash } from "../../utils/functions"
import RealmCard from "../RealmCard"
import { convert } from '../../utils/ratio';
import Colors from '../../constants/Colors';

type Props = {
  onClose: () => void
  visible: boolean
  dispatch: Dispatch<{}>
  list: {}[]
  refreshing: boolean
  onPress: (item: any) => void
}

export default connect(
  ({
    'list.realm': { list, refreshing },
  }: any) => ({
    list,
    refreshing,
  })
)(({ onClose, visible, dispatch, list, refreshing, onPress }: Props) => (
  <Modal
    visible={visible}
    onClose={onClose}>
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: convert(50),
      }}>
      <Text style={{
        fontSize: convert(20),
        fontWeight: '600',
        color: 'black',
        marginLeft: convert(20),
        marginTop: convert(15),
      }}>发送领域</Text>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Text style={{
          fontSize: 13,
          color: Colors.darkGray,
          marginTop: convert(23)
        }}>我所在的</Text>
        <TouchableIcon
          style={{
            right: 0,
            margin: convert(10)
          }}
          name="md-close-circle"
          onPress={onClose}
        />
      </View>
    </View>
    <FlatList
      contentContainerStyle={{ paddingTop: convert(10) }}
      refreshing={refreshing}
      onRefresh={() => dispatch({ type: 'list.realm/refresh' })}
      data={list}
      keyExtractor={(item) => objectHash(item)}
      onEndReached={() => dispatch({ type: 'list.realm/next' })}
      renderItem={({ item }: { item: any }) => (
        <View style={{ marginHorizontal: convert(20), marginBottom: convert(20) }}>
          <RealmCard
            onPress={() => onPress(item)}
            onPressAvatar={() => onPress(item)}
            realm={item}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={{ paddingTop: convert(26) }}>
          <Text style={{ fontSize: convert(20), color: '#ccc', alignSelf: 'center' }}>
            快来发布第一个话题吧！
          </Text>
        </View>
      }
    />
  </Modal>
))

