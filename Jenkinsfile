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
    stages {
        stage('Notify start') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')]) {
                        telegramSend(
                        chatId: CHAT_ID,
                        message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} started"
                        )
                    }
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')]) {
                        telegramSend(
                        chatId: CHAT_ID,
                        message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} started"
                        )
                    }
                }
                container('docker') {
                    sh "docker build ."
                }
            }
        }
    }
    post {
        failure {
            withCredentials([string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')]) {
                telegramSend(
                chatId: CHAT_ID,
                message: "Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} failed!"
                )
            }
        }    
    }
}
