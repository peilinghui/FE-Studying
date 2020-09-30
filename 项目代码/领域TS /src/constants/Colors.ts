const tintColor = '#252837';

export default {
  tintColor,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColor,
  tabBar: '#fff',
  errorBackground: 'red',
  errorText: '#fff',
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  noticeBackground: tintColor,
  noticeText: '#fff',
  lightGray: 'rgb(249, 251, 252)',
  darkGray: 'rgb(187, 187, 197)',
  darkerGray: 'rgb(167, 167, 177)',
  darkGrayAlpha(alpha: number) {
    return `rgba(187, 187, 197, ${alpha})`
  },
  blue: '#267BF7',
  red: 'rgb(255, 53, 103)',
};
