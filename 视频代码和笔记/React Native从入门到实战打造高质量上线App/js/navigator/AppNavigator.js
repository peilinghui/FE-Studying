import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import WelcomePage from "../page/WelcomePage";
import HomePage from "../page/HomePage";
import DetailPage from "../page/DetailPage";
import FetchDemoPage from "../page/FetchDemoPage";
import DataStoreDemoPage from "../page/DataStoreDemoPage";
import AboutPage from "../page/about/AboutPage";
import AboutMePage from "../page/about/AboutMePage";
import WebViewPage from "../page/WebViewPage";
import CustomKeyPage from "../page/CustomKeyPage";
import SortKeyPage from "../page/SortKeyPage";

const InitNavigator = createStackNavigator({
    WelcomePage: {
        screen: WelcomePage,
        navigationOptions: {
            header: null,//隐藏头部
        }
    }
});

const MainNavigator = createStackNavigator({
    HomePage: {
        screen: HomePage,
        navigationOptions: {
            header: null,
        }
    },
    DetailPage: {
        screen: DetailPage,
        navigationOptions: {
            header: null,
        }
    },
    FetchDemoPage: {
        screen: FetchDemoPage
    },
    DataStoreDemoPage: {
        screen: DataStoreDemoPage
    },
    WebViewPage: {
        screen: WebViewPage,
        navigationOptions: {
            header: null,
        }
    },
    AboutPage: {
        screen: AboutPage,
        navigationOptions: {
            header: null,
        }
    },
    AboutMePage: {
        screen: AboutMePage,
        navigationOptions: {
            header: null,
        }
    },
    CustomKeyPage: {
        screen: CustomKeyPage,
        navigationOptions: {
            header: null,
        }
    },
    SortKeyPage:{
        screen: SortKeyPage,
        navigationOptions: {
            header: null,
        }
    }
});

export default createAppContainer(createSwitchNavigator({
    Init: InitNavigator,
    Main: MainNavigator
}, {
    navigationOptions: {
        header: null,
    },
}));
