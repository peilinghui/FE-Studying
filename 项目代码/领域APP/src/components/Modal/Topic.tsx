import React from 'react'
import { View, Text, FlatList } from 'react-native'
import Modal from './Modal'
import TouchableIcon from '../TouchableIcon'
import { objectHash } from "../../utils/functions"
import TopicCardMini from "../TopicCardMini"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {convert  } from '../../utils/ratio';
import Colors from '../../constants/Colors';

type Props = {
  onClose: () => void
  visible: boolean
  list: {}[]
  refreshing: boolean
  dispatch: Dispatch<{ type: string }>
  onPress: (item: any) => void
}

export default connect(
  ({
    'list.joinedTopic': { list, refreshing, loading, hasNext },
  }: any) => ({
    list,
    refreshing,
    loading,
    hasNext
  })
)(({ onClose, visible, list, refreshing, dispatch, onPress }: Props) => (
  <Modal
    visible={visible}
    onClose={onClose}>
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height:convert(50),
      }}>
      <Text style={{
        fontSize: convert(20),
        fontWeight: '600',
        color:'black',
        marginLeft:convert(20),
        marginTop:convert(15),
        }}>发送话题</Text>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Text style={{ 
          fontSize: 13, 
          color: Colors.darkGray,
          marginTop:convert(23)
          }}>我参与的</Text>
       <TouchableIcon
          style={{  
            right: 0,
            margin:convert(10)}}
          name="md-close-circle"
          onPress={onClose}
      />
      </View>
    </View>
    
    <FlatList
      bounces={true}
      refreshing={refreshing}
      onRefresh={() => dispatch({ type: 'list.joinedTopic/refresh' })}
      onEndReached={() => dispatch({ type: 'list.joinedTopic/next' })}
      data={list}
      keyExtractor={(item) => objectHash(item)}
      renderItem={({ item = {} }: any) => (
        <TopicCardMini
          topic={item}
          onPress={() => onPress(item)}
          onPressAvatar={() => onPress(item)}
        />
      )}
      ListEmptyComponent={
        <View style={{ paddingTop: 26 }}>
          <Text style={{ fontSize: 20, color: '#ccc', alignSelf: 'center' }}>
            还没有一个讨论
          </Text>
        </View>
      }
    />
  </Modal>
))

