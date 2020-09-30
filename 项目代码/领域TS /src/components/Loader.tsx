import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { convert } from '../utils/ratio';

interface Props {
    loading: boolean;
}

@(connect(({ app: { loading } }: any) => ({ loading })) as any)
export default class Loader extends Component<Props> {

    render() {
        const { loading } = this.props;
        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={loading}
                onRequestClose={() => { console.log('close modal') }}>
                <View style={styles.modalBackground}>
                    <View style={styles.activityIndicatorWrapper}>
                        <ActivityIndicator
                            animating={loading} color="#ffffff" size={convert(40)}/>
                    </View>
                </View>
            </Modal>
        )
    }

}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000060'
    },
    activityIndicatorWrapper: {
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    }
});