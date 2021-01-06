import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { checkExpectedStatus, expectDeepMatch } from 'src/server/tests/tester.base';

const formatCommentUser = ({ id, pseudo }) => ({ id, pseudo });
const formatComment = ({ updated_at, ...comment }) => comment;

export const commentMessage = (user, message, content, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/comments')
    .set('Authorization', user.token)
    .send({ content, messageId: message.id })
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
    .get(`/api/comments?messageId=${message.id}`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status === httpStatus.OK) {
        expectDeepMatch(res.body.comments.map((c) => c.id), expectedResults);
      } else if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
      return res.body.comments;
    });

export const loveComment = (user, comment, {
  status = httpStatus.OK, lovesCount = 0, msgError = null, loved = true, isOwner = false,
} = {}) =>
  request(app)
    .post(`/api/comments/${comment.id}/love`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status === httpStatus.OK) {
        expect(formatComment(res.body.comment)).toMatchObject(formatComment({
          ...comment, lovesCount, loved, isOwner,
        }));
        Object.assign(comment, { lovesCount: res.body.comment.lovesCount });
      } else if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
      return res.body.comment;
    });

export const updateMessageComment = (user, comment, content, { status = httpStatus.OK, msgError = null } = {}) =>
  request(app)
    .put(`/api/comments/${comment.id}`)
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

export const deleteMessageComment = (user, comment, { status = httpStatus.OK, msgError = null } = {}) =>
  request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (msgError) {
        expect(res.body.message).toEqual(msgError);
      }
    });
