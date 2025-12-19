 def SERVICES = [
  [
    name: 'frontend',
    path: 'digital-wallet-demo/frontend/'
  ],
  [
    name: 'backend_transactions',
    path: 'digital-wallet-demo/services/transactions'
  ],

  [
    name: 'backend_wallets',
    path: 'digital-wallet-demo/services/wallets'
  ]
  // database intentionally excluded
]



pipeline {
  agent {
    docker {
      image 'localhost:5000/devsecops-toolbox:latest'
      reuseNode true
      args ' --user root --entrypoint="" --network ci-network -v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  environment {
    AWS_REGION = 'us-east-2'
    ECR_ACCOUNT = '278584440734'
    APP_NAME = 'wallet-app'
    ECR_REPO = "${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
  }

 

  stages {

    /* ---------------- ENV DETECTION ---------------- */
    stage('Detect Environment') {
      steps {
        script {
          if (env.CHANGE_ID) {
            env.ENV = 'pr'
          } else if (env.BRANCH_NAME == 'main') {
            env.ENV = 'prod'
          } else if (env.BRANCH_NAME.startsWith('release/')) {
            env.ENV = 'qa'
          } else if (env.BRANCH_NAME.startsWith('feature/')) {
            env.ENV = 'dev'
          } else {
            error("Unsupported branch: ${env.BRANCH_NAME}")
          }
        }
        echo "Branch: ${env.BRANCH_NAME}"
        echo "Environment: ${env.ENV}"
      }
    }



   stage('Detect Changed Services') {
  steps {
    script {

      def changedFiles = []

      currentBuild.changeSets.each { changeSet ->
        changeSet.items.each { item ->
          item.affectedFiles.each { file ->
            changedFiles << file.path
          }
        }
      }

      echo "Changed files:"
      changedFiles.each { echo " - ${it}" }

      def affectedServices = []

      SERVICES.each { svc ->
        if (changedFiles.any { it.startsWith(svc.path) }) {
          affectedServices << svc.name
        }
      }

      if (affectedServices.isEmpty() && !changedFiles.isEmpty()) {
        echo "Shared files changed → build ALL services"
        env.BUILD_ALL = 'true'
      } else {
        env.BUILD_ALL = 'false'
        env.AFFECTED_SERVICES = affectedServices.join(',')
      }

      echo "BUILD_ALL = ${env.BUILD_ALL}"
      echo "AFFECTED_SERVICES = ${env.AFFECTED_SERVICES}"
    }
  }
}



    /* ---------------- SECURITY & QUALITY ---------------- */
    stage('DevSecOps Scans') {
      when { expression { env.ENV != 'prod' } }
      steps {

        sh '''
          gitleaks detect --no-git \
            --source ./digital-wallet-demo \
            --report-path gitleaks-report.json \
            --verbose || true
        '''

        withSonarQubeEnv('sonar') {
          sh '''
            sonar-scanner \
              -Dsonar.projectKey=${APP_NAME} \
              -Dsonar.projectName=${APP_NAME} \
              -Dsonar.host.url=http://sonar:9000
          '''
        }

        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: true, credentialsId: 'sonar-token'
        }

        sh '''
          export TRIVY_CACHE_DIR=/tmp/trivy-cache
          mkdir -p $TRIVY_CACHE_DIR

          trivy fs \
            --cache-dir $TRIVY_CACHE_DIR \
            --severity HIGH,CRITICAL \
            --exit-code 0 .
        '''
      }
    }

    /* ---------------- PREPARE IMAGE TAG ---------------- */
   stage('Prepare Image Tag') {
  when { expression { env.ENV != 'pr' } }
  steps {
    script {
      def shortCommit = env.GIT_COMMIT.take(7)

      // Sanitize branch name for Docker tag
      def safeBranch = env.BRANCH_NAME.replaceAll('/', '-')

      env.IMAGE_TAG = "${safeBranch}-${shortCommit}-${env.BUILD_NUMBER}"
    }
    echo "Image tag: ${env.IMAGE_TAG}"
  }
}

    /* ---------------- BUILD & PUSH TO ECR ---------------- */
stage('Build & Push Images') {
  when { expression { env.ENV != 'pr' } }
  steps {
    withAWS(
      credentials: 'aws-cred',
      region: AWS_REGION,
      role: "arn:aws:iam::${ECR_ACCOUNT}:role/JenkinsECRPushRole",
      roleSessionName: 'jenkins-ecr'
    ) {
      script {

        sh '''

          aws ecr get-login-password --region $AWS_REGION \
          | docker login \
            --username AWS \
            --password-stdin ${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
        '''
        def servicesToBuild = []

        if (env.BUILD_ALL == 'true') {
        servicesToBuild = SERVICES
        } else {
        def names = env.AFFECTED_SERVICES.split(',') as List
        servicesToBuild = SERVICES.findAll { names.contains(it.name) }
        }

        servicesToBuild.each { svc ->
        def repo = "${ECR_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${svc.name}"

        sh """
            echo "🚀 Building ${svc.name}"

            docker build \
            -t ${repo}:${IMAGE_TAG} \
            -f ${svc.path}/Dockerfile \
            ${svc.path}

            docker push ${repo}:${IMAGE_TAG}
        """
        }


      }
    }
  }
}


    /* ---------------- PROD PROMOTION ---------------- */
    stage('Promote Image (Prod)') {
      when { expression { env.ENV == 'prod' } }
      steps {
        echo "Production promotion happens via GitOps (no rebuild)"
      }
    }
  }
}
