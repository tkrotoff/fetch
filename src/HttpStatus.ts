/**
 * List of HTTP status codes.
 *
 * [List of HTTP status codes](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
 * [Rails HTTP Status Code to Symbol Mapping](http://www.codyfauser.com/2008/7/4/rails-http-status-code-to-symbol-mapping)
 */
export enum HttpStatus {
  /*
   * 1xx Informational
   */

  /*
   * 2xx Success
   */

  _200_OK = 200,
  _201_Created = 201,
  _204_NoContent = 204,

  /*
   * 3xx Redirection
   */

  _300_MultipleChoices = 300,
  _301_MovedPermanently = 301,

  /*
   * 4xx Client Error
   */

  _400_BadRequest = 400,
  _401_Unauthorized = 401,
  _403_Forbidden = 403,
  _404_NotFound = 404,
  _409_Conflict = 409,

  // A deprecated response used by the Spring Framework when a method has failed
  _420_MethodFailure = 420,

  _422_UnprocessableEntity = 422,

  /*
   * 5xx Server Error
   */

  _500_InternalServerError = 500,
  _503_ServiceUnavailable = 503
}
