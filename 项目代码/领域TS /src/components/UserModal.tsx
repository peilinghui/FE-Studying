import React from 'react';
import { Text } from 'react-native';
import Layout from '../constants/Layout';
import 'moment/locale/zh-cn';
import Modal from 'react-native-modalbox';

interface DataObject {
  [key: string]: any;
}

interface Props {
}

interface State {
  data: DataObject;
}

export default class UserModal extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: {}
    }
  }

  open(data: DataObject = {}) {
    (this.refs.modal as InstanceType<typeof Modal>).open();
    this.setState({ data });
  }

  render() {
    return (
        <Modal
          style={{
            height: Layout.window.height / 1.5,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            bottom: -20
          }}
          backdrop={true}
          position="bottom"
          ref={"modal"}
        >
          <Text>UserId: {this.state.data.userId}</Text>
        </Modal>
    )
  }

}
