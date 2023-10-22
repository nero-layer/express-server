// Imports
import nodemailer from 'nodemailer'; 
import fs from 'fs';


// Takes in the email address for email, the get request id, and the public key of the account
// Sends email to email address specified
export async function send_email(email_address, get_req_id, public_key) {
  
  // Extract to environment variables
  const sending_email_address = process.env.OUTGOING_EMAIL_ADDR;
  const sending_email_address_password = process.env.OUTGOING_EMAIL_ADDR_PASSWD;

  //CONSTS
  const email_subject = "Mordor Faucet Email Verification";
  const email_html_file_path = "email_html.html";

  let email_html_content = await fs.readFileSync(email_html_file_path, "utf8")

  const domain =  process.env.DOMAIN;

  const link_get_request = `${domain}/mint_key/${get_req_id}`;
  email_html_content = email_html_content.replace("insert_link_here", link_get_request);
  email_html_content = email_html_content.replace("account", public_key);

  // Outlook email smtp configuration
  const mailer = nodemailer.createTransport({
      service: "Outlook365",
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: sending_email_address,
        pass: sending_email_address_password
      }
  });

  // Configuration to send email with
  var settings = {
    from : sending_email_address,
    to: email_address,
    subject: email_subject,
    html: email_html_content
  }

  // Actually send email
  return new Promise((resolve, reject) => {
    mailer.sendMail(settings, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info.response);
      }
    });  
  });

};