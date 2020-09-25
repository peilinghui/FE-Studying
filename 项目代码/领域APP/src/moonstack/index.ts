import MoonComponent from './MoonComponent';
import MoonStorage from './features/Storage';
import MoonReference from './features/Reference';

export default {
  Component: MoonComponent,
  Features: {
    Storage: MoonStorage,
    Reference: MoonReference
  },
};