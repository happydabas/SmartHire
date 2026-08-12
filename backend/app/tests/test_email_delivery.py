import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import smtplib

from app.core.config import settings
from app.services.email import EmailService

def test_email_service_configuration():
    """Verify that email service correctly loads settings from Pydantic Settings."""
    service = EmailService()
    assert service.host == settings.SMTP_HOST
    assert service.port == settings.SMTP_PORT
    assert service.from_email == settings.EMAIL_FROM
    assert service.frontend_url == settings.FRONTEND_URL.rstrip('/')


def test_email_invitation_link_and_content():
    """Verify that invitation email contains the correct acceptance URL and company information."""
    async def _test():
        service = EmailService()
        sent_messages = []

        def mock_send_email(to_email, subject, html_content, text_content):
            sent_messages.append({
                "to": to_email,
                "subject": subject,
                "html": html_content,
                "text": text_content
            })

        with patch.object(service, 'send_email', side_effect=mock_send_email):
            await service.send_recruiter_invitation_email(
                to_email="recruiter.test@example.com",
                company_name="Acme Corp",
                owner_name="Alice Owner",
                invitation_token="test_secure_token_123",
                expires_in_days=7
            )

        assert len(sent_messages) == 1
        msg = sent_messages[0]
        expected_url = f"{settings.FRONTEND_URL.rstrip('/')}/invitations/accept/test_secure_token_123"
        
        assert msg["to"] == "recruiter.test@example.com"
        assert "Acme Corp" in msg["subject"]
        assert expected_url in msg["html"]
        assert expected_url in msg["text"]
        assert "Alice Owner" in msg["html"]
        assert "7 days" in msg["html"]

    import asyncio
    asyncio.run(_test())


def test_invitation_email_sending_success(client: TestClient):
    """
    Verify successful recruiter invitation flow with mocked SMTP server.
    """
    # 1. Setup Company Owner
    client.post("/api/v1/auth/register", json={
        "name": "Owner EmailTest",
        "email": "owner.email@smarthire.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "owner.email@smarthire.com",
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_id = client.post("/api/v1/companies", json={
        "name": "EmailCorp",
        "description": "Email Testing Inc",
        "industry": "Technology",
        "company_size": "1-10",
        "location": "San Francisco, CA"
    }, headers=headers).json()["id"]

    # 2. Mock SMTP send_message
    mock_smtp_instance = MagicMock()
    # Mock SMTP context manager enter/exit
    mock_smtp_instance.__enter__.return_value = mock_smtp_instance
    with patch("app.services.email.smtplib.SMTP", return_value=mock_smtp_instance):
        with patch.object(settings, "SMTP_USERNAME", "mock_user@gmail.com"):
            with patch.object(settings, "SMTP_PASSWORD", "mock_app_password"):
                res = client.post(
                    f"/api/v1/companies/{company_id}/invitations",
                    json={"recruiter_email": "new.recruiter@smarthire.com"},
                    headers=headers
                )

    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "pending"
    assert data["recruiter_email"] == "new.recruiter@smarthire.com"

    # Verify SMTP methods were called
    mock_smtp_instance.starttls.assert_called_once()
    mock_smtp_instance.login.assert_called_once_with("mock_user@gmail.com", "mock_app_password")
    mock_smtp_instance.send_message.assert_called_once()


def test_invitation_email_smtp_failure_handling(client: TestClient):
    """
    Verify that if SMTP delivery fails, the API returns HTTP 500, does NOT leak credentials,
    and rolls back the created invitation record so it does not remain pending.
    """
    # 1. Setup Owner
    client.post("/api/v1/auth/register", json={
        "name": "Owner FailTest",
        "email": "owner.fail@smarthire.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "owner.fail@smarthire.com",
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_id = client.post("/api/v1/companies", json={
        "name": "FailCorp",
        "description": "SMTP Failure Corp",
        "industry": "Technology",
        "company_size": "1-10",
        "location": "Seattle, WA"
    }, headers=headers).json()["id"]

    secret_password = "super_secret_smtp_password_999"

    # 2. Mock SMTP to raise SMTPAuthenticationError
    def mock_smtp_login(*args, **kwargs):
        raise smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted")

    mock_smtp_instance = MagicMock()
    mock_smtp_instance.__enter__.return_value = mock_smtp_instance
    mock_smtp_instance.login.side_effect = mock_smtp_login

    with patch("app.services.email.smtplib.SMTP", return_value=mock_smtp_instance):
        with patch.object(settings, "SMTP_USERNAME", "bad_user@gmail.com"):
            with patch.object(settings, "SMTP_PASSWORD", secret_password):
                res = client.post(
                    f"/api/v1/companies/{company_id}/invitations",
                    json={"recruiter_email": "fail.recruiter@smarthire.com"},
                    headers=headers
                )

    # 3. Assert HTTP 500 Error
    assert res.status_code == 500
    detail = res.json()["detail"] if "detail" in res.json() else str(res.json())
    
    # 4. Verify password is NOT in response detail
    assert secret_password not in detail

    # 5. Verify invitation record was rolled back / deleted (list_invitations should be empty)
    inv_list = client.get(f"/api/v1/companies/{company_id}/invitations", headers=headers).json()
    assert len(inv_list) == 0
