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
        BOT_TOKEN = credentials('telegram-bot-token')
        CHAT_ID = credentials('telegram-chat-id')
    }
    stages {
        stage('Notify start') {
            steps {
                script {
                    sh "echo $CHAT_ID"
                    telegramSend(
                    botToken: env.BOT_TOKEN,
                    chatId: env.CHAT_ID,
                    message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} started"
                    )
                }
            }
        }
        stage('Test') {
            steps {
                script {
                        telegramSend(
                        botToken: env.BOT_TOKEN,
                        chatId: env.CHAT_ID,
                        message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} started"
                        )
                }
                // container('docker') {
                //     sh "docker build ."
                // }
            }
        }
    }
    post {
        failure {
                telegramSend(                
                botToken: env.BOT_TOKEN,
                chatId: env.CHAT_ID,
                message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} failed!"
                )
            }
        }    
}
