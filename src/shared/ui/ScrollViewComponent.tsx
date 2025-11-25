import React from 'react';
import { FlatList, ScrollViewProps } from 'react-native';

interface IProps extends ScrollViewProps {}

const ScrollViewComponent = (props: IProps) => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(_e, i) => 'dom' + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      ListHeaderComponent={() => <>{props.children}</>}
    />
  );
};

export default ScrollViewComponent;