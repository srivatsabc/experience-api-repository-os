pipeline {

  environment {
     git_subdirectory = "geocode-locator-app-0.0.2"
     git_repo_url = "https://github.com/srivatsabc/experience-api-repository-os.git"
     okd_app = "geocode-locator-app-v002"
     okd_namespace = "experience-api-ns"
     config_map = "geocode-locator-app-v002-config"
     docker_id = "srivatsabc"
     docker_repo = "geocode-locator-app"
     docker_tag = "os-e-api-v0.0.2"
     docker_pwd = "wipro123"
     deploymemt_yaml = "geocode-locator-app-0.0.2-deployment.yaml"
     service_yaml = "geocode-locator-app-0.0.2-service.yaml"
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
              extensions: [[$class: 'SparseCheckoutPaths',  sparseCheckoutPaths:[[$class:'SparseCheckoutPath', path:"${git_subdirectory}/"]]]                        ],
              submoduleCfg: [],
              userRemoteConfigs: [[credentialsId: 'srivatsabc_git_login', url: "${git_repo_url}"]]])

            sh "ls -lat"
          }
      }

    stage('OpenShift deployment delete') {
        steps {
          script {
            sh "echo deleting the current OpenShift deployment $okd_app from namespace $okd_namespace"
            status = sh(returnStatus: true, script: "oc delete deployment $okd_app --namespace=$okd_namespace")
            if (status == 0){
              stage('OpenShift service delete') {
                  script{
                    sh "echo deleting the current OpenShift service $okd_app from namespace $okd_namespace"
                    status = sh(returnStatus: true, script: "oc delete service $okd_app --namespace=$okd_namespace")
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
                      stage('No OpenShift service to delete'){
                        sh "echo no service available in OpenShift"
                      }
                    }
                  }
              }
            }else{
              stage('No OpenShift deployment to delete'){
                sh "echo no deployment available in OpenShift"
              }
            }
          }
        }
      }

    stage('Build docker image') {
      steps {
        sh "echo build docker image $docker_id/$docker_repo:$docker_tag"
        sh 'docker build -t $docker_id/$docker_repo:$docker_tag $git_subdirectory/.'
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

    stage('OpenShift configmap') {
        steps {
          script {
            sh "echo creating oc create -n $okd_namespace configmap $config_map --from-literal=RUNTIME_ENV_TYPE=k8s"
            statusCreate = sh(returnStatus: true, script: "oc create -n $okd_namespace configmap $config_map --from-literal=RUNTIME_ENV_TYPE=k8s")
            if (statusCreate != 0){
              sh "echo Unable to create $config_map in $okd_namespace as it already exists"
            }else{
              stage('OpenShift configmap created'){
                sh "echo OpenShift configmap successfully created"
              }
            }
          }
        }
      }

    stage('OpenShift deployment') {
      steps {
        sh 'oc apply -n $okd_namespace -f $git_subdirectory/$deploymemt_yaml'
      }
    }

    stage('OpenShift service') {
      steps {
        sh 'oc apply -n $okd_namespace -f $git_subdirectory/$service_yaml'
      }
    }
  }
}
