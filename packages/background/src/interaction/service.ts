import { InteractionWaitingData } from "./types";
import {
  APP_PORT,
  Env,
  FnRequestInteractionOptions,
  KeplrError,
  MessageRequester,
} from "@keplr-wallet/router";
import {
  InteractionPingMsg,
  PushEventDataMsg,
  PushInteractionDataMsg,
} from "./foreground";
import { Buffer } from "buffer/";
import { SidePanelService } from "../side-panel";

export class InteractionService {
  protected waitingMap: Map<string, InteractionWaitingData> = new Map();
  protected resolverMap: Map<
    string,
    { onApprove: (result: unknown) => void; onReject: (e: Error) => void }
  > = new Map();

  protected resolverV2Map: Map<
    string,
    {
      resolver: () => void;
    }[]
  > = new Map();

  constructor(
    protected readonly eventMsgRequester: MessageRequester,
    protected readonly sidePanelService: SidePanelService,
    protected readonly extensionMessageRequesterToUI?: MessageRequester
  ) {}

  async init(): Promise<void> {
    // noop
  }

  getInteractionWaitingDataArray(): InteractionWaitingData[] {
    return Array.from(this.waitingMap.values());
  }

  // Dispatch the event to the frontend. Don't wait any interaction.
  // And, don't ensure that the event is delivered successfully, just ignore the any errors.
  dispatchEvent(port: string, type: string, data: unknown) {
    if (!type) {
      throw new KeplrError("interaction", 101, "Type should not be empty");
    }

    const msg = new PushEventDataMsg({
      type,
      data,
    });

    this.eventMsgRequester.sendMessage(port, msg).catch((e) => {
      console.log(`Failed to send the event to ${port}: ${e.message}`);
    });
  }

  async waitApprove(
    env: Env,
    uri: string,
    type: string,
    data: unknown,
    options?: Omit<FnRequestInteractionOptions, "unstableOnClose">
  ): Promise<unknown> {
    if (!type) {
      throw new KeplrError("interaction", 101, "Type should not be empty");
    }

    // TODO: Add timeout?
    const interactionWaitingData = this.addDataToMap(
      type,
      env.isInternalMsg,
      await this.getWindowIdFromEnvOrCurrentWindowId(env),
      uri,
      data
    );

    return await this.wait(env, interactionWaitingData, options);
  }

  async waitApproveV2<Return, Response>(
    env: Env,
    uri: string,
    type: string,
    data: unknown,
    returnFn: (response: Response) => Promise<Return> | Return,
    options?: Omit<FnRequestInteractionOptions, "unstableOnClose">
  ): Promise<Return> {
    if (!type) {
      throw new KeplrError("interaction", 101, "Type should not be empty");
    }

    // TODO: Add timeout?
    const interactionWaitingData = this.addDataToMap(
      type,
      env.isInternalMsg,
      await this.getWindowIdFromEnvOrCurrentWindowId(env),
      uri,
      data
    );

    try {
      const response: any = await this.wait(
        env,
        interactionWaitingData,
        options
      );
      return returnFn(response);
    } finally {
      const resolvers = this.resolverV2Map.get(interactionWaitingData.id);
      if (resolvers) {
        for (const resolver of resolvers) {
          resolver.resolver();
        }
      }
      this.resolverV2Map.delete(interactionWaitingData.id);
    }
  }

