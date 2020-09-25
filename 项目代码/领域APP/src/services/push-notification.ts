import AV from 'leancloud-storage';
import AVInstallation from 'leancloud-installation';
import { NativeModules, PushNotificationIOS, DeviceEventEmitter, AppState } from 'react-native';
import ReferenceManager from './ref-manager';

const AndroidPush = NativeModules.androidPushModule;

const appId = 'jNY4QpTjeVae1PbsCLzD9lQf-gzGzoHsz';
const appKey = 'fIcGl0VWOqezJPL7gie5CfyK';

AV.init({
    appId: appId,
    appKey: appKey
});

const Installation = AVInstallation(AV);
// var LeancloudInstallation = require('leancloud-installation')(AV);
class PushService {
    an_initPush(userId: string) {
        this._an_saveInstallation(userId);
        DeviceEventEmitter.addListener(AndroidPush.ON_RECEIVE, (notification) => {
            // todo
            console.log('notification', notification);
            console.log(JSON.parse(notification.data).alert);
        });
        DeviceEventEmitter.addListener(AndroidPush.ON_CUSTOM_RECEIVE, (notification) => {
           console.log(JSON.parse(notification.data).alert);
        });
    }

    _an_saveInstallation(userId: string) {
        AndroidPush.saveInstaillation(async (installationId: string) => {
            if (installationId) {
                try {
                    let query = new AV.Query('_Installation');
                    query.equalTo('installationId', installationId);
                    const items = await query.find();
                    
                    if (items.length > 0) {
                        const item = items[0];
                        if (!item.get('userId')) {
                            item.set('userId', userId);
                            await item.save();
                            // LeancloudInstallation.getCurrent()
                            //     .then((installation: any) => {
                            //         installation.set('deviceType', 'android');
                            //         installation.set('deviceToken', userId);
                            //         return installation.save();
                            //     });
                        }
                    } else {
                        throw new Error('Not found installation');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        })
    }

    _iOS_initPush = () => {
        PushNotificationIOS.addEventListener('register', this._iOS_onRegister);
        PushNotificationIOS.addEventListener('notification', this._iOS_onNotification);
        PushNotificationIOS.requestPermissions();
    }


    _iOS_onRegister = (deviceToken: string) => {
        if (deviceToken) {
            this._iOS_saveInstallation(deviceToken);
        }
    }

    _iOS_onNotification = (notification: any) => {
        if (AppState.currentState === 'active') {
            console.warn(JSON.parse(notification.data).alert);
        }
    }

    _iOS_saveInstallation = (deviceToken: string) => {
        const info = {
            apnsTopic: 'com.realmapp',
            deviceType: 'ios',
            deviceToken: deviceToken
        };
        Installation.getCurrent()
            .then((installation: any) => installation.save(info))
            .then((result: any) => console.log(result))
            .catch((error: any) => console.error(error))
    }
}

export default new PushService();
