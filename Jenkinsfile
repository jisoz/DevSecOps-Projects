pipeline {
  agent {
    docker {
      image 'localhost:5000/devsecops-toolbox:latest'
      reuseNode true
      args '--entrypoint="" --network ci-network -v /var/run/docker.sock:/var/run/docker.sock'
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
          env.IMAGE_TAG = "${env.BRANCH_NAME}-${shortCommit}-${env.BUILD_NUMBER}"
        }
        echo "Image tag: ${env.IMAGE_TAG}"
      }
    }

    /* ---------------- BUILD & PUSH TO ECR ---------------- */
    stage('Build & Push Image') {
      when { expression { env.ENV != 'pr' } }
      steps {
        withAWS(
          credentials: 'aws-cred',
          region: "${AWS_REGION}",
          role: "arn:aws:iam::${ECR_ACCOUNT}:role/JenkinsECRPushRole",
          roleSessionName: 'jenkins-ecr'
        ) {
          sh '''
            aws sts get-caller-identity

            aws ecr get-login-password --region us-east-2 \
            | docker login \
              --username AWS \
              --password-stdin 278584440734.dkr.ecr.us-east-2.amazonaws.com

            docker build -t $ECR_REPO:$IMAGE_TAG .
            docker push $ECR_REPO:$IMAGE_TAG
          '''
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
