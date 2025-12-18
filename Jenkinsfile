pipeline {
    agent none

    stages {

        // stage('Git Checkout') {
        //     agent {
        //         docker {
        //             image 'alpine/git:latest'
        //         }
        //     }
        //     steps {
        //         git branch: 'main', url: 'https://github.com/jisoz/DevSecOps-Projects.git'
        //     }
        // }

        stage('Gitleaks Secret Scan') {
            agent {
                docker {
                    image 'zricethezav/gitleaks:latest'
                }
            }
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
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                }
            }
            steps {
                withSonarQubeEnv('sonar') {
                    sh """
                      sonar-scanner \
                        -Dsonar.projectKey=nodejs-project \
                        -Dsonar.projectName=nodejs-project
                    """
                }
            }
        }

        stage('Quality Gate Check') {
            agent any
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }

        stage('Trivy FS Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                }
            }
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
