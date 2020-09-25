import { GridLayoutProvider } from 'recyclerlistview-gridlayoutprovider'

const MAX_SPAN = 4
export default class LayoutProvider extends GridLayoutProvider {
  constructor(props: any) {
    super(
      MAX_SPAN,
      index => {
        const { layoutType = 'ITEM_SPAN_4' } = props.getDataForIndex(index) || {}
        return layoutType
      },
      (index: number) => {
        const { layoutType = 'ITEM_SPAN_4' } = props.getDataForIndex(index) || {}
        switch (layoutType) {
          case 'ITEM_SPAN_4':
            return 4
          case 'ITEM_SPAN_2':
            return 2
          case 'ITEM_SPAN_1':
          default:
            return 1
        }
      },
      (index: number) => {
        const { height = 100 } = props.getDataForIndex(index) || {}
        return height
      }
    )
  }
}
