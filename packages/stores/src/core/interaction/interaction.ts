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
import {
  action,
  observable,
  IObservableArray,
  makeObservable,
  flow,
} from "mobx";

export class InteractionStore implements InteractionForegroundHandler {
  @observable.shallow
  protected datas: Map<string, InteractionWaitingData[]> = new Map();

  constructor(
    protected readonly router: Router,
    protected readonly msgRequester: MessageRequester
  ) {
    makeObservable(this);

    const service = new InteractionForegroundService(this);
    interactionForegroundInit(router, service);
  }

  getDatas<T = unknown>(type: string): InteractionWaitingData<T>[] {
    return (this.datas.get(type) as InteractionWaitingData<T>[]) ?? [];
  }

  @action
  onInteractionDataReceived(data: InteractionWaitingData) {
    if (!this.datas.has(data.type)) {
      this.datas.set(
        data.type,
        observable.array([], {
          deep: false,
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.datas.get(data.type)!.push(data);
  }

  @flow
  *approve(type: string, id: string, result: unknown) {
    this.removeData(type, id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new ApproveInteractionMsg(id, result)
    );
  }

  @flow
  *reject(type: string, id: string) {
    this.removeData(type, id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new RejectInteractionMsg(id)
    );
  }

  @flow
  *rejectAll(type: string) {
    const datas = this.getDatas(type);
    for (const data of datas) {
      yield this.reject(data.type, data.id);
    }
  }

  @action
  removeData(type: string, id: string) {
    if (this.datas.has(type)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const find = this.datas.get(type)!.find((data) => {
        return data.id === id;
      });
      if (find) {
        (this.datas.get(
          type
        ) as IObservableArray<InteractionWaitingData>).remove(find);
      }
    }
  }
}
