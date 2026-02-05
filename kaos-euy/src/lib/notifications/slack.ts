interface SlackPayload {
  text: string;
}

export async function sendSlackNotification(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL이 설정되지 않아 알림을 건너뜁니다.');
    return;
  }

  const payload: SlackPayload = {
    text: message,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Slack 알림 실패', res.status, text);
    }
  } catch (error) {
    console.error('Slack 알림 오류', error);
  }
}

