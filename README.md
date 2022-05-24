# Offend a Friend

A random little site I built (also hosted on Tumblr) to play about with some ideas around sending offence messages in a jovial way, which you can access at: [leepenney.github.io](https://leepenney.github.io)

## More details

Having tracked down some old-school insults/terms, I found black and white images that seemed to fit and whipped up each insult 'card.' The details of these are stored in a JSON file which is read when the index page renders.

If you click on an insult it changes the URL hash, which is being monitored and this triggers the popup to appear with a form to send the insult to your desired recipient. The form is created using a Handlebars template to render it inline.

When you send the insult it makes an API POST to a Zapier webhook, which passes that data on to a template in SparkPost and triggers an email.

## Technologies used

* HTML
* CSS
* JavaScript
* Handlebars
* JSON
* REST API
* Webhooks
* Zapier
* SparkPost
