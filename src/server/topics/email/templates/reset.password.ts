import { EmailTemplate } from 'src/types/email';

export const resetPasswordTemplate = ({ pseudo, resetPasswordCode }): EmailTemplate => ({
  subject: 'Reset Password',
  bodyText: `
    Hello ${pseudo}

    reset password code '${resetPasswordCode}'.

    Merci.
  `,
});
