import Axios from 'axios'

interface Cursor {
  key: string;
  operator: string;
  pos: 'front' | 'end';
}
interface Configs {
  url: string;
  pagerType: 'cursor' | 'offset';
  limit?: number;
  query?: { [key: string]: any };
  headers?: { [key: string]: any };
  axios?: { [key: string]: any };
  polling?: boolean;
  cursor?: Cursor;
  offset?: number;
}

interface Controls {
  hasNext: boolean;
  cursorAt?: string | null;
  offset?: number | null;
}

export default class DataStream {
  private url: string;
  private pagerType: 'cursor' | 'offset';
  private limit: number;
  private query: { [key: string]: any };
  private headers: { [key: string]: any };
  private axios: { [key: string]: any };
  private polling: boolean;
  private cursor?: Cursor;
  private offset?: number;
  private controls: Controls;
  private busy: boolean;
  private afterFirst: boolean;

  constructor(configs: Configs) {
    this.url = configs.url
    this.pagerType = configs.pagerType
    this.limit = configs.limit || 40
    this.query = configs.query || {}
    this.headers = configs.headers || {}
    this.axios = configs.axios || {}
    this.polling = configs.polling || false

    if (this.pagerType === 'cursor') {
      this.controls = {
        hasNext: true,
        cursorAt: null
      }
      this.cursor = configs.cursor
    } else if (this.pagerType === 'offset') {
      this.controls = {
        hasNext: true,
        offset: 0
      }
      this.offset = configs.offset;
    } else {
      this.controls = { hasNext: false };
    }

    this.busy = false

    if (this.polling) {
      this.afterFirst = true
    } else {
      this.afterFirst = false
    }
  }

  get hasNext() {
    return this.controls.hasNext
  }

  get isBusy() {
    return this.busy
  }

  setCursorAt(cursorAt: string) {
    this.controls.cursorAt = cursorAt
  }

  setOffset(offset: number) {
    this.controls.offset = offset
  }

  async load() {
    if (!this.hasNext && !this.polling) {
      throw new Error('end of source')
    }
    try {
      if (!this.afterFirst) {
        return this.loadFirst()
      }
      return this.loadMore()
    } catch (error) {
      throw new Error('Network error')
    }
  }

  async refresh() {
    try {
      return this.loadFirst()
    } catch (error) {
      throw new Error('Network error')
    }
  }

  async loadFirst() {
    this.busy = true

    const response = await Axios.get(this.url, {
      params: this.query,
      headers: this.headers,
      ...this.axios
    })
    const list = response.data

    this.updateControls(list)
    this.afterFirst = true
    this.busy = false
    return list
  }

  async loadMore() {
    this.busy = true
    const params = { ...this.query }

    if (this.pagerType === 'cursor') {
      Object.assign(params, {
        cursorKey: this.cursor!.key,
        cursorOperator: this.cursor!.operator,
        cursorValue: this.controls.cursorAt,
        limit: this.limit
      })
    } else if (this.pagerType === 'offset') {
      Object.assign(params, {
        offset: this.offset,
        limit: this.limit
      })
    }

    const response = await Axios.get(this.url, {
      params,
      headers: this.headers,
      ...this.axios
    })
    const list = response.data

    this.updateControls(list)
    this.busy = false
    return list
  }

  updateControls(list: any[]) {
    this.controls.hasNext = list.length === this.limit
    if (list.length === 0) {
      return
    }
    if (this.pagerType === 'cursor') {
      if (this.cursor!.pos === 'end') {
        this.controls.cursorAt = list[list.length - 1].createdAt
      } else if (this.cursor!.pos === 'front') {
        this.controls.cursorAt = list[0].createdAt
      }
    } else if (this.pagerType === 'offset') {
      this.controls.offset! += list.length
    }
  }
}
