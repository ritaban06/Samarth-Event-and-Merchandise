const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Create a reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
    tls: {
        rejectUnauthorized: false, // Use `true` in production
    },
});

const wpLinks=[
    {
        eventName: "Instant Ink",
        link: "https://chat.whatsapp.com/BoA9SnRe0rDCXEWjOUZ7S0"
    },
    {
        eventName: "Apti Acumen",
        link: "https://chat.whatsapp.com/DQ6dYhuxkOH7CEYovvL5ct"
    },
    {
        eventName: "Brain Blitz",
        link: "https://chat.whatsapp.com/IrmCHW57eh57ztjXVLV5xc"
    },
    {
        eventName: "Sherlock's Escape",
        link: "https://chat.whatsapp.com/HC2qtsaex43Csm37nH1peb"
    },
    {
        eventName: "Snap Flicks",
        link: "https://chat.whatsapp.com/FQe5idim7IGFI3vBwYBu80"
    },
    {
        eventName: "Triathlon",
        link: "https://chat.whatsapp.com/IkYmKjk8aCHIuR8aFR0ZSX"
    },
    {
        eventName: "Model United States",
        link: "https://chat.whatsapp.com/JEbLLMaSar05w4brBRFAFQ"
    },
    {
        eventName: "UI Design-Ed",
        link: "https://chat.whatsapp.com/Gb6KuhygFjUAdQCtpf95uV"
    },
    {
        eventName: "Innov-A-Thon",
        link: "https://chat.whatsapp.com/BpngwLMjSnk88fUVfenPAr"
    },
    {
        eventName: "Shot-A-Reel",
        link: "https://chat.whatsapp.com/LC8SaAf8THC3HcVF8luHPL"
    },
    {
        eventName: "Reimagine a Book Cover",
        link: "https://chat.whatsapp.com/FOIlKHaMT304B0JkaD3ziE"
    },
    {
        eventName: "Matrix of Mock",
        link: "https://chat.whatsapp.com/HjgWEgWhshk2HucIztfFil"
    }
]

  
// Function to send event registration confirmation
const sendEventConfirmation = async (name, email, eventName, uid, teamName , teamUid , isPaid , isTeamEvent, paymentType) => {
    try {
        let subject, htmlContent;

        if (isPaid) {
            if (isTeamEvent) {
                if(paymentType === 'online' || paymentType === 'package'){
                    subject = `Registration Confirmed: ${eventName}`;
                    htmlContent = `
                        <p>Hello <strong>${name}(${uid})</strong>,</p>
                        <p>Your registration for the event <strong>${eventName}</strong> by ${paymentType} as a part of team <strong>${teamName}</strong> (Team UID: <strong>${teamUid}</strong>) has been confirmed.</p>
                        ${wpLinks.filter((wpLink) => wpLink.eventName === eventName).map((wpLink) => {
                        return `<p>Join the following group positively. <a href="${wpLink.link}"><strong>${wpLink.eventName} Group</strong></a> </p>`;
                          })
                        }
                    `;
                }
                else{
                    subject = `Registration Request Sent: ${eventName}`;
                    htmlContent = `
                        <p>Hello <strong>${name} (UID: ${uid})</strong>,</p>
                        <p>Your registration request for the event <strong>${eventName}</strong> as part of team <strong>${teamName}</strong> (Team UID: <strong>${teamUid}</strong>) has been successfully submitted. Payment by ${paymentType} has been noted.</p>
                        ${paymentType === 'cash' && '<p>Please visit our offline desk at TMSL campus to complete your payment and proceed further.</p>'}
                        <p>Your request will be processed within a few hours.</p>
                `;
                }
            } else {
                if(paymentType === 'online' || paymentType === 'package'){
                    subject = `Registration Confirmed: ${eventName}`;
                    htmlContent = `
                        <p>Hello <strong>${name}(${uid})</strong>,</p>
                        <p>Your registration for the event <strong>${eventName}</strong> by ${paymentType} has been confirmed.</p>
                        ${wpLinks.filter((wpLink) => wpLink.eventName === eventName).map((wpLink) => {
                        return `<p>Join the following group positively. <a href="${wpLink.link}"><strong>${wpLink.eventName} Group</strong></a> </p>`;
                          })
                        }
                    `;
                }
                else{
                    subject = `Registration Request Sent: ${eventName}`;
                    htmlContent = `
                        <p>Hello <strong>${name}(${uid})</strong>,</p>
                        <p>Your registration request for the event <strong>${eventName}</strong> has been successfully submitted. Payment by ${paymentType} has been noted.</p>
                        ${paymentType === 'cash' && '<p>Please visit our offline desk at TMSL campus to complete your payment and proceed further.</p>'}
                        <p>Your request will be processed within a few hours.</p>
                    `;
                }
            }
        } else {
            if (isTeamEvent) {
                subject = `Registration Confirmed: ${eventName}`;
                htmlContent = `
                    <p>Hello <strong>${name}(${uid})</strong>,</p>
                    <p>Your registration request for the event <strong>${eventName}</strong> as part of team <strong>${teamName}</strong> (Team UID: <strong>${teamUid}</strong>)!</p>
                    ${wpLinks.filter((wpLink) => wpLink.eventName === eventName).map((wpLink) => {
                        return `<p>Join the following group positively. <a href="${wpLink.link}"><strong>${wpLink.eventName} Group</strong></a> </p>`;
                      })
                    }
                `;
            } else {
                subject = `Registration Confirmed: ${eventName}`;
                htmlContent = `
                    <p>Hello <strong>${name}(${uid})</strong>,</p>
                    <p>Thank you for registering for the event <strong>${eventName}</strong>!</p>
                    ${wpLinks.filter((wpLink) => wpLink.eventName === eventName).map((wpLink) => {
                        return `<p>Join the following group positively. <a href="${wpLink.link}"><strong>${wpLink.eventName} Group</strong></a> </p>`;
                      })
                    }
                `;
            }
        }

        // Common footer for all emails
        htmlContent += `
            <br>
            <p><strong style="color: purple;">In case of any discrepancies, show this email to the event management volunteers for smooth passage.<br> - Team Samarth</strong></p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return { success: true, message: "Email sent successfully!" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email." };
    }
};

const PaidConfirmation = async (name, uid ,email, eventName , paymentType) => {
    try {
        let subject, htmlContent;

        subject = `Registration Confirmed: ${eventName}`;
        htmlContent = `
            <p>Hello <strong>${name}(${uid})</strong>,</p>
            <p>Thank you for registering for the event <strong>${eventName}</strong>. Your registration request for the event by ${paymentType} payment has been confirmed.</p>
            ${wpLinks.filter((wpLink) => wpLink.eventName === eventName).map((wpLink) => {
                        return `<p>Join the following group positively. <a href="${wpLink.link}"><strong>${wpLink.eventName} Group</strong></a> </p>`;
                          })
                        }
            `;    

        htmlContent += `
            <br>
            <p><strong style="color: purple;">In case of any discrepancies, show this email to the event management volunteers for smooth passage.<br> - by Team Samarth</strong></p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return { success: true, message: "Email sent successfully!" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email." };
    }

}

const sendOtpEmail = async (email, otp) => {
    try {
        const subject = "Your OTP Code";
        const htmlContent = `
            <p>Your OTP code is <strong style="font-size: 24px;">${otp}</strong></p>
            <p><strong style="color: purple;">- Team Samarth</strong></p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent: ", info.messageId);
        return { success: true, message: "OTP sent successfully!" };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return { success: false, message: "Failed to send OTP email." };
    }
};

const sendPackageConfirmation = async (name, uid, email, status) => {
    try {
        let subject, htmlContent;
        if(status === 'paid'){
             subject = `Package Confirmed: Safalya 2025`;
             htmlContent = `
                <p>Hello <strong>${name}(${uid})</strong>,</p>
                <p>Your package for <strong>Safalya 2025</strong> has been activated.</p>
                <p>Next 6 events registrations will be considered under your active package.</p>
            `;
        }
        else{
             subject = `Package Request Sent: Safalya 2025`;
             htmlContent = `
                <p>Hello <strong>${name}(${uid})</strong>,</p>
                <p>Your package request for <strong>Safalya 2025</strong> has been successfully submitted.</p>
                <p>Please visit our offline desk at TMSL campus to complete your payment and proceed further.</p>
            `;
        }
        
        htmlContent += `
            <br>
            <p><strong style="color: purple;">In case of any discrepancies, show this email to the event management volunteers for smooth passage.<br> - Team Samarth</strong></p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Package Email sent: ", info.messageId);
        return { success: true, message: "Package sent successfully!" };
    } catch (error) {
        console.error("Error sending package confirmation email:", error);
        return { success: false, message: "Failed to send package confirmation email." };
    }
}

// Export functions
module.exports = { sendEventConfirmation, PaidConfirmation, sendOtpEmail, sendPackageConfirmation }; 
