import { SendEmailData } from 'src/types/email';
import EmailTemplateService from 'src/server/topics/email/email.template.service';

export default class EmailService {
  static async sendEmail({
    to,
    bcc,
    template,
    templateData,
  }: SendEmailData) {
    const { subject, bodyText } = EmailTemplateService.buildTemplate(template, templateData);

    console.log(subject, bcc, subject, bodyText);
  }
}
