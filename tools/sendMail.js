import nodemailer from 'nodemailer'

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "ae78dd0fc0c30a",
        pass: "95c6cb262a3767"
    }
});
let message = {
    from: "linas.mockus@gmail.com",
    to: "linas.mockus@gmail.com",
    subject: "Subject",
    text: "Hello SMTP Email"
}

export const sendMessage = (message) => {
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
        }
    })
}


