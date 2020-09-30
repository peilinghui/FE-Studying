import React, { PureComponent } from 'react';
import {
    TouchableOpacity
} from "react-native"
import throttle from 'lodash.throttle';


type Props = {
    onPress: () => void
    onPressWithSecond: number | 1000
}

export default class Touchable extends PureComponent<Props> {

    private handleClickThrottled:any
    constructor(props:any) {
        super(props)
        this.handleClickThrottled = throttle(this.props.onPress, this.props.onPressWithSecond);
    }
    componentWillUnmount() {
        this.handleClickThrottled.cancel();
    }

    render() {
        return (
            <TouchableOpacity {...this.props} onPress={this.handleClickThrottled}>
                {this.props.children}
            </TouchableOpacity>
        );
    }
}
