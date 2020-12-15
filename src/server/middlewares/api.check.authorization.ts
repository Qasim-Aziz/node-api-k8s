import assert from 'assert';

export const checkAuthorization = (method) =>
  (req, res, next) => {
    if (method.forLogged) {
      assert.equal(req.user.isLogged, true, 'User are not logged');
    }
    next();
  };
