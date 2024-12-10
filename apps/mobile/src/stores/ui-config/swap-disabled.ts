import {IQueriesStore} from '@keplr-wallet/stores';
import {autorun, makeObservable, observable, runInAction} from 'mobx';
import {APP_VERSION} from '../../../constants.ts';
import {Platform} from 'react-native';

export class SwapDisabledConfig {
  @observable
  public disabled = true;

  constructor(protected readonly queriesStore: IQueriesStore) {
    makeObservable(this);

    this.init();
  }

  init() {
    if (Platform.OS === 'android') {
      runInAction(() => {
        this.disabled = false;
      });
      return;
    }

    autorun(() => {
      const res = this.queriesStore.simpleQuery.queryGet<{
        [version: string]:
          | {
              disabled: boolean;
            }
          | undefined;
      }>(
        process.env['KEPLR_EXT_CONFIG_SERVER'] || 'http://unknown',
        '/disable-swap/legacy.json',
      );
      if (res.response) {
        if (
          !res.response.data[APP_VERSION] ||
          (res.response.data[APP_VERSION] &&
            !res.response.data[APP_VERSION].disabled)
        ) {
          runInAction(() => {
            this.disabled = false;
          });
        }
      }
    });
  }
}
