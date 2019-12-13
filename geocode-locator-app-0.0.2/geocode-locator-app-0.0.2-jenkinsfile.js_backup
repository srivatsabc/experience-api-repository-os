pipeline {

  environment {
     application = "geocode-locator-app-0.0.2"
     docker_id = "srivatsabc"
     docker_pwd = "wipro123"
     docker_repo = "geocode-locator-app"
     docker_tag = "exp-api-v0.0.2"
     deploymemt_yaml = "geocode-locator-app-0.0.2-deployment.yaml"
     service_yaml = "geocode-locator-app-0.0.2-service.yaml"
     k8s_namespace = "experience-api-ns"
     k8s_app = "geocode-locator-app"
     config_map = "geocode-locator-app-config"
   }

  agent {
      label "master"
  }

  stages {
     stage('Checkout') {
          steps {
            checkout([$class: 'GitSCM',
              branches: [[name: 'master']],
              doGenerateSubmoduleConfigurations: false,
              extensions: [[$class: 'SparseCheckoutPaths',  sparseCheckoutPaths:[[$class:'SparseCheckoutPath', path:'geocode-locator-app-0.0.2/']]]                        ],
              submoduleCfg: [],
              userRemoteConfigs: [[credentialsId: 'srivatsabc_git_login', url: 'https://github.com/srivatsabc/experience-api-repository.git']]])

            sh "ls -lat"
          }
      }

      stage('Kubernetes deployment delete') {
        steps {
          script {
            sh "echo deleting the current kubernetes deployment $k8s_app from namespace $k8s_namespace"
            status = sh(returnStatus: true, script: "kubectl delete deployment $k8s_app --namespace=$k8s_namespace")
            if (status == 0){
              stage('Kubernetes service delete') {
                  script{
                    sh "echo deleting the current kubernetes service $k8s_app from namespace $k8s_namespace"
                    status = sh(returnStatus: true, script: "kubectl delete service $k8s_app --namespace=$k8s_namespace")
                    if (status == 0){
                      stage('Deleting current docker image from local repo'){
                        sh "echo deleting docker image from local $docker_id/$docker_repo:$docker_tag"
                        status = sh(returnStatus: true, script: "docker rmi $docker_id/$docker_repo:$docker_tag -f")
                        if (status == 0){
                          sh "echo Delete kube deployment service and docker image successfully"
                        }else{
                          stage('Nothing docker image to delete'){
                            sh "echo no docker image to delete in local repo"
                          }
                        }
                      }
                    }else{
                      stage('No Kubernetes service to delete'){
                        sh "echo no service available in kubernetes"
                      }
                    }
                  }
              }
            }else{
              stage('No Kubernetes deployment to delete'){
                sh "echo no deployment available in kubernetes"
              }
            }
          }
        }
      }

    stage('Build docker image') {
      steps {
        sh "echo build docker image $docker_id/$docker_repo:$docker_tag"
        sh 'docker build -t $docker_id/$docker_repo:$docker_tag $application/.'
      }
    }

    stage('Docker login') {
      steps {
        sh "echo loging into Docker hub"
        sh 'docker login -u $docker_id -p $docker_pwd'
      }
    }

    stage('Docker push') {
      steps {
        sh "echo Pushing $docker_id/$docker_repo:$docker_tag to Docker hub"
        sh 'docker push $docker_id/$docker_repo:$docker_tag'
      }
    }

    /*
    stage('Delete existing Kubernetes deployment') {
      steps {
        sh 'kubectl delete deployment $k8s_app --namespace=$k8s_namespace'
      }
    }

    stage('Delete existing Kubernetes service') {
      steps {
        sh 'kubectl delete service $k8s_app --namespace=$k8s_namespace'
      }
    }*/

    stage('Kubernetes configmap') {
      steps {
        script {
          sh "echo creating kubectl create -n $k8s_namespace configmap $config_map --from-literal=RUNTIME_ENV_TYPE=k8s"
          statusCreate = sh(returnStatus: true, script: "kubectl create -n $k8s_namespace configmap $config_map --from-literal=RUNTIME_ENV_TYPE=k8s")
          if (statusCreate != 0){
            sh "echo Unable to create $config_map in $k8s_namespace as it already exists"
          }else{
            stage('Kubernetes configmap created'){
              sh "echo Kubernetes configmap successfully created"
            }
          }
        }
      }
    }

    stage('Kubernetes deployment') {
      steps {
        sh 'kubectl apply -n $k8s_namespace -f $application/$deploymemt_yaml'
      }
    }

    stage('Kubernetes service') {
      steps {
        sh 'kubectl apply -n $k8s_namespace -f $application/$service_yaml'
      }
    }
  }
}
