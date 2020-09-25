package com.realmapp;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.banli17.RNUpdateAppPackage;
import com.rnfs.RNFSPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.brentvatne.react.ReactVideoPackage;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import com.horcrux.svg.SvgPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.wix.RNCameraKit.RNCameraKitPackage;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.theweflex.react.WeChatPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.avos.avoscloud.AVOSCloud;
import com.avos.avoscloud.AVMixPushManager;
import com.zhuge.analysis.stat.ZhugeSDK;// <--导入SDK
import com.zhuge.reactnativezhuge.RNZhugeioPackage;//<--导入react-native接口

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNUpdateAppPackage(),
            new RNFSPackage(),
            new ReactNativeExceptionHandlerPackage(),
            new RandomBytesPackage(),
            new FastImageViewPackage(),
            new RNFetchBlobPackage(),
            new ImageResizerPackage(),
            new RNZhugeioPackage(),
            new OrientationPackage(),
            new ReactVideoPackage(),
            new ExtraDimensionsPackage(),
            new SvgPackage(),
            new RNViewShotPackage(),
            new RNCameraKitPackage(),
            new RNTextSizePackage(),
            new PickerPackage(),
          new WeChatPackage(),
          new RNGestureHandlerPackage(),
          new LinearGradientPackage(),
          new VectorIconsPackage(),
          new PushPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    AVOSCloud.initialize(this, "jNY4QpTjeVae1PbsCLzD9lQf-gzGzoHsz", "fIcGl0VWOqezJPL7gie5CfyK");
    AVMixPushManager.registerHMSPush(this);
//    AVMixPushManager.registerXiaomiPush(this, "2882303761517962279", "5551796239279", "wcVwFWZnMjmu+mKHWdlWig==");
    AVMixPushManager.registerXiaomiPush(this, "2882303761517962279", "5551796239279");
    AVMixPushManager.registerFlymePush(this, "", "");

    ZhugeSDK.getInstance().init(this, "931dcdc5215147259de4c3680c113e79","");
    ZhugeSDK.getInstance().openExceptionTrack();
  }
}
