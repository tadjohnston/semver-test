const arg = require('yargs').argv
const semver = require('semver')
const path = require('path')
const gittags = require('git-tags')
const Nodegit = require("nodegit")
const Tag = Nodegit.Tag

const gitrepo = path.resolve(__dirname, "../.git")

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
          .then(() => {
            return repo.openIndex()
          })
          .then(index => {
            index.addAll('lib')
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
