const nodemailer = require('nodemailer');

async function sendEmail({ user, pass, to, subject, text, html, attachments }) {
    if (!user || !pass || !to) {
        console.log('Skipping email send: Credentials missing.');
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });

    await transporter.sendMail({
        from: `"Icebreak Email" <${user}>`,
        to,
        subject,
        text,
        html,
        attachments: attachments.map(a => ({
            filename: a.filename,
            path: a.path,
            cid: a.filename
        }))
    });

    console.log('Email sent successfully.');
}

module.exports = { sendEmail };
