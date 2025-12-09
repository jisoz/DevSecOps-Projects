pipeline {
    agent any
    tools {
        nodejs 'nodejs25'  
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/jisoz/DevSecOps-Projects.git'
            }
        }
        
      
        
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
        
         stage('SonarQube Analysis'){
               
                    steps {
                         withSonarQubeEnv('sonar') {
                    sh """
                        $SCANNER_HOME/bin/sonar-scanner  \
                          -Dsonar.projectKey=nodejs-project \
                         -Dsonar.projectName=nodejs-project 
                        
                       
                    """
                }
               
            }
        }
        
        stage('Quality and Gate Check'){
            steps{
                timeout(time:1 , unit:'HOURS'){
                    waitForQualityGate abortPipeline: false , credentialsId:'sonar-token'
                }
            }
        }
        
        stage('Trivy FS Scan'){
            steps{
                sh 'trivy fs --format table -o fs-report.html . '
            }
        }
        
        
     
    }
}
