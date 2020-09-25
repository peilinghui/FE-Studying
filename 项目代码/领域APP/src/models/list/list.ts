export default {
  state: {
    list: [],
    limit: 40,
    cursorAt: null,
    hasNext: true,
    refreshing: false,
    loading: false,
    cursorKey: 'createdAt',
  },
  reducers: {
    append(state: any, { list }: any) {
      return {
        ...state,
        list: [...state.list, ...list],
        hasNext: list.length === state.limit,
      }
    },
    update(state: any, { list }: any) {
      return { ...state, list, hasNext: list.length === state.limit }
    },
    updateCursorAtState(state: any, { cursorAt }: any) {
      return { ...state, cursorAt }
    },
    updateRefreshing(state: any, { refreshing }: any) {
      return { ...state, refreshing }
    },
    updateLoading(state: any, { loading }: any) {
      return { ...state, loading }
    },
    updateHasNext(state: any, { hasNext }: any) {
      return { ...state, hasNext }
    }
  },
  effects: {
    *next({ type, ...rest }: any, { select, put }: any) {
      const [namespace] = type.split('/')
      const hasNext = yield select(({ [namespace]: { hasNext } }: any) => hasNext)
      if (hasNext) {
        yield put({ type: 'updateCursorAt' })
        yield put({ type: 'fetch', ...rest })
      }
    },
    *refresh({ type, ...rest }: any, { put }: any) {
      yield put({ type: 'updateCursorAtState', cursorAt: null })
      yield put({ type: 'updateHasNext', hasNext: true })
      yield put({ type: 'fetch', action: 'update', ...rest })
    },
    *updateCursorAt({ type }: any, { select, put }: any) {
      const [namespace] = type.split('/')
      const [list, cursorKey] = yield select(({ [namespace]: { list, cursorKey } }: any) => [list, cursorKey])
      if (list.length > 0) {
        const [{ [cursorKey]: cursorAt }] = list.slice(-1)
        yield put({ type: 'updateCursorAtState', cursorAt })
      }
    }
  }
}
