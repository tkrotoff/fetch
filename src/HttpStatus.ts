/**
 * [List of HTTP status codes](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
 *
 * With TypeScript use `typeof HttpStatus[keyof typeof HttpStatus]` to pull out the values
 * (https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums)
 */
// [Rails HTTP Status Code to Symbol Mapping](https://web.archive.org/web/20131211220540/http://www.codyfauser.com/2008/7/4/rails-http-status-code-to-symbol-mapping)
//
// https://www.rubydoc.info/gems/rack/Rack/Utils#HTTP_STATUS_CODES-constant
//
// ```
// curl -s https://www.iana.org/assignments/http-status-codes/http-status-codes-1.csv | \
// ruby -ne 'm = /^(\d{3}),(?!Unassigned|\(Unused\))([^,]+)/.match($_) and \
// puts "_#{m[1]}_#{m[2].delete %Q[ ]} = #{m[1]},"'
// ```
export const HttpStatus = {
  /*
   * 1xx informational response
   */

  _100_Continue: 100,
  _101_SwitchingProtocols: 101,
  _102_Processing: 102,
  _103_EarlyHints: 103,

  /*
   * 2xx success
   */

  _200_OK: 200,
  _201_Created: 201,
  _202_Accepted: 202,
  _203_NonAuthoritativeInformation: 203,
  _204_NoContent: 204,
  _205_ResetContent: 205,
  _206_PartialContent: 206,
  _207_MultiStatus: 207,
  _208_AlreadyReported: 208,
  _226_IMUsed: 226,

  /*
   * 3xx redirection
   */

  _300_MultipleChoices: 300,
  _301_MovedPermanently: 301,
  _302_Found: 302,
  _303_SeeOther: 303,
  _304_NotModified: 304,
  _305_UseProxy: 305,
  _307_TemporaryRedirect: 307,
  _308_PermanentRedirect: 308,

  /*
   * 4xx client errors
   */

  _400_BadRequest: 400,
  _401_Unauthorized: 401,
  _402_PaymentRequired: 402,
  _403_Forbidden: 403,
  _404_NotFound: 404,
  _405_MethodNotAllowed: 405,
  _406_NotAcceptable: 406,
  _407_ProxyAuthenticationRequired: 407,
  _408_RequestTimeout: 408,
  _409_Conflict: 409,
  _410_Gone: 410,
  _411_LengthRequired: 411,
  _412_PreconditionFailed: 412,
  _413_PayloadTooLarge: 413,
  _414_URITooLong: 414,
  _415_UnsupportedMediaType: 415,
  _416_RangeNotSatisfiable: 416,
  _417_ExpectationFailed: 417,
  _421_MisdirectedRequest: 421,
  _422_UnprocessableEntity: 422,
  _423_Locked: 423,
  _424_FailedDependency: 424,
  _425_TooEarly: 425,
  _426_UpgradeRequired: 426,
  _428_PreconditionRequired: 428,
  _429_TooManyRequests: 429,
  _431_RequestHeaderFieldsTooLarge: 431,
  _451_UnavailableForLegalReasons: 451,

  /*
   * 5xx server errors
   */

  _500_InternalServerError: 500,
  _501_NotImplemented: 501,
  _502_BadGateway: 502,
  _503_ServiceUnavailable: 503,
  _504_GatewayTimeout: 504,
  _505_HTTPVersionNotSupported: 505,
  _506_VariantAlsoNegotiates: 506,
  _507_InsufficientStorage: 507,
  _508_LoopDetected: 508,
  _510_NotExtended: 510,
  _511_NetworkAuthenticationRequired: 511,

  /*
   * Unofficial codes
   */

  // A deprecated response used by the Spring Framework when a method has failed
  // Still in use at PMU as of 2022
  _420_MethodFailure: 420
} as const;
