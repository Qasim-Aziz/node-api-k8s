import { EmailTemplates } from 'src/server/topics/email/templates/templates.enum';

interface SendEmailData {
  template: EmailTemplates;
  templateData: Record<string, unknown>;
  to: string;
  bcc?: string[];
}

interface EmailTemplate {
  subject: string;
  bodyText: string;
}
