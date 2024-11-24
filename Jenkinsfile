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
                - name: node
                  image: node:18-alpine
                  command:
                  - sleep
                  args:
                  - 99d
            """
        }
    }
    environment {
        TG_TOKEN = credentials('telegram-bot-token')
        TG_CHAT_ID = credentials('telegram-chat-id')
    }
    stages {
        stage('Notify build start') {
            steps {
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"ℹ️ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* started ℹ️\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"ℹ️ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* BUILD started ℹ️\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
                container('node') {
                    sh "yarn install"
                    sh "yarn run build"
                }
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"✅ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* BUILD success ✅\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"ℹ️ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* TEST started ℹ️\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
                }
                container('node') {
                    sh "yarn install"
                    sh "yarn run test"
                }
                script {
                    sh "curl --location --request POST \"https://api.telegram.org/bot${TG_TOKEN}/sendMessage\" --form text=\"✅ Pipeline *${env.JOB_NAME} #${env.BUILD_NUMBER}* TEST success ✅\" --form parse_mode=markdown --form chat_id=\"${TG_CHAT_ID}\""
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
