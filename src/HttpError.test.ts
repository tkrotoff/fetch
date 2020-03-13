import { HttpStatus } from './HttpStatus';
import { HttpError } from './HttpError';

test('throw', () => {
  expect.assertions(6);

  try {
    throw new HttpError('Bad Request', HttpStatus._400_BadRequest, { error: 400 });
  } catch (e) {
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');
    expect(e.message).toEqual('Bad Request');
    expect(e.status).toEqual(HttpStatus._400_BadRequest);
    expect(e.statusCode).toEqual(HttpStatus._400_BadRequest);
    expect(e.response).toEqual({ error: 400 });
  }
});
