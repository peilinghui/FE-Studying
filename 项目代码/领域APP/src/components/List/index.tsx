import React from 'react'
import { RefreshControl } from 'react-native'
import { RecyclerListView, DataProvider } from 'recyclerlistview'
import LayoutProvider from './LayoutProvider'

interface Props {
  extendedState: {}
  rowRenderer: (type: string | number, data: any, index: number) => JSX.Element | JSX.Element[] | null;
  request: (cursorAt: string | undefined, limit: number, offset: number) => any
  cursorKey: string
  limit: number
  useOffset: boolean;
  nextCursor: () => string | undefined
}

type State = {
  loading: boolean
  hasNext: boolean
  dataProvider: DataProvider
  layoutProvider: LayoutProvider
  refreshing: boolean
  cursorAt: string | null
  offset: number;
  list: any
}

export default class extends React.Component<Props, State> {
  static defaultProps = {
    cursorKey: 'createdAt',
    limit: 40,
    nextCursor: null,
    useOffset: false,
    extendedState: {},
  }

  dataProvider: DataProvider

  constructor(props: Props) {
    super(props)
    this.dataProvider = new DataProvider((r1: any, r2: any) => {
      return r1 !== r2
    })
    const dataProvider = this.dataProvider.cloneWithRows([]);
    this.state = {
      list: [],
      dataProvider,
      layoutProvider: new LayoutProvider(dataProvider),
      refreshing: false,
      loading: false,
      cursorAt: null,
      offset: 0,
      hasNext: true
    }
  }


  componentDidMount() {
    this.refresh()
  }

  refresh = async () => {
    this.setState({ cursorAt: null, refreshing: true, loading: true })
    const { request, limit } = this.props
    const data = await request(undefined, limit, 0);
    const dataProvider = this.dataProvider.cloneWithRows(data);
    this.setState({
      list: data,
      dataProvider,
      layoutProvider: new LayoutProvider(dataProvider),
      refreshing: false,
      loading: false,
      offset: 0,
      hasNext: data.length === limit,
    })
  }

  nextCursor = () => {
    const { nextCursor, cursorKey } = this.props
    if (nextCursor) {
      return nextCursor()
    } else {
      const [{ [cursorKey]: cursorAt }] = this.state.list.slice(-1)
      return cursorAt
    }
  }

  nextOffset = () => {
    const { useOffset, limit } = this.props
    const { offset } = this.state;
    if (useOffset) {
      return offset + limit;
    }
    return 0
  }

  next = () => {
    if (!this.state.loading && this.state.hasNext) {
      this.setState({ loading: true }, async () => {
        const { request, limit } = this.props
        const cursorAt = this.nextCursor()
        const offset = this.nextOffset()
        const data = await request(cursorAt, limit, offset)
        const newList = [...this.state.list, ...data]
        const dataProvider = this.dataProvider.cloneWithRows(newList)
        this.setState({
          dataProvider,
          layoutProvider: new LayoutProvider(dataProvider),
          list: newList,
          loading: false,
          offset,
          hasNext: data.length === limit,
        })
      })
    }
  }

  render() {
    return (this.state.list.length > 0 ?
      <RecyclerListView
        layoutProvider={this.state.layoutProvider}
        dataProvider={this.state.dataProvider}
        scrollViewProps={{
          refreshControl: (
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
            />
          )
        }}
        onEndReached={this.next}
        onEndReachedThreshold={10}
        rowRenderer={this.props.rowRenderer}
        extendedState={this.props.extendedState}
      />
      : null)
  }
}
