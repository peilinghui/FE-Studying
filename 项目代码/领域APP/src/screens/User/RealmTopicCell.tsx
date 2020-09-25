import React from 'react'
import { Dimensions, RefreshControl, ActivityIndicator, View, Text, Image, GestureResponderEvent } from "react-native"
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import MyRealmCard from '../../components/User/MyRealmCard'
import TopicCard from '../../components/TopicCard'
import Colors from '../../constants/Colors';
import _ from 'lodash'
import TouchableIcon from "../../components/TouchableIcon";
import { getBottomSpace, getStatusBarHeight } from "react-native-iphone-x-helper";
import { winHeight, convert, winWidth } from "../../utils/ratio";

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressTopicCallback = (event: GestureResponderEvent) => void;
interface Props {
    myJoinRealm: any
    onClose: () => void
    request: Function
    limit: number,
    onPressRealm: OnPressCallback
    onPressRealmTopic: OnPressTopicCallback;
    currentUserId:string,
}

interface State {
    dataProvider: DataProvider,
    refreshing: boolean,
    loading: boolean,
    cursorAt: null,
    hasNext: boolean,
    modal: string,
    singalTopic: any
}

const MAX_HEIGHT = winHeight - convert(140) - getBottomSpace() - getStatusBarHeight();

export default class extends React.Component<Props, State> {
    static defaultProps = {
        limit: 5
    }

    _layoutProvider: LayoutProvider;
    dataProvider: DataProvider;
    listData: any[];

    constructor(props: Props) {
        super(props);
        let { width } = Dimensions.get("window");
        this.dataProvider = new DataProvider((r1: any, r2: any) => {
            return r1 !== r2;
        });
 
        this.listData = [];
        this._layoutProvider = new LayoutProvider(
            (index: number) => {
                return 0;
            },
            (type, dim, index) => {
                dim.width = width;
                dim.height = this.listData[index].cardHeight;
            }
        );
        this.state = {
            dataProvider: this.dataProvider.cloneWithRows([]),
            refreshing: false,
            loading: false,
            cursorAt: null,
            hasNext: true,
            modal: "",
            singalTopic: {}
        };
    }

    componentDidMount() {
        this.refresh()
    }
    //下拉刷新
    refresh = () => {
        
        this.setState({ cursorAt: null, refreshing: true }, async () => {
            const allResponse = await this.props.request(this.state.cursorAt, this.props.limit)
            const response = allResponse.filter((item: any) => item.creator._id === this.props.currentUserId)
            this.listData = response;
            this.setState({
                cursorAt: response.length > 0 ? response[response.length - 1].createdAt : null,
                dataProvider: this.dataProvider.cloneWithRows(this.listData),
                refreshing: false
            })
        })
    }

    next = () => {
        this.setState({ loading: true }, async () => {
            const allResponse = await this.props.request(this.state.cursorAt, this.props.limit)
            const response = allResponse.filter((item: any) => item.creator_id === this.props.currentUserId)
            if (response.length > 0) {
                this.listData = [...this.listData, ...response];
                this.setState({
                    cursorAt: response[response.length - 1].createdAt,
                    dataProvider: this.dataProvider.cloneWithRows(this.listData),
                    loading: false,
                    hasNext: response.length === this.props.limit,
                })
            } else {
                this.setState({
                    loading: false,
                    hasNext: false
                })
            }

        })
    }

    //上拉加载更多
    handleLoadMore() {
        if (this.state.loading) return;

        if (this.listData.length == 0) {
            return;
        }

        if (!this.state.hasNext) {
            return;
        }
        this.next();
    }

    renderFooter = () => {
        return (
            <View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
                {this.state.loading && <ActivityIndicator size="large" color={Colors.darkGray} />}
                {!this.state.hasNext && <Text style={{ color: Colors.darkGray }}>- 完 - </Text>}
            </View>
        );
    };

    _rowRenderer = (type: any, item: any) => {
        const { onPressRealmTopic }= this.props
        return (
            <TopicCard
                onPress={(item) => {
                    onPressRealmTopic(item)
                }}
                onPressAvatar={(user = {}) => {
                    onPressRealmTopic(item)
                }}
                topic={item}
                onPressRealm={(topic) => {
                    onPressRealmTopic(item)
                }}
                onPressTopic={(topic) => {
                    onPressRealmTopic(item)
                }}
                onPressVideo={(topic) => {
                    onPressRealmTopic(item)
                }}
                onPressLink={(topic) => {
                    onPressRealmTopic(item)
                }}
            />
        );
    }

    render() {
        const { myJoinRealm, onClose, onPressRealmTopic, onPressRealm, currentUserId } = this.props
        const {
            myJoinRealm: {
                computed: { userInfo: { numOfCreatedTopics, numOfReceivedAgrees } },
                creator: { profile: { nickname } },
                statistics: { numOfMembers }
            }
        } = this.props

        return (
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0)', height: winHeight }}>
                <View style={{ height: convert(200), width: winWidth, alignItems: 'center', justifyContent: 'center' }}>
                    <MyRealmCard
                        onPress={onPressRealm}
                        realm={myJoinRealm}
                        styles={{}}
                        currentUserId={currentUserId}/>
                </View>
                <View
                    style={{
                        backgroundColor: "#fff",
                        height: MAX_HEIGHT,
                        borderTopLeftRadius: convert(12),
                        borderTopRightRadius: convert(12),
                    }}
                >
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            height: convert(50),
                        }}>
                        <Text style={{
                            fontSize: convert(20),
                            fontWeight: '600',
                            color: 'black',
                            marginLeft: convert(20),
                            marginTop: convert(15),
                        }}>{numOfCreatedTopics} 讨论 ·{numOfReceivedAgrees} 认同</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                            }}>
                            <Text style={{
                                fontSize: 13,
                                color: Colors.darkGray,
                                marginTop: convert(23)
                            }}>领域成就</Text>
                            <TouchableIcon
                                style={{
                                    right: 0,
                                    margin: convert(10)
                                }}
                                name="md-close-circle"
                                onPress={onClose}
                            />
                        </View>
                    </View>
                    {this.state.dataProvider.getSize() > 0 ? <RecyclerListView
                        layoutProvider={this._layoutProvider}
                        dataProvider={this.state.dataProvider}
                        rowRenderer={this._rowRenderer}
                        scrollViewProps={{
                            refreshControl: (
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={async () => {
                                        this.refresh();
                                    }}
                                />
                            )
                        }}
                        onEndReachedThreshold={20}
                        onEndReached={() => {
                            this.handleLoadMore();
                        }}
                        renderFooter={() => this.renderFooter()}
                    /> : <View style={{ paddingTop: convert(80) }}>
                            <Text
                                style={{
                                    fontSize: convert(20),
                                    color: '#ccc',
                                    alignSelf: 'center'
                                }}
                            >还没有发起讨论！</Text>
                        </View>}
                </View>
            </View>
        )
    }
}
