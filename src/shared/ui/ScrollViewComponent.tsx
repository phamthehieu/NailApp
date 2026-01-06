import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

interface IProps extends ScrollViewProps {}

const ScrollViewComponent = React.memo((props: IProps) => {
  return <ScrollView {...props}>{props.children}</ScrollView>;
});

ScrollViewComponent.displayName = 'ScrollViewComponent';

export default ScrollViewComponent;