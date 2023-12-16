import {ObservableQuery, QuerySharedContext} from '@keplr-wallet/stores';
import {APP_STORE_URL, PLAY_STORE_URL} from '../../config';
import {computed} from 'mobx';
import DeviceInfo from 'react-native-device-info';
import {AppState, I18nManager, Platform, Settings} from 'react-native';

type IosVersion = {results: [{version?: string}]};

export class CheckVersionStore extends ObservableQuery<IosVersion | string> {
  protected once = false;
  public country: string;

  constructor(sharedContext: QuerySharedContext) {
    const instance = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

    const country = (() => {
      if (Platform.OS === 'ios') {
        const settings = Settings.get('AppleLocale');
        const locale: string = settings || settings?.[0];
        if (locale) {
          return locale.split('-')[0];
        }
      } else {
        const locale = I18nManager.getConstants().localeIdentifier;
        if (locale) {
          return locale.split('_')[0];
        }
      }
    })();

    const storeApiUrl =
      Platform.OS === 'ios'
        ? '/lookup?bundleId=com.chainapsis.keplrwallet'
        : '/store/apps/details?id=com.chainapsis.keplr';
    super(sharedContext, instance, storeApiUrl);

    this.country = country || 'en';

    AppState.addEventListener('change', e => {
      if (e === 'active') {
        this.waitFreshResponse();
      }
    });
  }

  @computed
  get checkAppVersion(): {needUpdate: boolean; url: string} {
    const currentVersion = DeviceInfo.getVersion();
    const versionFromStore = (() => {
      if (Platform.OS === 'ios') {
        const data = this.response?.data as IosVersion;
        const versionFromAppStore = data?.results[0]?.version;
        return versionFromAppStore;
      }

      return (() => {
        const text = this.response?.data as string;
        const match = text?.match(/Current Version.+?>([\d.-]+)<\/span>/);
        if (match) {
          return match[1].trim();
        }
        const matchNewLayout = text?.match(/\[\[\["([\d-.]+?)"\]\]/);
        if (matchNewLayout) {
          return matchNewLayout[1].trim();
        }
      })();
    })();

    //NOTE 쿼리 오류로 버전을 받지 못하면 update 모달을 보여주지 않음
    if (!versionFromStore) {
      return {needUpdate: false, url: ''};
    }

    if (Platform.OS === 'ios') {
      return {
        needUpdate: versionFromStore !== currentVersion,
        url: `https://apps.apple.com/${this.country}/app/keplr-wallet/id1567851089`,
      };
    }

    return {
      needUpdate: versionFromStore !== currentVersion,
      url: `https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=${this.country}`,
    };
  }

  @computed
  get checkCodePushVersion() {
    return true;
  }
}
