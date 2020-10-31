import httpStatus from 'http-status';
import request from 'supertest';
import setCookie from 'set-cookie-parser';
import app from 'src/application';


const extractJwtValue = (res) => {
  const cookies = setCookie.parse(res, { map: true });
  return cookies.jwt.value;
};

export const registerUser = async (user, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(user)
    .expect(status);
  const userRes = res.body.user;
  expect(extractJwtValue(res)).not.toBe(false);
  user.cookie = res.headers['set-cookie']; //eslint-disable-line no-param-reassign
  return userRes;
};

export const loginUser = async (user, { status = httpStatus.OK } = {}) => {
  const { email, password } = user;
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(status);
  expect(extractJwtValue(res)).not.toBe(false);
  user.cookie = res.headers['set-cookie']; //eslint-disable-line no-param-reassign
  return res.body.user;
};

export const logoutUser = async (cookie, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/auth/logout')
    .set('cookie', cookie)
    .send({})
    .expect(status);
  const userRes = res.body.user;
  expect(extractJwtValue(res)).toBe('');
  return userRes;
};
