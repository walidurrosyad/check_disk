const df = require('node-df');
const nodemailer = require('nodemailer');

// SMTP Configuration
const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false, 
    auth: {
        user: '',
        pass: ''
    }
});


const checkDiskUsage = () => {
    df(function (error, response) {
        if (error) {
            console.error('Error fetching disk usage:', error);
            return;
        }

        let alert = false;
        let emailBody = `
            <html>
            <body>
            <h2>Disk Usage Alert</h2>
            <table border="1">
                <tr>
                    <th>Filesystem</th>
                    <th>Usage (%)</th>
                    <th>Available</th>
                </tr>
        `;

        response.forEach((disk) => {
            if (disk.filesystem.indexOf('overlay2') === -1 && disk.mount.indexOf('tmpfs') === -1 && disk.mount.indexOf('cdrom') === -1 && disk.capacity >= 80) {
                alert = true;
                emailBody += `
                    <tr>
                        <td>${disk.filesystem}</td>
                        <td>${disk.capacity}%</td>
                        <td>${disk.available}</td>
                    </tr>
                `;
            }
        });

        emailBody += '</table></body></html>';

        if (alert) {
            const mailOptions = {
                from: 'no-reply@gmail.com',
                to: '',
                subject: 'Disk Usage Alert',
                html: emailBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else {
            console.log('No disks exceed 80% usage.');
        }
    });
};

// Run the disk usage check
checkDiskUsage();
