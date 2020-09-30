import { AsyncStorage } from 'react-native';
import { Component } from 'react';

const REFS: {[key: string]: Component} = {};

export default class MoonReference {

    static get(key: string): Component {
        if (!REFS[key]) {
            throw new Error('Reference is not found');
        }
        return REFS[key];
    }

    static put(key: string, ref: Component) {
        REFS[key] = ref;
    }

}