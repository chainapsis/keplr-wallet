import React, {FunctionComponent} from 'react';
import {PageWithScrollView} from '../../../components/page';

import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';

export const ValidatorListScreen: FunctionComponent = observer(() => {
  return (
    <PageWithScrollView backgroundMode="default">
      <Text>test</Text>
    </PageWithScrollView>
  );
});
