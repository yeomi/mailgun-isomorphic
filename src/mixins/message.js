import Utils from './../utils'
import fetch from 'isomorphic-fetch'

export default (superclass) => class extends superclass {
  messages() {
    let self = this

    return {

      send(mailingData) {
        let promise = new Promise((resolve, reject) => {
          resolve(mailingData)
        })
        promise
        // Prepare mailing.
          .then(this._prepareMailing)

        // Sending.
        promise = promise
          .then(mailingData => {

            if (!this.controlRequiredParams(mailingData))
              throw new Error("Some required parameters are missing.")

            // Sub-promise to run each send requests.
            let progressionPromise = new Promise((resolve, reject) => {
              resolve(Object.assign(mailingData, {success: 0, intent: 0, error: 0}))
            })


            // Splitting sending into several promises in order to control progression.
            for (let postQuery of this.getPostFieldsGroups(mailingData)) {
              progressionPromise = progressionPromise.then(mailingData => {

                return self.post(`/${mailingData.domain}/messages`, postQuery)
                  .then(res => {

                    if (res == undefined || !('id' in res)) {
                      mailingData.intent++
                      mailingData.error++
                      return mailingData
                    }

                    if (res.id !== undefined && /Queued/.test(res.message)) {
                      mailingData.success++
                      mailingData.intent++
                    }
                    return mailingData
                  })
                  .catch(err => {
                    mailingData.intent++
                    mailingData.error++
                    return mailingData
                  })
              })
            }

            return progressionPromise
          })
          .catch(e => {
            console.error(`[Mailgun isomorphic]: ${e.message}`)
            throw e
          })


        return promise
      },

      _prepareMailing(mailingData) {
        if (Utils.isEmpty(mailingData.content_url))
          return mailingData

        return fetch(mailingData.content_url)
          .then(function (response) {
            return response.text()
          })
          .then(html => {
            mailingData.content = html
            return mailingData
          })
          .catch(function (e) {
            throw new Error(e.message)
          });
      },

      controlRequiredParams(mailingData) {
        if (Utils.isEmpty(mailingData.recipients))
          throw new Error("Recipients list is empty or missing.")

        // if (Utils.isEmpty(this.config.recipients_test)) {
        //   console.error('Recipients value is missing.')
        //   return false
        // }

        if (Utils.isEmpty(mailingData.domain))
          throw new Error("No domain has been set for this mailing.")

        if (Utils.isEmpty(mailingData.from))
          throw new Error("You need to give a value for 'from' parameter.")

        if (Utils.isEmpty(mailingData.content))
          throw new Error("No content has been set for this mailing.")

        if (Utils.isEmpty(mailingData.subject))
          throw new Error("No subject has been set for this mailing.")

        return true
      },

      getDomain() {
        return this.config.domain
      },

      getBaseParams(mailingData) {
        let postFields = {
          from: mailingData.from,
          subject: mailingData.subject,
          html: mailingData.content
        }

        if (!Utils.isEmpty(mailingData.reply_to))
          postFields['h:Reply-to'] = mailingData.reply_to

        if (!Utils.isEmpty(mailingData.campaign))
          postFields['o:campaign'] = mailingData.campaign

        postFields['o:tracking-clicks'] = mailingData.tracking_click ? 'yes' : 'no'
        return postFields
      },

      getPostFieldsGroups(mailingData) {

        const postFieldsBase = this.getBaseParams(mailingData)
        let recipientGroups = this._getBatchGroups(mailingData)
        let postFieldsGroups = [];

        for (let group_key of Object.keys(recipientGroups)) {

          let postField = Object.assign({}, postFieldsBase),
            recipient_variables = {},
            group = recipientGroups[group_key];

          for (let user_key of Object.keys(group)) {
            const email = group[user_key]
            postField['to[' + user_key + ']'] = email;

            // Add required recipient vars and extra if provided in config.
            let recipientVars = {id: user_key}
            if (email in mailingData.recipients_vars) {
              recipientVars = Object.assign(recipientVars, mailingData.recipients_vars[email])
            }
            recipient_variables[email] = recipientVars;
          }

          postField['recipient-variables'] = JSON.stringify(recipient_variables);
          postFieldsGroups.push(postField)
        }

        return postFieldsGroups
      },

      _getBatchGroups(mailingData, type = 'recipients') {
        if (type !== 'recipients' && type !== 'recipients_test')
          throw new Error(`Value '${type}' is not authorized as recipient type.`)

        return Utils.arrayChunk(mailingData[type], 1);
      }

    }
  }
};
