import React from 'react'
import { CameraRoll, Image, TouchableOpacity } from 'react-native'
import List from './List'
import { CameraKitCamera, CameraKitGallery } from "react-native-camera-kit"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

type Props = {
  dispatch: Dispatch<{}>
}
@(connect() as any)
export default class extends React.Component<Props> {

  state = {
    isGalleryAuthorized: false,
    nextCursor: undefined,
    selected: [],
  }

  async componentDidMount() {
    this.props.dispatch({ type: 'file/qiniuToken' })
    const isGalleryAuthorized = await CameraKitGallery.checkDevicePhotosAuthorizationStatus()
    this.setState({ isGalleryAuthorized: isGalleryAuthorized === 1 })
    if (!isGalleryAuthorized || isGalleryAuthorized === -1) {
      this.requestAuth()
    }
  }

  async requestAuth() {
    const isUserAuthorizedGallery = await CameraKitGallery.requestDevicePhotosAuthorization()
    this.setState({ isGalleryAuthorized: isUserAuthorizedGallery })
  }

  getPhotos = async (cursorAt: string | undefined, limit: number) => {
    const response = await CameraRoll.getPhotos({
      first: limit,
      after: cursorAt,
      assetType: 'Photos',
    })
    this.setState({ nextCursor: response.page_info.end_cursor })
    return response.edges.map(
      ({ node: { image: { uri }, type } }) => ({
        layoutType: 'ITEM_SPAN_1',
        uri,
        mime: type
      })
    )
  }

  render() {
    return (
      this.state.isGalleryAuthorized ?
        <List
          request={this.getPhotos}
          nextCursor={() => this.state.nextCursor}
          rowRenderer={(layoutType, { uri, mime }: { uri: never, mime: any }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ position: 'relative' }}
                onPress={() => {
                  this.setState(({ selected }: any) => {
                    const index = selected.indexOf(uri)
                    let nextSelected = []
                    if (index >= 0) {
                      selected.splice(index, 1)
                      nextSelected = selected
                    } else {
                      nextSelected = [...selected, uri]
                    }
                    this.props.dispatch({
                      type: 'topic/updateSelectedImages',
                      selected: nextSelected
                    })
                    return { selected: nextSelected }
                  })
                }}
              >
                {this.state.selected.includes(uri) ?
                  <Image
                    style={{ width: 50, height: 50, position: 'absolute', right: 0, top: 0 }}
                    source={require('../assets/selected.png')}
                  />
                  : null}
                <Image
                  style={{ width: 100, height: 100 }}
                  source={{ uri }}
                />
              </TouchableOpacity>
            )
          }}
        /> : null
    )
  }
}