  protected async wait(
    env: Env,
    data: InteractionWaitingData,
    options?: Omit<FnRequestInteractionOptions, "unstableOnClose">
  ): Promise<unknown> {
    const msg = new PushInteractionDataMsg(data);

    const id = msg.data.id;
    if (this.resolverMap.has(id)) {
      throw new KeplrError("interaction", 100, "Id is aleady in use");
    }

    return new Promise<unknown>((resolve, reject) => {
      this.resolverMap.set(id, {
        onApprove: resolve,
        onReject: reject,
      });

      if (env.isInternalMsg) {
        env.requestInteraction(data.uri, msg, {
          ...options,
          unstableOnClose: () => {
            this.reject(id);
          },
        });
      } else {
        // XXX: internal msg의 경우엔 extension popup(side panel)에서 요청된 것이기 때문에
        //      그대로 페이지의 uri 자체를 백그라운드에서 바꾼다
        //      하지만 internal msg가 아닌 경우는 외부 웹페이지에서 요청된 것인데
        //      side panel의 경우 특정 extension url에 대해서 백그라운드에서 처리할 수 없기 때문에
        //      extension UI 자체에서 url 전환을 해결해야한다.
        //      popup의 경우도 side panel과 로직을 동일하게 가져가게 하기 위해서
        //      이런식으로 처리해야한다.
        if (this.sidePanelService.getIsEnabled()) {
          // 위의 주석을 참고.
          // side panel이 enabled면 baackground에서 side panel을 열어줄 방법이 없다.
          // side panel을 여는건 provider에서 처리해야만 한다.
          // side panel을 열 순 없지만 interaction이 UI에는 추가되어야하기 때문에
          // msg만 보내준다
          if (this.extensionMessageRequesterToUI) {
            this.extensionMessageRequesterToUI.sendMessage(APP_PORT, msg);
          }
        } else {
          env.requestInteraction("", msg, {
            ...options,
            unstableOnClose: () => {
              this.reject(id);
            },
          });
        }
      }
    });
  }

  approve(id: string, result: unknown) {
    if (this.resolverMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.resolverMap.get(id)!.onApprove(result);
      this.resolverMap.delete(id);
    }

    this.removeDataFromMap(id);
  }

