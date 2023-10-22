// Imports
import fs from 'fs'
import nodemailer from 'nodemailer'
import { config } from './email_config.js'

// Takes in the email address for email, the get request id, and the public key of the account
// Sends email to email address specified
export async function send_email(email_address, get_req_id, public_key) {
  
  // Extract to environment variables
  var sending_email_address = config.outgoing_email_address;
  var sending_email_address_password = config.outgoing_email_address_password;

  //CONSTS
  var email_subject = "Mordor Faucet Email Verification";
  var email_html_file_path = "email_html.html";

  var email_html_content = await fs.readFileSync(email_html_file_path, "utf8");

  let domain = config.domain;

  var link_get_request = `${domain}?${get_req_id}`;
  email_html_content = email_html_content.replace("insert_link_here", link_get_request);
  email_html_content = email_html_content.replace("account", public_key);
  
  // Outlook email smtp configuration
  var mailer = nodemailer.createTransport({
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
  };

  // Actually send email
  mailer.sendMail(settings, (err, info) => {
    if(err != null) {
      console.log(err)
    }
  
  } );  

};