from aiosmtplib import SMTP
from email.message import EmailMessage
from fastapi import HTTPException
from src.core.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, TEMPLATES_PATH
from jinja2 import Environment, FileSystemLoader
from src.logging_config import logger

# Инициализация шаблонизатора Jinja2
env = Environment(loader=FileSystemLoader(TEMPLATES_PATH))

# Отправка email-сообщения
async def send_email(to_email: str, subject: str, template_name: str, context: dict):
    try:
        template = env.get_template(template_name)
        html_content = template.render(context)

        message = EmailMessage()
        message['From'] = SMTP_USER
        message['To'] = to_email
        message['Subject'] = subject
        message.set_content(html_content, subtype='html')

        async with SMTP(hostname=SMTP_HOST, port=SMTP_PORT, use_tls=True) as smtp:
            await smtp.login(SMTP_USER, SMTP_PASSWORD)
            await smtp.send_message(message)
            logger.info(f"Email sent to {to_email}")
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")