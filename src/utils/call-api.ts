import { addUrlParams } from './url';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface CallApiOptions<Q extends {} = {}, B extends {} = {}> {
  /**
   * Data to pass in the query string
   */
  params?: Q;
  /**
   * Data to pass in the body
   */
  data?: B;
  /**
   * Milliseconds before timing-out (falsy or <0 value to disable)
   * Default is 10 seconds.
   */
  timeout?: number;
}

export interface ApiResponse<R> {
  data: R;
}

type MethodOptions<
  M extends HttpMethod,
  Q extends {} = {},
  B extends {} = {}
> = CallApiOptions<Q, M extends 'GET' | 'HEAD' ? never : B>;

const defaultOptions: Partial<CallApiOptions> = {
  timeout: 10000,
};

export function callApi<
  R extends {},
  Q extends {} = {},
  B extends {} = {},
  M extends HttpMethod = HttpMethod
>(
  apiUrl: string,
  method: M,
  opt: MethodOptions<M, Q, B> = {}
): Promise<ApiResponse<R>> {
  const options = {
    ...defaultOptions,
    ...opt,
  };

  return new Promise<ApiResponse<R>>((resolve, reject) => {
    let timeoutHandler: number;
    if (options.timeout! > 0) {
      timeoutHandler = window.setTimeout(
        () => reject('timeout'),
        options.timeout!
      );
    }

    const body = options.data ? JSON.stringify(options.data) : undefined;
    let url = apiUrl;

    if (options.params) {
      url = addUrlParams(url, options.params);
    }

    fetch(url, {
      method,
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        clearTimeout(timeoutHandler);
        return response.json();
      })
      .then((json) => {
        if (json.error) {
          return reject(json.msg);
        }
        resolve(json.data);
      });
  });
}
