export type SettledResponse<T> =
  | {
      status: "fulfilled";
      value: T;
    }
  | {
      status: "rejected";
      reason: Error;
    };

export type SettledResponses<T> = SettledResponse<T>[];
