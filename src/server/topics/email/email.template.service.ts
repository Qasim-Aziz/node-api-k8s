import { BackError } from 'src/server/helpers';
import { resetPasswordTemplate } from 'src/server/topics/email/templates';
import { EmailTemplate } from 'src/types/email';
import { EmailTemplates } from 'src/server/topics/email/templates/templates.enum';

export default class EmailTemplateService {
  static buildTemplate(template: EmailTemplates, data): EmailTemplate {
    switch (template) {
      case EmailTemplates.RESET_PASSWORD:
        return resetPasswordTemplate(data);
        break;
      default:
        throw new BackError('Template Not found');
    }
  }
}
