/**
 * List of HTTP status codes.
 *
 * See List of HTTP status codes http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 * See Rails HTTP Status Code to Symbol Mapping http://www.codyfauser.com/2008/7/4/rails-http-status-code-to-symbol-mapping
 */
enum HttpStatus {
  /*
   * 1xx Informational
   */


  /*
   * 2xx Success
   */

  OK_200 = 200,
  Created_201 = 201,
  NoContent_204 = 204,


  /*
   * 3xx Redirection
   */

  MultipleChoices_300 = 300,
  MovedPermanently_301 = 301,


  /*
   * 4xx Client Error
   */

  BadRequest_400 = 400,
  Unauthorized_401 = 401,
  NotFound_404 = 404,
  Conflict_409 = 409,

  // A deprecated response used by the Spring Framework when a method has failed
  MethodFailure_420 = 420,

  UnprocessableEntity_422 = 422,


  /*
   * 5xx Server Error
   */
  InternalServerError_500 = 500
}

export default HttpStatus;
