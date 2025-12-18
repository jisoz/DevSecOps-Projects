pipeline {
    agent {
    docker {
      image 'localhost:5000/devsecops-toolbox:latest'
      // registryUrl 'http://localhost:5000'
      // registryCredentialsId 'docker-registry-creds'
      reuseNode true
      args '--entrypoint="" --network ci-network'
    }
  }

    stages {

        stage('Gitleaks Secret Scan') {
           
            steps {
                echo "Running Gitleaks secret scan..."
                sh """
                    gitleaks detect \
                      --no-git \
                      --source ./digital-wallet-demo \
                      --report-path gitleaks-report.json \
                      --verbose
                """
            }
        }

        stage('SonarQube Analysis') {
          
            steps {
                withSonarQubeEnv('sonar') {
                    sh """
                      sonar-scanner \
                        -Dsonar.projectKey=nodejs-project \
                        -Dsonar.projectName=nodejs-project \
                        -Dsonar.host.url=http://sonar:9000
                    """
                }
            }
        }

        stage('Quality Gate Check') {
            
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }

        stage('Trivy FS Scan') {
           
            steps {
                sh """
                  trivy fs \
                    --format table \
                    -o fs-report.html .
                """
            }
        }
    }
}