  approveV2(id: string, result: unknown): Promise<void> {
    return new Promise((resolve) => {
      const resolvers = this.resolverV2Map.get(id) || [];
      resolvers.push({
        resolver: resolve,
      });
      this.resolverV2Map.set(id, resolvers);

      if (this.resolverMap.has(id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.resolverMap.get(id)!.onApprove(result);
        this.resolverMap.delete(id);
      }

      this.removeDataFromMap(id);
    });
  }

  reject(id: string) {
    if (this.resolverMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.resolverMap.get(id)!.onReject(new Error("Request rejected"));
      this.resolverMap.delete(id);
    }

    this.removeDataFromMap(id);
  }

  rejectV2(id: string): Promise<void> {
    return new Promise((resolve) => {
      const resolvers = this.resolverV2Map.get(id) || [];
      resolvers.push({
        resolver: resolve,
      });
      this.resolverV2Map.set(id, resolvers);

      if (this.resolverMap.has(id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.resolverMap.get(id)!.onReject(new Error("Request rejected"));
        this.resolverMap.delete(id);
      }

      this.removeDataFromMap(id);
    });
  }

  protected addDataToMap(
    type: string,
    isInternal: boolean,
    windowId: number | undefined,
    uri: string,
    data: unknown
  ): InteractionWaitingData {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const id = Buffer.from(bytes).toString("hex");

    const interactionWaitingData: InteractionWaitingData = {
      id,
      type,
      isInternal,
      windowId,
      data,
      uri,
    };

    if (this.waitingMap.has(id)) {
      throw new KeplrError("interaction", 100, "Id is aleady in use");
    }

    const wasEmpty = this.waitingMap.size === 0;

    this.waitingMap.set(id, interactionWaitingData);

    if (wasEmpty && this.extensionMessageRequesterToUI) {
      // waiting data를 처리하려면 당연히 UI가 있어야한다.
      // 근데 side panel의 경우 UI가 꺼졌는지 아닌지 쉽게 알 방법이 없다...
      // 그래서 UI가 꺼졌는지 아닌지를 판단하기 위해서 ping을 보내서 UI가 살아있는지 확인한다.
      // 추가로 side panel의 경우는 window id까지 고려한다...
      // 유저가 여러 window를 켜놨고 각 window마다 side panel을 열어놨다고 생각해보자...
      // ping이 일단 최소한 한번은 성공해야지 이러한 처리를 해준다.
      // 왜냐면 어쩌다가 interaction이 추가된 이후에 UI가 늦게 열리면
      // UI가 늦게 열렸다는 이유로 실패할 수 있는데 이건 이상하기 때문에...
      // 그리고 모바일에서는 어차피 이러한 처리가 필요없기 때문에 모바일 쪽 UI에서는 ping을 받아줄 필요가 없다.
      // 그래서 모바일에서는 어차피 ping이 성공하지 않기 때문에 아무런 처리도 안되도록 한다.
      // should not wait
      this.startCheckPingOnUIWithWindowId();
      this.startCheckPingOnUI();
    }

    return interactionWaitingData;
  }

  protected async startCheckPingOnUIWithWindowId() {
    const pingStateMap = new Map<
      number,
      {
        wasPingSucceeded: boolean;
      }
    >();

    while (this.waitingMap.size > 0 && this.extensionMessageRequesterToUI) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const windowIds = this.sidePanelService.getIsEnabled()
        ? new Set(Array.from(this.waitingMap.values()).map((w) => w.windowId))
        : // 로직 짜기가 귀찮아서 side panel이 아닌 경우는 그냥 window id를 다 0으로 처리한다...
          new Set([-1]);

      for (const windowId of windowIds) {
        // XXX: window id를 찾지 못하는 경우는 개발 중에는 없었는데...
        //      일단 타이핑 상 undefined일수도 있다.
        //      이 경우는 일단 아무것도 안하고 넘어간다.
        if (windowId == null) {
          continue;
        }

        const data = Array.from(this.waitingMap.values()).filter(
          (w) => w.windowId === windowId
        );
        const wasPingSucceeded = (() => {
          if (pingStateMap.has(windowId)) {
            return pingStateMap.get(windowId)!.wasPingSucceeded;
          } else {
            pingStateMap.set(windowId, {
              wasPingSucceeded: false,
            });
            return false;
          }
        })();
        let succeeded = false;
        try {
          const res = await this.extensionMessageRequesterToUI!.sendMessage(
            APP_PORT,
            // XXX: popup에서는 위에 로직에서 window id를 -1로 대충 처리 했었다.
            new InteractionPingMsg(
              windowId === -1 ? undefined : windowId,
              false
            )
          );
          if (res) {
            succeeded = true;
          }
        } catch (e) {
          console.log(e);
        }

        if (wasPingSucceeded && !succeeded) {
          // UI가 꺼진 것으로 판단한다.
          // 그래서 모든 interaction을 reject한다.
          for (const d of data) {
            this.rejectV2(d.id);
          }
          break;
        }

        if (!wasPingSucceeded && succeeded) {
          pingStateMap.set(windowId, {
            wasPingSucceeded: true,
          });
        }
      }
    }
  }

  protected async startCheckPingOnUI() {
    let wasPingSucceeded = false;

    while (this.waitingMap.size > 0 && this.extensionMessageRequesterToUI) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let succeeded = false;
      try {
        const res = await this.extensionMessageRequesterToUI!.sendMessage(
          APP_PORT,
          new InteractionPingMsg(0, true)
        );
        if (res) {
          succeeded = true;
        }
      } catch (e) {
        console.log(e);
      }

      if (wasPingSucceeded && !succeeded) {
        const data = this.waitingMap.values();
        // UI가 꺼진 것으로 판단한다.
        // 그래서 모든 interaction을 reject한다.
        for (const d of data) {
          this.rejectV2(d.id);
        }
        break;
      }

      if (!wasPingSucceeded && succeeded) {
        wasPingSucceeded = true;
      }
    }
  }

  // extension에서 env.sender로부터 요청된 message의 window id를 찾는다.
  // 근데 문제는 popup이나 side panel같은 내부의 UI에서 보낸 message의 경우
  // sender에 tab 정보가 없다...
  // 그래서 tab 정보가 없는 경우에는 현재 window id를 반환한다.
  // 대충 현재의 window에서 유저가 무엇인가를 했을테니 별 문제는 안될 것이다...
  // mobile에서는 어차피 이러한 처리가 필요 없기 때문에 무조건 undefined를 반환한다.
  protected async getWindowIdFromEnvOrCurrentWindowId(
    env: Env
  ): Promise<number | undefined> {
    if (
      typeof browser === "undefined" ||
      typeof browser.windows === "undefined" ||
      typeof browser.tabs === "undefined"
    ) {
      return;
    }

    const current = (await browser.windows.getCurrent()).id;
    if (!env.sender.tab || !env.sender.tab.id) {
      return current;
    }

    const tab = await browser.tabs.get(env.sender.tab.id);
    return tab.windowId || current;
  }

  protected removeDataFromMap(id: string) {
    this.waitingMap.delete(id);
  }
}
