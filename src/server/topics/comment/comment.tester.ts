import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { checkExpectedStatus, expectDeepMatch } from 'src/server/tests/tester.base';

const formatCommentUser = ({ id, pseudo }) => ({ id, pseudo });
const formatComment = ({ updated_at, ...comment }) => comment;

export const commentMessage = (user, message, content, { status = httpStatus.OK } = {}) =>
  request(app)
    .post(`/api/messages/${message.id}/comment`)
    .set('Authorization', user.token)
    .send({ content })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      expect(res.body.comment).toMatchObject({
        user: formatCommentUser(user),
        content,
        commentsCount: 0,
        lovesCount: 0,
      });
      return res.body.comment;
    });

export const getMessageComments = (user, message, { status = httpStatus.OK, expectedResults = null, msgError = null } = {}) =>
  request(app)
    .get(`/api/messages/${message.id}/comment`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status === httpStatus.OK) {
        expectDeepMatch(res.body.comments, expectedResults);
      } else if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
      return res.body.comments;
    });

export const loveComment = (user, message, comment, { status = httpStatus.OK, lovesCount = 0, msgError = null } = {}) =>
  request(app)
    .post(`/api/messages/${message.id}/comment/${comment.id}/love`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status === httpStatus.OK) {
        expect(formatComment(res.body.comment)).toMatchObject(formatComment({ ...comment, lovesCount }));
        Object.assign(comment, formatComment(res.body.comment));
      } else if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
      return res.body.comment;
    });

export const updateMessageComment = (user, message, comment, content, { status = httpStatus.OK, msgError = null } = {}) =>
  request(app)
    .put(`/api/messages/${message.id}/comment/${comment.id}`)
    .set('Authorization', user.token)
    .send({ content })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status === httpStatus.OK) {
        expect(formatComment(res.body.comment)).toMatchObject(formatComment({ ...comment, content }));
        Object.assign(comment, formatComment(res.body.comment));
      } else if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
      return res.body.comment;
    });

export const deleteMessageComment = (user, message, comment, { status = httpStatus.OK, msgError = null } = {}) =>
  request(app)
    .delete(`/api/messages/${message.id}/comment/${comment.id}`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
    });
