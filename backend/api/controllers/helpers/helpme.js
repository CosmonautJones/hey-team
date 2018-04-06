const Account = require('../models/accountModel');

const request = require('request');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const createUserAccount = (req, res) => {
  if (!req.query.code) {
    // access denied
    return;
  }
  var data = {
    form: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code,
    },
  };
  request.post('https://slack.com/api/oauth.access', data, async function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      const newBody = JSON.parse(body);

      const foundAccount = await Account.findOne(
        {
          'owner.access_token': newBody.access_token,
        },
        (err, doc) => {
          console.log('doc', doc);
        }
      );
      // console.log(foundAccount.owner);
      if (foundAccount) {
        console.log('Account already made!');
        return res.json({ err: 'Account already exists!' });
      } else {
        const newAccount = new Account({
          owner: {
            access_token: newBody.access_token,
            name: newBody.user.name,
            id: newBody.user.id,
            email: newBody.user.email,
            image: newBody.user.image_192,
          },
        });
        newAccount.save((err, newAccount) => {
          if (err) {
            return res.status(403).json({ err: err.message });
          }
          // res.status(200).json({ newAccount });
        });
        res.redirect(__dirname + '/public/success.html');
      }
    }
  });
};

module.exports = {
  createUserAccount,
};
