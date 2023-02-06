export interface SimpleFetchRequestOptions extends RequestInit {
  validateStatus?: (status: number) => boolean;
}

export interface SimpleFetchResponse<R> {
  readonly url: string;
  readonly data: R;
  readonly headers: Headers;
  readonly status: number;
  readonly statusText: string;
}
