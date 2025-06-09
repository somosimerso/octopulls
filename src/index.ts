import * as core from '@actions/core'
import * as github from '@actions/github'
import { logger } from './libs'

;(async function run() {
  try {
    core.startGroup('Get Inputs')
    const token = core.getInput('token', { required: true })
    const pullRequestNumberInput = core.getInput('pull-request-number')
    const openApiKey = core.getInput('open-api-key')
    core.endGroup()

    core.startGroup('Set Pull Request')
    const octokit = github.getOctokit(token)
    const pullRequest = github.context.payload.pull_request
    const { owner, repo } = github.context.repo

    const pullNumber =
      pullRequestNumberInput || (pullRequest && pullRequest.number)

    if (!pullNumber) {
      throw new Error('Número do Pull Request não encontrado. Verifique se esse workflow foi gerado a partir de um PR ou Se passou o valor de')
    }

    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: Number(pullNumber)
    })
    core.endGroup()

    core.startGroup('Review')
    core.info(`Arquivos modificados no PR #${pullNumber}:`)
    for (const file of files) {
      core.info(`- ${file.filename}`)
    }
    core.endGroup()

  } catch (err) {
    core.setFailed(`Erro ao listar arquivos do PR: ${(err as Error).message}`)
  }
})()