import { Platform, StatusBar } from "react-native";
import { getStatusBarHeight } from "react-native-iphone-x-helper";

export function darkLight(a: any) {
    let r, b, g, hsp

    if (a.match(/^rgb/)) {
        a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = a[1];
        g = a[2];
        b = a[3];
    } else {
        a = +('0x' + a.slice(1).replace(
            a.length < 5 && /./g, '$&$&'
        )
        );
        r = a >> 16;
        g = a >> 8 & 255;
        b = a & 255;
    }

    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    if (hsp > 127.5) {
        return 'light';
    } else {
        return 'dark';
    }
}