pipeline {
    agent {
        kubernetes {
            yaml """
              apiVersion: v1
              kind: Pod
              spec:
                volumes:
                - name: docker-socket
                  emptyDir: {}
                containers:
                - name: docker
                  image: docker:27.3.1
                  readinessProbe:
                    exec:
                      command: [sh, -c, "ls -S /var/run/docker.sock"]
                  command:
                  - sleep
                  args:
                  - 99d
                  volumeMounts:
                  - name: docker-socket
                    mountPath: /var/run
                - name: docker-daemon
                  image: docker:27.3.1-dind
                  securityContext:
                    privileged: true
                  volumeMounts:
                  - name: docker-socket
                    mountPath: /var/run
            """
        }
    }
    environment {
        TG_TOKEN = credentials('telegram-bot-token')
        TG_CHAT_ID = credentials('telegram-chat-id')
    }
    stages {
        stage('Notify start') {
            steps {
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"ℹ️ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* started ℹ️\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
            }
        }
        stage('Test') {
            steps {
                container('docker') {
                    sh "npm -v"
                }
            }
        }
    }
    post {
        failure {
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"❌ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* failed ❌\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
            }
        }    
}
