import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import SocialCard from './SocialCard'
import CardModal from './Modal/Card'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

type Props = {
  dispatch: Dispatch<any>
  cards: any[]
  features: any[]
  currentUser: any
  userId: string
}
@(connect(
  ({
    auth: { detail: currentUser },
  }: any) => ({
    currentUser,
  })
) as any)
export default class extends React.Component<Props> {
  static defaultProps = {
    dispatch: null,
    currentUser: null
  }
  state = {
    modal: ''
  }

  render() {
    const { dispatch, cards, features,currentUser, userId } = this.props
    if (cards.length === 0 && currentUser._id !== userId) {
      return <></>
    }
    return (
      <View>
        <View style={{ marginHorizontal: 18 }}>
          <Text style={styles.title}>社交卡片</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cards.length > 0 && cards.map((card, index) => (
            <SocialCard
              onDelete={() => dispatch({ type: 'user/removeCard', cardId: card._id })}
              style={{ marginLeft: index === 0 ? 20 : 13 }}
              key={card._id}
              card={card}
            />
          ))}
          {currentUser._id === userId ?
            <CardModal
              features={features}
              visible={this.state.modal === 'card'}
              onClose={() => this.setState({ modal: '' })}
            >
              <TouchableOpacity
                style={{
                  width: 136,
                  height: 174,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f7f7f7',
                  marginLeft: 13,
                }}
                onPress={() => this.setState({ modal: 'card' })}
              >
                <Icon name="md-add-circle" size={43} color="#bbbbc5" />
                <Text style={{ fontSize: 20, fontWeight: '500', marginTop: 30 }}>添加卡片</Text>
              </TouchableOpacity>
            </CardModal>
            : null}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  }
})
