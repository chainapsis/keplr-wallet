import {
  Router,
  MessageRequester,
  BACKGROUND_PORT,
} from "@keplr-wallet/router";
import {
  InteractionForegroundHandler,
  interactionForegroundInit,
  InteractionForegroundService,
  InteractionWaitingData,
  ApproveInteractionMsg,
  RejectInteractionMsg,
} from "@keplr-wallet/background";
import { action, observable, makeObservable, flow, toJS } from "mobx";
import { computedFn } from "mobx-utils";

export type InteractionWaitingDataWithObsolete<T = unknown> =
  InteractionWaitingData<T> & {
    obsolete: boolean;
  };

export class InteractionStore implements InteractionForegroundHandler {
  @observable.shallow
  protected data: InteractionWaitingDataWithObsolete[] = [];

  constructor(
    protected readonly router: Router,
    protected readonly msgRequester: MessageRequester
  ) {
    makeObservable(this);

    const service = new InteractionForegroundService(this);
    interactionForegroundInit(router, service);
  }

  getAllData = computedFn(
    <T = unknown>(type: string): InteractionWaitingDataWithObsolete<T>[] => {
      return toJS(
        this.data.filter((d) => d.type === type)
      ) as InteractionWaitingDataWithObsolete<T>[];
    }
  );

  getData = computedFn(
    <T = unknown>(
      id: string
    ): InteractionWaitingDataWithObsolete<T> | undefined => {
      return this.data.find(
        (d) => d.id === id
      ) as InteractionWaitingDataWithObsolete<T>;
    }
  );

  @action
  onInteractionDataReceived(data: InteractionWaitingData) {
    this.data.push({
      ...data,
      obsolete: false,
    });
  }

  onEventDataReceived() {
    // noop
  }

  /**
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
   * @param type
   * @param id
   * @param result
   * @param afterFn
   */
  @flow
  *approveWithProceedNext(
    id: string,
    result: unknown,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    const d = this.getData(id);
    if (!d || d.obsolete) {
      return;
    }

    this.markAsObsolete(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new ApproveInteractionMsg(id, result)
    );
    yield this.delay(200);
    yield afterFn(this.hasOtherData(id));
    this.removeData(id);
  }

  /**
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
   * @param type
   * @param id
   * @param afterFn
   */
  @flow
  *rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    const d = this.getData(id);
    if (!d || d.obsolete) {
      return;
    }

    this.markAsObsolete(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new RejectInteractionMsg(id)
    );
    yield this.delay(200);
    yield afterFn(this.hasOtherData(id));
    this.removeData(id);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  @flow
  *rejectAll(type: string) {
    const data = this.getAllData(type);
    for (const d of data) {
      if (d.obsolete) {
        continue;
      }
      yield this.msgRequester.sendMessage(
        BACKGROUND_PORT,
        new RejectInteractionMsg(d.id)
      );
      this.removeData(d.id);
    }
  }

  @action
  protected removeData(id: string) {
    this.data = this.data.filter((d) => d.id !== id);
  }

  @action
  protected markAsObsolete(id: string) {
    const findIndex = this.data.findIndex((data) => {
      return data.id === id;
    });
    if (findIndex >= 0) {
      this.data[findIndex] = {
        ...this.data[findIndex],
        obsolete: true,
      };
    }
  }

  protected hasOtherData(id: string): boolean {
    const find = this.data.find((data) => {
      return data.id !== id;
    });
    return !!find;
  }
}
