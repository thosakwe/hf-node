import Nightmare from 'nightmare';

/**
 * A magical class that automates http://hackforums.net.
 */
export default class HackForums {
  /**
   * @param options {Object} See https://github.com/segmentio/nightmare#nightmareoptions
   */
  constructor(options = {}) {
    this.nightmare = new Nightmare(options);
  }

  /**
   * Logs in to Hack Forums.
   * @param username {String}
   * @param password {String}
   * @returns {Promise}
   */
  login(username, password) {
    return new Promise((resolve, reject) => {
      this.nightmare
        .goto('http://hackforums.net/member.php?action=login')
        .wait('input[name="username"]')
        .insert('input[name="username"]', username)
        .insert('input[name="password"]', password)
        .click('.button[name="submit"]')
        .wait('a[href="http://hackforums.net/private.php"]')
        .evaluate(function () {
          return document.querySelector('a[href="http://hackforums.net/private.php"]');
        })
        .then(function (linkToPms) {
          if (linkToPms) {
            return resolve();
          } else return reject('Could not log you in.');
        });
    });
  }

  /**
   * Retrieves your entire inbox. Currently broken.
   * @returns {Promise<Object[]>}
     */
  getEntireInbox() {
    return this.getInboxPageCount()
      .then(count => {
        var promises = [];
        for (let i = 0; i < count; i++) {
          promises.push(() => {
            return this.getInbox(i);
          });
        }
        return Promise.all(promises).then(arrays => [].concat.apply(arrays));
      });
  }

  /**
   * Retrieves messages in your inbox.
   * @param page {Number}
   * @returns {Promise<Object[]>}
   */
  getInbox(page = 1) {
    return new Promise((resolve) => {
      this.nightmare
        .goto(`http://hackforums.net/private.php?fid=1&page=${page}`)
        .wait('input[name="quick_search"]')
        .evaluate(function () {
          let ids = [], messages = [];
          var rows = document.querySelectorAll('td.trow1.forumdisplay_regular');
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let message = {};
            const spans = row.querySelectorAll('span');
            // Get id, title
            var titleLink = spans[0].querySelector('a');
            message.id = /pmid=([^$]+)$/.exec(titleLink.href)[1];
            if (ids.indexOf(message.id) === -1) {
              ids.push(message.id);
            } else continue;
            message.title = titleLink.innerText;

            // Sender
            var senderLink = spans[1].querySelector('a');
            message.sender = {
              id: /uid=([^$]+)$/.exec(senderLink.href)[1],
              username: senderLink.innerText
            };

            messages.push(message);
          }
          return messages;
        })
        .then(resolve);
    });
  }

  /**
   * Gets the number of pages in your inbox.
   * @returns {Promise<Number>}
   */
  getInboxPageCount() {
    return new Promise((resolve) => {
      this.nightmare
        .goto('http://hackforums.net/private.php')
        .wait('input[name="quick_search"]')
        .evaluate(function () {
          return document.querySelectorAll('.pagination_page').length;
        })
        .then(resolve);
    });
  }

  /**
   * Reads the text of a PM, provided you have access to it.
   * @param id
   * @returns {Promise<String>}
   */
  readPm(id) {
    return new Promise((resolve) => {
      this.nightmare
        .goto(`http://hackforums.net/private.php?action=read&pmid=${id}`)
        .wait('a.bitButton')
        .evaluate(function () {
          return document.getElementById('pid_').innerText;
        })
        .then(resolve);
    });
  }

  /**
   * Sends a private message. Ooh la la!
   * @param to
   * @param subject
   * @param message
   * @returns {Promise}
   */
  sendPm(to, subject, message) {
    return new Promise((resolve) => {
      this.nightmare.goto('http://hackforums.net/private.php?action=send')
        .insert('#to', to)
        .insert('input[name="subject"]', subject)
        .insert('#message_new', message)
        .click('input[name="submit"]')
        .then(resolve);
    });
  }

  /**
   * Closes the client.
   * @returns {Promise}
   */
  close() {
    return this.nightmare.end();
  }
}
