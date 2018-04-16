const request = require('request');

const Workspace = require('../models/workspaceModel');

const createWorkspace = require('./helpers/createWorkspace');

const login = (req, res) => {
  if (!req.query.code) {
    // access denied

    return;
  }
  var data = {
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_AUTH,
      code: req.query.code,
    },
  };
  request.post('https://slack.com/api/oauth.access', data, async function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      const workspace = await Workspace.findOne({
        'info.id': body.team_id,
      });
      if (workspace) {
        console.log('workspace exists');
        return res.redirect(
          `${process.env.REDIRECT_URI}/?doc_id=${workspace._id}`
        );
      } else {
        await createWorkspace(body, req, res);
      }
    }
  });
};

const addBot = (req, res) => {
  if (!req.query.code) {
    // access denied
    return;
  }
  var data = {
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_BOT,
      code: req.query.code,
    },
  };
  request.post('https://slack.com/api/oauth.access', data, async function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      console.log(body);
      const workspace = await Workspace.findOneAndUpdate({
        'info.id': body.team_id,
        $set: {
          bot: {
            access_token: body.access_token,
            user_id: body.user_id,
            team_name: body.team_name,
            team_id: body.team_id,
            bot_user_id: body.bot.bot_user_id,
            bot_access_token: body.bot.bot_access_token,
          },
        },
      })
        .then(() => {
          return res.redirect(
            `${process.env.REDIRECT_URI}/?doc_id=${workspace._id}`
          );
        })
        .catch(console.error);
    }
  });
};

const getAllMembers = async (req, res) => {
  const { w_id } = req.body;
  const workspace = await Workspace.findById(w_id).populate('members');
  res.json(workspace.members)
};

const getOneMember = async (req, res) => {
  const { w_id, user_id } = req.body;
  const workspace = await Workspace.findById(w_id).populate('members');
  let member;
  workspace.members.forEach(m => {
    if (m.id === user_id) {
      member = m;
    }
  });
  res.json(member)
};

module.exports = {
  login,
  addBot,
  getAllMembers,
  getOneMember,
};
