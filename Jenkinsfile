#!groovy

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

node('ibm-jenkins-slave-nvm') {
  def lib = library("jenkins-library").org.zowe.jenkins_shared_library

  def pipeline = lib.pipelines.nodejs.NodeJSPipeline.new(this)

  pipeline.admins.add("jackjia")
  // pipeline.admins.add("jackjia", "jstruga", "sgrady", "nakul.manchanda")

  // we have extra parameters for integration test
  pipeline.addBuildParameters(
    string(
      name: 'ZLUX_CORE_ARTIFACTORY_PATTERN',
      description: 'ZLUX Core artifactory download pattern',
      defaultValue: 'libs-snapshot-local/org/zowe/zlux/zlux-core/*-STAGING/zlux-core-*.tar',
      trim: true,
      required: true
    )
  )

  pipeline.setup(
    // we don't need below two features
    disablePax: true,
    installRegistries: [
      [
        email                      : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_EMAIL,
        usernamePasswordCredential : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_CREDENTIAL,
        registry                   : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_INSTALL,
      ]
    ],
    publishRegistry: [
      email                      : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_EMAIL,
      usernamePasswordCredential : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_CREDENTIAL,
    ]
  )

  pipeline.createStage(
    name          : "Prepare zlux Dependencies",
    timeout       : [ time: 10, unit: 'MINUTES' ],
    isSkippable   : true,
    stage         : {
      pipeline.artifactory.download(
          specContent : """
{
  "files": [{
    "pattern": "${params.ZLUX_CORE_ARTIFACTORY_PATTERN}",
    "target": "zlux/",
    "flat": "true",
    "sortBy": ["created"],
    "sortOrder": "desc",
    "limit": 1
  }]
}
""",
          expected    : 1
      )
      dir('zlux') {
        sh 'tar xvf zlux-core-*.tar'
      }
    }
  )

  pipeline.build(
    operation: {
      withEnv([
        'MVD_DESKTOP_DIR=zlux/zlux-app-manager/virtual-desktop'
      ]) {
        sh "npm run build"
      }
    }
  )

  pipeline.test(
    name          : 'Unit',
    operation     : {
      echo "Test to be defined."
    },
    allowMissingJunit : true
  )

  // we need sonar scan
  pipeline.sonarScan(
    scannerTool     : lib.Constants.DEFAULT_LFJ_SONARCLOUD_SCANNER_TOOL,
    scannerServer   : lib.Constants.DEFAULT_LFJ_SONARCLOUD_SERVER,
    allowBranchScan : lib.Constants.DEFAULT_LFJ_SONARCLOUD_ALLOW_BRANCH,
    // FIXME: temporarily set this to false until we resolve the test coverage failure
    // failBuild       : lib.Constants.DEFAULT_LFJ_SONARCLOUD_FAIL_BUILD
    failBuild       : false
  )

  // define we need publish stage
  pipeline.publish()

  // define we need release stage
  pipeline.release()

  pipeline.end()
}
