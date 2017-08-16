const arg = require('yargs').argv
const semver = require('semver')
const path = require('path')
const gittags = require('git-tags')
const Nodegit = require("nodegit")
const { Tag, Remote, Cred } = Nodegit

const gitrepo = path.resolve(__dirname, "../.git")
const remoteRepo = `git@github.com:nodegit/${arg.name}.git`
let oid

gittags.latest((err, latest) => {
  const tag = `v${semver.inc(latest, arg.release)}`
  const branch = `release-tag/${tag}`

  Nodegit.Repository.open(gitrepo)
    .then(repo => {
      return repo.getHeadCommit()
      .then(commit => {
        repo.createBranch(
          branch,
          commit,
          0,
          repo.defaultSignature(),
          "Created new-branch on HEAD"
        )
        .then(commit => {
          repo.checkoutBranch(branch)
          .then(() => repo.refreshIndex())
          .then(index => {
            return index.addAll('lib')
              .then(() => index.write())
              .then(() => index.writeTree())
          })
          .then(oid => {
            const sig = repo.defaultSignature()
            console.log('oid', oid)
            return repo.createCommit("HEAD", sig, sig, msg, oid, [])
          })
          .then(() => {
            return Remote.create(repo, "origin", remoteRepo)
            .then(remote => {
              return remote.push(["refs/heads/master:refs/heads/master"],
                {
                  callbacks: {
                    credentials: (url, userName) => Cred.sshKeyFromAgent(userName)
                  }
                }
              )
            })
          })
        })
      })
    }).done(function() {
      console.log(`Created release branch with tag ${tag}`)
    }
  )
})

          // .then(ref => {
          //   console.log('ref')
          //   console.log('repo: ', repo)
          //   repo.createTag(
          //     tag,
          //     tag,
          //     'test'
          //   )
          // })
