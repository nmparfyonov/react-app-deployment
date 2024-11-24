pipeline {
    agent {
        kubernetes {
            yaml """
              apiVersion: v1
              kind: Pod
              spec:
                containers:
                - name: docker
                  image: docker:27.3.1
                  command:
                  - cat
                  tty: true
            """
        }
    }
    stages {
        stage('Test') {
            steps {
                container('docker') {
                    sh "docker --version"
                }
            }
        }
    }
}
